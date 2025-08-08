import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/toaster";

// Student Pages
import StudentLanding from "@/pages/student/student-landing";
import StudentDashboard from "@/pages/student/student-dashboard";
import CourseBrowse from "@/pages/student/course-browse";
import CourseDetail from "@/pages/student/course-detail";
import CoursePlayer from "@/pages/student/course-player";
import StudentProfile from "@/pages/student/student-profile";
import StudentEnrollments from "@/pages/student/student-enrollments";

// Shared Components
import { apiRequest } from "@/lib/queryClient";

// Setup Query Client with auth-aware fetcher
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const [url] = queryKey as [string];
        const response = await apiRequest("GET", url);
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`${response.status}: ${errorData}`);
        }
        return response.json();
      },
      retry: (failureCount, error) => {
        if (error.message.includes("401")) return false;
        return failureCount < 3;
      },
    },
  },
});

function StudentRouter() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={StudentLanding} />
      ) : (
        <>
          <Route path="/" component={StudentDashboard} />
          <Route path="/browse" component={CourseBrowse} />
          <Route path="/course/:id" component={CourseDetail} />
          <Route path="/learn/:id" component={CoursePlayer} />
          <Route path="/my-courses" component={StudentEnrollments} />
          <Route path="/profile" component={StudentProfile} />
        </>
      )}
      <Route>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-neutral-900 mb-4">404</h1>
            <p className="text-neutral-600">Page not found</p>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

export default function StudentApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <StudentRouter />
      <Toaster />
    </QueryClientProvider>
  );
}