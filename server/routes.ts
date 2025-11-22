import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { User } from "@shared/schema";

const JWT_SECRET = process.env.SESSION_SECRET || "your-secret-key-change-in-production";

interface AuthRequest extends Express.Request {
  user?: User;
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

    const user = await storage.getUser(payload.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
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
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        verified: user.verified,
        createdAt: user.createdAt,
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
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        verified: user.verified,
        createdAt: user.createdAt,
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

  app.get("/api/properties/owner/:ownerId", async (req, res) => {
    try {
      const properties = await storage.getPropertiesByOwner(req.params.ownerId);
      res.json(properties);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/properties", authenticateToken, async (req, res) => {
    try {
      const property = await storage.createProperty(req.body);
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

  const httpServer = createServer(app);

  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  const chatRooms = new Map<string, Set<{ ws: WebSocket; userId: string }>>();

  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected to WebSocket');
    let currentUserId: string | null = null;
    let currentPropertyId: string | null = null;

    ws.on('message', async (data: string) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === 'join') {
          currentUserId = message.userId;
          currentPropertyId = message.propertyId;
          const roomId = `${message.propertyId}`;
          
          if (!chatRooms.has(roomId)) {
            chatRooms.set(roomId, new Set());
          }
          chatRooms.get(roomId)!.add({ ws, userId: message.userId });

          const property = await storage.getProperty(message.propertyId);
          if (property) {
            let chat = await storage.getChatByPropertyAndTenant(message.propertyId, message.userId);
            if (!chat) {
              chat = await storage.createChat({
                propertyId: message.propertyId,
                tenantId: message.userId,
                ownerId: property.ownerId,
              });
            }

            const messages = await storage.getMessages(chat.id);
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'history', messages }));
            }
          }
        } else if (message.type === 'message') {
          const property = await storage.getProperty(message.propertyId);
          if (property) {
            const senderId = message.senderId;
            const isTenant = senderId !== property.ownerId;
            
            let chat = await storage.getChatByPropertyAndTenant(
              message.propertyId,
              isTenant ? senderId : message.recipientId || senderId
            );
            
            if (!chat) {
              chat = await storage.createChat({
                propertyId: message.propertyId,
                tenantId: isTenant ? senderId : message.recipientId || senderId,
                ownerId: property.ownerId,
              });
            }

            const savedMessage = await storage.createMessage({
              chatId: chat.id,
              senderId: message.senderId,
              content: message.content,
            });

            const roomId = `${message.propertyId}`;
            const room = chatRooms.get(roomId);
            if (room) {
              room.forEach((client) => {
                if (client.ws.readyState === WebSocket.OPEN) {
                  client.ws.send(JSON.stringify({ type: 'message', message: savedMessage }));
                }
              });
            }
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
