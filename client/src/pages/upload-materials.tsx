import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/layout/header";
import FileUpload from "@/components/upload/file-upload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileVideo, 
  FileText, 
  HelpCircle, 
  ClipboardList,
  Trash2,
  Eye,
  Download
} from "lucide-react";
import type { CourseWithDetails, CourseMaterial } from "@shared/schema";

export default function UploadMaterials() {
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const { toast } = useToast();

  const { data: courses, isLoading: coursesLoading, error: coursesError } = useQuery<CourseWithDetails[]>({
    queryKey: ["/api/courses"],
  });

  // Handle errors
  if (coursesError instanceof Error && isUnauthorizedError(coursesError)) {
    toast({
      title: "Unauthorized",
      description: "You are logged out. Logging in again...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
  }

  const { data: materials, isLoading: materialsLoading } = useQuery<CourseMaterial[]>({
    queryKey: ["/api/courses", selectedCourseId, "materials"],
    enabled: !!selectedCourseId,
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <FileVideo className="h-5 w-5 text-primary" />;
      case 'pdf':
        return <FileText className="h-5 w-5 text-error" />;
      case 'quiz':
        return <HelpCircle className="h-5 w-5 text-secondary" />;
      case 'assignment':
        return <ClipboardList className="h-5 w-5 text-success" />;
      default:
        return <FileText className="h-5 w-5 text-neutral-400" />;
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-primary/10 text-primary';
      case 'pdf':
        return 'bg-error/10 text-error';
      case 'quiz':
        return 'bg-secondary/10 text-secondary';
      case 'assignment':
        return 'bg-success/10 text-success';
      default:
        return 'bg-neutral-100 text-neutral-600';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDeleteMaterial = async (materialId: string) => {
    try {
      const response = await fetch(`/api/materials/${materialId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete material');
      }

      toast({
        title: "Success",
        description: "Material deleted successfully",
      });

      // Refresh materials list
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete material",
        variant: "destructive",
      });
    }
  };

  if (coursesLoading) {
    return (
      <div className="p-8">
        <Header title="Upload Materials" description="Upload course materials and resources" />
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-neutral-200 rounded-lg"></div>
          <div className="h-64 bg-neutral-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <Header 
        title="Upload Materials" 
        description="Upload videos, PDFs, quizzes, and other course resources"
      />

      {/* Course Selection */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Select Course</CardTitle>
          <CardDescription>
            Choose which course you want to upload materials for
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select a course..." />
            </SelectTrigger>
            <SelectContent>
              {courses?.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedCourseId && (
        <>
          {/* File Upload Component */}
          <FileUpload courseId={selectedCourseId} />

          {/* Existing Materials */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Course Materials</CardTitle>
              <CardDescription>
                Manage existing materials for this course
              </CardDescription>
            </CardHeader>
            <CardContent>
              {materialsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-neutral-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : materials && materials.length > 0 ? (
                <div className="space-y-4">
                  {materials.map((material) => (
                    <div
                      key={material.id}
                      className="flex items-center space-x-4 p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        {getFileIcon(material.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="text-sm font-medium text-neutral-900 truncate">
                            {material.title}
                          </p>
                          <Badge variant="outline" className={getFileTypeColor(material.type)}>
                            {material.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-neutral-500">
                          {material.fileSize && formatFileSize(material.fileSize)}
                          {material.mimeType && ` • ${material.mimeType}`}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        {material.fileUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(material.fileUrl ?? '', '_blank')} 
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMaterial(material.id)}
                          className="text-error hover:text-error hover:bg-error/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                  <h3 className="text-lg font-medium text-neutral-700 mb-2">No materials uploaded</h3>
                  <p className="text-neutral-500">
                    Upload your first course material using the form above.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!selectedCourseId && courses && courses.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
              <h3 className="text-lg font-medium text-neutral-700 mb-2">No courses available</h3>
              <p className="text-neutral-500">
                Create a course first before uploading materials.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
