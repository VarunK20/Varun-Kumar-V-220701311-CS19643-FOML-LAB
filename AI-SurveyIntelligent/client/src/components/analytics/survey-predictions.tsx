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
import { SurveyResults } from "@shared/schema";

interface SurveyPrediction {
  expectedCompletionRate: number;
  expectedResponseCount: number;
  targetDemographic: string;
  recommendations: string[];
}

interface SurveyPredictionsProps {
  results: SurveyResults;
}

export function SurveyPredictions({ results }: SurveyPredictionsProps) {
  const { toast } = useToast();
  const [prediction, setPrediction] = useState<SurveyPrediction | null>(null);

  const getPredictionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/ai/predict-survey", {
        title: results.title,
        description: results.description || "",
        questions: results.questions.map(q => ({
          text: q.text,
          type: q.type,
          required: Boolean(q.required)
        })),
        previousStats: {
          avgCompletionRate: results.responses.length > 0 
            ? Math.round(Math.min(results.responses.length * 5, 100)) 
            : undefined,
          avgResponseCount: results.responses.length || undefined
        }
      });
      return await res.json();
    },
    onSuccess: (data) => {
      setPrediction(data);
      toast({
        title: "Prediction generated",
        description: "AI has analyzed your survey and generated future predictions.",
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
  console.log("results.analysis", results.analysis);

// if (hasAnalysis) {
  // console.log("Key Insights:", (results.analysis as Analysis).insights.keyInsights);
// }


  const requiredQuestionCount = results.questions.filter(q => q.required).length;
  const completionRate = prediction?.expectedCompletionRate || 0;
  
  // Determine completion rate class based on the value
  const getCompletionRateClass = () => {
    if (completionRate < 30) return "text-red-500";
    if (completionRate < 70) return "text-amber-500";
    return "text-green-500";
  };

  return (
    <div className="mt-8 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Target className="h-5 w-5 text-indigo-500" /> 
          AI Future Predictions
        </h3>
        {!prediction && (
          <Button
            onClick={() => getPredictionMutation.mutate()}
            disabled={getPredictionMutation.isPending}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
            size="sm"
          >
            {getPredictionMutation.isPending ? (
              <>
                <span className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
                Analyzing...
              </>
            ) : (
              <>
                <LightbulbIcon className="mr-2 h-4 w-4" />
                Generate Predictions
              </>
            )}
          </Button>
        )}
      </div>

      {!prediction ? (
        <Card className="border-dashed border-2 border-gray-200 bg-gray-50">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center">
            <LightbulbIcon className="h-10 w-10 text-indigo-300 mb-4" />
            <h4 className="text-lg font-medium text-gray-800 mb-2">AI Predictions Unavailable</h4>
            <p className="text-gray-500 max-w-md mb-6">
              Generate AI-powered predictions to forecast your survey's future performance metrics and get recommendations for improvement.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Predict completion rates and expected responses</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Identify ideal target demographics</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Get recommendations to improve effectiveness</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white p-6 rounded-lg border shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Completion Rate Card */}
            <Card className="border border-indigo-100">
              <CardContent className="p-4 flex flex-col items-center">
                <div className="rounded-full bg-indigo-100 p-2 mb-2">
                  <BarChart4 className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="mb-1 font-medium text-gray-700">
                  Projected Completion Rate
                </div>
                <div className={`text-2xl font-bold ${getCompletionRateClass()}`}>
                  {prediction.expectedCompletionRate}%
                </div>
                <Progress 
                  value={prediction.expectedCompletionRate} 
                  className="h-2 mt-2 w-full"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {prediction.expectedCompletionRate >= 70 
                    ? "Excellent completion rate expected" 
                    : prediction.expectedCompletionRate >= 40
                    ? "Good completion rate expected"
                    : "Low completion rate expected"}
                </div>
              </CardContent>
            </Card>
            
            {/* Response Count Card */}
            <Card className="border border-indigo-100">
              <CardContent className="p-4 flex flex-col items-center">
                <div className="rounded-full bg-purple-100 p-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div className="mb-1 font-medium text-gray-700">
                  Future Response Forecast
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {prediction.expectedResponseCount}
                </div>
                <div className="text-xs text-gray-500 mt-3">
                  Additional responses expected if shared with target audience
                </div>
              </CardContent>
            </Card>
            
            {/* Target Demographic Card */}
            <Card className="border border-indigo-100">
              <CardContent className="p-4 flex flex-col items-center">
                <div className="rounded-full bg-fuchsia-100 p-2 mb-2">
                  <Users className="h-5 w-5 text-fuchsia-600" />
                </div>
                <div className="mb-1 font-medium text-gray-700">
                  Ideal Target Audience
                </div>
                <div className="text-lg font-semibold text-center text-fuchsia-600 px-2">
                  {prediction.targetDemographic}
                </div>
                <div className="text-xs text-gray-500 mt-3">
                  Best demographic match for maximum engagement
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Separator />
          
          {/* Recommendations */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Award className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold text-gray-800">AI Optimization Recommendations</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
  {prediction.recommendations && Array.isArray(prediction.recommendations) ? (
    prediction.recommendations.map((rec, index) => (
      <div key={index} className="flex items-start gap-2 p-3 rounded-md bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
        <AlertTriangle className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
        <span>{rec}</span>
      </div>
    ))
  ) : (
    <p>No recommendations available</p>
  )}
</div>
            <div className="mt-4 flex justify-between items-center">
              <Badge variant="outline" className="text-xs text-gray-500 gap-1 flex items-center">
                <LightbulbIcon className="h-3 w-3" />
                AI-powered prediction
              </Badge>
              <button 
                onClick={() => setPrediction(null)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Reset Prediction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}