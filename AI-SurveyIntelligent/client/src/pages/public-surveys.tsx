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
import { Loader2, Calendar, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function PublicSurveys() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: surveys = [], isLoading, error } = useQuery<Survey[]>({
    queryKey: ["/api/surveys/answerable", user?.id],
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

  const handleTakeSurvey = (surveyId: number) => {
    navigate(`/surveys/${surveyId}/respond`);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Take a Survey
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Browse and respond to public surveys created by other users.
            </p>
          </div>
        </div>

        {surveys.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No public surveys available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {surveys.map((survey) => (
              <Card key={survey.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-primary-600">{survey.title}</CardTitle>
                  <CardDescription>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Calendar className="mr-1 h-4 w-4 text-gray-400" />
                      Created on {new Date(survey.createdAt).toLocaleDateString()}
                    </div>
                    {survey.endDate && new Date(survey.endDate) < new Date() && (
                      <div className="mt-2">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          Closed
                        </span>
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {survey.description || "No description provided."}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => handleTakeSurvey(survey.id)}
                    className="w-full"
                    disabled={survey.endDate ? new Date(survey.endDate) < new Date() : false}
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Take Survey
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
