import { useState } from "react";
import { useLocation, Link } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { insertUserSchema } from "@shared/schema";
import { Eye, EyeOff, PieChart } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

const loginSchema = insertUserSchema;

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });
  
  // Redirect if already logged in - go to landing page
  if (user) {
    navigate("/landing");
    return null;
  }

  function onLoginSubmit(data: z.infer<typeof loginSchema>) {
    loginMutation.mutate(data, {
      onSuccess: () => {
        // Navigate to landing page on successful login
        navigate("/landing");
      }
    });
  }

  function onRegisterSubmit(data: z.infer<typeof registerSchema>) {
    const { confirmPassword, ...userData } = data;
    registerMutation.mutate(userData, {
      onSuccess: () => {
        // Navigate to landing page on successful registration
        navigate("/landing");
      }
    });
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-white to-gray-50">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-2">
              <PieChart className="text-primary h-8 w-8" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">SurveyAI</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            {activeTab === "login" ? "Welcome back" : "Join SurveyAI today"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {activeTab === "login" 
              ? "Sign in to access your surveys and analytics" 
              : "Create an account to start creating and analyzing surveys"}
          </p>
        </div>

        <div className="mt-8 mx-auto w-full max-w-md">
          <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-gray-100">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input 
                                type={showLoginPassword ? "text" : "password"} 
                                placeholder="Enter your password" 
                                {...field} 
                              />
                            </FormControl>
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                              onClick={() => setShowLoginPassword(!showLoginPassword)}
                            >
                              {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Checkbox id="remember-me" />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                          Remember me
                        </label>
                      </div>
                      <div className="text-sm">
                        <button 
                          type="button"
                          className="font-medium text-primary hover:text-primary-600"
                          onClick={() => alert("Forgot password feature coming soon!")}
                        >
                          Forgot password?
                        </button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary-600 hover:to-purple-700"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Signing in..." : "Sign in"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Choose a username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input 
                                type={showRegisterPassword ? "text" : "password"} 
                                placeholder="Create a password" 
                                {...field} 
                              />
                            </FormControl>
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                              onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                            >
                              {showRegisterPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input 
                                type={showConfirmPassword ? "text" : "password"} 
                                placeholder="Confirm your password" 
                                {...field} 
                              />
                            </FormControl>
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary-600 hover:to-purple-700"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating account..." : "Create account"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 text-center">
              <Link href="/landing" className="text-sm text-gray-600 hover:text-primary">
                ← Back to home page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}