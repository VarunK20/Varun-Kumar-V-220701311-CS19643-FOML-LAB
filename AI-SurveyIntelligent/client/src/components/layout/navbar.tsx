import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MenuIcon, BellIcon, PieChart, ChevronDown, User, LogOut, Settings } from "lucide-react";

export function Navbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", active: location === "/dashboard" },
    { href: "/my-surveys", label: "My Surveys", active: location === "/my-surveys" },
    { href: "/public-surveys", label: "Take a Survey", active: location === "/public-surveys" },
    { href: "/answered-surveys", label: "Completed", active: location === "/answered-surveys" },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="bg-white shadow-md border-b sticky top-0 z-50 backdrop-blur-md bg-white/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/landing" className="flex items-center space-x-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-primary rounded-full blur-[6px] opacity-30"></div>
                  <PieChart className="relative text-primary h-7 w-7" />
                </div>
                <span className="text-xl font-bold gradient-heading">SurveyAI</span>
              </Link>
            </div>
            
            <div className="hidden sm:ml-10 sm:flex sm:space-x-10">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${
                    item.active
                      ? "border-primary text-foreground font-semibold"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-secondary/40"
                  } inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium transition-all duration-200`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-3">
            <button className="bg-accent p-2 rounded-full text-accent-foreground hover:bg-accent/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors">
              <span className="sr-only">View notifications</span>
              <BellIcon className="h-5 w-5" />
            </button>

            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative rounded-full py-1.5 px-3 bg-accent/50 hover:bg-accent flex items-center space-x-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center text-primary font-semibold shadow-sm border border-primary/10">
                      {user?.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-foreground hidden md:block">{user?.username}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-1 p-1">
                  <DropdownMenuItem className="flex items-center py-2 px-3 cursor-pointer hover:bg-accent">
                    <User className="mr-2.5 h-4 w-4" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center py-2 px-3 cursor-pointer hover:bg-accent">
                    <Settings className="mr-2.5 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center py-2 px-3 cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive">
                    <LogOut className="mr-2.5 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="-mr-2 flex items-center sm:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <MenuIcon className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`sm:hidden shadow-lg ${mobileMenuOpen ? "block animate-accordion-down" : "hidden"}`}>
        <div className="pt-2 pb-3 space-y-1 px-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${
                item.active
                  ? "bg-primary/10 border-primary text-primary font-medium"
                  : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
              } block pl-3 pr-4 py-2.5 border-l-2 text-base transition-colors rounded-r-lg`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="pt-4 pb-3 border-t border-border">
          <div className="flex items-center px-4 py-2">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center text-primary font-semibold shadow-sm border border-primary/10">
                {user?.username.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="ml-3">
              <div className="text-base font-medium text-foreground">
                {user?.username}
              </div>
            </div>
          </div>
          <div className="mt-3 space-y-1 px-1">
            <button className="flex w-full items-center px-3 py-2.5 text-base text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg">
              <User className="mr-3 h-5 w-5" />
              <span>My Profile</span>
            </button>
            <button className="flex w-full items-center px-3 py-2.5 text-base text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg">
              <Settings className="mr-3 h-5 w-5" />
              <span>Settings</span>
            </button>
            <button 
              onClick={handleLogout}
              className="flex w-full items-center px-3 py-2.5 text-base text-destructive hover:bg-destructive/10 rounded-lg"
            >
              <LogOut className="mr-3 h-5 w-5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
