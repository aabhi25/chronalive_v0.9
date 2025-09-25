import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, School, Calendar, Users, Bot, Newspaper, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loginMutation, user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  // This useEffect is no longer needed as redirect is handled in useAuth
  // Keeping it as a fallback for edge cases
  useEffect(() => {
    if (isAuthenticated && user) {
      // Fallback redirect - should not be needed with the new logic
      setLocation("/");
    }
  }, [isAuthenticated, user, setLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <School className="h-8 w-8 text-primary mr-2" />
              <span className="text-2xl font-bold">Chrona</span>
            </div>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your AI-powered school management platform
            </CardDescription>
            
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-login">
              <div className="space-y-2">
                <Label htmlFor="email">Email / User ID</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="Enter your email or user ID"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="input-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-testid="input-password"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Right side - Hero Section */}
      <div className="flex-1 bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/40 dark:from-blue-950/20 dark:via-indigo-950/15 dark:to-purple-950/10 flex items-center justify-center p-8">
        <div className="max-w-lg text-center space-y-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-3 mr-3">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent">
            AI Powered School Management Solution
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Transform your educational institution with intelligent automation, 
            seamless communication, and comprehensive management tools.
          </p>
          
          <div className="grid grid-cols-1 gap-3 mt-8">
            <div className="flex items-center space-x-3 p-4 bg-white/60 dark:bg-slate-800/40 rounded-xl backdrop-blur-sm border border-white/20 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-2">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-sm">AI-Powered Scheduling</h3>
                <p className="text-xs text-muted-foreground">
                  Generate optimal timetables automatically
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-white/60 dark:bg-slate-800/40 rounded-xl backdrop-blur-sm border border-white/20 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg p-2">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-sm">AI Chroney Chat</h3>
                <p className="text-xs text-muted-foreground">
                  Intelligent assistant for school operations
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-white/60 dark:bg-slate-800/40 rounded-xl backdrop-blur-sm border border-white/20 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-2">
                <Newspaper className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-sm">School & Class Newsfeed</h3>
                <p className="text-xs text-muted-foreground">
                  Stay connected with real-time updates
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-white/60 dark:bg-slate-800/40 rounded-xl backdrop-blur-sm border border-white/20 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-2">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-sm">Multi-Role Access</h3>
                <p className="text-xs text-muted-foreground">
                  Administrators, teachers, students & parents
                </p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}