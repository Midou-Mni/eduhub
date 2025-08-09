import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  Settings,
  Shield,
  Flag,
  Bell,
  Database,
  Activity,
  Globe,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState } from "react";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "User Management",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Course Management",
    href: "/admin/courses",
    icon: BookOpen,
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    name: "Reports & Moderation",
    href: "/admin/reports",
    icon: Flag,
    badge: "notifications",
  },
  {
    name: "System Logs",
    href: "/admin/logs",
    icon: Activity,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

const bottomNavigation = [
  {
    name: "Help & Support",
    href: "/admin/help",
    icon: HelpCircle,
  },
  {
    name: "System Status",
    href: "/admin/status",
    icon: Database,
  },
];

export default function AdminSidebar() {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { data: notifications } = useQuery<{
    pendingReports: number;
    activeUsers: number;
    systemAlerts: number;
  }>({
    queryKey: ["/api/admin/notifications/unread-count"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getBadgeCount = (badgeType: string) => {
    switch (badgeType) {
      case "notifications":
        return notifications?.pendingReports || 0;
      default:
        return 0;
    }
  };

  return (
    <div className={cn(
      "fixed left-0 top-0 z-40 h-screen bg-neutral-900 text-white transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-700">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm">Admin Panel</h1>
              <p className="text-xs text-neutral-400">EduManage</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg hover:bg-neutral-700 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href || 
            (item.href !== "/admin" && location.startsWith(item.href));
          const badgeCount = item.badge ? getBadgeCount(item.badge) : 0;

          return (
            <Link key={item.name} href={item.href}>
              <div className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-neutral-300 hover:bg-neutral-700 hover:text-white"
              )}>
                <div className="flex items-center space-x-3">
                  <item.icon className={cn("h-5 w-5 flex-shrink-0")} />
                  {!isCollapsed && <span>{item.name}</span>}
                </div>
                {!isCollapsed && badgeCount > 0 && (
                  <Badge variant="destructive" className="ml-2 text-xs">
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </Badge>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Quick Stats */}
      {!isCollapsed && (
        <div className="p-4 border-t border-neutral-700">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Server Status</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-400">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Active Users</span>
              <span className="text-white font-medium">
                {notifications?.activeUsers || 0}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Pending Reports</span>
              <span className="text-white font-medium">
                {notifications?.pendingReports || 0}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-neutral-700 space-y-2">
        {bottomNavigation.map((item) => {
          const isActive = location === item.href;

          return (
            <Link key={item.name} href={item.href}>
              <div className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-neutral-300 hover:bg-neutral-700 hover:text-white"
              )}>
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.name}</span>}
              </div>
            </Link>
          );
        })}

        {/* Logout */}
        <div className={cn(
          "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 cursor-pointer",
          "text-neutral-300 hover:bg-red-600 hover:text-white"
        )}>
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </div>
      </div>
    </div>
  );
}
