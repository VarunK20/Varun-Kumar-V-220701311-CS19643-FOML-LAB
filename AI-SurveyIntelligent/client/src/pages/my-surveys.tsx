import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  ChevronRight, 
  BarChart2, 
  PlusIcon, 
  Loader2,
  Archive,
  Trash2,
  MoreVertical
} from "lucide-react";
import { Survey } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function MySurveys() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Import useAuth for user data
  const { user } = useAuth();
  
  const { data: surveys = [], isLoading, error } = useQuery<Survey[]>({
    queryKey: ["/api/surveys/my", user?.id],
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

  const handleCreateSurvey = () => {
    navigate("/create-survey");
  };

  const handleViewAnalytics = (surveyId: number) => {
    navigate(`/surveys/${surveyId}/analytics`);
  };
  
  const deactivateSurvey = async (id: number) => {
    try {
      await apiRequest("PATCH", `/api/surveys/${id}/status`, {
        isActive: false
      });
      
      // Invalidate queries to refresh data with the correct user ID
      queryClient.invalidateQueries({ queryKey: ["/api/surveys/my", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/surveys/inactive", user?.id] });
      
      toast({
        title: "Survey deactivated",
        description: "Your survey has been moved to inactive surveys.",
      });
    } catch (error) {
      toast({
        title: "Failed to deactivate survey",
        description: "An error occurred while deactivating the survey.",
        variant: "destructive",
      });
    }
  };
  
  const deleteSurvey = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/surveys/${id}`);
      
      // Invalidate queries to refresh data with user ID
      queryClient.invalidateQueries({ queryKey: ["/api/surveys/my", user?.id] });
      
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
  
  const viewInactiveSurveys = () => {
    navigate("/inactive-surveys");
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
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              My Surveys
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage and analyze your created surveys.
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Button onClick={handleCreateSurvey}>
              <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
              Create Survey
            </Button>
          </div>
        </div>
        
        {surveys.length === 0 ? (
          <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
            <p className="text-gray-500 mb-4">You haven't created any surveys yet.</p>
            <Button onClick={handleCreateSurvey}>
              Create Your First Survey
            </Button>
          </div>
        ) : (
          <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-md">
            <div className="flex justify-end p-4 border-b">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={viewInactiveSurveys} 
                className="text-gray-600"
              >
                <Archive className="mr-2 h-4 w-4" />
                View Inactive Surveys
              </Button>
            </div>
            <ul role="list" className="divide-y divide-gray-200">
              {surveys.map((survey) => {
                const isActive = !survey.endDate || new Date(survey.endDate) >= new Date();
                
                return (
                  <li key={survey.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="min-w-0 flex-1 px-4 py-2">
                          <p className="text-sm font-medium text-primary-600 truncate">{survey.title}</p>
                          <p className="mt-1 flex items-center text-sm text-gray-500">
                            <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <span className="truncate">
                              Created on {new Date(survey.createdAt).toLocaleDateString()}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {isActive ? 'Active' : 'Closed'}
                        </span>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewAnalytics(survey.id)}
                            className="text-primary"
                          >
                            <BarChart2 className="h-4 w-4 mr-1" />
                            View Analytics
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => deactivateSurvey(survey.id)}>
                                <Archive className="mr-2 h-4 w-4" />
                                Deactivate
                              </DropdownMenuItem>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
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
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
