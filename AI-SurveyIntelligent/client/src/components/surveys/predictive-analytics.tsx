import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  LightbulbIcon, 
  BarChart4, 
  TrendingUp, 
  Users, 
  Award, 
  AlertTriangle,
  Target,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface PredictiveAnalyticsProps {
  survey: {
    title: string;
    description?: string;
    questions: Array<{
      text: string;
      type: string;
      required: boolean;
    }>;
  };
}

interface SurveyPrediction {
  expectedCompletionRate: number;
  expectedResponseCount: number;
  targetDemographic: string;
  recommendations: string[];
}

export function PredictiveAnalytics({ survey }: PredictiveAnalyticsProps) {
  const { toast } = useToast();
  const [prediction, setPrediction] = useState<SurveyPrediction | null>(null);
  const [expanded, setExpanded] = useState(false);

  const getPredictionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/ai/predict-survey", {
        title: survey.title,
        description: survey.description || "",
        questions: survey.questions,
        // You could add previousStats here if available
      });
      return await res.json();
    },
    onSuccess: (data) => {
      setPrediction(data);
      setExpanded(true);
      toast({
        title: "Prediction generated",
        description: "AI has analyzed your survey and generated a prediction.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error generating prediction",
        description: error.message || "Failed to generate survey prediction.",
        variant: "destructive",
      });
    },
  });

  const requiredQuestionCount = survey.questions.filter(q => q.required).length;
  const completionRate = prediction?.expectedCompletionRate || 0;
  
  // Determine completion rate class based on the value
  const getCompletionRateClass = () => {
    if (completionRate < 30) return "text-red-500";
    if (completionRate < 70) return "text-amber-500";
    return "text-green-500";
  };

  return (
    <div className="space-y-4">
      {!prediction ? (
        <Card className="border border-indigo-100 shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white">
            <CardTitle className="flex items-center gap-2">
              <LightbulbIcon className="h-5 w-5" />
              AI Survey Prediction
            </CardTitle>
            <CardDescription className="text-white/80">
              Get insights on your survey before launching it
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BarChart4 className="h-5 w-5 text-indigo-500" />
                <span className="font-medium">
                  Predict success metrics for your survey
                </span>
              </div>
              
              <div className="text-sm text-gray-500 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-64">Survey Title:</span>
                  <span className="font-medium text-gray-700">{survey.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-64">Total Questions:</span>
                  <span className="font-medium text-gray-700">{survey.questions.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-64">Required Questions:</span>
                  <span className="font-medium text-gray-700">{requiredQuestionCount}</span>
                </div>
              </div>
              
              <div className="pt-2">
                <Button
                  onClick={() => getPredictionMutation.mutate()}
                  disabled={getPredictionMutation.isPending}
                  className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white"
                >
                  {getPredictionMutation.isPending ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <LightbulbIcon className="mr-2 h-4 w-4" />
                      Generate Prediction
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Accordion
          type="single" 
          collapsible
          value={expanded ? "prediction" : undefined}
          onValueChange={(val) => setExpanded(val === "prediction")}
          className="w-full"
        >
          <AccordionItem value="prediction" className="border rounded-lg shadow-md overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:no-underline bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:bg-gradient-to-r hover:from-violet-600 hover:to-fuchsia-600">
              <div className="flex items-center gap-2">
                <LightbulbIcon className="h-5 w-5" />
                <span className="font-semibold">Survey Prediction Results</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-0">
              <div className="bg-white p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Completion Rate Card */}
                  <Card className="border border-indigo-100 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center">
                        <div className="mb-1 font-medium text-gray-500 flex items-center gap-1">
                          <BarChart4 className="h-4 w-4" />
                          Expected Completion Rate
                        </div>
                        <div className={`text-2xl font-bold ${getCompletionRateClass()}`}>
                          {prediction.expectedCompletionRate}%
                        </div>
                        <Progress 
                          value={prediction.expectedCompletionRate} 
                          className="h-2 mt-2 w-full"
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Response Count Card */}
                  <Card className="border border-indigo-100 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center">
                        <div className="mb-1 font-medium text-gray-500 flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          Expected Responses
                        </div>
                        <div className="text-2xl font-bold text-indigo-600">
                          {prediction.expectedResponseCount}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          If shared with your target audience
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Target Demographic Card */}
                  <Card className="border border-indigo-100 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center">
                        <div className="mb-1 font-medium text-gray-500 flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          Target Demographic
                        </div>
                        <div className="text-lg font-bold text-center text-purple-600">
                          {prediction.targetDemographic}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Separator />
                
                {/* Recommendations */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="h-5 w-5 text-amber-500" />
                    <h3 className="font-semibold text-gray-800">AI Recommendations</h3>
                  </div>
                  
                  <div className="space-y-2">
                    {prediction.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 rounded bg-violet-50">
                        <AlertTriangle className="h-4 w-4 text-violet-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">{rec}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4">
                    <Badge variant="outline" className="text-xs text-gray-500 gap-1 items-center">
                      <LightbulbIcon className="h-3 w-3" />
                      AI-generated prediction
                    </Badge>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}