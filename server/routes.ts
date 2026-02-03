import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { User, Chat } from "@shared/schema";
import { insertAppointmentSchema } from "@shared/schema";

const JWT_SECRET = process.env.SESSION_SECRET || "your-secret-key-change-in-production";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: User;
    }
  }
}

function stripPassword(user: User) {
  const { password: _, ...safeUser } = user;
  return safeUser;
}

function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers?.['authorization'] as string | undefined;
  const token = authHeader?.split(' ')?.[1];

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
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
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
      // Ensure ownerId matches authenticated user and available is true
      const propertyData = {
        ...req.body,
        ownerId: req.userId,
        available: true,
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

      if (!req.userId) {
        return res.status(401).json({ message: "User not authenticated" });
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

      if (!req.userId) {
        return res.status(401).json({ message: "User not authenticated" });
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

  app.get("/api/saved-properties", authenticateToken, async (req, res) => {
    try {
      const saved = await storage.getSavedProperties(req.userId!);
      res.json(saved);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/saved-properties/toggle", authenticateToken, async (req, res) => {
    try {
      const { propertyId } = req.body;
      const saved = await storage.toggleSavedProperty(req.userId!, propertyId);
      res.json({ saved });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/saved-properties/check/:propertyId", authenticateToken, async (req, res) => {
    try {
      const saved = await storage.isPropertySaved(req.userId!, req.params.propertyId);
      res.json({ saved });
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

  app.get("/api/appointments/owner/:ownerId", authenticateToken, async (req, res) => {
    try {
      // Security check: only allow owners to fetch their own appointments
      if (req.userId !== req.params.ownerId) {
        return res.status(403).json({ message: "Unauthorized access to owner appointments" });
      }
      const appointments = await storage.getAppointmentsByOwner(req.params.ownerId);
      res.json(appointments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/appointments", authenticateToken, async (req, res) => {
    try {
      const validated = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(validated);
      res.status(201).json(appointment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/appointments/:id", authenticateToken, async (req, res) => {
    try {
      const { status } = req.body;
      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const appointment = await storage.updateAppointment(req.params.id, { status });
      res.json(appointment);
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
      if (!req.userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const review = await storage.createReview({
        ...req.body,
        tenantId: req.userId
      });
      res.status(201).json(review);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/owners", async (req, res) => {
    try {
      const allUsers = await storage.getUsersByRole("owner");
      res.json(allUsers.map(stripPassword));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/chats/tenant/:tenantId", authenticateToken, async (req, res) => {
    try {
      if (req.userId !== req.params.tenantId) {
        return res.status(403).json({ message: "Unauthorized access to chats" });
      }
      const chats = await storage.getChatsByTenant(req.params.tenantId);
      res.json(chats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/chats/owner/:ownerId", authenticateToken, async (req, res) => {
    try {
      // Security check: only allow owners to fetch their own chats
      if (req.userId !== req.params.ownerId) {
        return res.status(403).json({ message: "Unauthorized access to chats" });
      }
      const chats = await storage.getChatsByOwner(req.params.ownerId);
      res.json(chats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/chats/users", authenticateToken, async (req, res) => {
    try {
      const user = await storage.getUser(req.userId!);
      let allChats: Chat[] = [];
      
      if (user?.role === 'owner') {
        allChats = await storage.getChatsByOwner(req.userId!);
      } else {
        allChats = await storage.getChatsByTenant(req.userId!);
      }
      
      const tenantIds = Array.from(new Set(allChats.map(c => c.tenantId)));
      const ownerIds = Array.from(new Set(allChats.map(c => c.ownerId)));
      const allUserIds = Array.from(new Set([...tenantIds, ...ownerIds]));
      
      const users: Record<string, any> = {};
      for (const id of allUserIds) {
        const user = await storage.getUser(id);
        if (user) {
          const { password: _, ...safeUser } = user;
          users[id] = safeUser;
        }
      }
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/chats/:id", authenticateToken, async (req, res) => {
    try {
      const chat = await storage.getChat(req.params.id);
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }
      // Security check: only participants can see chat details
      if (chat.tenantId !== req.userId && chat.ownerId !== req.userId) {
        return res.status(403).json({ message: "Unauthorized access to chat" });
      }
      res.json(chat);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/messages/:chatId", authenticateToken, async (req, res) => {
    try {
      const messages = await storage.getMessages(req.params.chatId);
      res.json(messages);
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
            authenticated = true;

            const property = await storage.getProperty(message.propertyId);
            if (!property) {
              ws.send(JSON.stringify({ type: 'error', message: 'Property not found' }));
              ws.close();
              return;
            }

            currentPropertyId = property.id;
            
            let chat: Chat | undefined;
            let tenantId: string;

            if (user.role === 'owner') {
              if (message.chatId) {
                chat = await storage.getChat(message.chatId);
                if (!chat || chat.ownerId !== currentUserId) {
                  ws.send(JSON.stringify({ type: 'error', message: 'Unauthorized chat access' }));
                  ws.close();
                  return;
                }
                tenantId = chat.tenantId;
              } else {
                // Owner joining without a specific chatId (maybe just viewing property chats)
                return;
              }
            } else {
              tenantId = currentUserId;
              chat = await storage.getChatByPropertyAndTenant(currentPropertyId, tenantId);
              
              if (!chat) {
                chat = await storage.createChat({
                  propertyId: currentPropertyId,
                  tenantId: tenantId,
                  ownerId: property.ownerId,
                });
              }
            }

            const roomId = `${currentPropertyId}-${tenantId}`;
            
            if (!chatRooms.has(roomId)) {
              chatRooms.set(roomId, new Set());
            }
            // Remove any existing connection for this user in this room
            const room = chatRooms.get(roomId)!;
            room.forEach(client => {
              if (client.userId === currentUserId) room.delete(client);
            });
            room.add({ ws, userId: currentUserId });
            
            console.log(`User ${currentUserId} joined room ${roomId}. Room size: ${room.size}`);

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

          let chatId = message.chatId;
          console.log(`Received message content: "${message.content}" for chatId: ${chatId}`);

          if (!chatId) {
            // If tenant sends message without chatId, find or create it
            const property = await storage.getProperty(currentPropertyId);
            if (!property) {
              ws.send(JSON.stringify({ type: 'error', message: 'Property not found' }));
              return;
            }

            let chat = await storage.getChatByPropertyAndTenant(currentPropertyId, currentUserId);
            if (!chat) {
              console.log(`Creating new chat for property ${currentPropertyId} and tenant ${currentUserId}`);
              chat = await storage.createChat({
                propertyId: currentPropertyId,
                tenantId: currentUserId,
                ownerId: property.ownerId,
              });
            }
            chatId = chat.id;
          }

          const chat = await storage.getChat(chatId);
          if (!chat) {
            console.error(`Chat ${chatId} not found in database`);
            ws.send(JSON.stringify({ type: 'error', message: 'Chat not found' }));
            return;
          }

          if (chat.tenantId !== currentUserId && chat.ownerId !== currentUserId) {
            console.error(`Unauthorized access attempt by ${currentUserId} to chat ${chatId}`);
            ws.send(JSON.stringify({ type: 'error', message: 'Unauthorized' }));
            return;
          }

          const savedMessage = await storage.createMessage({
            chatId: chat.id,
            senderId: currentUserId,
            content: message.content,
            read: false,
            type: message.msgType || "text",
          });

          const roomId = `${chat.propertyId}-${chat.tenantId}`;
          const room = chatRooms.get(roomId);
          console.log(`Sending message to room ${roomId}. Room exists: ${!!room}, Room size: ${room?.size || 0}`);
          if (room) {
            room.forEach((client) => {
              if (client.ws.readyState === WebSocket.OPEN) {
                console.log(`Sending message to user ${client.userId} in room ${roomId}`);
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
