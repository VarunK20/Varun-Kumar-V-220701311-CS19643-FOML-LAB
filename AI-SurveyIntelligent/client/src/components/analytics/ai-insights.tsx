import { SurveyResults } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Bot, ChartLine, Lightbulb, AlertTriangle, Users } from "lucide-react";

interface Insight {
  title: string;
  description: string;
  type: string;
}

interface Analysis {
  insights: {
    keyInsights: Insight[];
  };
}

interface AIInsightsProps {
  results: SurveyResults;
  onGenerateAnalysis: () => void;
  isGenerating: boolean;
}


export function AIInsights({ results, onGenerateAnalysis, isGenerating }: AIInsightsProps) {
  const hasAnalysis = results.analysis !== undefined;
  
  // Cast analysis to Analysis type
  const insights = hasAnalysis ? (results.analysis as Analysis).insights.keyInsights : null;
  
  if (!hasAnalysis && results.responses.length === 0) {
    return (
      <Card className="mt-8">
        <CardContent className="pt-6">
          <div className="text-center py-4">
            <p className="text-gray-500 mb-2">No responses yet. AI analysis will be available once you have responses.</p>
          </div>
        </CardContent>
      </Card>
    );
  }


  return (
    <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
            <Bot className="text-secondary-500 h-6 w-6" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">AI-Generated Insights</h3>
            <p className="text-sm text-gray-500">
              {hasAnalysis 
                ? `Based on ${results.responses.length} responses, our AI has generated these key insights.` 
                : `Generate insights for ${results.responses.length} responses.`}
            </p>
          </div>
        </div>
        
        {hasAnalysis ? (
  <div className="mt-6 border-t border-gray-200 pt-6">
    <div className="prose prose-sm max-w-none text-gray-500">
      <ul className="space-y-4">
        {insights && insights.length > 0 ? (
          insights.map((insight, index) => {
            let icon;
            switch(insight.type) {
              case 'general':
                icon = <ChartLine className="text-primary-500" />;
                break;
              case 'improvement':
                icon = <Lightbulb className="text-warning-500" />;
                break;
              case 'segment':
                icon = <Users className="text-success-500" />;
                break;
              case 'trend':
                icon = <AlertTriangle className="text-error-500" />;
                break;
              default:
                icon = <ChartLine className="text-primary-500" />;
            }

            return (
              <li key={index} className="flex items-start">
                <span className="mr-2">{icon}</span>
                <span>
                  <strong className="text-gray-900">{insight.title}</strong> – {insight.description}
                </span>
              </li>
            );
          })
        ) : (
          <li className="text-center py-2">No specific insights generated.</li>
        )}
      </ul>

      <div className="mt-6">
        <Button
          className="bg-secondary-500 hover:bg-purple-700"
          onClick={onGenerateAnalysis}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="m21.64 3.64-1.28-1.28a1.08 1.08 0 0 0-1.52 0L2.36 18.84a1.08 1.08 0 0 0 0 1.52l1.28 1.28a1.08 1.08 0 0 0 1.52 0L21.64 5.16a1.08 1.08 0 0 0 0-1.52Z" />
                <path d="m14.5 12.5 7.14-7.14" />
                <path d="M19.5 8.5 16 12" />
                <path d="m8.5 19.5 3-3" />
                <circle cx="4.5" cy="19.5" r="2.5" />
                <circle cx="19.5" cy="4.5" r="2.5" />
              </svg>
              Generate Detailed Analysis
            </>
          )}
        </Button>
      </div>
    </div>
  </div>
) : (
  <div className="mt-6 border-t border-gray-200 pt-6">
    <div className="text-center py-4">
      <p className="text-gray-500 mb-4">Generate AI-powered insights from your survey responses.</p>
      <Button
        className="bg-secondary-500 hover:bg-purple-700"
        onClick={onGenerateAnalysis}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Insights...
          </>
        ) : (
          <>
            <Bot className="mr-2 h-4 w-4" />
            Generate AI Insights
          </>
        )}
      </Button>
    </div>
  </div>
)}
</div>
</div>
);
}
