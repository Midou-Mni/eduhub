import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import type { ActivityWithDetails } from "@shared/schema";

interface StudentActivityProps {
  activities?: ActivityWithDetails[];
  isLoading: boolean;
}

export default function StudentActivity({ activities, isLoading }: StudentActivityProps) {
  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getActivityText = (activity: ActivityWithDetails) => {
    switch (activity.activityType) {
      case 'enrolled':
        return 'enrolled in';
      case 'completed':
        return 'completed';
      case 'reviewed':
        return 'left a review on';
      case 'assignment_submitted':
        return 'submitted assignment in';
      case 'quiz_completed':
        return 'completed quiz in';
      default:
        return 'interacted with';
    }
  };

  const getActivityBadge = (activityType: string) => {
    switch (activityType) {
      case 'enrolled':
        return <Badge variant="outline" className="bg-primary/10 text-primary">Enrolled</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-success/10 text-success">Completed</Badge>;
      case 'reviewed':
        return <Badge variant="outline" className="bg-warning/10 text-warning">Review</Badge>;
      case 'assignment_submitted':
        return <Badge variant="outline" className="bg-secondary/10 text-secondary">Assignment</Badge>;
      case 'quiz_completed':
        return <Badge variant="outline" className="bg-purple-100 text-purple-600">Quiz</Badge>;
      default:
        return <Badge variant="outline">Activity</Badge>;
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return activityDate.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card className="bg-white rounded-xl shadow-sm border border-neutral-200">
        <CardHeader className="border-b border-neutral-200">
          <CardTitle className="text-lg font-semibold text-neutral-700">Recent Student Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start space-x-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-5 w-16 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card className="bg-white rounded-xl shadow-sm border border-neutral-200">
        <CardHeader className="border-b border-neutral-200">
          <CardTitle className="text-lg font-semibold text-neutral-700">Recent Student Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
            <h3 className="text-lg font-medium text-neutral-700 mb-2">No activity yet</h3>
            <p className="text-neutral-500">
              Student activity will appear here once they start engaging with your courses.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-neutral-200">
      <CardHeader className="border-b border-neutral-200">
        <CardTitle className="text-lg font-semibold text-neutral-700">Recent Student Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src={activity.student.profileImageUrl || undefined} />
                <AvatarFallback>
                  {getInitials(activity.student.firstName, activity.student.lastName)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium text-neutral-700">
                    {activity.student.firstName} {activity.student.lastName}
                  </span>
                  <span className="text-neutral-400"> {getActivityText(activity)} </span>
                  <span className="font-medium text-neutral-700">
                    {activity.course.title}
                  </span>
                </p>
                <p className="text-xs text-neutral-400">
                  {formatTimeAgo(activity.createdAt)}
                </p>
              </div>
              
              {getActivityBadge(activity.activityType)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
