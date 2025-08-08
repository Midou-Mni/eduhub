import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/layout/header";
import CourseTable from "@/components/courses/course-table";
import CreateCourseModal from "@/components/modals/create-course-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { CourseWithDetails } from "@shared/schema";

export default function Courses() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { toast } = useToast();

  const { data: courses, isLoading, error } = useQuery<CourseWithDetails[]>({
    queryKey: ["/api/courses"],
  });

  // Handle errors
  if (error instanceof Error) {
    if (isUnauthorizedError(error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    } else {
      toast({
        title: "Error",
        description: "Failed to load courses. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="p-8">
      <Header
        title="My Courses"
        description="Create, edit, and manage all your courses"
        action={
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-primary text-white hover:bg-primary-dark"
          >
            <Plus className="mr-2" size={16} />
            Create Course
          </Button>
        }
      />

      <CourseTable courses={courses} isLoading={isLoading} showActions />

      <CreateCourseModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  );
}
