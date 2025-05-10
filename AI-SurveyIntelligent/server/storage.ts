import { users, surveys, questions, responses, answers, analyses } from "@shared/schema";
import type { 
  User, InsertUser, Survey, InsertSurvey, 
  Question, InsertQuestion, Response, InsertResponse,
  Answer, InsertAnswer, Analysis, InsertAnalysis,
  SurveyWithQuestions, SurveyResults
} from "@shared/schema";
import { eq, ne, and, desc, asc, not, inArray } from "drizzle-orm";
import { db, pool } from "./db";
import dotenv from 'dotenv';
dotenv.config();

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Survey methods
  createSurvey(survey: InsertSurvey): Promise<Survey>;
  getSurvey(id: number): Promise<Survey | undefined>;
  getSurveyWithQuestions(id: number): Promise<SurveyWithQuestions | undefined>;
  getUserSurveys(userId: number): Promise<Survey[]>;
  getPublicSurveys(): Promise<Survey[]>;
  getAnswerableSurveys(userId?: number): Promise<Survey[]>;
  getAnsweredSurveys(userId: number): Promise<Survey[]>;
  updateSurveyStatus(id: number, status: { isActive?: boolean, isPublic?: boolean }): Promise<Survey>;
  deleteSurvey(id: number): Promise<void>;
  getInactiveSurveys(userId: number): Promise<Survey[]>;
  
  // Question methods
  createQuestion(question: InsertQuestion): Promise<Question>;
  getQuestionsBySurveyId(surveyId: number): Promise<Question[]>;
  
  // Response methods
  createResponse(response: InsertResponse): Promise<Response>;
  createAnswer(answer: InsertAnswer): Promise<Answer>;
  getSurveyResponses(surveyId: number): Promise<Response[]>;
  getResponseWithAnswers(responseId: number): Promise<(Response & { answers: Answer[] }) | undefined>;
  getSurveyResults(surveyId: number): Promise<SurveyResults | undefined>;
  
  // Analysis methods
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  getAnalysis(surveyId: number): Promise<Analysis | undefined>;
  
  // Statistics methods
  getUserStats(userId: number): Promise<{ totalResponses: number, aiInsightsGenerated: number }>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Simple constructor with no complex session store
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Survey methods
  async createSurvey(insertSurvey: InsertSurvey): Promise<Survey> {
    // Ensure all dates are properly converted to Date objects
    const parsedDates = {
      ...insertSurvey,
      startDate: new Date(insertSurvey.startDate),
      endDate: insertSurvey.endDate ? new Date(insertSurvey.endDate) : null,
      createdAt: new Date()
    };
    
    const [survey] = await db.insert(surveys).values(parsedDates).returning();
    return survey;
  }

  async getSurvey(id: number): Promise<Survey | undefined> {
    const [survey] = await db.select().from(surveys).where(eq(surveys.id, id));
    return survey;
  }

  async getSurveyWithQuestions(id: number): Promise<SurveyWithQuestions | undefined> {
    const survey = await this.getSurvey(id);
    if (!survey) return undefined;
    
    const questions = await this.getQuestionsBySurveyId(id);
    return { ...survey, questions };
  }

  async getUserSurveys(userId: number): Promise<Survey[]> {
    return await db.select().from(surveys)
      .where(and(
        eq(surveys.userId, userId),
        eq(surveys.isActive, true)
      ))
      .orderBy(desc(surveys.createdAt));
  }

  async getPublicSurveys(): Promise<Survey[]> {
    // Return all public, active surveys
    return await db.select().from(surveys)
      .where(and(
        eq(surveys.isPublic, true),
        eq(surveys.isActive, true)
      ))
      .orderBy(desc(surveys.createdAt));
  }
  
  async getAnswerableSurveys(userId?: number): Promise<Survey[]> {
    // If no user ID provided, return all public and active surveys
    if (userId === undefined) {
      return await db.select().from(surveys)
        .where(and(
          eq(surveys.isPublic, true),
          eq(surveys.isActive, true)
        ))
        .orderBy(desc(surveys.createdAt));
    }
    
    // Get IDs of surveys that the user has already answered
    const answeredSurveyIds = await db
      .select({ surveyId: responses.surveyId })
      .from(responses)
      .where(eq(responses.userId, userId))
      .then(results => results.map(r => r.surveyId));
    
    // Return public and active surveys that the user hasn't created and hasn't answered yet
    return await db.select().from(surveys)
      .where(and(
        eq(surveys.isPublic, true),
        eq(surveys.isActive, true),
        ne(surveys.userId, userId),
        not(inArray(surveys.id, answeredSurveyIds))
      ))
      .orderBy(desc(surveys.createdAt));
  }
  
  // Get surveys that the user has already answered
  async getAnsweredSurveys(userId: number): Promise<Survey[]> {
    // Get IDs of surveys that the user has answered
    const answeredSurveyIds = await db
      .select({ surveyId: responses.surveyId })
      .from(responses)
      .where(eq(responses.userId, userId))
      .then(results => results.map(r => r.surveyId));
    
    if (answeredSurveyIds.length === 0) {
      return [];
    }
    
    // Get the surveys that the user has answered
    return await db.select().from(surveys)
      .where(inArray(surveys.id, answeredSurveyIds))
      .orderBy(desc(surveys.createdAt));
  }

  // Question methods
  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    // Create a clean question object with only the required fields
    const questionData = {
      text: insertQuestion.text,
      type: insertQuestion.type,
      surveyId: insertQuestion.surveyId,
      order: insertQuestion.order,
      required: insertQuestion.required || false,
      // Only include options if they exist and are an array
      ...(Array.isArray(insertQuestion.options) ? { options: insertQuestion.options } : { options: null })
    };
    
    // Insert the question into the database
    const [question] = await db.insert(questions).values(questionData).returning();
    return question;
  }

  async getQuestionsBySurveyId(surveyId: number): Promise<Question[]> {
    return await db.select().from(questions)
      .where(eq(questions.surveyId, surveyId))
      .orderBy(asc(questions.order));
  }

  // Response methods
  async createResponse(insertResponse: InsertResponse): Promise<Response> {
    const [response] = await db.insert(responses).values(insertResponse).returning();
    return response;
  }

  async createAnswer(insertAnswer: InsertAnswer): Promise<Answer> {
    const [answer] = await db.insert(answers).values(insertAnswer).returning();
    return answer;
  }

  async getSurveyResponses(surveyId: number): Promise<Response[]> {
    return await db.select().from(responses)
      .where(eq(responses.surveyId, surveyId))
      .orderBy(desc(responses.submittedAt));
  }

  async getResponseWithAnswers(responseId: number): Promise<(Response & { answers: Answer[] }) | undefined> {
    const [response] = await db.select().from(responses).where(eq(responses.id, responseId));
    if (!response) return undefined;
    
    const responseAnswers = await db.select().from(answers)
      .where(eq(answers.responseId, responseId));
    
    return { ...response, answers: responseAnswers };
  }

  async getSurveyResults(surveyId: number): Promise<SurveyResults | undefined> {
    const survey = await this.getSurveyWithQuestions(surveyId);
    if (!survey) return undefined;
    
    const surveyResponses = await this.getSurveyResponses(surveyId);
    
    const responsesWithAnswers = await Promise.all(
      surveyResponses.map(async (response) => {
        const fullResponse = await this.getResponseWithAnswers(response.id);
        return fullResponse!;
      })
    );
    
    const analysis = await this.getAnalysis(surveyId);
    
    return {
      ...survey,
      responses: responsesWithAnswers,
      analysis
    };
  }

  // Analysis methods
  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const [analysis] = await db.insert(analyses).values(insertAnalysis).returning();
    return analysis;
  }

  async getAnalysis(surveyId: number): Promise<Analysis | undefined> {
    const [analysis] = await db.select().from(analyses)
      .where(eq(analyses.surveyId, surveyId))
      .orderBy(desc(analyses.createdAt))
      .limit(1);
    return analysis;
  }
  
  // Update a survey's status (active/inactive, public/private)
  async updateSurveyStatus(id: number, status: { isActive?: boolean, isPublic?: boolean }): Promise<Survey> {
    const [updatedSurvey] = await db
      .update(surveys)
      .set(status)
      .where(eq(surveys.id, id))
      .returning();
    
    return updatedSurvey;
  }
  
  // Delete a survey and all its related data
  async deleteSurvey(id: number): Promise<void> {
    // Start a transaction to ensure all related data is deleted
    await db.transaction(async (tx) => {
      // First get all responses to delete their answers
      const surveyResponses = await tx
        .select({ id: responses.id })
        .from(responses)
        .where(eq(responses.surveyId, id));
      
      const responseIds = surveyResponses.map(r => r.id);
      
      // Delete answers related to the responses
      if (responseIds.length > 0) {
        await tx
          .delete(answers)
          .where(inArray(answers.responseId, responseIds));
      }
      
      // Delete the responses
      await tx
        .delete(responses)
        .where(eq(responses.surveyId, id));
      
      // Delete the questions
      await tx
        .delete(questions)
        .where(eq(questions.surveyId, id));
      
      // Delete the analysis
      await tx
        .delete(analyses)
        .where(eq(analyses.surveyId, id));
      
      // Finally, delete the survey
      await tx
        .delete(surveys)
        .where(eq(surveys.id, id));
    });
  }
  
  // Get inactive surveys for a user
  async getInactiveSurveys(userId: number): Promise<Survey[]> {
    return await db.select().from(surveys)
      .where(and(
        eq(surveys.userId, userId),
        eq(surveys.isActive, false)
      ))
      .orderBy(desc(surveys.createdAt));
  }
  
  // Get statistics for a user
  async getUserStats(userId: number): Promise<{ totalResponses: number, aiInsightsGenerated: number }> {
    // Get surveys created by the user
    const userSurveys = await db.select({ id: surveys.id })
      .from(surveys)
      .where(eq(surveys.userId, userId));
    
    const surveyIds = userSurveys.map(s => s.id);
    
    // If user has no surveys, return zero counts
    if (surveyIds.length === 0) {
      return { totalResponses: 0, aiInsightsGenerated: 0 };
    }
    
    // Count total responses for the user's surveys
    const responseResults = await db
      .select()
      .from(responses)
      .where(inArray(responses.surveyId, surveyIds));
      
    const totalResponses = responseResults.length;
    
    // Count AI analyses generated for the user's surveys
    const analysisResults = await db
      .select()
      .from(analyses)
      .where(inArray(analyses.surveyId, surveyIds));
      
    const aiInsightsGenerated = analysisResults.length;
    
    return { totalResponses, aiInsightsGenerated };
  }
}

// Use the database storage implementation
export const storage = new DatabaseStorage();
