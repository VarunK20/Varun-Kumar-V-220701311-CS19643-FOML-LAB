import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const questionTypes = [
  "multiple_choice",
  "checkbox",
  "text",
  "rating",
] as const;

export const surveys = pgTable("surveys", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  userId: integer("user_id").notNull(),
  isPublic: boolean("is_public").default(true).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").notNull(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  surveyId: integer("survey_id").notNull(),
  text: text("text").notNull(),
  type: text("type").notNull(),
  options: jsonb("options").$type<string[]>(),
  order: integer("order").notNull(),
  required: boolean("required").default(false).notNull(),
});

export const responses = pgTable("responses", {
  id: serial("id").primaryKey(),
  surveyId: integer("survey_id").notNull(),
  userId: integer("user_id"),
  submittedAt: timestamp("submitted_at").notNull(),
});

export const answers = pgTable("answers", {
  id: serial("id").primaryKey(),
  responseId: integer("response_id").notNull(),
  questionId: integer("question_id").notNull(),
  value: jsonb("value").notNull(), // Can be string, string[], number depending on question type
});

export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  surveyId: integer("survey_id").notNull(),
  insights: jsonb("insights").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

// Insert schemas
export const insertSurveySchema = createInsertSchema(surveys).omit({
  id: true,
  createdAt: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
});

export const insertResponseSchema = createInsertSchema(responses).omit({
  id: true,
});

export const insertAnswerSchema = createInsertSchema(answers).omit({
  id: true,
});

export const insertAnalysisSchema = createInsertSchema(analyses).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Survey = typeof surveys.$inferSelect;
export type InsertSurvey = z.infer<typeof insertSurveySchema>;

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type QuestionType = typeof questionTypes[number];

export type Response = typeof responses.$inferSelect;
export type InsertResponse = z.infer<typeof insertResponseSchema>;

export type Answer = typeof answers.$inferSelect;
export type InsertAnswer = z.infer<typeof insertAnswerSchema>;

export type Analysis = typeof analyses.$inferSelect;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;

// Frontend Survey Creation Type
export type SurveyCreationData = {
  title: string;
  description?: string;
  isPublic: boolean;
  isActive?: boolean;
  startDate: Date | string;
  endDate?: Date | string | null;
  questions: {
    text: string;
    type: QuestionType;
    options?: string[] | null;
    order: number;
    required: boolean;
  }[];
};

// Frontend Survey Response Type
export type SurveyResponseData = {
  surveyId: number;
  answers: {
    questionId: number;
    value: string | string[] | number;
  }[];
};

// Frontend Survey with Questions Type
export type SurveyWithQuestions = Survey & {
  questions: Question[];
};

// Frontend Survey Results Type
export type SurveyResults = Survey & {
  questions: Question[];
  responses: (Response & {
    answers: Answer[];
  })[];
  analysis?: Analysis;
};
