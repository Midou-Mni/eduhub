import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen, Users, TrendingUp, Upload, BarChart3 } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="text-white" size={24} />
            </div>
            <div>
              <h1 className="font-bold text-lg text-neutral-700">EduPlatform</h1>
              <p className="text-sm text-neutral-400">Teacher Portal</p>
            </div>
          </div>
          <Button onClick={handleLogin} className="bg-primary hover:bg-primary-dark">
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-neutral-700 mb-6">
            Build Your Teaching Empire
          </h1>
          <p className="text-xl text-neutral-500 mb-8 leading-relaxed">
            Create, manage, and scale your online courses with our comprehensive teacher platform. 
            Track student progress, upload materials, and grow your educational impact.
          </p>
          <Button 
            onClick={handleLogin} 
            size="lg" 
            className="bg-primary hover:bg-primary-dark text-lg px-8 py-4"
          >
            Get Started Teaching
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-neutral-700 mb-4">
            Everything You Need to Teach Online
          </h2>
          <p className="text-neutral-500 text-lg max-w-2xl mx-auto">
            Our platform provides all the tools you need to create engaging courses, 
            manage students, and track your success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border border-neutral-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="text-primary" size={24} />
              </div>
              <CardTitle className="text-neutral-700">Course Creation</CardTitle>
              <CardDescription>
                Build comprehensive courses with video lectures, PDFs, quizzes, and assignments.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border border-neutral-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="text-success" size={24} />
              </div>
              <CardTitle className="text-neutral-700">Student Management</CardTitle>
              <CardDescription>
                Track enrollments, monitor progress, and engage with your student community.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border border-neutral-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                <Upload className="text-secondary" size={24} />
              </div>
              <CardTitle className="text-neutral-700">File Upload</CardTitle>
              <CardDescription>
                Easily upload videos, documents, and other course materials with drag-and-drop.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border border-neutral-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="text-warning" size={24} />
              </div>
              <CardTitle className="text-neutral-700">Analytics & Insights</CardTitle>
              <CardDescription>
                Get detailed analytics on course performance, student engagement, and revenue.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border border-neutral-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-error/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="text-error" size={24} />
              </div>
              <CardTitle className="text-neutral-700">Revenue Tracking</CardTitle>
              <CardDescription>
                Monitor your earnings, student enrollment trends, and course ratings.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border border-neutral-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <GraduationCap className="text-primary" size={24} />
              </div>
              <CardTitle className="text-neutral-700">Professional Dashboard</CardTitle>
              <CardDescription>
                Access all your teaching tools from one beautiful, intuitive dashboard.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Teaching?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of educators who are already building successful online courses 
            and growing their teaching business.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg" 
            variant="secondary"
            className="bg-white text-primary hover:bg-neutral-100 text-lg px-8 py-4"
          >
            Start Teaching Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-700 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="text-white" size={20} />
            </div>
            <span className="font-bold text-lg">EduPlatform</span>
          </div>
          <p className="text-neutral-400">
            Empowering educators to build and scale their online teaching business.
          </p>
        </div>
      </footer>
    </div>
  );
}
