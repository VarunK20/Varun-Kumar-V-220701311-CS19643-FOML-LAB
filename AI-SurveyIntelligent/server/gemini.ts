// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { QuestionType } from "@shared/schema";
// import dotenv from 'dotenv';
// dotenv.config();

// // Initialize the Gemini API

// const API_KEY = process.env.GEMINI_API_KEY;
// const genAI = new GoogleGenerativeAI(API_KEY!);
// if (!API_KEY) {
//   throw new Error("GEMINI_API_KEY is not defined in the environment variables");
// }


// // Define interfaces for AI-generated content
// interface SuggestedQuestion {
//   text: string;
//   type: QuestionType;
//   options?: string[] | null;
//   required: boolean;
// }

// interface SurveyPrediction {
//   expectedCompletionRate: number;
//   expectedResponseCount: number;
//   targetDemographic: string;
//   recommendations: string[];
// }

// // Defining the model
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// /**
//  * Generate survey questions based on a given topic
//  */
// export async function generateSurveyQuestions(
//   topic: string,
//   description: string,
//   numQuestions: number = 5
// ): Promise<SuggestedQuestion[]> {
//   try {
//     const prompt = `
//     You are an expert survey designer. Please create ${numQuestions} well-crafted survey questions about the topic: "${topic}".
//     Additional context about the survey: "${description}"

//     For each question:
//     1. Create a clear, unbiased question text
//     2. Select an appropriate question type (multiple_choice, checkbox, text, rating)
//     3. For multiple_choice and checkbox types, provide 3-5 relevant answer options
//     4. Determine if the question should be required or optional

//     Return your response as a JSON array of objects with these properties:
//     - text: The question text
//     - type: The question type (multiple_choice, checkbox, text, rating)
//     - options: An array of possible answers (only for multiple_choice and checkbox types)
//     - required: Boolean whether the question should be required

//     Focus on creating a variety of question types and make the questions engaging and effective for gathering meaningful data.
//     `;

//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const text = response.text();
    
//     // Extract JSON part from the response
//     const cleanText = text.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
//     const jsonMatch = cleanText.match(/\\{[\s\S]*\\}/);
    
//     if (!jsonMatch) {
//       console.error('Failed to parse JSON from Gemini response');
//       return getDefaultQuestions(topic, numQuestions);
//     }
    
//     // Parse the JSON string into an array of questions
//     const questions: SuggestedQuestion[] = JSON.parse(jsonMatch[0]);
    
//     // Validate that the questions are in the expected format
//     return questions.map((q) => ({
//       text: q.text,
//       type: q.type as QuestionType,
//       options: q.type === 'multiple_choice' || q.type === 'checkbox' ? q.options : null,
//       required: Boolean(q.required),
//     }));
//   } catch (error) {
//     console.error('Error generating survey questions:', error);
//     return getDefaultQuestions(topic, numQuestions);
//   }
// }

// /**
//  * Generate predictive analytics for a survey
//  */
// export async function generateSurveyPredictions(
//   surveyTitle: string,
//   surveyDescription: string,
//   questionCount: number,
//   requiredQuestionCount: number,
//   previousSurveyStats?: {
//     avgCompletionRate?: number;
//     avgResponseCount?: number;
//   }
// ): Promise<SurveyPrediction> {
//   try {
//     let previousStatsPrompt = '';
//     if (previousSurveyStats) {
//       previousStatsPrompt = `
//       Historical data from your previous surveys:
//       - Average completion rate: ${previousSurveyStats.avgCompletionRate || 'Unknown'}%
//       - Average response count: ${previousSurveyStats.avgResponseCount || 'Unknown'}
//       `;
//     }

//     const prompt = `
//     You are a survey analytics expert with access to extensive survey data. Based on the following information about a survey, predict its performance metrics and provide recommendations for improvement:

//     Survey Title: "${surveyTitle}"
//     Survey Description: "${surveyDescription}"
//     Total Questions: ${questionCount}
//     Required Questions: ${requiredQuestionCount}
//     ${previousStatsPrompt}

//     Please analyze this information and provide:
//     1. Expected completion rate (percentage)
//     2. Expected response count (if shared publicly)
//     3. Target demographic that would likely respond to this survey
//     4. 3-5 specific recommendations to improve the survey's effectiveness

//     Return your analysis as a JSON object with these properties:
//     - expectedCompletionRate: number (percentage)
//     - expectedResponseCount: number
//     - targetDemographic: string
//     - recommendations: array of strings

//     Base your predictions on research about survey response patterns and engagement factors.
//     `;

//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const text = response.text();
//     console.log('Gemini raw response:', text);

    
//     // Extract JSON part from the response
//     const cleanText = text.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
//     const jsonMatch = cleanText.match(/\\{[\s\S]*\\}/);
    
