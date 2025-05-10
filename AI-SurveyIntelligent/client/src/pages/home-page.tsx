import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/dashboard/stats-card";
import { RecentSurveys } from "@/components/dashboard/recent-surveys";
import { PlusIcon, BarChart4, Reply, Bot } from "lucide-react";
import { Survey } from "@shared/schema";

export default function HomePage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Fetch user surveys - include userId in the query key to avoid cache issues between accounts
  const { data: surveys = [], isLoading: isLoadingSurveys } = useQuery<Survey[]>({
    queryKey: ["/api/surveys/my", user?.id],
    enabled: !!user,
  });

  // Calculate active survey count
  const activeSurveys = surveys.filter(survey => 
    survey.isActive && (!survey.endDate || new Date(survey.endDate) >= new Date())
  ).length;

  // Fetch statistics from API
  const { data: stats = { totalResponses: 0, aiInsightsGenerated: 0 }, isLoading: isLoadingStats } = useQuery<{ totalResponses: number, aiInsightsGenerated: number }>({
    queryKey: ["/api/user/stats", user?.id],
    enabled: !!user,
  });

  const totalResponses = stats.totalResponses;
  const aiInsightsGenerated = stats.aiInsightsGenerated;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Welcome, {user?.username}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Your survey dashboard and analytics overview
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Button 
              onClick={() => navigate("/create-survey")}
              className="ml-3 bg-gradient-to-r from-primary to-purple-600 hover:from-primary-600 hover:to-purple-700 shadow-md"
            >
              <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
              Create Survey
            </Button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <StatsCard 
            title="Active Surveys"
            value={activeSurveys.toString()}
            icon={<BarChart4 />}
            bgColor="bg-primary-100"
            iconColor="text-primary"
            linkText="View all"
            linkHref="/my-surveys"
          />
          
          <StatsCard 
            title="Total Responses"
            value={totalResponses.toString()}
            icon={<Reply />}
            bgColor="bg-green-100"
            iconColor="text-green-600"
            linkText="View responses"
            linkHref={surveys.length > 0 ? `/surveys/${surveys[0].id}/analytics` : "/my-surveys"}
          />
          
          <StatsCard 
            title="AI Insights Generated"
            value={aiInsightsGenerated.toString()}
            icon={<Bot />}
            bgColor="bg-purple-100"
            iconColor="text-secondary-500"
            linkText="View insights"
            linkHref={surveys.length > 0 ? `/surveys/${surveys[0].id}/analytics` : "/my-surveys"}
          />
        </div>

        <RecentSurveys surveys={surveys} isLoading={isLoadingSurveys} />
      </main>
    </div>
  );
}
