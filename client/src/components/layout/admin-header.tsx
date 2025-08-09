import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Bell, 
  Search, 
  Settings, 
  User, 
  LogOut,
  AlertTriangle,
  CheckCircle,
  Info,
  X
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { User as UserType, AdminNotification } from "@shared/schema";

export default function AdminHeader() {
  const { user, logout: authLogout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const { data: notifications } = useQuery<AdminNotification[]>({
    queryKey: ["/api/admin/notifications"],
    refetchInterval: 30000,
  });

  const { data: unreadCount } = useQuery<{ count: number }>({
    queryKey: ["/api/admin/notifications/unread-count"],
    refetchInterval: 30000,
  });

  const unreadNotifications = notifications?.filter(n => !n.isRead) || [];

  const getNotificationIcon = (type: string | null) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const handleLogout = () => {
    authLogout();
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-neutral-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users, courses, reports..."
              className="pl-9 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-96"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Quick Stats */}
          <div className="hidden md:flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-muted-foreground">System Online</span>
            </div>
            <div className="text-muted-foreground">
              Active Users: <span className="font-medium text-foreground">1,234</span>
            </div>
          </div>

          {/* Notifications */}
          <Popover open={showNotifications} onOpenChange={setShowNotifications}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount && unreadCount.count > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadCount.count > 99 ? "99+" : unreadCount.count}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="border-b border-neutral-200 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Notifications</h3>
                  {unreadCount && unreadCount.count > 0 && (
                    <Badge variant="secondary">
                      {unreadCount.count} new
                    </Badge>
                  )}
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {unreadNotifications.length > 0 ? (
                  unreadNotifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className="border-b border-neutral-100 p-4 hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {notification.createdAt ? new Date(notification.createdAt).toLocaleDateString() : 'Unknown date'}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" className="p-1">
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No new notifications</p>
                  </div>
                )}
              </div>
              {unreadNotifications.length > 0 && (
                <div className="border-t border-neutral-200 p-4">
                  <Button variant="outline" size="sm" className="w-full">
                    Mark all as read
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* Settings */}
          <Button variant="ghost" size="sm">
            <Settings className="h-5 w-5" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={(user as UserType)?.profileImageUrl || undefined} />
                  <AvatarFallback>
                    {(user as UserType)?.firstName?.[0]}{(user as UserType)?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {(user as UserType)?.firstName} {(user as UserType)?.lastName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {(user as UserType)?.email}
                  </p>
                  <Badge variant="destructive" className="w-fit mt-1">
                    Administrator
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
