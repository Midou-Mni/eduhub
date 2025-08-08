import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Users, DollarSign, Star } from "lucide-react";

interface StatsCardsProps {
  stats?: {
    totalCourses: number;
    totalStudents: number;
    totalRevenue: number;
    avgRating: number;
  };
  isLoading: boolean;
}

export default function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="bg-white rounded-xl shadow-sm border border-neutral-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-neutral-400">Total Courses</CardTitle>
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <BookOpen className="text-primary" size={20} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-neutral-700">
            {stats?.totalCourses || 0}
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-success text-sm font-medium">+2.5%</span>
            <span className="text-neutral-400 text-sm ml-1">vs last month</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white rounded-xl shadow-sm border border-neutral-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-neutral-400">Total Students</CardTitle>
          <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
            <Users className="text-success" size={20} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-neutral-700">
            {stats?.totalStudents || 0}
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-success text-sm font-medium">+12.3%</span>
            <span className="text-neutral-400 text-sm ml-1">vs last month</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white rounded-xl shadow-sm border border-neutral-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-neutral-400">Revenue</CardTitle>
          <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
            <DollarSign className="text-secondary" size={20} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-neutral-700">
            {formatCurrency(stats?.totalRevenue || 0)}
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-success text-sm font-medium">+8.1%</span>
            <span className="text-neutral-400 text-sm ml-1">vs last month</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white rounded-xl shadow-sm border border-neutral-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-neutral-400">Avg. Rating</CardTitle>
          <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
            <Star className="text-warning" size={20} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-neutral-700">
            {typeof stats?.avgRating === "number" ? stats.avgRating.toFixed(1) : "0.0"}
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-success text-sm font-medium">+0.2</span>
            <span className="text-neutral-400 text-sm ml-1">vs last month</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
