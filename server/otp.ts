import { storage } from "./storage";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtp(userId: string, phone: string): Promise<string> {
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  await storage.createOtp({
    userId,
    code,
    phone,
    expiresAt,
    verified: false
  });

  // In production, integrate Twilio here:
  // await client.messages.create({
  //   body: `Your DirectConnect OTP is: ${code}`,
  //   from: process.env.TWILIO_PHONE,
  //   to: phone
  // });

  console.log(`OTP for ${phone}: ${code} (expires in 10 minutes)`);
  return code;
}

export async function verifyOtp(userId: string, code: string): Promise<boolean> {
  return await storage.verifyOtp(userId, code);
}
