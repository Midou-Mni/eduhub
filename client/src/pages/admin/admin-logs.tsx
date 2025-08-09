import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type LogItem = {
  id: string;
  action: string;
  description: string | null;
  userId: string | null;
  entityType: string | null;
  entityId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: string | null;
  severity: "low" | "medium" | "high" | "critical";
  createdAt: string;
};

export default function AdminLogs() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState<string>("");

  const { data, isLoading, refetch } = useQuery<{ total: number; logs: LogItem[] }>({
    queryKey: ["/api/admin/logs", { search, severity }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (severity) params.set("severity", severity);
      const res = await apiRequest("GET", `/api/admin/logs?${params.toString()}`);
      return res.json();
    },
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/admin/logs");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/logs"] }),
  });

  const severityBadge = (sev: string) => {
    const map: Record<string, string> = {
      low: "bg-neutral-200 text-neutral-800",
      medium: "bg-yellow-200 text-yellow-800",
      high: "bg-orange-200 text-orange-800",
      critical: "bg-red-200 text-red-800",
    };
    return <span className={`text-xs px-2 py-0.5 rounded ${map[sev] || map.low}`}>{sev}</span>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">System Logs</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => refetch()}>Refresh</Button>
          <Button variant="destructive" onClick={() => clearMutation.mutate()} disabled={clearMutation.isPending}>
            Clear All
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input placeholder="Search action/description" value={search} onChange={e => setSearch(e.target.value)} />
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Events {data ? `(${data.total})` : ""}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-neutral-500">Loading…</div>
          ) : (
            <div className="divide-y">
              {data?.logs?.map((log) => (
                <div key={log.id} className="py-3 flex items-start gap-3">
                  {severityBadge(log.severity)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{log.action}</div>
                      <div className="text-xs text-neutral-500">{new Date(log.createdAt as any).toLocaleString()}</div>
                    </div>
                    {log.description && (
                      <div className="text-sm text-neutral-700 mt-0.5">{log.description}</div>
                    )}
                    <div className="text-xs text-neutral-500 mt-1 flex flex-wrap gap-2">
                      {log.userId && <Badge variant="secondary">user:{log.userId}</Badge>}
                      {log.entityType && <Badge variant="secondary">{log.entityType}:{log.entityId}</Badge>}
                      {log.ipAddress && <span>ip:{log.ipAddress}</span>}
                    </div>
                  </div>
                </div>
              ))}
              {(!data || data.logs.length === 0) && (
                <div className="py-10 text-center text-neutral-500">No logs found</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


