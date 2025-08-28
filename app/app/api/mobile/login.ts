// pages/api/mobile/login.ts
import type { NextApiRequest, NextApiResponse } from "next";
import NextAuth from "next-auth/next";
import { authOptions } from "@/lib/auth"; // adjust path based on your project structure

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Delegate login to NextAuth
  return await NextAuth(req, res, authOptions);
}