//     if (!jsonMatch) {
//       console.error('Failed to parse JSON from Gemini response');
//       return getDefaultPrediction(surveyTitle, questionCount, requiredQuestionCount);
//     }
    
//     // Parse the JSON string into a prediction object
//     const prediction: SurveyPrediction = JSON.parse(jsonMatch[0]);
    
//     return {
//       expectedCompletionRate: prediction.expectedCompletionRate || 0,
//       expectedResponseCount: prediction.expectedResponseCount || 0,
//       targetDemographic: prediction.targetDemographic || 'Unknown',
//       recommendations: prediction.recommendations || [],
//     };
//   } catch (error) {
//     console.error('Error generating survey predictions:', error);
//     return getDefaultPrediction(surveyTitle, questionCount, requiredQuestionCount);
//   }
// }

// // Helper function for default questions if API fails
// function getDefaultQuestions(topic: string, numQuestions: number): SuggestedQuestion[] {
//   const defaultQuestions: SuggestedQuestion[] = [
//     {
//       text: `How would you rate your overall satisfaction with ${topic}?`,
//       type: 'rating',
//       required: true
//     },
//     {
//       text: `What aspects of ${topic} are most important to you?`,
//       type: 'checkbox',
//       options: ['Quality', 'Price', 'Features', 'Customer Service', 'Other'],
//       required: true
//     },
//     {
//       text: `How likely are you to recommend ${topic} to others?`,
//       type: 'multiple_choice',
//       options: ['Very likely', 'Somewhat likely', 'Neutral', 'Somewhat unlikely', 'Very unlikely'],
//       required: true
//     },
//     {
//       text: `What improvements would you suggest for ${topic}?`,
//       type: 'text',
//       required: false
//     },
//     {
//       text: `How often do you use or interact with ${topic}?`,
//       type: 'multiple_choice',
//       options: ['Daily', 'Weekly', 'Monthly', 'Rarely', 'Never'],
//       required: true
//     }
//   ];

//   return defaultQuestions.slice(0, numQuestions);
// }

// // Helper function for default predictions if API fails
// function getDefaultPrediction(
//   surveyTitle: string, 
//   questionCount: number, 
//   requiredQuestionCount: number
// ): SurveyPrediction {
//   const expectedCompletionRate = Math.round(
//     100 - (requiredQuestionCount / questionCount * 15)
//   );
  
//   return {
//     expectedCompletionRate: Math.min(Math.max(expectedCompletionRate, 50), 95),
//     expectedResponseCount: 25,
//     targetDemographic: "General audience interested in " + surveyTitle,
//     recommendations: [
//       "Keep surveys concise - aim for 5-10 questions for highest completion rates",
//       "Include a mix of question types to keep respondents engaged",
//       "Clearly communicate the purpose of your survey at the beginning",
//       "Offer an incentive for survey completion if possible",
//       "Follow up with respondents to share results and actions taken"
//     ]
//   };
// }

import axios from 'axios';
import { QuestionType } from "@shared/schema";
import dotenv from 'dotenv';
dotenv.config();

interface SuggestedQuestion {
  text: string;
  type: QuestionType;
  options?: string[] | null;
  required: boolean;
}

interface SurveyPrediction {
  expectedCompletionRate: number;
  expectedResponseCount: number;
  targetDemographic: string;
  recommendations: string[];
}

// OLLAMA CONFIG
const OLLAMA_BASE_URL = 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3'; // can be mistral, llama3, etc.

/**
 * Send prompt to Ollama and get response
 */
async function queryOllama(prompt: string): Promise<string> {
  try {
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
    });

    return response.data.response;
  } catch (err) {
    console.error('Error querying Ollama:', err);
    throw err;
  }
}

/**
 * Generate detailed analysis from survey responses
 */
export async function generateDetailedAnalysis(
  surveyTitle: string,
  surveyDescription: string,
  responses: any[] // ideally strongly typed, depending on your response schema
): Promise<string> {
  const prompt = `
You are an expert data analyst. Given the following responses to the survey titled "${surveyTitle}" with the description "${surveyDescription}", analyze the responses.

Provide a detailed summary with key insights, trends, and any notable patterns.

Survey Responses:
${JSON.stringify(responses, null, 2)}

Return only the analysis as plain text.
`;

  try {
    const rawText = await queryOllama(prompt);
    return rawText.trim();
  } catch (error) {
    console.error('Error generating detailed analysis:', error);
    return 'Could not generate analysis due to an error.';
  }
}


/**
 * Generate survey questions
 */
