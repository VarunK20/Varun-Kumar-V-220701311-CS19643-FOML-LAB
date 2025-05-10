import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Survey } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Trash2, Eye, ArrowUpRightSquare } from "lucide-react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function InactiveSurveys() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  
  const {
    data: surveys,
    isLoading,
    error,
  } = useQuery<Survey[]>({
    queryKey: ["/api/surveys/inactive", user?.id],
    staleTime: 30000, // 30 seconds
    enabled: !!user,
  });

  const reactivateSurvey = async (id: number) => {
    try {
      await apiRequest("PATCH", `/api/surveys/${id}/status`, {
        isActive: true,
      });
      
      // Invalidate queries to refresh data with user ID
      queryClient.invalidateQueries({ queryKey: ["/api/surveys/inactive", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/surveys/my", user?.id] });
      
      toast({
        title: "Survey reactivated",
        description: "Your survey is now active again.",
      });
    } catch (error) {
      toast({
        title: "Failed to reactivate survey",
        description: "An error occurred while reactivating the survey.",
        variant: "destructive",
      });
    }
  };

  const deleteSurvey = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/surveys/${id}`);
      
      // Invalidate queries to refresh data with user ID
      queryClient.invalidateQueries({ queryKey: ["/api/surveys/inactive", user?.id] });
      
      toast({
        title: "Survey deleted",
        description: "Your survey has been permanently deleted.",
      });
    } catch (error) {
      toast({
        title: "Failed to delete survey",
        description: "An error occurred while deleting the survey.",
        variant: "destructive",
      });
    }
  };

  const viewResults = (id: number) => {
    navigate(`/surveys/${id}/analytics`);
  };

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading inactive surveys...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-10">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <p className="text-destructive">Failed to load inactive surveys</p>
          <Button variant="outline" className="mt-4" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/surveys/inactive", user?.id] })}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Inactive Surveys</h1>
          <p className="text-muted-foreground">
            Manage your inactive surveys. You can reactivate or permanently delete them.
          </p>
        </div>
      </div>

      {surveys && surveys.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {surveys.map((survey) => (
            <Card key={survey.id} className="flex flex-col h-full transition-all">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="line-clamp-1 text-lg">{survey.title}</CardTitle>
                  <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-200">
                    Inactive
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {survey.description || "No description provided"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-sm text-muted-foreground">
                  <p>Created: {format(new Date(survey.createdAt), "MMM d, yyyy")}</p>
                  {survey.endDate && (
                    <p>Ended: {format(new Date(survey.endDate), "MMM d, yyyy")}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => reactivateSurvey(survey.id)}
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> Reactivate
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => viewResults(survey.id)}
                >
                  <Eye className="mr-2 h-4 w-4" /> Results
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      className="flex-1"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the survey
                        and all associated data including responses and analytics.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => deleteSurvey(survey.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[40vh] bg-muted/30 rounded-lg p-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">No Inactive Surveys</h3>
            <p className="text-muted-foreground mb-6">
              You don't have any inactive surveys. When you deactivate a survey, it will appear here.
            </p>
            <Button 
              variant="default" 
              onClick={() => navigate("/my-surveys")}
              className="gap-2"
            >
              <ArrowUpRightSquare className="h-4 w-4" />
              Go to My Surveys
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}