import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { MenuIcon, PieChart } from "lucide-react";

export function LandingNavbar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Function to handle section highlighting
  const handleSectionClick = (section: string) => {
    setActiveSection(section);
  };
  
  // Detect current section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100; // Offset for better UX
      
      // Get section positions
      const featuresSection = document.getElementById('features');
      const pricingSection = document.getElementById('pricing');
      
      if (!featuresSection || !pricingSection) return;
      
      // Set active section based on scroll position
      if (scrollPosition >= pricingSection.offsetTop) {
        setActiveSection('pricing');
      } else if (scrollPosition >= featuresSection.offsetTop) {
        setActiveSection('features');
      } else {
        setActiveSection('home');
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Call once on mount to set initial state
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
              <Link
                href="/landing"
                className={`${
                  activeSection === 'home'
                    ? "border-primary text-foreground font-semibold" 
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-secondary/40"
                } inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium transition-all duration-200`}
                onClick={() => handleSectionClick('home')}
              >
                Home
              </Link>
              
              <a
                href="#features"
                className={`${
                  activeSection === 'features'
                    ? "border-primary text-foreground font-semibold" 
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-secondary/40"
                } inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium transition-all duration-200`}
                onClick={() => handleSectionClick('features')}
              >
                Features
              </a>
              
              <a
                href="#pricing"
                className={`${
                  activeSection === 'pricing'
                    ? "border-primary text-foreground font-semibold" 
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-secondary/40"
                } inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium transition-all duration-200`}
                onClick={() => handleSectionClick('pricing')}
              >
                Pricing
              </a>
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-3">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="outline">Dashboard</Button>
                </Link>
                <Link href="/create-survey">
                  <Button className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary-600 hover:to-purple-700">
                    Create Survey
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="outline">Log in</Button>
                </Link>
                <Link href="/auth">
                  <Button className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary-600 hover:to-purple-700">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
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
          <Link
            href="/landing"
            className={`${
              activeSection === 'home'
                ? "bg-primary/10 border-primary text-primary font-medium"
                : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
            } block pl-3 pr-4 py-2.5 border-l-2 text-base transition-colors rounded-r-lg`}
            onClick={() => {
              setMobileMenuOpen(false);
              handleSectionClick('home');
            }}
          >
            Home
          </Link>
          
          <a
            href="#features"
            className={`${
              activeSection === 'features'
                ? "bg-primary/10 border-primary text-primary font-medium"
                : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
            } block pl-3 pr-4 py-2.5 border-l-2 text-base transition-colors rounded-r-lg`}
            onClick={() => {
              setMobileMenuOpen(false);
              handleSectionClick('features');
            }}
          >
            Features
          </a>
          
          <a
            href="#pricing"
            className={`${
              activeSection === 'pricing'
                ? "bg-primary/10 border-primary text-primary font-medium"
                : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
            } block pl-3 pr-4 py-2.5 border-l-2 text-base transition-colors rounded-r-lg`}
            onClick={() => {
              setMobileMenuOpen(false);
              handleSectionClick('pricing');
            }}
          >
            Pricing
          </a>
          
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="border-transparent text-primary hover:bg-accent hover:text-primary block pl-3 pr-4 py-2.5 border-l-2 text-base transition-colors rounded-r-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/create-survey"
                className="border-transparent bg-primary/10 text-primary hover:bg-primary/20 block pl-3 pr-4 py-2.5 border-l-2 text-base transition-colors rounded-r-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Create Survey
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/auth"
                className="border-transparent text-primary hover:bg-accent hover:text-primary block pl-3 pr-4 py-2.5 border-l-2 text-base transition-colors rounded-r-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                href="/auth"
                className="border-transparent bg-primary/10 text-primary hover:bg-primary/20 block pl-3 pr-4 py-2.5 border-l-2 text-base transition-colors rounded-r-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}