import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  Upload,
  Settings,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "@shared/schema";

export default function Sidebar() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      name: "My Courses",
      href: "/courses",
      icon: BookOpen,
    },
    {
      name: "Students",
      href: "/students",
      icon: Users,
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: BarChart3,
    },
    {
      name: "Upload Materials",
      href: "/materials",
      icon: Upload,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  const handleSignOut = () => {
    window.location.href = "/api/logout";
  };

  const getInitials = () => {
    if (!user) return "U";
    const userData = user as User;
    return `${userData?.firstName?.charAt(0) || ''}${userData?.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <nav className="w-64 bg-white shadow-lg border-r border-neutral-200 fixed h-full z-30">
      {/* Logo */}
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <GraduationCap className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg text-neutral-700">EduPlatform</h1>
            <p className="text-sm text-neutral-400">Teacher Portal</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* User Profile Section */}
        {user && (
          <div className="bg-neutral-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={(user as User)?.profileImageUrl || undefined} />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-neutral-700 truncate">
                  {(user as User)?.firstName} {(user as User)?.lastName}
                </p>
                <p className="text-sm text-neutral-400 truncate">
                  {(user as User)?.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <button
                  onClick={() => setLocation(item.href)}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 w-full text-left rounded-lg font-medium transition-colors",
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-neutral-600 hover:text-primary hover:bg-primary/5"
                  )}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Sign Out Button */}
      <div className="absolute bottom-0 w-full p-4 border-t border-neutral-200">
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="flex items-center space-x-3 px-4 py-3 text-neutral-600 hover:text-error hover:bg-error/5 rounded-lg transition-colors w-full justify-start"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </Button>
      </div>
    </nav>
  );
}
