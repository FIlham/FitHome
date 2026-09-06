import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { db } from "../db";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import * as schema from "../db/schema"

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg", // or "pg" or "mysql"
        schema
    }),
    user: {
        additionalFields: {
            isAdmin: {
                type: "boolean",
                defaultValue: false,
                required: false,
                input: false,
            },
        },
    },
    emailAndPassword: {
        enabled: true
    },
    plugins: [tanstackStartCookies()]
});