import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/toaster";

// Auth Components
import { LoginPage } from "@/pages/login";

// Teacher Components
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Courses from "@/pages/courses";
import Students from "@/pages/students";
import Analytics from "@/pages/analytics";
import UploadMaterials from "@/pages/upload-materials";
import Settings from "@/pages/settings";
import Sidebar from "@/components/layout/sidebar";

// Admin Components
import AdminDashboard from "@/pages/admin/admin-dashboard";
import UserManagement from "@/pages/admin/user-management";
import CourseManagement from "@/pages/admin/course-management";
import AdminAnalytics from "@/pages/admin/admin-analytics";
import AdminSettings from "@/pages/admin/admin-settings";
import ReportsModeration from "@/pages/admin/reports-moderation";
import AdminSidebar from "@/components/layout/admin-sidebar";
import AdminHeader from "@/components/layout/admin-header";

// Student Components
import StudentApp from "@/student-app";

// Shared Components
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

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

function AdminRouter() {
  return (
    <Switch>
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/users" component={UserManagement} />
      <Route path="/admin/courses" component={CourseManagement} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      <Route path="/admin/reports" component={ReportsModeration} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-neutral-900 mb-4">404</h1>
            <p className="text-neutral-600">Admin page not found</p>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

function TeacherRouter() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/courses" component={Courses} />
          <Route path="/students" component={Students} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/materials" component={UploadMaterials} />
          <Route path="/settings" component={Settings} />
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

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading while determining auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Check if user is an admin, teacher, or student
  const userRole = (user as User)?.role || 'student';

  // Route to appropriate app based on role
  if (userRole === 'admin') {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="flex">
          <AdminSidebar />
          <div className="flex-1 ml-16 lg:ml-64">
            <AdminHeader />
            <main className="p-0">
              <AdminRouter />
            </main>
          </div>
        </div>
      </div>
    );
  }

  if (userRole === 'teacher') {
    return (
      <div className="min-h-screen bg-neutral-50 flex">
        <Sidebar />
        <main className="flex-1 ml-64">
          <TeacherRouter />
        </main>
      </div>
    );
  }

  // Default to student app
  return <StudentApp />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}