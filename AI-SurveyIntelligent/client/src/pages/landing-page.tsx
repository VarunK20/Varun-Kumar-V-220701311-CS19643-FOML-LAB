import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { LandingNavbar } from "@/components/layout/landing-navbar";
import {
  BarChart3,
  LineChart,
  Share2,
  FileBarChart2,
  Zap,
  Brain,
  ChevronRight,
  ArrowRight
} from "lucide-react";

export default function LandingPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: <BarChart3 className="h-10 w-10 text-primary" />,
      title: "Advanced Analytics",
      description: "Gain deep insights into your survey data with our powerful analytics tools.",
    },
    {
      icon: <Zap className="h-10 w-10 text-primary" />,
      title: "AI-Powered Questions",
      description: "Generate survey questions automatically with our AI assistant.",
    },
    {
      icon: <FileBarChart2 className="h-10 w-10 text-primary" />,
      title: "Export Reports",
      description: "Download and share your survey results in multiple formats.",
    },
    {
      icon: <Brain className="h-10 w-10 text-primary" />,
      title: "Predictive Insights",
      description: "Get AI-generated predictions about survey performance and audience engagement.",
    },
    {
      icon: <LineChart className="h-10 w-10 text-primary" />,
      title: "Real-time Results",
      description: "Watch responses come in and analyze them as they arrive.",
    },
    {
      icon: <Share2 className="h-10 w-10 text-primary" />,
      title: "Easy Sharing",
      description: "Share your surveys with your audience through multiple channels.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <LandingNavbar />

      <main>
        {/* Hero Section */}
        <div className="relative bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
              <svg
                className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
                fill="currentColor"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <polygon points="50,0 100,0 50,100 0,100" />
              </svg>

              <div className="pt-10 sm:pt-16 lg:pt-8 xl:pt-16">
                <div className="sm:text-center lg:text-left px-4 sm:px-6 lg:px-8">
                  <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                    <span className="block xl:inline">Create advanced surveys </span>
                    <span className="block xl:inline bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                      powered by AI
                    </span>
                  </h1>
                  <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    Design, collect, and analyze survey data with our AI-assisted platform. Generate insights, export reports, and make data-driven decisions faster than ever before.
                  </p>
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    <div className="rounded-md shadow">
                      {user ? (
                        <Link href="/dashboard">
                          <Button 
                            className="w-full flex items-center justify-center py-6 text-base font-medium rounded-md text-white bg-gradient-to-r from-primary to-purple-600 hover:from-primary-600 hover:to-purple-700 md:py-4 md:text-lg md:px-10"
                          >
                            Go to Dashboard
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                        </Link>
                      ) : (
                        <Link href="/auth">
                          <Button 
                            className="w-full flex items-center justify-center py-6 text-base font-medium rounded-md text-white bg-gradient-to-r from-primary to-purple-600 hover:from-primary-600 hover:to-purple-700 md:py-4 md:text-lg md:px-10"
                          >
                            Get started
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                        </Link>
                      )}
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                      <a
                        href="#features"
                        className="w-full flex items-center justify-center py-6 px-8 border border-transparent text-base font-medium rounded-md text-primary bg-primary-50 hover:bg-primary-100 md:py-4 md:text-lg md:px-10"
                      >
                        Learn more
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
            <img
              className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
              src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80"
              alt="Team collaborating on surveys"
            />
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Features</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Smarter surveys, deeper insights
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Our platform combines ease of use with powerful AI capabilities to elevate your survey experience.
              </p>
            </div>

            <div className="mt-10">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((feature, index) => (
                  <div key={index} className="pt-6 px-6 pb-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                    <div className="h-12 w-12 rounded-md bg-primary-50 flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <h3 className="mt-5 text-lg leading-6 font-medium text-gray-900">{feature.title}</h3>
                    <p className="mt-2 text-base text-gray-500">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>



        {/* Pricing Section */}
        <div id="pricing" className="bg-gray-50 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="sm:text-center">
              <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Pricing</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Plans for teams of all sizes
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 sm:mx-auto">
                Choose the perfect plan for your needs. All plans include our core features.
              </p>
            </div>

            <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:grid-cols-3">
              {/* Free Plan */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200">
                <div className="p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Free</h3>
                  <p className="mt-4 text-sm text-gray-500">Get started with basic survey features.</p>
                  <p className="mt-8">
                    <span className="text-4xl font-extrabold text-gray-900">₹0</span>
                    <span className="text-base font-medium text-gray-500">/mo</span>
                  </p>
                  {user ? (
                    <Link href="/dashboard">
                      <Button
                        className="mt-8 w-full bg-primary"
                      >
                        Go to Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/auth">
                      <Button
                        className="mt-8 w-full bg-primary"
                      >
                        Sign up for free
                      </Button>
                    </Link>
                  )}
                </div>
                <div className="pt-6 pb-8 px-6">
                  <h4 className="text-sm font-medium text-gray-900 tracking-wide">What's included</h4>
                  <ul className="mt-6 space-y-4">
                    <li className="flex space-x-3">
                      <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-500">Up to 5 surveys</span>
                    </li>
                    <li className="flex space-x-3">
                      <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-500">Basic analytics</span>
                    </li>
                    <li className="flex space-x-3">
                      <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-500">100 responses per survey</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Pro Plan */}
              <div className="bg-white border border-primary-200 rounded-lg shadow-sm divide-y divide-gray-200">
                <div className="p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Pro</h3>
                  <p className="mt-4 text-sm text-gray-500">For professionals with advanced needs.</p>
                  <p className="mt-8">
                    <span className="text-4xl font-extrabold text-gray-900">₹2,199</span>
                    <span className="text-base font-medium text-gray-500">/mo</span>
                  </p>
                  {user ? (
                    <Link href="/dashboard">
                      <Button
                        className="mt-8 w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary-600 hover:to-purple-700"
                      >
                        Go to Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/auth">
                      <Button
                        className="mt-8 w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary-600 hover:to-purple-700"
                      >
                        Start Pro plan
                      </Button>
                    </Link>
                  )}
                </div>
                <div className="pt-6 pb-8 px-6">
                  <h4 className="text-sm font-medium text-gray-900 tracking-wide">What's included</h4>
                  <ul className="mt-6 space-y-4">
                    <li className="flex space-x-3">
                      <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-500">Unlimited surveys</span>
                    </li>
                    <li className="flex space-x-3">
                      <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-500">Advanced analytics & AI insights</span>
                    </li>
                    <li className="flex space-x-3">
                      <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-500">1,000 responses per survey</span>
                    </li>
                    <li className="flex space-x-3">
                      <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-500">PDF and Excel exports</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Enterprise Plan */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200">
                <div className="p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Enterprise</h3>
                  <p className="mt-4 text-sm text-gray-500">For organizations with custom requirements.</p>
                  <p className="mt-8">
                    <span className="text-4xl font-extrabold text-gray-900">₹7,499</span>
                    <span className="text-base font-medium text-gray-500">/mo</span>
                  </p>
                  {user ? (
                    <Link href="/dashboard">
                      <Button
                        className="mt-8 w-full"
                        variant="outline"
                      >
                        Go to Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/auth">
                      <Button
                        className="mt-8 w-full"
                        variant="outline"
                      >
                        Contact sales
                      </Button>
                    </Link>
                  )}
                </div>
                <div className="pt-6 pb-8 px-6">
                  <h4 className="text-sm font-medium text-gray-900 tracking-wide">What's included</h4>
                  <ul className="mt-6 space-y-4">
                    <li className="flex space-x-3">
                      <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-500">Everything in Pro</span>
                    </li>
                    <li className="flex space-x-3">
                      <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-500">Dedicated support</span>
                    </li>
                    <li className="flex space-x-3">
                      <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-500">Custom integrations</span>
                    </li>
                    <li className="flex space-x-3">
                      <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-500">Advanced security features</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Ready to get started?</span>
              <span className="block text-primary-100">Create your first survey today.</span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                {user ? (
                  <Link href="/dashboard">
                    <Button 
                      className="bg-white text-primary hover:bg-gray-50 py-6 px-8"
                    >
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link href="/auth">
                    <Button 
                      className="bg-white text-primary hover:bg-gray-50 py-6 px-8"
                    >
                      Get started
                    </Button>
                  </Link>
                )}
              </div>
              <div className="ml-3 inline-flex rounded-md shadow">
                <a
                  href="#features"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-800 hover:bg-primary-700"
                >
                  Learn more
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="space-y-8 xl:col-span-1">
              <Link href="/landing" className="inline-block">
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Survey AI
                </span>
              </Link>
              <p className="text-gray-500 text-base">
                Making survey creation and analysis smarter with powerful AI tools.
              </p>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Features</h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                        AI Assistance
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                        Analytics
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                        Reports
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                        Integrations
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Support</h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                        Documentation
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                        Guides
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                        API Status
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                        About
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                        Blog
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                        Careers
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                        Privacy
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                        Terms
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-200 pt-8">
            <p className="text-sm text-gray-500 text-center">
              &copy; {new Date().getFullYear()} Survey AI. All rights reserved. <br />
              <span className="mt-2 inline-block">Headquarters: Chennai, Tamil Nadu, India</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}