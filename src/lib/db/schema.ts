// Schema defines structure of the database
import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

// If role is system, it means it is sent by GPT
// If role is user, it means it is sent by the user
export const userSystemEnum = pgEnum("user_system_enum", ["user", "system"]);

export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  pdfName: text("pdf_name").notNull(),
  pdfUrl: text("pdf_url").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(), // time the chat was created at
  userId: varchar("user_id", { length: 256 }).notNull(),
  fileKey: text("file_key").notNull(), // for retrieving file from S3
});

export type DrizzleChat = typeof chats.$inferSelect;

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id")
    .references(() => chats.id)
    .notNull(), // each message will belong to a chat -- chatId is a foreign key
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(), // time the message was created at
  role: userSystemEnum("role").notNull(), // role of the sender of the message
});
