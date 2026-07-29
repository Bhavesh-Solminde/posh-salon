import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "./db";
import { SITE_URL } from "./brand";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  trustedOrigins: [SITE_URL],
  logger: {
    level: "debug",
    disabled: false,
  },
  // Staff-only tool: no public sign-up. Accounts are seeded / created by an admin.
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  user: {
    additionalFields: {
      // Managed by admin, never set from a client request.
      role: {
        type: "string",
        required: false,
        defaultValue: "CASHIER",
        input: false,
      },
      isActive: {
        type: "boolean",
        required: false,
        defaultValue: true,
        input: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh daily
  },
  plugins: [nextCookies()],
});

export type StaffRole = "ADMIN" | "MANAGER" | "CASHIER";
