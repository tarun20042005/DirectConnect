import { 
  type User, type InsertUser,
  type Property, type InsertProperty,
  type Chat, type InsertChat,
  type Message, type InsertMessage,
  type Appointment, type InsertAppointment,
  type Review, type InsertReview,
  type SavedProperty, type InsertSavedProperty,
  users, properties, chats, messages, appointments, reviews, savedProperties
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
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

  async getProperties(): Promise<Property[]> {
    return await db.select().from(properties).where(eq(properties.available, true));
  }

  async getPropertiesByOwner(ownerId: string): Promise<Property[]> {
    return await db.select().from(properties).where(eq(properties.ownerId, ownerId));
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const result = await db.insert(properties).values(property).returning();
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

  async createReview(review: InsertReview): Promise<Review> {
    const result = await db.insert(reviews).values(review).returning();
    return result[0];
  }

  async getSavedProperties(userId: string): Promise<SavedProperty[]> {
    return await db.select().from(savedProperties).where(eq(savedProperties.userId, userId));
  }

  async createSavedProperty(savedProperty: InsertSavedProperty): Promise<SavedProperty> {
    const result = await db.insert(savedProperties).values(savedProperty).returning();
    return result[0];
  }

  async deleteSavedProperty(userId: string, propertyId: string): Promise<boolean> {
    const result = await db.delete(savedProperties)
      .where(and(eq(savedProperties.userId, userId), eq(savedProperties.propertyId, propertyId)));
    return result.rowCount > 0;
  }
}
