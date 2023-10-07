// This file holds the configuration on how we want to tell Drizzle where our schema is.
import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({path: ".env"}); // This is so we can access .env variables in the current file

export default {
    driver: 'pg',
    schema: './src/lib/db/schema.ts', // Tells Drizzle where our schema is
    dbCredentials: {
            connectionString: process.env.DATABASE_URL!, // Any folder outside src will not have access to .env variables
            // Note that the '!' means that we are sure that process.env.DATABASE_URL is not null
    }
} satisfies Config;

// Whenever we push our schema, we run a command in terminal:
// npx drizzle-kit push:pg -- This takes a look at our schema and makes sure our database in Neon is synced up with our schema
// To access drizzle-kit run npx drizzle-kit studio and go to localhost:4983 (terminal says http://0.0.0.0:4983/ but this doesn't work)