export async function generateSurveyQuestions(
  topic: string,
  description: string,
  numQuestions: number = 5
): Promise<SuggestedQuestion[]> {
  const prompt = `
You are an expert survey designer. Please create ${numQuestions} well-crafted survey questions about the topic: "${topic}".
Additional context: "${description}"

Return a JSON array with each object having:
- text (string)
- type (multiple_choice | checkbox | text | rating)
- options (array<string>, for multiple_choice and checkbox only)
- required (boolean)

Format:
[
  {
    "text": "...",
    "type": "multiple_choice",
    "options": ["A", "B", "C"],
    "required": true
  },
  ...
]
`;

  try {
    const rawText = await queryOllama(prompt);
    const cleanText = rawText.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
    const jsonStart = cleanText.indexOf('[');
    const jsonEnd = cleanText.lastIndexOf(']');
    const jsonString = cleanText.slice(jsonStart, jsonEnd + 1);

    const questions: SuggestedQuestion[] = JSON.parse(jsonString);
    return questions.map((q) => ({
      text: q.text,
      type: q.type as QuestionType,
      options: q.type === 'multiple_choice' || q.type === 'checkbox' ? q.options : null,
      required: Boolean(q.required),
    }));
  } catch (error) {
    console.error('Error generating survey questions:', error);
    return getDefaultQuestions(topic, numQuestions);
  }
}

/**
 * Generate survey predictions
 */
export async function generateSurveyPredictions(
  surveyTitle: string,
  surveyDescription: string,
  questionCount: number,
  requiredQuestionCount: number,
  previousSurveyStats?: {
    avgCompletionRate?: number;
    avgResponseCount?: number;
  }
): Promise<SurveyPrediction> {
  let previousStatsPrompt = '';
  if (previousSurveyStats) {
    previousStatsPrompt = `
Previous survey data:
- Avg Completion Rate: ${previousSurveyStats.avgCompletionRate || 'Unknown'}%
- Avg Response Count: ${previousSurveyStats.avgResponseCount || 'Unknown'}
    `;
  }

  const prompt = `
You are a survey analytics expert. Based on the details below, predict key metrics and give recommendations.

Survey Title: "${surveyTitle}"
Description: "${surveyDescription}"
Total Questions: ${questionCount}
Required Questions: ${requiredQuestionCount}
${previousStatsPrompt}

Return JSON like:
{
  "expectedCompletionRate": 85,
  "expectedResponseCount": 40,
  "targetDemographic": "Young professionals aged 25-35",
  "recommendations": [
    "Keep the survey concise",
    "Use incentives",
    ...
  ]
}
`;

  try {
    const rawText = await queryOllama(prompt);
    const cleanText = rawText.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
    const jsonStart = cleanText.indexOf('{');
    const jsonEnd = cleanText.lastIndexOf('}');
    const jsonString = cleanText.slice(jsonStart, jsonEnd + 1);

    const prediction: SurveyPrediction = JSON.parse(jsonString);
    return prediction;
  } catch (error) {
    console.error('Error generating predictions:', error);
    return getDefaultPrediction(surveyTitle, questionCount, requiredQuestionCount);
  }
}

// Default fallback question set
function getDefaultQuestions(topic: string, num: number): SuggestedQuestion[] {
  const defaultQuestions: SuggestedQuestion[] = [
    {
      text: `How would you rate your overall satisfaction with ${topic}?`,
      type: 'rating',
      required: true
    },
    {
      text: `What aspects of ${topic} are most important to you?`,
      type: 'checkbox',
      options: ['Quality', 'Price', 'Features', 'Customer Service', 'Other'],
      required: true
    },
    {
      text: `How likely are you to recommend ${topic}?`,
      type: 'multiple_choice',
      options: ['Very likely', 'Somewhat likely', 'Neutral', 'Somewhat unlikely', 'Very unlikely'],
      required: true
    },
    {
      text: `What improvements would you suggest for ${topic}?`,
      type: 'text',
      required: false
    },
    {
      text: `How often do you use or interact with ${topic}?`,
      type: 'multiple_choice',
      options: ['Daily', 'Weekly', 'Monthly', 'Rarely', 'Never'],
      required: true
    }
  ];
  return defaultQuestions.slice(0, num);
}

// Default fallback prediction
function getDefaultPrediction(
  surveyTitle: string,
  questionCount: number,
  requiredQuestionCount: number
): SurveyPrediction {
  const rate = Math.round(100 - (requiredQuestionCount / questionCount * 15));
  return {
    expectedCompletionRate: Math.min(Math.max(rate, 50), 95),
    expectedResponseCount: 30,
    targetDemographic: `General audience interested in ${surveyTitle}`,
    recommendations: [
      "Keep surveys short",
      "Use incentives",
      "Use clear and engaging language",
      "Use diverse question types",
      "Share survey results with respondents"
    ]
  };
}
