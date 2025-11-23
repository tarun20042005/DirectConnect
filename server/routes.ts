import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { DatabaseStorage } from "./storage-db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { User, Chat } from "@shared/schema";

const JWT_SECRET = process.env.SESSION_SECRET || "your-secret-key-change-in-production";

interface AuthRequest extends Express.Request {
  user?: User;
}

function stripPassword(user: User) {
  const { password: _, ...safeUser } = user;
  return safeUser;
}

function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, async (err: any, payload: any) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    // Attach userId from token to request
    req.userId = payload.userId;
    next();
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  const storage = new DatabaseStorage();

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, fullName, phone, role } = req.body;

      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await storage.createUser({
        email,
        password: hashedPassword,
        fullName,
        phone: phone || undefined,
        role,
        avatarUrl: undefined,
      });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

      res.json({
        ...stripPassword(user),
        token
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

      res.json({
        ...stripPassword(user),
        token
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/properties", async (req, res) => {
    try {
      const properties = await storage.getProperties();
      res.json(properties);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Must come BEFORE /:id route to avoid matching "owner" as an ID
  app.get("/api/properties/owner/:ownerId", async (req, res) => {
    try {
      const properties = await storage.getPropertiesByOwner(req.params.ownerId);
      res.json(properties);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/properties/:id", async (req, res) => {
    try {
      const property = await storage.getProperty(req.params.id);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      await storage.incrementPropertyViews(req.params.id);

      res.json(property);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/upload", authenticateToken, async (req, res) => {
    try {
      const { files } = req.body;
      if (!Array.isArray(files)) {
        return res.status(400).json({ message: "Invalid files format" });
      }
      
      const validImages = files.filter(f => f && typeof f === 'string' && f.length > 0);
      res.json({ images: validImages });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/properties", authenticateToken, async (req, res) => {
    try {
      // Ensure ownerId matches authenticated user
      const propertyData = {
        ...req.body,
        ownerId: req.userId,
      };
      const property = await storage.createProperty(propertyData);
      res.status(201).json(property);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/properties/:id", authenticateToken, async (req, res) => {
    try {
      const property = await storage.updateProperty(req.params.id, req.body);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      res.json(property);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/properties/:id", authenticateToken, async (req, res) => {
    try {
      const deleted = await storage.deleteProperty(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Property not found" });
      }
      res.json({ message: "Property deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/otp/send", authenticateToken, async (req, res) => {
    try {
      const { phone } = req.body;
      if (!phone) {
        return res.status(400).json({ message: "Phone number required" });
      }

      // Generate 6-digit OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      const otp = await storage.createOtp({
        userId: req.userId,
        phone,
        code,
        expiresAt,
        verified: false,
      });

      // In production, send OTP via SMS using Twilio or similar
      // For now, log it for testing
      console.log(`OTP Code for ${phone}: ${code}`);

      res.json({ 
        message: "OTP sent successfully", 
        expiresAt,
        code // Remove in production
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/otp/verify", authenticateToken, async (req, res) => {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ message: "OTP code required" });
      }

      const verified = await storage.verifyOtp(req.userId, code);
      if (!verified) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      // Mark user as verified
      await storage.updateUser(req.userId, { verified: true });

      res.json({ message: "Phone verified successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/appointments/:userId", async (req, res) => {
    try {
      const appointments = await storage.getAppointmentsByUser(req.params.userId);
      res.json(appointments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/appointments", authenticateToken, async (req, res) => {
    try {
      const appointment = await storage.createAppointment(req.body);
      res.status(201).json(appointment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/properties/:propertyId/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviews(req.params.propertyId);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/reviews", authenticateToken, async (req, res) => {
    try {
      const review = await storage.createReview(req.body);
      res.status(201).json(review);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/properties/saved/:userId", async (req, res) => {
    try {
      const savedProperties = await storage.getSavedProperties(req.params.userId);
      const propertyIds = savedProperties.map(sp => sp.propertyId);

      const properties = [];
      for (const id of propertyIds) {
        const property = await storage.getProperty(id);
        if (property) {
          properties.push(property);
        }
      }

      res.json(properties);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/saved-properties", authenticateToken, async (req, res) => {
    try {
      const saved = await storage.createSavedProperty(req.body);
      res.status(201).json(saved);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/saved-properties/:userId/:propertyId", authenticateToken, async (req, res) => {
    try {
      const deleted = await storage.deleteSavedProperty(req.params.userId, req.params.propertyId);
      if (!deleted) {
        return res.status(404).json({ message: "Saved property not found" });
      }
      res.json({ message: "Property unsaved" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/payments/deposit", authenticateToken, async (req, res) => {
    try {
      const { propertyId, amount } = req.body;
      
      if (!propertyId || !amount) {
        return res.status(400).json({ message: "Property ID and amount are required" });
      }

      const payment = await storage.createPayment({
        tenantId: req.user.id,
        propertyId,
        amount: parseFloat(amount),
        currency: "INR",
        type: "deposit",
        description: `Deposit for property ${propertyId}`,
        status: "completed",
      });

      res.json(payment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  const chatRooms = new Map<string, Set<{ ws: WebSocket; userId: string }>>();

  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected to WebSocket');
    let currentUserId: string | null = null;
    let currentPropertyId: string | null = null;
    let authenticated = false;

    ws.on('message', async (data: string) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === 'join') {
          if (!message.token) {
            ws.send(JSON.stringify({ type: 'error', message: 'Authentication required' }));
            ws.close();
            return;
          }

          try {
            const payload = jwt.verify(message.token, JWT_SECRET) as any;
            const user = await storage.getUser(payload.userId);
            
            if (!user) {
              ws.send(JSON.stringify({ type: 'error', message: 'User not found' }));
              ws.close();
              return;
            }

            currentUserId = user.id;
            currentPropertyId = message.propertyId;
            authenticated = true;

            const property = await storage.getProperty(message.propertyId);
            if (!property) {
              ws.send(JSON.stringify({ type: 'error', message: 'Property not found' }));
              ws.close();
              return;
            }

            const isOwner = currentUserId === property.ownerId;
            
            let chat: Chat | undefined;
            let tenantId: string;

            if (isOwner) {
              if (!message.chatId) {
                ws.send(JSON.stringify({ type: 'error', message: 'Chat ID required for owner' }));
                ws.close();
                return;
              }
              
              chat = await storage.getChat(message.chatId);
              if (!chat || chat.ownerId !== currentUserId || chat.propertyId !== message.propertyId) {
                ws.send(JSON.stringify({ type: 'error', message: 'Unauthorized chat access' }));
                ws.close();
                return;
              }
              
              tenantId = chat.tenantId;
            } else {
              tenantId = currentUserId;
              chat = await storage.getChatByPropertyAndTenant(message.propertyId, tenantId);
              
              if (!chat) {
                chat = await storage.createChat({
                  propertyId: message.propertyId,
                  tenantId: tenantId,
                  ownerId: property.ownerId,
                });
              }
            }

            const roomId = `${message.propertyId}-${tenantId}`;
            
            if (!chatRooms.has(roomId)) {
              chatRooms.set(roomId, new Set());
            }
            chatRooms.get(roomId)!.add({ ws, userId: currentUserId });

            const messages = await storage.getMessages(chat.id);
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'history', messages, chatId: chat.id }));
            }
          } catch (err) {
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid token' }));
            ws.close();
            return;
          }
        } else if (message.type === 'message') {
          if (!authenticated || !currentUserId || !currentPropertyId) {
            ws.send(JSON.stringify({ type: 'error', message: 'Not authenticated' }));
            return;
          }

          if (!message.chatId) {
            ws.send(JSON.stringify({ type: 'error', message: 'Chat ID required' }));
            return;
          }

          const chat = await storage.getChat(message.chatId);
          if (!chat) {
            ws.send(JSON.stringify({ type: 'error', message: 'Chat not found' }));
            return;
          }

          if (chat.tenantId !== currentUserId && chat.ownerId !== currentUserId) {
            ws.send(JSON.stringify({ type: 'error', message: 'Unauthorized' }));
            return;
          }

          const savedMessage = await storage.createMessage({
            chatId: chat.id,
            senderId: currentUserId,
            content: message.content,
          });

          const roomId = `${chat.propertyId}-${chat.tenantId}`;
          const room = chatRooms.get(roomId);
          if (room) {
            room.forEach((client) => {
              if (client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(JSON.stringify({ type: 'message', message: savedMessage }));
              }
            });
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
      chatRooms.forEach((room) => {
        const toDelete = Array.from(room).filter(client => client.ws === ws);
        toDelete.forEach(client => room.delete(client));
      });
    });
  });

  return httpServer;
}
