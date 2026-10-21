import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "@/lib/auth.config";
import { otpVerifySchema } from "@/lib/validators/auth";
import { verifyOtp } from "@/server/auth/otp";
import { prisma } from "@/server/db/client";
import { findOrCreateUserByPhone } from "@/server/db/users";

/**
 * The full Auth.js instance: `authConfig` (providers + RBAC) plus the things
 * that must never reach the proxy bundle — the Prisma adapter and the
 * database-backed OTP provider.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    ...authConfig.providers,
    Credentials({
      id: "phone-otp",
      name: "Phone OTP",
      credentials: {
        phone: { label: "Mobile number", type: "tel", placeholder: "9876543210" },
        code: { label: "One-time code", type: "text", placeholder: "123456" },
      },
      async authorize(credentials) {
        const parsed = otpVerifySchema.safeParse(credentials);
        if (!parsed.success) return null;

        const verified = await verifyOtp(parsed.data.phone, parsed.data.code);
        if (!verified) return null;

        const user = await findOrCreateUserByPhone(parsed.data.phone);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          phone: user.phone,
        };
      },
    }),
  ],
});
