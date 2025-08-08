import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Star, 
  Play,
  CheckCircle 
} from "lucide-react";

export default function StudentLanding() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="text-white" size={20} />
              </div>
              <div>
                <h1 className="font-bold text-xl text-neutral-900">EduPlatform</h1>
                <p className="text-sm text-neutral-500">Learn without limits</p>
              </div>
            </div>
            <Button onClick={handleLogin} size="lg">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-neutral-900 mb-6">
            Learn from the{" "}
            <span className="text-primary">best teachers</span>
            <br />
            in the world
          </h1>
          <p className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto">
            Join thousands of students learning new skills, advancing their careers, 
            and pursuing their passions through our comprehensive online courses.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button onClick={handleLogin} size="lg" className="px-8 py-3">
              Start Learning Now
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-3">
              <Play className="mr-2 h-4 w-4" />
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Why choose EduPlatform?
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              We provide everything you need to succeed in your learning journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Expert-Led Courses</CardTitle>
                <CardDescription>
                  Learn from industry professionals with years of real-world experience
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Active Community</CardTitle>
                <CardDescription>
                  Connect with fellow learners and get support when you need it
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Track Progress</CardTitle>
                <CardDescription>
                  Monitor your learning journey with detailed progress tracking
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50K+</div>
              <div className="text-neutral-600">Active Students</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">1,200+</div>
              <div className="text-neutral-600">Online Courses</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">95%</div>
              <div className="text-neutral-600">Completion Rate</div>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <div className="text-4xl font-bold text-primary">4.8</div>
                <Star className="h-6 w-6 text-warning fill-current ml-1" />
              </div>
              <div className="text-neutral-600">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to start your learning journey?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join our community of learners and start building the skills you need for success.
          </p>
          <Button 
            onClick={handleLogin} 
            size="lg" 
            variant="secondary" 
            className="px-8 py-3"
          >
            Get Started Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="text-white" size={16} />
              </div>
              <span className="font-semibold">EduPlatform</span>
            </div>
            <div className="text-neutral-400">
              © 2024 EduPlatform. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}