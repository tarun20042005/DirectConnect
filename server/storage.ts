import {
  type User, type InsertUser,
  type Property, type InsertProperty,
  type Chat, type InsertChat,
  type Message, type InsertMessage,
  type Appointment, type InsertAppointment,
  type Review, type InsertReview,
  type SavedProperty, type InsertSavedProperty
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | undefined>;
  
  getProperty(id: string): Promise<Property | undefined>;
  getProperties(): Promise<Property[]>;
  getPropertiesByOwner(ownerId: string): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: string, property: Partial<Property>): Promise<Property | undefined>;
  deleteProperty(id: string): Promise<boolean>;
  incrementPropertyViews(id: string): Promise<void>;
  
  getChat(id: string): Promise<Chat | undefined>;
  getChatByPropertyAndTenant(propertyId: string, tenantId: string): Promise<Chat | undefined>;
  createChat(chat: InsertChat): Promise<Chat>;
  
  getMessages(chatId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  getAppointment(id: string): Promise<Appointment | undefined>;
  getAppointmentsByUser(userId: string): Promise<Appointment[]>;
  getAppointmentsByProperty(propertyId: string): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, appointment: Partial<Appointment>): Promise<Appointment | undefined>;
  
  getReviews(propertyId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  getSavedProperties(userId: string): Promise<SavedProperty[]>;
  createSavedProperty(savedProperty: InsertSavedProperty): Promise<SavedProperty>;
  deleteSavedProperty(userId: string, propertyId: string): Promise<boolean>;

  createOtp(otp: any): Promise<any>;
  getOtpByUserAndCode(userId: string, code: string): Promise<any>;
  verifyOtp(userId: string, code: string): Promise<boolean>;

  createPayment(payment: any): Promise<any>;
  getPayment(id: string): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private properties: Map<string, Property>;
  private chats: Map<string, Chat>;
  private messages: Map<string, Message>;
  private appointments: Map<string, Appointment>;
  private reviews: Map<string, Review>;
  private savedProperties: Map<string, SavedProperty>;
  private otpCodes: Map<string, any>;
  private payments: Map<string, any>;

  constructor() {
    this.users = new Map();
    this.properties = new Map();
    this.chats = new Map();
    this.messages = new Map();
    this.appointments = new Map();
    this.reviews = new Map();
    this.savedProperties = new Map();
    this.otpCodes = new Map();
    this.payments = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      email: insertUser.email,
      password: insertUser.password,
      fullName: insertUser.fullName,
      role: insertUser.role,
      phone: insertUser.phone || null,
      avatarUrl: insertUser.avatarUrl || null,
      verified: false,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  async getProperty(id: string): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async getProperties(): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(p => p.available);
  }

  async getPropertiesByOwner(ownerId: string): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(
      (property) => property.ownerId === ownerId,
    );
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = randomUUID();
    const property: Property = {
      id,
      ownerId: insertProperty.ownerId,
      title: insertProperty.title,
      description: insertProperty.description,
      propertyType: insertProperty.propertyType,
      price: insertProperty.price,
      deposit: insertProperty.deposit || null,
      bedrooms: insertProperty.bedrooms,
      bathrooms: insertProperty.bathrooms,
      sqft: insertProperty.sqft || null,
      address: insertProperty.address,
      city: insertProperty.city,
      state: insertProperty.state,
      zipCode: insertProperty.zipCode,
      latitude: insertProperty.latitude,
      longitude: insertProperty.longitude,
      images: Array.isArray(insertProperty.images) ? (insertProperty.images as string[]) : [],
      amenities: Array.isArray(insertProperty.amenities) ? (insertProperty.amenities as string[]) : [],
      virtualTourUrl: insertProperty.virtualTourUrl || null,
      available: true,
      views: 0,
      createdAt: new Date(),
    };
    this.properties.set(id, property);
    return property;
  }

  async updateProperty(id: string, updates: Partial<Property>): Promise<Property | undefined> {
    const property = this.properties.get(id);
    if (!property) return undefined;
    const updated = { ...property, ...updates };
    this.properties.set(id, updated);
    return updated;
  }

  async deleteProperty(id: string): Promise<boolean> {
    return this.properties.delete(id);
  }

  async incrementPropertyViews(id: string): Promise<void> {
    const property = this.properties.get(id);
    if (property) {
      property.views = (property.views || 0) + 1;
      this.properties.set(id, property);
    }
  }

  async getChat(id: string): Promise<Chat | undefined> {
    return this.chats.get(id);
  }

  async getChatByPropertyAndTenant(propertyId: string, tenantId: string): Promise<Chat | undefined> {
    return Array.from(this.chats.values()).find(
      (chat) => chat.propertyId === propertyId && chat.tenantId === tenantId,
    );
  }

  async createChat(insertChat: InsertChat): Promise<Chat> {
    const id = randomUUID();
    const chat: Chat = {
      ...insertChat,
      id,
      createdAt: new Date(),
    };
    this.chats.set(id, chat);
    return chat;
  }

  async getMessages(chatId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((message) => message.chatId === chatId)
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async getAppointmentsByUser(userId: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.tenantId === userId || appointment.ownerId === userId,
    );
  }

  async getAppointmentsByProperty(propertyId: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.propertyId === propertyId,
    );
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = randomUUID();
    const appointment: Appointment = {
      id,
      propertyId: insertAppointment.propertyId,
      tenantId: insertAppointment.tenantId,
      ownerId: insertAppointment.ownerId,
      scheduledDate: insertAppointment.scheduledDate,
      status: insertAppointment.status || "pending",
      message: insertAppointment.message || null,
      createdAt: new Date(),
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    const updated = { ...appointment, ...updates };
    this.appointments.set(id, updated);
    return updated;
  }

  async getReviews(propertyId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.propertyId === propertyId,
    );
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = randomUUID();
    const review: Review = {
      ...insertReview,
      id,
      comment: insertReview.comment || null,
      createdAt: new Date(),
    };
    this.reviews.set(id, review);
    return review;
  }

  async getSavedProperties(userId: string): Promise<SavedProperty[]> {
    return Array.from(this.savedProperties.values()).filter(
      (saved) => saved.userId === userId,
    );
  }

  async createSavedProperty(insertSavedProperty: InsertSavedProperty): Promise<SavedProperty> {
    const id = randomUUID();
    const savedProperty: SavedProperty = {
      ...insertSavedProperty,
      id,
      createdAt: new Date(),
    };
    this.savedProperties.set(id, savedProperty);
    return savedProperty;
  }

  async deleteSavedProperty(userId: string, propertyId: string): Promise<boolean> {
    const saved = Array.from(this.savedProperties.values()).find(
      (s) => s.userId === userId && s.propertyId === propertyId,
    );
    if (saved) {
      return this.savedProperties.delete(saved.id);
    }
    return false;
  }

  async createOtp(otp: any): Promise<any> {
    const id = randomUUID();
    const otpEntry = { ...otp, id, createdAt: new Date() };
    this.otpCodes.set(id, otpEntry);
    return otpEntry;
  }

  async getOtpByUserAndCode(userId: string, code: string): Promise<any> {
    return Array.from(this.otpCodes.values()).find(
      (o: any) => o.userId === userId && o.code === code && !o.verified && new Date(o.expiresAt) > new Date()
    );
  }

  async verifyOtp(userId: string, code: string): Promise<boolean> {
    const otp = await this.getOtpByUserAndCode(userId, code);
    if (otp) {
      this.otpCodes.set(otp.id, { ...otp, verified: true });
      return true;
    }
    return false;
  }

  async createPayment(payment: any): Promise<any> {
    const id = randomUUID();
    const paymentEntry = { ...payment, id, createdAt: new Date() };
    this.payments.set(id, paymentEntry);
    return paymentEntry;
  }

  async getPayment(id: string): Promise<any> {
    return Array.from(this.payments.values()).find((p: any) => p.id === id);
  }
}

export const storage = new MemStorage();
