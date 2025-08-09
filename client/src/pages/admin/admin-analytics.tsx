import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  DollarSign,
  Download,
  Calendar,
  Star,
  Target,
  Activity,
  Zap
} from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState("30d");
  const [chartType, setChartType] = useState("line");

  const { data: analytics, isLoading } = useQuery<any>({
    queryKey: ["/api/admin/analytics", { timeRange }],
  });

  const { data: realTimeStats } = useQuery<any>({
    queryKey: ["/api/admin/realtime-stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: conversionFunnel } = useQuery<any[]>({
    queryKey: ["/api/admin/conversion-funnel", { timeRange }],
  });

  const { data: cohortAnalysis } = useQuery<any>({
    queryKey: ["/api/admin/cohort-analysis", { timeRange }],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Analytics & Reports</h1>
          <p className="text-neutral-600 mt-1">
            Comprehensive platform insights and performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeStats?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+{realTimeStats?.newSessionsLastHour || 0}</span> in last hour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Enrollments</CardTitle>
            <Zap className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeStats?.liveEnrollments || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-500">+{realTimeStats?.enrollmentsToday || 0}</span> today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${realTimeStats?.revenueToday?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-purple-500">+{realTimeStats?.revenueGrowthPercent || 0}%</span> vs yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeStats?.conversionRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-orange-500">{realTimeStats?.conversionTrend || 0}%</span> change
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Growth */}
            <Card className="col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Platform Growth Overview</CardTitle>
                  <CardDescription>Key metrics over time</CardDescription>
                </div>
                <Select value={chartType} onValueChange={setChartType}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="area">Area Chart</SelectItem>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                {analytics?.userGrowth && (
                  <ChartContainer config={{
                    users: { label: "Users", color: "#3b82f6" },
                    teachers: { label: "Teachers", color: "#10b981" },
                    students: { label: "Students", color: "#f59e0b" }
                  }}>
                    <div className="h-[300px]">
                      <p className="text-sm text-muted-foreground">Platform growth chart will be implemented</p>
                    </div>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            {/* Top Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Top Categories</CardTitle>
                <CardDescription>Most popular course categories</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics?.topCategories?.slice(0, 5).map((category: any, index: number) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${
                        index === 0 ? 'from-blue-500 to-blue-600' :
                        index === 1 ? 'from-green-500 to-green-600' :
                        index === 2 ? 'from-yellow-500 to-yellow-600' :
                        index === 3 ? 'from-purple-500 to-purple-600' :
                        'from-red-500 to-red-600'
                      }`} />
                      <span className="font-medium">{category.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{category.courseCount} courses</div>
                      <div className="text-xs text-muted-foreground">
                        {category.enrollmentCount} enrollments
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Top Teachers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Teachers</CardTitle>
                <CardDescription>Based on revenue and enrollments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics?.topTeachers?.slice(0, 5).map((item: any, index: number) => (
                  <div key={item.teacher.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-600' :
                        'bg-blue-500'
                      }`}>
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{item.teacher.firstName} {item.teacher.lastName}</p>
                        <p className="text-xs text-muted-foreground">{item.courseCount} courses</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">${item.revenue.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.enrollmentCount} enrollments
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>User Registration Trends</CardTitle>
                <CardDescription>New user signups over time</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.userGrowth && (
                  <ChartContainer config={{
                    users: { label: "Users", color: "#3b82f6" }
                  }}>
                    <div className="h-[300px]">
                      <p className="text-sm text-muted-foreground">User registration trends chart will be implemented</p>
                    </div>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Demographics</CardTitle>
                <CardDescription>Role distribution</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Pie chart would go here */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Students</span>
                    <Badge variant="secondary">75%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Teachers</span>
                    <Badge variant="default">23%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Admins</span>
                    <Badge variant="outline">2%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
                <CardDescription>Daily active users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Today</span>
                    <span className="font-medium">{realTimeStats?.activeUsers || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Yesterday</span>
                    <span className="font-medium">{realTimeStats?.activeUsersYesterday || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Last Week</span>
                    <span className="font-medium">{realTimeStats?.activeUsersLastWeek || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Course Publication Trends</CardTitle>
                <CardDescription>New courses published over time</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.courseGrowth && (
                  <ChartContainer config={{
                    courses: { label: "Courses", color: "#10b981" },
                    published: { label: "Published", color: "#3b82f6" }
                  }}>
                    <div className="h-[300px]">
                      <p className="text-sm text-muted-foreground">Course publication trends chart will be implemented</p>
                    </div>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Performance</CardTitle>
                <CardDescription>Top courses by enrollment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics?.topCourses?.slice(0, 3).map((item: any, index: number) => (
                  <div key={item.course.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <div>
                        <p className="font-medium truncate max-w-[200px]">{item.course.title}</p>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{item.course.avgRating?.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{item.enrollments}</div>
                      <div className="text-xs text-muted-foreground">enrollments</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Categories</CardTitle>
                <CardDescription>Distribution by category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics?.topCategories?.slice(0, 4).map((category: any, index: number) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <span className="font-medium">{category.category}</span>
                    <Badge variant="outline">{category.courseCount}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Platform revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.enrollmentGrowth && (
                  <ChartContainer config={{
                    revenue: { label: "Revenue", color: "#8b5cf6" }
                  }}>
                    <div className="h-[300px]">
                      <p className="text-sm text-muted-foreground">Revenue trends chart will be implemented</p>
                    </div>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>By category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics?.topCategories?.map((category: any, index: number) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <span className="font-medium">{category.category}</span>
                    <span className="text-sm">${(category.enrollmentCount * 50).toLocaleString()}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Revenue Generators</CardTitle>
                <CardDescription>Highest earning courses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics?.topCourses?.slice(0, 4).map((item: any, index: number) => (
                  <div key={item.course.id} className="flex items-center justify-between">
                    <span className="font-medium truncate max-w-[200px]">{item.course.title}</span>
                    <span className="text-sm font-medium">${item.revenue.toLocaleString()}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>User journey from visit to enrollment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {(conversionFunnel || []).map((step: any, index: number) => (
                  <div key={step.stage} className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{step.stage}</h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-2xl font-bold">{step.count.toLocaleString()}</span>
                        <Badge variant={step.conversionRate > 50 ? 'default' : 'secondary'}>
                          {step.conversionRate}% conversion
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Retention Cohort Analysis</CardTitle>
              <CardDescription>User retention by signup month</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Cohort analysis table would go here */}
              <div className="text-center py-8 text-muted-foreground">
                Cohort analysis chart coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
