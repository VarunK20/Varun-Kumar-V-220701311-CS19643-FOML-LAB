import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { SurveyWithQuestions, SurveyResponseData } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SurveyResponse() {
  const [, params] = useRoute<{ id: string }>("/surveys/:id/respond");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const surveyId = params?.id ? parseInt(params.id) : 0;
  
  // State to store answers
  const [answers, setAnswers] = useState<{ questionId: number; value: string | string[] | number }[]>([]);
  
  // Fetch survey with questions
  const { data: survey, isLoading, error } = useQuery<SurveyWithQuestions>({
    queryKey: [`/api/surveys/${surveyId}`],
    enabled: !!surveyId,
  });
  
  // Initialize answers state when survey loads
  useEffect(() => {
    if (survey) {
      const initialAnswers = survey.questions.map(question => ({
        questionId: question.id,
        value: question.type === 'checkbox' ? [] : '',
      }));
      setAnswers(initialAnswers);
    }
  }, [survey]);
  
  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading survey",
        description: error.message,
        variant: "destructive",
      });
      navigate("/public-surveys");
    }
  }, [error, toast, navigate]);
  
  // Check if survey is closed
  const isSurveyClosed = survey?.endDate && new Date(survey.endDate) < new Date();
  
  // Submit response mutation
  const submitResponseMutation = useMutation({
    mutationFn: async (responseData: SurveyResponseData) => {
      const res = await apiRequest("POST", `/api/surveys/${surveyId}/responses`, responseData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Response submitted",
        description: "Thank you for completing the survey!",
      });
      navigate("/public-surveys");
    },
    onError: (error) => {
      toast({
        title: "Failed to submit response",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const handleSubmit = () => {
    // Validate all questions have been answered
    const unansweredQuestions = survey?.questions.filter(question => {
      const answer = answers.find(a => a.questionId === question.id);
      if (!answer) return true;
      
      if (Array.isArray(answer.value) && answer.value.length === 0) return true;
      if (answer.value === '') return true;
      
      return false;
    });
    
    if (unansweredQuestions && unansweredQuestions.length > 0) {
      toast({
        title: "Please answer all questions",
        description: "All questions in this survey are required.",
        variant: "destructive",
      });
      return;
    }
    
    submitResponseMutation.mutate({
      surveyId,
      answers,
    });
  };
  
  // Handle answer changes
  const handleAnswerChange = (questionId: number, value: string | string[] | number) => {
    setAnswers(prev => 
      prev.map(a => 
        a.questionId === questionId ? { ...a, value } : a
      )
    );
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (questionId: number, optionValue: string, checked: boolean) => {
    setAnswers(prev => 
      prev.map(a => {
        if (a.questionId === questionId) {
          const currentValues = Array.isArray(a.value) ? [...a.value] : [];
          
          if (checked) {
            // Add the option if it's not already in the array
            if (!currentValues.includes(optionValue)) {
              return { ...a, value: [...currentValues, optionValue] };
            }
          } else {
            // Remove the option
            return { ...a, value: currentValues.filter(v => v !== optionValue) };
          }
        }
        return a;
      })
    );
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  if (!survey) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p>Survey not found.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{survey.title}</CardTitle>
            <CardDescription>
              {survey.description || "No description provided."}
            </CardDescription>
          </CardHeader>
        </Card>
        
        {isSurveyClosed ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-red-500 mb-4">This survey is no longer accepting responses.</p>
              <Button onClick={() => navigate("/public-surveys")}>
                Back to Public Surveys
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {survey.questions.map((question, index) => (
              <Card key={question.id} className="mb-6">
                <CardHeader>
                  <div className="flex items-center">
                    <span className="bg-primary-100 text-primary-700 px-2.5 py-1 rounded-full text-xs font-medium mr-2">
                      Q{index + 1}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      question.type === 'multiple_choice' ? 'bg-blue-100 text-blue-700' :
                      question.type === 'checkbox' ? 'bg-purple-100 text-purple-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {question.type === 'multiple_choice' ? 'Multiple Choice' :
                       question.type === 'checkbox' ? 'Checkbox' :
                       question.type === 'rating' ? 'Rating' : 'Text'}
                    </span>
                  </div>
                  <CardTitle className="text-base mt-2">{question.text}</CardTitle>
                </CardHeader>
                <CardContent>
                  {question.type === 'multiple_choice' && question.options && (
                    <RadioGroup 
                      onValueChange={(value) => handleAnswerChange(question.id, value)}
                      className="space-y-3"
                    >
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`q${question.id}-option${optionIndex}`} />
                          <Label htmlFor={`q${question.id}-option${optionIndex}`}>{option}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                  
                  {question.type === 'checkbox' && question.options && (
                    <div className="space-y-3">
                      {question.options.map((option, optionIndex) => {
                        const answer = answers.find(a => a.questionId === question.id);
                        const isChecked = Array.isArray(answer?.value) && answer.value.includes(option);
                        
                        return (
                          <div key={optionIndex} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`q${question.id}-option${optionIndex}`} 
                              checked={isChecked}
                              onCheckedChange={(checked) => 
                                handleCheckboxChange(question.id, option, checked as boolean)
                              }
                            />
                            <Label htmlFor={`q${question.id}-option${optionIndex}`}>{option}</Label>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {question.type === 'text' && (
                    <Textarea 
                      placeholder="Your answer" 
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="min-h-[100px]"
                    />
                  )}
                  
                  {question.type === 'rating' && (
                    <div className="flex space-x-4 justify-center py-4">
                      {[1, 2, 3, 4, 5].map((rating) => {
                        const answer = answers.find(a => a.questionId === question.id);
                        const isSelected = answer?.value === rating;
                        
                        return (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => handleAnswerChange(question.id, rating)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isSelected
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {rating}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            <div className="mt-8 flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={submitResponseMutation.isPending}
                className="px-6"
              >
                {submitResponseMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Response"
                )}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
