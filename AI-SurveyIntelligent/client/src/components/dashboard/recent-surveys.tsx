import { Link } from "wouter";
import { Survey } from "@shared/schema";
import { ChevronRight, Calendar, BarChart3, ClipboardList, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface RecentSurveysProps {
  surveys: Survey[];
  isLoading: boolean;
}

export function RecentSurveys({ surveys, isLoading }: RecentSurveysProps) {
  const sortedSurveys = [...surveys].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 3);

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-foreground font-inter">
          Recent Surveys
        </h3>
        <Link 
          href="/my-surveys"
          className="text-primary hover:text-primary-700 text-sm font-medium flex items-center transition-colors"
        >
          View all
          <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
      <Card className="overflow-hidden shadow-card gradient-border">
        {isLoading ? (
          <div className="divide-y divide-border">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="px-7 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="min-w-0 flex-1">
                      <Skeleton className="h-5 w-60 mb-2" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-8 w-40 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedSurveys.length === 0 ? (
          <div className="px-8 py-14 text-center">
            <div className="relative mx-auto mb-6">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-md"></div>
              <div className="relative rounded-full bg-primary/20 p-4 w-16 h-16 mx-auto flex items-center justify-center">
                <ClipboardList className="h-8 w-8 text-primary" />
              </div>
            </div>
            <p className="text-xl font-semibold text-foreground mb-2">No surveys yet</p>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">Create your first survey to start collecting responses and gain valuable insights.</p>
            <Button asChild className="btn-gradient">
              <Link href="/create-survey">
                Create a survey
              </Link>
            </Button>
          </div>
        ) : (
          <ul role="list" className="divide-y divide-border">
            {sortedSurveys.map((survey) => {
              const isActive = !survey.endDate || new Date(survey.endDate) >= new Date();
              
              return (
                <li key={survey.id} className="px-7 py-5 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <Link href={`/surveys/${survey.id}/analytics`}>
                        <p className="text-base font-medium text-foreground hover:text-primary transition-colors truncate">
                          {survey.title}
                        </p>
                      </Link>
                      <p className="mt-1.5 flex items-center text-sm text-muted-foreground">
                        <Calendar className="flex-shrink-0 mr-1.5 h-3.5 w-3.5" />
                        <span className="truncate">
                          Created on {new Date(survey.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${
                        isActive 
                          ? 'bg-success/20 text-success border border-success/30' 
                          : 'bg-muted text-muted-foreground border border-muted'
                      }`}>
                        {isActive ? (
                          <>
                            <span className="h-1.5 w-1.5 rounded-full bg-success mr-1.5 animate-pulse"></span>
                            Active
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3 w-3 mr-1.5" />
                            Closed
                          </>
                        )}
                      </span>
                      <Link 
                        href={`/surveys/${survey.id}/analytics`}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors group"
                      >
                        <BarChart3 className="h-3.5 w-3.5 mr-1" />
                        <span className="text-xs font-medium">
                          View Analytics
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
