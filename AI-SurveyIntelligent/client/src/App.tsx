import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { ThemeProvider } from "next-themes";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import CreateSurvey from "@/pages/create-survey";
import MySurveys from "@/pages/my-surveys";
import PublicSurveys from "@/pages/public-surveys";
import AnsweredSurveys from "@/pages/answered-surveys";
import InactiveSurveys from "@/pages/inactive-surveys";
import Analytics from "@/pages/analytics";
import SurveyResponse from "@/pages/survey-response";
import LandingPage from "@/pages/landing-page";

// Redirect logic for the homepage
function HomeRedirect() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      // Always navigate to landing page for consistency
      navigate("/landing");
    }
  }, [isLoading, navigate]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      <Route path="/landing" component={LandingPage} />
      <ProtectedRoute path="/dashboard" component={HomePage} />
      <ProtectedRoute path="/create-survey" component={CreateSurvey} />
      <ProtectedRoute path="/my-surveys" component={MySurveys} />
      <ProtectedRoute path="/inactive-surveys" component={InactiveSurveys} />
      <ProtectedRoute path="/surveys/:id/analytics" component={Analytics} />
      <ProtectedRoute path="/public-surveys" component={PublicSurveys} />
      <ProtectedRoute path="/answered-surveys" component={AnsweredSurveys} />
      <ProtectedRoute path="/surveys/:id/respond" component={SurveyResponse} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

// Custom Route function no longer needed as we're using the Route component from wouter directly
