import { GoogleGenerativeAI } from "@google/generative-ai";
import { SurveyResults } from "@shared/schema";
import dotenv from 'dotenv';
dotenv.config();
// Simple types for insight generation
type InsightType = "general" | "improvement" | "segment" | "trend";

interface SurveyInsight {
  type: InsightType;
  title: string;
  description: string;
  confidence: number;
  relevance: number;
}

interface SurveyAnalysisResult {
  summaryStats: {
    totalResponses: number;
    averageSatisfaction?: number;
    completionRate?: number;
  };
  keyInsights: SurveyInsight[];
  questionAnalysis: {
    questionId: number;
    questionText: string;
    analysis: string;
    stats: Record<string, any>;
  }[];
}

// Initialize the Gemini API
const API_KEY = process.env.GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;
const model = genAI?.getGenerativeModel({ model: "gemini-1.5-pro" });

/**
 * Generate a survey analysis using Gemini AI
 * Falls back to basic statistical analysis if API key is not available
 */
export async function generateSurveyAnalysis(results: SurveyResults): Promise<SurveyAnalysisResult> {
  // First generate the basic statistics (we'll need these regardless)
  const basicAnalysis = await generateBasicAnalysis(results);
  
  // If no API key or fewer than 3 responses, return basic analysis
  if (!model || results.responses.length < 3) {
    return basicAnalysis;
  }
  
  try {
    // Prepare survey data for the AI
    const surveyData = {
      title: results.title,
      description: results.description,
      questions: results.questions.map(q => ({
        id: q.id,
        text: q.text,
        type: q.type,
        options: q.options
      })),
      responses: results.responses.map(r => ({
        id: r.id,
        answers: r.answers.map(a => ({
          questionId: a.questionId,
          value: a.value
        }))
      }))
    };
    
    // Create prompt for Gemini
    const prompt = `
    You are a survey analysis expert. Analyze the following survey results and provide insights.

    Survey: "${results.title}"
    Description: "${results.description || 'No description provided'}"
    Number of responses: ${results.responses.length}
    
    The survey has ${results.questions.length} questions:
    ${results.questions.map(q => {
      return `
      Question ${q.id}: "${q.text}" (Type: ${q.type})
      ${q.options ? `Options: ${q.options.join(', ')}` : ''}
      Responses: ${results.responses
        .flatMap(r => r.answers)
        .filter(a => a.questionId === q.id)
        .map(a => JSON.stringify(a.value))
        .join(', ')}
      `;
    }).join('\n')}
    
    Based on this data, please provide:
    1. A summary of response statistics
    2. 3-5 key insights from the data
    3. An analysis for each question
    
    Return your analysis as a JSON object with these properties:
    {
      "summaryStats": {
        "totalResponses": number,
        "averageSatisfaction": number (if applicable),
        "completionRate": number
      },
      "keyInsights": [
        {
          "type": string (one of: "general", "improvement", "segment", "trend"),
          "title": string,
          "description": string,
          "confidence": number (between 0-1),
          "relevance": number (between 1-10)
        }
      ],
      "questionAnalysis": [
        {
          "questionId": number,
          "analysis": string
        }
      ]
    }
    `;

    // Get analysis from Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON part from the response
    const jsonMatch = text.match(/\\{[\s\S]*\\}/);
    
    if (!jsonMatch) {
      console.error('Failed to parse JSON from Gemini response');
      return basicAnalysis;
    }
    
    // Parse the analysis
    const aiAnalysis = JSON.parse(jsonMatch[0]);
    
    // Combine AI analysis with basic stats
    return {
      summaryStats: {
        ...basicAnalysis.summaryStats,
        ...aiAnalysis.summaryStats
      },
      keyInsights: aiAnalysis.keyInsights || basicAnalysis.keyInsights,
      questionAnalysis: results.questions.map(question => {
        // Find AI analysis for this question
        const aiQuestionAnalysis = aiAnalysis.questionAnalysis?.find(
          (qa: any) => qa.questionId === question.id
        );
        
        // Find basic analysis for this question
        const basicQuestionAnalysis = basicAnalysis.questionAnalysis.find(
          qa => qa.questionId === question.id
        );
        
        return {
          questionId: question.id,
          questionText: question.text,
          analysis: aiQuestionAnalysis?.analysis || basicQuestionAnalysis?.analysis || '',
          stats: basicQuestionAnalysis?.stats || {}
        };
      })
    };
  } catch (error) {
    console.error('Error generating AI analysis:', error);
    return basicAnalysis;
  }
}

/**
 * Generate a basic survey analysis without AI
 * Used as fallback when AI is not available
 */
async function generateBasicAnalysis(results: SurveyResults): Promise<SurveyAnalysisResult> {
  // Generate basic statistics
  const totalResponses = results.responses.length;
  
  // Generate basic insights
  const keyInsights: SurveyInsight[] = [
    {
      type: "general",
      title: "Response Summary",
      description: `Your survey received ${totalResponses} responses.`,
      confidence: 1,
      relevance: 10
    }
  ];
  
  // Create question analysis
  const questionAnalysis = results.questions.map(question => {
    const questionResponses = results.responses
      .flatMap(response => response.answers)
      .filter(answer => answer.questionId === question.id);
      
    let analysis = `Received ${questionResponses.length} responses to this question.`;
    let stats: Record<string, any> = { responseCount: questionResponses.length };
    
    // For multiple choice questions, calculate basic statistics
    if (question.type === 'multiple_choice' && question.options) {
      const optionCounts: Record<string, number> = {};
      question.options.forEach(option => { optionCounts[option] = 0; });
      
      questionResponses.forEach(response => {
        // Safely convert value to string
        const valueStr = String(response.value);
        optionCounts[valueStr] = (optionCounts[valueStr] || 0) + 1;
      });
      
      stats.optionCounts = optionCounts;
      
      // Find the most common answer
      let maxCount = 0;
      let mostCommonOption = '';
      Object.entries(optionCounts).forEach(([option, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mostCommonOption = option;
        }
      });
      
      if (mostCommonOption && questionResponses.length > 0) {
        analysis += ` Most common response: "${mostCommonOption}" (${Math.round(maxCount/questionResponses.length*100)}%).`;
      }
    }
    
    // For rating questions, calculate average
    if (question.type === 'rating') {
      const values = questionResponses.map(r => {
        // Safely convert to number
        if (typeof r.value === 'number') return r.value;
        if (typeof r.value === 'string') return parseInt(r.value, 10);
        // Handle jsonb, which could be any structure
        return typeof r.value === 'object' ? NaN : parseInt(String(r.value), 10);
      }).filter(v => !isNaN(v));
      
      if (values.length > 0) {
        const sum = values.reduce((acc, val) => acc + val, 0);
        const average = sum / values.length;
        stats.average = average.toFixed(1);
        analysis += ` Average rating: ${average.toFixed(1)} out of 5.`;
      }
    }
    
    return {
      questionId: question.id,
      questionText: question.text,
      analysis,
      stats
    };
  });
  
  return {
    summaryStats: {
      totalResponses,
      completionRate: totalResponses > 0 ? 1 : 0
    },
    keyInsights,
    questionAnalysis
  };
}
