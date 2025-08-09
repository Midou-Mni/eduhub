import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle,
  Search,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Flag,
  Shield,
  Ban,
  MessageSquare,
  User,
  BookOpen,
  Star,
  Filter
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { ReportWithDetails, SystemLogWithUser } from "@shared/schema";

export default function ReportsModeration() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState<ReportWithDetails | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState("");
  const [resolution, setResolution] = useState("");

  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useQuery<ReportWithDetails[]>({
    queryKey: ["/api/admin/reports", { search: searchQuery, status: statusFilter, type: typeFilter }],
  });

  const { data: reportStats } = useQuery({
    queryKey: ["/api/admin/reports/stats"],
  });

  const { data: systemLogs } = useQuery<SystemLogWithUser[]>({
    queryKey: ["/api/admin/logs", { limit: 50 }],
  });

  const updateReportMutation = useMutation({
    mutationFn: async ({ reportId, updates }: { reportId: string; updates: any }) => {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update report');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reports"] });
      toast({ title: "Report updated successfully" });
      setShowActionDialog(false);
      setShowReportDialog(false);
    },
    onError: () => {
      toast({ title: "Failed to update report", variant: "destructive" });
    },
  });

  const handleReportAction = (report: ReportWithDetails, action: string) => {
    setSelectedReport(report);
    setActionType(action);
    setShowActionDialog(true);
  };

  const executeAction = () => {
    if (!selectedReport) return;

    const updates: any = {};
    
    switch (actionType) {
      case 'resolve':
        updates.status = 'resolved';
        updates.resolution = resolution;
        break;
      case 'dismiss':
        updates.status = 'dismissed';
        updates.resolution = resolution;
        break;
      case 'escalate':
        updates.status = 'reviewed';
        updates.resolution = resolution;
        break;
    }

    updateReportMutation.mutate({ reportId: selectedReport.id, updates });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'destructive';
      case 'reviewed': return 'default';
      case 'resolved': return 'secondary';
      case 'dismissed': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-orange-500" />;
      case 'reviewed': return <Eye className="w-4 h-4 text-blue-500" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'dismissed': return <XCircle className="w-4 h-4 text-gray-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
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
          <h1 className="text-3xl font-bold text-neutral-900">Reports & Moderation</h1>
          <p className="text-neutral-600 mt-1">
            Review and moderate reported content and user activities
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportStats?.pending || 0}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportStats?.underReview || 0}</div>
            <p className="text-xs text-muted-foreground">
              Currently being reviewed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportStats?.resolvedToday || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{reportStats?.resolvedThisWeek || 0} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportStats?.avgResponseTime || '2.5'}h</div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Content Reports</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
          <TabsTrigger value="automated">Automated Moderation</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
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
                      placeholder="Search reports..."
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewed">Under Review</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="course">Course</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="material">Material</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Reports Table */}
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>
                {reports?.length || 0} reports found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report</TableHead>
                    <TableHead>Reported Entity</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports?.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {report.reportedEntity === 'user' && <User className="w-5 h-5 text-blue-500" />}
                          {report.reportedEntity === 'course' && <BookOpen className="w-5 h-5 text-green-500" />}
                          {report.reportedEntity === 'review' && <Star className="w-5 h-5 text-yellow-500" />}
                          {report.reportedEntity === 'material' && <MessageSquare className="w-5 h-5 text-purple-500" />}
                          <div>
                            <p className="font-medium">#{report.id.slice(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">
                              {report.reportedEntity}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <p className="font-medium truncate">
                            {report.entityDetails?.title || report.entityDetails?.name || 'Deleted'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ID: {report.entityId.slice(0, 8)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={report.reportedByUser.profileImageUrl} />
                            <AvatarFallback>
                              {report.reportedByUser.firstName?.[0]}{report.reportedByUser.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {report.reportedByUser.firstName} {report.reportedByUser.lastName}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {report.reason}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(report.status)}
                          <Badge variant={getStatusBadgeColor(report.status)}>
                            {report.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(report.createdAt).toLocaleDateString()}
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
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedReport(report);
                                setShowReportDialog(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {report.status === 'pending' && (
                              <>
                                <DropdownMenuItem onClick={() => handleReportAction(report, 'resolve')}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Resolve
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleReportAction(report, 'dismiss')}>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Dismiss
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleReportAction(report, 'escalate')}
                              className="text-red-600"
                            >
                              <Flag className="mr-2 h-4 w-4" />
                              Escalate
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
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Activity Logs</CardTitle>
              <CardDescription>Recent system activities and administrative actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemLogs?.map((log) => (
                  <div key={log.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                    <div className={`w-3 h-3 rounded-full mt-1 ${
                      log.severity === 'critical' ? 'bg-red-500' :
                      log.severity === 'high' ? 'bg-orange-500' :
                      log.severity === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{log.action}</p>
                        <Badge variant="outline" className={getSeverityColor(log.severity)}>
                          {log.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{log.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <span>
                          {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                        </span>
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                        {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automated" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automated Moderation</CardTitle>
              <CardDescription>Configure automated content moderation rules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto mb-4" />
                <p>Automated moderation features coming soon...</p>
                <p className="text-sm mt-2">Configure AI-powered content filtering and spam detection</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Report Details Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>
              Review the reported content and take appropriate action
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Report ID</Label>
                  <p className="text-sm text-muted-foreground">#{selectedReport.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant={getStatusBadgeColor(selectedReport.status)}>
                    {selectedReport.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Reported Entity</Label>
                  <p className="text-sm text-muted-foreground">{selectedReport.reportedEntity}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Reason</Label>
                  <p className="text-sm text-muted-foreground">{selectedReport.reason}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedReport.description || 'No description provided'}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">Reporter</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={selectedReport.reportedByUser.profileImageUrl} />
                    <AvatarFallback>
                      {selectedReport.reportedByUser.firstName?.[0]}{selectedReport.reportedByUser.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {selectedReport.reportedByUser.firstName} {selectedReport.reportedByUser.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedReport.reportedByUser.email}
                    </p>
                  </div>
                </div>
              </div>

              {selectedReport.resolution && (
                <div>
                  <Label className="text-sm font-medium">Resolution</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedReport.resolution}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>
              Close
            </Button>
            {selectedReport?.status === 'pending' && (
              <div className="flex space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => handleReportAction(selectedReport, 'dismiss')}
                >
                  Dismiss
                </Button>
                <Button 
                  onClick={() => handleReportAction(selectedReport, 'resolve')}
                >
                  Resolve
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <AlertDialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'resolve' ? 'Resolve Report' :
               actionType === 'dismiss' ? 'Dismiss Report' :
               'Escalate Report'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a resolution note for this action.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <Textarea
              placeholder="Enter resolution details..."
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setResolution('')}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={executeAction}>
              {actionType === 'resolve' ? 'Resolve' :
               actionType === 'dismiss' ? 'Dismiss' :
               'Escalate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
