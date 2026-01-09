import { 
  type User, type InsertUser,
  type Property, type InsertProperty,
  type Chat, type InsertChat,
  type Message, type InsertMessage,
  type Appointment, type InsertAppointment,
  type Review, type InsertReview,
  type SavedProperty, type InsertSavedProperty,
  users, properties, chats, messages, appointments, reviews,
  otpCodes, savedProperties
} from "@shared/schema";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, and, gte, inArray } from "drizzle-orm";
import type { IStorage } from "./storage";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const result = await this.getUserByEmail(email);
    return !!result;
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  async getProperty(id: string): Promise<Property | undefined> {
    const result = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
    return result[0];
  }

  async getProperties(filters: any = {}): Promise<Property[]> {
    try {
      let query = db.select().from(properties);
      
      const conditions: any[] = [];
      if (filters.city) conditions.push(eq(properties.city, filters.city));
      if (filters.bedrooms && filters.bedrooms !== "any") conditions.push(gte(properties.bedrooms, parseInt(filters.bedrooms)));
      if (filters.bathrooms && filters.bathrooms !== "any") conditions.push(gte(properties.bathrooms, parseInt(filters.bathrooms)));
      if (filters.propertyType && filters.propertyType !== "any") conditions.push(eq(properties.propertyType, filters.propertyType));
      
      conditions.push(eq(properties.available, true));
      
      const result = await db.select().from(properties).where(and(...conditions));
      return result || [];
    } catch (error) {
      console.error("Database error in getProperties:", error);
      try {
        const fallback = await db.select().from(properties).where(eq(properties.available, true));
        return fallback || [];
      } catch (innerError) {
        console.error("Critical fallback database error:", innerError);
        return [];
      }
    }
  }

  async getPropertiesByOwner(ownerId: string): Promise<Property[]> {
    return await db.select().from(properties).where(eq(properties.ownerId, ownerId));
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const result = await db.insert(properties).values(property as any).returning();
    return result[0];
  }

  async updateProperty(id: string, updates: Partial<Property>): Promise<Property | undefined> {
    const result = await db.update(properties).set(updates).where(eq(properties.id, id)).returning();
    return result[0];
  }

  async deleteProperty(id: string): Promise<boolean> {
    const result = await db.delete(properties).where(eq(properties.id, id));
    return result.rowCount > 0;
  }

  async incrementPropertyViews(id: string): Promise<void> {
    const property = await this.getProperty(id);
    if (property) {
      await this.updateProperty(id, { views: (property.views || 0) + 1 });
    }
  }

  async getSavedProperties(userId: string): Promise<Property[]> {
    const saved = await db.select().from(savedProperties).where(eq(savedProperties.userId, userId));
    const ids = saved.map(s => s.propertyId);
    if (ids.length === 0) return [];
    return await db.select().from(properties).where(inArray(properties.id, ids));
  }

  async toggleSavedProperty(userId: string, propertyId: string): Promise<boolean> {
    const existing = await db.select().from(savedProperties)
      .where(and(eq(savedProperties.userId, userId), eq(savedProperties.propertyId, propertyId)))
      .limit(1);
    
    if (existing[0]) {
      await db.delete(savedProperties).where(eq(savedProperties.id, existing[0].id));
      return false;
    }
    
    await db.insert(savedProperties).values({ userId, propertyId });
    return true;
  }

  async isPropertySaved(userId: string, propertyId: string): Promise<boolean> {
    const existing = await db.select().from(savedProperties)
      .where(and(eq(savedProperties.userId, userId), eq(savedProperties.propertyId, propertyId)))
      .limit(1);
    return !!existing[0];
  }

  async getChat(id: string): Promise<Chat | undefined> {
    const result = await db.select().from(chats).where(eq(chats.id, id)).limit(1);
    return result[0];
  }

  async getChatByPropertyAndTenant(propertyId: string, tenantId: string): Promise<Chat | undefined> {
    const result = await db.select().from(chats)
      .where(and(eq(chats.propertyId, propertyId), eq(chats.tenantId, tenantId)))
      .limit(1);
    return result[0];
  }

  async getChatsByOwner(ownerId: string): Promise<Chat[]> {
    return await db.select().from(chats).where(eq(chats.ownerId, ownerId));
  }

  async getChatsByTenant(tenantId: string): Promise<Chat[]> {
    return await db.select().from(chats).where(eq(chats.tenantId, tenantId));
  }

  async createChat(chat: InsertChat): Promise<Chat> {
    const result = await db.insert(chats).values(chat).returning();
    return result[0];
  }

  async getMessages(chatId: string): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.chatId, chatId));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await db.insert(messages).values(message).returning();
    return result[0];
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    const result = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
    return result[0];
  }

  async getAppointmentsByUser(userId: string): Promise<Appointment[]> {
    return await db.select().from(appointments)
      .where(eq(appointments.tenantId, userId));
  }

  async getAppointmentsByOwner(ownerId: string): Promise<Appointment[]> {
    return await db.select().from(appointments)
      .where(eq(appointments.ownerId, ownerId));
  }

  async getAppointmentsByProperty(propertyId: string): Promise<Appointment[]> {
    return await db.select().from(appointments).where(eq(appointments.propertyId, propertyId));
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const result = await db.insert(appointments).values(appointment).returning();
    return result[0];
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | undefined> {
    const result = await db.update(appointments).set(updates).where(eq(appointments.id, id)).returning();
    return result[0];
  }

  async getReviews(propertyId: string): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.propertyId, propertyId));
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const result = await db.insert(reviews).values(review).returning();
    return result[0];
  }

  async createOtp(otp: any): Promise<any> {
    const result = await db.insert(otpCodes).values(otp).returning();
    return result[0];
  }

  async getOtpByUserAndCode(userId: string, code: string): Promise<any> {
    const result = await db
      .select()
      .from(otpCodes)
      .where(and(eq(otpCodes.userId, userId), eq(otpCodes.code, code)));
    return result[0];
  }

  async verifyOtp(userId: string, code: string): Promise<boolean> {
    const result = await db
      .update(otpCodes)
      .set({ verified: true })
      .where(and(eq(otpCodes.userId, userId), eq(otpCodes.code, code)));
    return result.rowCount > 0;
  }
}
