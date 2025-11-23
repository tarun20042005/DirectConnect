import { db } from "./db";
import { users, properties } from "@shared/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seed() {
  try {
    console.log("Seeding database...");
    
    // Create demo owner users for each city
    const ownerEmails = [
      { email: "owner.bangalore@demo.com", name: "Rajesh Bangalore" },
      { email: "owner.chennai@demo.com", name: "Anand Chennai" },
      { email: "owner.coimbatore@demo.com", name: "Mukesh Coimbatore" },
      { email: "owner.tiruppur@demo.com", name: "Suresh Tiruppur" }
    ];

    const owners: { [key: string]: string } = {};
    for (const ownerInfo of ownerEmails) {
      const existing = await db.select().from(users).where(eq(users.email, ownerInfo.email)).limit(1);
      
      if (existing.length === 0) {
        const hashedPassword = await bcrypt.hash("password123", 10);
        const owner = await db.insert(users).values({
          email: ownerInfo.email,
          password: hashedPassword,
          fullName: ownerInfo.name,
          role: "owner",
          phone: "+91-9876543210",
          verified: true
        }).returning();
        owners[ownerInfo.email] = owner[0].id;
        console.log(`Created owner: ${ownerInfo.name}`);
      } else {
        owners[ownerInfo.email] = existing[0].id;
      }
    }

    // Seed properties for 4 cities
    const featuredProps = [
      {
        ownerId: owners["owner.bangalore@demo.com"],
        title: "Premium 2BHK in Indiranagar, Bangalore",
        description: "Spacious 2BHK apartment in the heart of Indiranagar with all modern amenities, close to metro, restaurants, and shopping malls",
        propertyType: "apartment",
        price: "45000",
        deposit: "90000",
        bedrooms: 2,
        bathrooms: 2,
        sqft: 1100,
        address: "123 100 Feet Road, Indiranagar, Bangalore",
        city: "Bangalore",
        state: "Karnataka",
        zipCode: "560038",
        latitude: "12.9698",
        longitude: "77.6412",
        images: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600",
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600"
        ],
        amenities: ["WiFi", "Parking", "Air Conditioning", "Balcony", "Gym", "Water"],
        available: true
      },
      {
        ownerId: owners["owner.chennai@demo.com"],
        title: "Modern 3BHK in Anna Nagar, Chennai",
        description: "Luxurious 3-bedroom apartment in Anna Nagar with premium finishes, good ventilation, and close to schools and hospitals",
        propertyType: "apartment",
        price: "55000",
        deposit: "110000",
        bedrooms: 3,
        bathrooms: 2,
        sqft: 1300,
        address: "456 Sooraswamy Road, Anna Nagar, Chennai",
        city: "Chennai",
        state: "Tamil Nadu",
        zipCode: "600040",
        latitude: "13.1690",
        longitude: "80.2237",
        images: [
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600",
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600"
        ],
        amenities: ["WiFi", "Parking", "Air Conditioning", "Swimming Pool", "Security"],
        available: true
      },
      {
        ownerId: owners["owner.coimbatore@demo.com"],
        title: "Cozy 2BHK in Race Course, Coimbatore",
        description: "Well-furnished 2-bedroom apartment near Race Course area with excellent connectivity to the main city, close to markets and amenities",
        propertyType: "apartment",
        price: "28000",
        deposit: "56000",
        bedrooms: 2,
        bathrooms: 1,
        sqft: 900,
        address: "789 Avinashi Road, Race Course, Coimbatore",
        city: "Coimbatore",
        state: "Tamil Nadu",
        zipCode: "641018",
        latitude: "11.0089",
        longitude: "76.9617",
        images: [
          "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600",
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600"
        ],
        amenities: ["WiFi", "Parking", "Air Conditioning", "Kitchen Appliances"],
        available: true
      },
      {
        ownerId: owners["owner.tiruppur@demo.com"],
        title: "Affordable 2BHK in Tiruppur Town",
        description: "Budget-friendly 2-bedroom apartment in central Tiruppur with easy access to shopping district, textile mills, and public transport",
        propertyType: "apartment",
        price: "22000",
        deposit: "44000",
        bedrooms: 2,
        bathrooms: 1,
        sqft: 850,
        address: "321 Palladam Road, Tiruppur Town, Tiruppur",
        city: "Tiruppur",
        state: "Tamil Nadu",
        zipCode: "641604",
        latitude: "11.1087",
        longitude: "77.3411",
        images: [
          "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600",
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600"
        ],
        amenities: ["WiFi", "Parking", "Balcony", "Water Supply"],
        available: true
      }
    ];

    for (const prop of featuredProps) {
      const existing = await db.select().from(properties)
        .where(eq(properties.title, prop.title))
        .limit(1);
      
      if (existing.length === 0) {
        const result = await db.insert(properties).values(prop).returning();
        console.log(`Created property: ${prop.title} (ID: ${result[0].id})`);
      } else {
        console.log(`Property already exists: ${prop.title}`);
      }
    }

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

seed();
