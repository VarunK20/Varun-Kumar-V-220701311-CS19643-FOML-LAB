import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  bgColor: string;
  iconColor: string;
  linkText?: string;
  linkHref?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({
  title,
  value,
  icon,
  bgColor,
  iconColor,
  linkText,
  linkHref,
  trend,
}: StatsCardProps) {
  return (
    <Card className="card-hover overflow-hidden shadow-card gradient-border bg-white dark:bg-card">
      <div className="p-6">
        <div className="flex items-center">
          <div className="relative">
            <div className={cn("absolute inset-0 rounded-full blur-[8px] opacity-30", bgColor)}></div>
            <div className={cn("relative flex-shrink-0 rounded-full p-3", bgColor)}>
              <div className={cn("h-6 w-6", iconColor)}>
                {icon}
              </div>
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-muted-foreground truncate">
                {title}
              </dt>
              <dd>
                <div className="text-2xl font-semibold text-foreground font-inter mt-1">
                  {value}
                </div>
                {trend && (
                  <div className={cn(
                    "text-xs font-medium mt-1 flex items-center",
                    trend.isPositive ? "text-success" : "text-destructive"
                  )}>
                    <span>
                      {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                    </span>
                    <span className="text-muted-foreground ml-1.5">from last period</span>
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
      {linkText && linkHref && (
        <div className="px-6 py-3 border-t border-border bg-muted/40">
          <div className="text-sm">
            <Link
              href={linkHref}
              className="font-medium text-primary hover:text-primary-800 transition-colors flex items-center"
            >
              {linkText}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      )}
    </Card>
  );
}
