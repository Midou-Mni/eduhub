import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  Download,
  CheckCircle,
  FileText,
  Video,
  BookOpen
} from "lucide-react";
import type { CourseWithDetails, CourseMaterial, Enrollment } from "@shared/schema";

export default function CoursePlayer() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentMaterialIndex, setCurrentMaterialIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const { data: course, isLoading } = useQuery<CourseWithDetails>({
    queryKey: ["/api/student/course", id],
    enabled: !!id,
  });

  const { data: enrollment } = useQuery<Enrollment>({
    queryKey: ["/api/student/enrollment", id],
    enabled: !!id,
  });

  const progressMutation = useMutation({
    mutationFn: async (progress: number) => {
      if (!enrollment) return;
      await apiRequest("PUT", `/api/student/progress/${enrollment.id}`, { progress });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/student/course", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/student/enrollment", id] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!course || !course.isEnrolled) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-neutral-400 mb-4">You need to be enrolled to access this course.</p>
          <Link href={`/course/${id}`}>
            <Button>View Course</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentMaterial = course.materials[currentMaterialIndex];
  const isFirstMaterial = currentMaterialIndex === 0;
  const isLastMaterial = currentMaterialIndex === course.materials.length - 1;

  const handlePrevious = () => {
    if (!isFirstMaterial) {
      setCurrentMaterialIndex(currentMaterialIndex - 1);
    }
  };

  const handleNext = () => {
    if (!isLastMaterial) {
      setCurrentMaterialIndex(currentMaterialIndex + 1);
      // Update progress
      const newProgress = Math.round(((currentMaterialIndex + 1) / course.materials.length) * 100);
      progressMutation.mutate(newProgress);
    }
  };

  const handleMaterialComplete = () => {
    const newProgress = Math.round(((currentMaterialIndex + 1) / course.materials.length) * 100);
    progressMutation.mutate(newProgress);
    
    toast({
      title: "Progress Updated",
      description: `You've completed "${currentMaterial.title}"`,
    });

    if (!isLastMaterial) {
      setTimeout(() => {
        setCurrentMaterialIndex(currentMaterialIndex + 1);
      }, 1000);
    } else {
      toast({
        title: "Congratulations! 🎉",
        description: "You've completed the entire course!",
      });
    }
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'pdf':
        return <FileText className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const renderMaterialContent = (material: CourseMaterial) => {
    if (material.type === 'video' && material.fileUrl) {
      return (
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <video
            controls
            className="w-full h-full"
            onEnded={handleMaterialComplete}
            poster={course.thumbnailUrl || undefined}
          >
            <source src={material.fileUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    if (material.type === 'pdf' && material.fileUrl) {
      return (
        <div className="bg-white rounded-lg p-8 text-center">
          <FileText className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
          <h3 className="text-xl font-semibold mb-4">{material.title}</h3>
          <div className="space-y-4">
            <Button asChild>
              <a href={material.fileUrl} target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </a>
            </Button>
            <Button variant="outline" onClick={handleMaterialComplete}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as Complete
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg p-8 text-center">
        {getFileTypeIcon(material.type)}
        <h3 className="text-xl font-semibold mb-4">{material.title}</h3>
        <p className="text-neutral-600 mb-6">
          This material type is not supported for preview.
        </p>
        <Button onClick={handleMaterialComplete}>
          <CheckCircle className="mr-2 h-4 w-4" />
          Mark as Complete
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-900">
      {/* Header */}
      <div className="bg-neutral-800 border-b border-neutral-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={`/course/${id}`}>
              <Button variant="ghost" size="sm" className="text-white hover:text-primary">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Course
              </Button>
            </Link>
            <div className="text-white">
              <h1 className="font-semibold truncate max-w-md">{course.title}</h1>
              <p className="text-sm text-neutral-400">
                Lesson {currentMaterialIndex + 1} of {course.materials.length}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-white text-right">
              <p className="text-sm text-neutral-400">Progress</p>
              <p className="font-semibold">{Math.round(course.userProgress || 0)}%</p>
            </div>
            <Progress value={course.userProgress || 0} className="w-32" />
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="h-full flex flex-col">
            {/* Material Header */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-2">
                {getFileTypeIcon(currentMaterial.type)}
                <Badge variant="outline" className="text-white border-neutral-600">
                  {currentMaterial.type.charAt(0).toUpperCase() + currentMaterial.type.slice(1)}
                </Badge>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {currentMaterial.title}
              </h2>
            </div>

            {/* Material Content */}
            <div className="flex-1 mb-6">
              {renderMaterialContent(currentMaterial)}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={isFirstMaterial}
                className="text-white border-neutral-600 hover:bg-neutral-800"
              >
                <SkipBack className="mr-2 h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={handleMaterialComplete}
                  className="text-white border-neutral-600 hover:bg-neutral-800"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete
                </Button>
              </div>

              <Button
                onClick={handleNext}
                disabled={isLastMaterial}
                className="bg-primary hover:bg-primary/90"
              >
                Next
                <SkipForward className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-neutral-800 border-l border-neutral-700 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-white font-semibold mb-4">Course Content</h3>
            <div className="space-y-2">
              {course.materials.map((material, index) => (
                <button
                  key={material.id}
                  onClick={() => setCurrentMaterialIndex(index)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    index === currentMaterialIndex
                      ? 'bg-primary text-white'
                      : 'text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {getFileTypeIcon(material.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {material.title}
                      </p>
                      <p className="text-xs opacity-75">
                        Lesson {index + 1}
                      </p>
                    </div>
                    {index < currentMaterialIndex && (
                      <CheckCircle className="h-4 w-4 text-success" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}