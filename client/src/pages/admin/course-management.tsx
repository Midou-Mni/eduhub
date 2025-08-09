import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  BookOpen, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye,
  Edit,
  Archive,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Users,
  DollarSign,
  AlertTriangle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { CourseWithAdminDetails } from "@shared/schema";

export default function CourseManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedCourse, setSelectedCourse] = useState<CourseWithAdminDetails | null>(null);
  const [actionType, setActionType] = useState<string>("");
  const [showActionDialog, setShowActionDialog] = useState(false);

  const queryClient = useQueryClient();

  const { data: courses, isLoading } = useQuery<CourseWithAdminDetails[]>({
    queryKey: ["/api/admin/courses", { search: searchQuery, status: statusFilter, category: categoryFilter }],
  });

  const { data: courseStats } = useQuery<any>({
    queryKey: ["/api/admin/courses/stats"],
  });

  const { data: categories } = useQuery<any[]>({
    queryKey: ["/api/categories"],
  });

  const updateCourseMutation = useMutation({
    mutationFn: async ({ courseId, updates }: { courseId: string; updates: any }) => {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update course');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      toast({ title: "Course updated successfully" });
      setShowActionDialog(false);
    },
    onError: () => {
      toast({ title: "Failed to update course", variant: "destructive" });
    },
  });

  const handleCourseAction = (course: CourseWithAdminDetails, action: string) => {
    setSelectedCourse(course);
    setActionType(action);
    setShowActionDialog(true);
  };

  const executeAction = () => {
    if (!selectedCourse) return;

    const updates: any = {};
    
    switch (actionType) {
      case 'publish':
        updates.status = 'published';
        break;
      case 'draft':
        updates.status = 'draft';
        break;
      case 'archive':
        updates.status = 'archived';
        break;
      case 'feature':
        updates.isFeatured = true;
        break;
      case 'unfeature':
        updates.isFeatured = false;
        break;
    }

    updateCourseMutation.mutate({ courseId: selectedCourse.id, updates });
  };

  const getActionText = () => {
    switch (actionType) {
      case 'publish': return 'publish this course';
      case 'draft': return 'move this course to draft';
      case 'archive': return 'archive this course';
      case 'feature': return 'feature this course';
      case 'unfeature': return 'remove this course from featured';
      default: return 'perform this action';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'published': return 'default';
      case 'draft': return 'secondary';
      case 'archived': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'draft': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'archived': return <Archive className="w-4 h-4 text-gray-500" />;
      default: return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

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
          <h1 className="text-3xl font-bold text-neutral-900">Course Management</h1>
          <p className="text-neutral-600 mt-1">
            Manage and moderate platform courses
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courseStats?.total ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              +{courseStats?.newThisMonth ?? 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courseStats?.published ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {(((courseStats?.published ?? 0) / (courseStats?.total ?? 1)) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courseStats?.pendingReview ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting moderation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reported</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courseStats?.reported ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {(categories ?? []).map((category: any) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Courses</CardTitle>
          <CardDescription>
            {courses?.length || 0} courses found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Reports</TableHead>
                <TableHead>Created</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses?.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{course.title}</p>
                        <p className="text-sm text-muted-foreground">
                          ${course.price}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={course.teacher.profileImageUrl || undefined} />
                        <AvatarFallback>
                          {course.teacher.firstName?.[0]}{course.teacher.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {course.teacher.firstName} {course.teacher.lastName}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {course.category?.name || 'Uncategorized'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(course.status || "")}
                      <Badge variant={getStatusBadgeColor(course.status || "") }>
                        {course.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{course.enrollmentCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{course.avgRating?.toFixed(1) || "N/A"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span>{course.revenue?.toLocaleString() || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {course.reportCount > 0 ? (
                      <Badge variant="destructive">
                        {course.reportCount}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : ""}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Course
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        
                        {course.status === 'draft' && (
                          <DropdownMenuItem onClick={() => handleCourseAction(course, 'publish')}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Publish Course
                          </DropdownMenuItem>
                        )}
                        
                        {course.status === 'published' && (
                          <>
                            <DropdownMenuItem onClick={() => handleCourseAction(course, 'draft')}>
                              <Clock className="mr-2 h-4 w-4" />
                              Move to Draft
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCourseAction(course, 'feature')}>
                              <Star className="mr-2 h-4 w-4" />
                              Feature Course
                            </DropdownMenuItem>
                          </>
                        )}
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleCourseAction(course, 'archive')}
                          className="text-red-600"
                        >
                          <Archive className="mr-2 h-4 w-4" />
                          Archive Course
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Action Confirmation Dialog */}
      <AlertDialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {getActionText()}? This action may affect course visibility and student access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeAction}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
