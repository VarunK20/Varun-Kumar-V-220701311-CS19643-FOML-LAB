import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { questionTypes, SurveyCreationData, QuestionType } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { SurveyForm } from "@/components/surveys/survey-form";
import { AIQuestionGenerator } from "@/components/surveys/ai-question-generator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Wand2 } from "lucide-react";

// Define survey schema for form validation
const surveySchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().optional(),
  isPublic: z.boolean().default(true),
  startDate: z.date(),
  endDate: z.date().optional().nullable(),
  questions: z.array(z.object({
    text: z.string().min(3, { message: "Question must be at least 3 characters" }),
    type: z.enum(questionTypes),
    options: z.array(z.string()).optional().nullable(),
    order: z.number(),
    required: z.boolean().default(false),
  })).min(1, { message: "Add at least one question" }),
});

type SurveyFormValues = z.infer<typeof surveySchema>;

export default function CreateSurvey() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const form = useForm<SurveyFormValues>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      title: "",
      description: "",
      isPublic: true,
      startDate: new Date(),
      endDate: null,
      questions: [{
        text: "",
        type: "multiple_choice",
        options: [""],
        order: 0,
        required: false,
      }],
    },
  });
  
  // Use react-hook-form's useFieldArray to manage the dynamic questions array
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  const createSurveyMutation = useMutation({
    mutationFn: async (data: SurveyCreationData) => {
      const res = await apiRequest("POST", "/api/surveys", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/surveys/my'] });
      toast({
        title: "Survey created",
        description: "Your survey has been created successfully.",
      });
      navigate("/my-surveys");
    },
    onError: (error) => {
      toast({
        title: "Failed to create survey",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: SurveyFormValues) {
    // Format dates as ISO strings and handle null/undefined properly
    const formattedData = {
      ...data,
      startDate: data.startDate.toISOString(),
      endDate: data.endDate ? data.endDate.toISOString() : undefined,
      questions: data.questions.map(q => ({
        ...q,
        options: q.options || undefined // Convert null options to undefined
      }))
    };
    createSurveyMutation.mutate(formattedData);
  }

  function onCancel() {
    navigate("/");
  }

  const addQuestion = () => {
    append({
      text: "",
      type: "multiple_choice",
      options: [""],
      order: fields.length,
      required: false,
    });
  };

  const [activeTab, setActiveTab] = useState<string>("manual");
  
  const handleQuestionsGenerated = (generatedQuestions: Array<{
    text: string;
    type: QuestionType;
    options?: string[] | null;
    required: boolean;
  }>) => {
    // Replace all questions with AI generated ones
    // If you'd prefer to append instead, use form.setValue to update existing questions
    const currentQuestionsCount = fields.length;
    
    // Remove existing questions first
    if (currentQuestionsCount > 0) {
      for (let i = currentQuestionsCount - 1; i >= 0; i--) {
        remove(i);
      }
    }
    
    // Add the generated questions with proper order
    generatedQuestions.forEach((question, index) => {
      append({
        text: question.text,
        type: question.type,
        options: question.type === "multiple_choice" || question.type === "checkbox" 
          ? question.options || [""] 
          : null,
        order: index,
        required: question.required,
      });
    });
    
    // Switch to manual tab to edit the generated questions
    setActiveTab("manual");
    
    toast({
      title: "Questions added",
      description: `${generatedQuestions.length} AI-generated questions have been added to your survey.`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Create New Survey
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Build your survey by adding questions or use AI to generate them automatically.
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Button
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              className="ml-3"
              onClick={form.handleSubmit(onSubmit)}
              disabled={createSurveyMutation.isPending}
            >
              {createSurveyMutation.isPending ? "Creating..." : "Publish Survey"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="manual" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="manual" className="flex items-center gap-2">
              Manual Creation
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              AI Question Generator
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="mt-0">
            <SurveyForm 
              form={form}
              questions={fields}
              addQuestion={addQuestion}
              removeQuestion={remove}
              moveQuestion={move}
              onSubmit={onSubmit}
              isPending={createSurveyMutation.isPending}
            />
          </TabsContent>
          
          <TabsContent value="ai" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-5">
                <AIQuestionGenerator onQuestionsGenerated={handleQuestionsGenerated} />
              </div>
              <div className="md:col-span-7">
                <Card className="p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-medium mb-4">How to use AI Question Generator</h3>
                  <ol className="list-decimal ml-5 space-y-2 text-gray-700 mb-6">
                    <li>Enter your survey topic (e.g., "Customer Satisfaction", "Employee Feedback")</li>
                    <li>Add a description to provide more context (optional)</li>
                    <li>Adjust the number of questions you want to generate</li>
                    <li>Click "Generate Questions" and wait for the AI to create your survey questions</li>
                    <li>The generated questions will be added to your survey automatically</li>
                    <li>You can edit or customize the questions afterward in the Manual Creation tab</li>
                  </ol>
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex gap-4 items-start">
                    <div className="rounded-full bg-amber-200 p-1 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-sm text-amber-800">
                      <p className="font-medium">Tips for better results:</p>
                      <p className="mt-1">Be specific with your topic and description to get more relevant questions. The AI will try to create a variety of question types based on your input.</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
