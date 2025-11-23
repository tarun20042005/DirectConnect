import { db } from "./db";
import { users, properties } from "@shared/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seed() {
  try {
    console.log("Seeding database...");
    
    // Create a demo owner user
    const ownerEmail = "owner@demo.com";
    const existingOwner = await db.select().from(users).where(eq(users.email, ownerEmail)).limit(1);
    
    let ownerId: string;
    if (existingOwner.length === 0) {
      const hashedPassword = await bcrypt.hash("password123", 10);
      const owner = await db.insert(users).values({
        email: ownerEmail,
        password: hashedPassword,
        fullName: "Demo Owner",
        role: "owner",
        phone: "+91-9876543210",
        verified: true
      }).returning();
      ownerId = owner[0].id;
      console.log("Created demo owner user");
    } else {
      ownerId = existingOwner[0].id;
    }

    // Seed featured properties
    const featuredProps = [
      {
        ownerId,
        title: "Modern Apartment in Bangalore",
        description: "Beautiful 2BHK apartment in the heart of Bangalore with modern amenities",
        propertyType: "apartment",
        price: "50000",
        deposit: "100000",
        bedrooms: 2,
        bathrooms: 2,
        sqft: 1200,
        address: "123 MG Road, Bangalore",
        city: "Bangalore",
        state: "Karnataka",
        zipCode: "560001",
        latitude: "12.9716",
        longitude: "77.5946",
        images: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400"
        ],
        amenities: ["WiFi", "Parking", "Air Conditioning", "Balcony"],
        available: true
      },
      {
        ownerId,
        title: "Luxury 3BHK in Mumbai",
        description: "Premium 3-bedroom apartment in Mumbai with stunning city views",
        propertyType: "apartment",
        price: "85000",
        deposit: "200000",
        bedrooms: 3,
        bathrooms: 2,
        sqft: 1500,
        address: "456 Marine Drive, Mumbai",
        city: "Mumbai",
        state: "Maharashtra",
        zipCode: "400001",
        latitude: "19.0760",
        longitude: "72.8777",
        images: [
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400",
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400"
        ],
        amenities: ["WiFi", "Parking", "Gym", "Pool", "Balcony"],
        available: true
      },
      {
        ownerId,
        title: "Cozy Studio in Delhi",
        description: "Affordable studio apartment perfect for students and professionals",
        propertyType: "studio",
        price: "35000",
        deposit: "70000",
        bedrooms: 1,
        bathrooms: 1,
        sqft: 500,
        address: "789 Connaught Place, Delhi",
        city: "Delhi",
        state: "Delhi",
        zipCode: "110001",
        latitude: "28.6329",
        longitude: "77.2197",
        images: [
          "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400",
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400"
        ],
        amenities: ["WiFi", "Parking", "Pet Friendly"],
        available: true
      }
    ];

    for (const prop of featuredProps) {
      const existing = await db.select().from(properties)
        .where(eq(properties.title, prop.title))
        .limit(1);
      
      if (existing.length === 0) {
        await db.insert(properties).values(prop);
        console.log(`Created property: ${prop.title}`);
      }
    }

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

seed();
