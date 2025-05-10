import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertSurveySchema, 
  insertQuestionSchema, 
  insertResponseSchema,
  insertAnswerSchema,
  SurveyCreationData,
  SurveyResponseData,
  QuestionType
} from "@shared/schema";
import { z } from "zod";
import { generateDetailedAnalysis } from "./gemini";
import { generateSurveyQuestions, generateSurveyPredictions } from "./gemini";
import dotenv from 'dotenv';
dotenv.config();

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // User statistics
  app.get("/api/user/stats", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user!.id;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user statistics:", error);
      res.status(500).json({ message: "Failed to fetch user statistics" });
    }
  });

  // Survey Routes
  // Create a new survey with questions
  app.post("/api/surveys", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const surveyData: SurveyCreationData = req.body;
      
      // Validate basic survey data
      const validatedSurvey = {
        title: surveyData.title,
        description: surveyData.description || "",
        userId: req.user!.id,
        isPublic: surveyData.isPublic,
        startDate: new Date(surveyData.startDate),
        endDate: surveyData.endDate ? new Date(surveyData.endDate) : null,
      };
      
      // Create the survey
      const survey = await storage.createSurvey(validatedSurvey);
      
      // Create all questions for the survey
      const questions = await Promise.all(
        surveyData.questions.map(async (q) => {
          const questionData = {
            surveyId: survey.id,
            text: q.text,
            type: q.type as QuestionType,
            options: q.options || null,
            order: q.order,
          };
          
          return await storage.createQuestion(questionData);
        })
      );
      
      res.status(201).json({ ...survey, questions });
    } catch (error) {
      console.error("Error creating survey:", error);
      res.status(400).json({ message: "Invalid survey data" });
    }
  });

  // Get all surveys for the current user
  app.get("/api/surveys/my", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const surveys = await storage.getUserSurveys(req.user!.id);
      res.json(surveys);
    } catch (error) {
      console.error("Error fetching user surveys:", error);
      res.status(500).json({ message: "Failed to fetch surveys" });
    }
  });

  // Get all public surveys
  app.get("/api/surveys/public", async (req: Request, res: Response) => {
    try {
      // Always return all public surveys regardless of owner
      const surveys = await storage.getPublicSurveys();
      res.json(surveys);
    } catch (error) {
      console.error("Error fetching public surveys:", error);
      res.status(500).json({ message: "Failed to fetch public surveys" });
    }
  });
  
  // Get answerable surveys (public surveys excluding the user's own and those they've already answered)
  app.get("/api/surveys/answerable", async (req: Request, res: Response) => {
    try {
      // If user is authenticated, exclude their own surveys and answered surveys
      const userId = req.isAuthenticated() ? req.user!.id : undefined;
      // Handle the case where userId might not be a number
      const userIdNum = userId !== undefined ? Number(userId) : undefined;
      if (userId !== undefined && isNaN(userIdNum!)) {
        throw new Error("Invalid user ID");
      }
      const surveys = await storage.getAnswerableSurveys(userIdNum);
      res.json(surveys);
    } catch (error) {
      console.error("Error fetching answerable surveys:", error);
      res.status(500).json({ message: "Failed to fetch answerable surveys" });
    }
  });
  
  // Get surveys that the user has answered
  app.get("/api/surveys/answered", async (req: Request, res: Response) => {
    try {
      // This endpoint requires authentication
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = Number(req.user!.id);
      if (isNaN(userId)) {
        throw new Error("Invalid user ID");
      }
      
      const surveys = await storage.getAnsweredSurveys(userId);
      res.json(surveys);
    } catch (error) {
      console.error("Error fetching answered surveys:", error);
      res.status(500).json({ message: "Failed to fetch answered surveys" });
    }
  });
  
  // Get inactive surveys for the current user
  app.get("/api/surveys/inactive", async (req: Request, res: Response) => {
    try {
      // This endpoint requires authentication
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = Number(req.user!.id);
      if (isNaN(userId)) {
        throw new Error("Invalid user ID");
      }
      
      const surveys = await storage.getInactiveSurveys(userId);
      res.json(surveys);
    } catch (error) {
      console.error("Error fetching inactive surveys:", error);
      res.status(500).json({ message: "Failed to fetch inactive surveys" });
    }
  });

  // Get a specific survey with its questions
  app.get("/api/surveys/:id", async (req: Request, res: Response) => {
    try {
      const surveyId = Number(req.params.id);
      
      if (isNaN(surveyId)) {
        return res.status(400).json({ message: "Invalid survey ID" });
      }
      
      const survey = await storage.getSurveyWithQuestions(surveyId);
      
      if (!survey) {
        return res.status(404).json({ message: "Survey not found" });
      }
      
      res.json(survey);
    } catch (error) {
      console.error("Error fetching survey:", error);
      res.status(500).json({ message: "Failed to fetch survey" });
    }
  });
  
  // Update survey status (active/inactive)
  app.patch("/api/surveys/:id/status", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const surveyId = Number(req.params.id);
      
      if (isNaN(surveyId)) {
        return res.status(400).json({ message: "Invalid survey ID" });
      }
      
      // Get the survey to check ownership
      const survey = await storage.getSurvey(surveyId);
      
      if (!survey) {
        return res.status(404).json({ message: "Survey not found" });
      }
      
      // Check if user is the owner
      if (req.user!.id !== survey.userId) {
        return res.status(403).json({ message: "You don't have permission to update this survey" });
      }
      
      const { isActive, isPublic } = req.body;
      
      // Update the survey status
      const updatedSurvey = await storage.updateSurveyStatus(surveyId, {
        isActive: isActive !== undefined ? isActive : survey.isActive,
        isPublic: isPublic !== undefined ? isPublic : survey.isPublic
      });
      
      res.json(updatedSurvey);
    } catch (error) {
      console.error("Error updating survey status:", error);
      res.status(500).json({ message: "Failed to update survey status" });
    }
  });
  
  // Delete a survey
  app.delete("/api/surveys/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const surveyId = Number(req.params.id);
      
      if (isNaN(surveyId)) {
        return res.status(400).json({ message: "Invalid survey ID" });
      }
      
      // Get the survey to check ownership
      const survey = await storage.getSurvey(surveyId);
      
      if (!survey) {
        return res.status(404).json({ message: "Survey not found" });
      }
      
      // Check if user is the owner
      if (req.user!.id !== survey.userId) {
        return res.status(403).json({ message: "You don't have permission to delete this survey" });
      }
      
      // Delete the survey
      await storage.deleteSurvey(surveyId);
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting survey:", error);
      res.status(500).json({ message: "Failed to delete survey" });
    }
  });

  // Submit a survey response
  app.post("/api/surveys/:id/responses", async (req: Request, res: Response) => {
    try {
      const surveyId = Number(req.params.id);
      
      if (isNaN(surveyId)) {
        return res.status(400).json({ message: "Invalid survey ID" });
      }
      
      const responseData: SurveyResponseData = req.body;
      
      // Validate that the survey exists
      const survey = await storage.getSurvey(surveyId);
      if (!survey) {
        return res.status(404).json({ message: "Survey not found" });
      }
      
      // Create the response record
      const response = await storage.createResponse({
        surveyId,
        userId: req.isAuthenticated() ? req.user!.id : null,
        submittedAt: new Date(),
      });
      
      // Create all the answer records
      const answers = await Promise.all(
        responseData.answers.map(async (a) => {
          return await storage.createAnswer({
            responseId: response.id,
            questionId: a.questionId,
            value: a.value,
          });
        })
      );
      
      res.status(201).json({ ...response, answers });
    } catch (error) {
      console.error("Error submitting survey response:", error);
      res.status(400).json({ message: "Invalid response data" });
    }
  });

  // Get survey results (responses and analysis)
  app.get("/api/surveys/:id/results", async (req: Request, res: Response) => {
    try {
      const surveyId = Number(req.params.id);
      
      if (isNaN(surveyId)) {
        return res.status(400).json({ message: "Invalid survey ID" });
      }
      
      // Get the survey
      const survey = await storage.getSurvey(surveyId);
      
      if (!survey) {
        return res.status(404).json({ message: "Survey not found" });
      }
      
      // Check if user is authorized to see results (must be the survey creator)
      if (!req.isAuthenticated() || req.user!.id !== survey.userId) {
        return res.status(403).json({ message: "Not authorized to view these results" });
      }
      
      const results = await storage.getSurveyResults(surveyId);
      res.json(results);
    } catch (error) {
      console.error("Error fetching survey results:", error);
      res.status(500).json({ message: "Failed to fetch survey results" });
    }
  });

  // Generate AI analysis for a survey
  app.post("/api/surveys/:id/analyze", async (req: Request, res: Response) => {
    try {
      const surveyId = Number(req.params.id);
      
      if (isNaN(surveyId)) {
        return res.status(400).json({ message: "Invalid survey ID" });
      }
      
      // Get the survey results
      const results = await storage.getSurveyResults(surveyId);
      
      if (!results) {
        return res.status(404).json({ message: "Survey not found" });
      }
      
      // Check if user is authorized (must be the survey creator)
      if (!req.isAuthenticated() || req.user!.id !== results.userId) {
        return res.status(403).json({ message: "Not authorized to analyze this survey" });
      }
      
      // Check if there are enough responses to analyze
      if (results.responses.length === 0) {
        return res.status(400).json({ message: "No responses to analyze" });
      }
      
      // Generate AI analysis
      const insights = await generateDetailedAnalysis(
        results.title ?? "Untitled Survey",
        results.description ?? "No description provided",
        results.responses
      );
  ;
      
      // Save the analysis
      const analysis = await storage.createAnalysis({
        surveyId,
        insights,
        createdAt: new Date(),
      });
      
      res.json(analysis);
    } catch (error) {
      console.error("Error generating analysis:", error);
      res.status(500).json({ message: "Failed to generate analysis" });
    }
  });

  // Generate AI-powered survey questions based on topic
  app.post("/api/ai/generate-questions", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { topic, description, numQuestions } = req.body;
      
      if (!topic) {
        return res.status(400).json({ message: "Topic is required" });
      }
      
      const suggestedQuestions = await generateSurveyQuestions(
        topic,
        description || "",
        numQuestions || 5
      );
      
      res.json(suggestedQuestions);
    } catch (error) {
      console.error("Error generating survey questions:", error);
      res.status(500).json({ message: "Failed to generate survey questions" });
    }
  });

  // Generate predictive analytics for a survey
  app.post("/api/ai/predict-survey", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { 
        title, 
        description, 
        questions, 
        previousStats 
      } = req.body;
      
      if (!title || !questions || !Array.isArray(questions)) {
        return res.status(400).json({ message: "Title and questions array are required" });
      }
      
      const requiredQuestionCount = questions.filter((q: any) => q.required).length;
      
      const prediction = await generateSurveyPredictions(
        title,
        description || "",
        questions.length,
        requiredQuestionCount,
        previousStats
      );
      
      res.json(prediction);
    } catch (error) {
      console.error("Error generating survey predictions:", error);
      res.status(500).json({ message: "Failed to generate survey predictions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
