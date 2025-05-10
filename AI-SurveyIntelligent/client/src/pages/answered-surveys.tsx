import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Survey } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, BarChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";

export default function AnsweredSurveys() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: surveys = [], isLoading, error } = useQuery<Survey[]>({
    queryKey: ["/api/surveys/answered", user?.id],
    enabled: !!user,
  });

  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading surveys",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleViewResults = (surveyId: number) => {
    navigate(`/surveys/${surveyId}/analytics`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Completed Surveys
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Surveys you have already completed.
            </p>
          </div>
        </div>

        {surveys.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100 p-8">
            <div className="rounded-full bg-gray-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No completed surveys yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Surveys you complete will appear here.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => navigate("/public-surveys")}
                variant="outline"
                className="bg-white"
              >
                Find surveys to complete
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {surveys.map((survey) => (
              <Card key={survey.id} className="hover:shadow-md transition-shadow overflow-hidden border border-gray-200">
                <div className="absolute top-0 right-0 m-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                    Completed
                  </Badge>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-primary-600 font-bold">{survey.title}</CardTitle>
                  <CardDescription>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Calendar className="mr-1 h-4 w-4 text-gray-400" />
                      Completed on {new Date(survey.createdAt).toLocaleDateString()}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {survey.description || "No description provided."}
                  </p>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t border-gray-100">
                  <Button 
                    onClick={() => handleViewResults(survey.id)}
                    className="w-full"
                    variant="secondary"
                  >
                    <BarChart className="mr-2 h-4 w-4" />
                    View Your Response
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}