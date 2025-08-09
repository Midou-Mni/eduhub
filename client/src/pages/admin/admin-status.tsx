import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminStatus() {
  const { data, isLoading, refetch } = useQuery<any>({
    queryKey: ["/api/admin/system-status"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/system-status");
      return res.json();
    },
    refetchInterval: 10000,
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">System Status</h1>
        <Button variant="outline" onClick={() => refetch()}>Refresh</Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? "…" : `${Math.floor((data?.uptimeSec ?? 0) / 60)} min`}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Environment</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? "…" : data?.env}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Last Updated</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? "…" : new Date(data?.time ?? Date.now()).toLocaleString()}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Memory Usage</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            "…"
          ) : (
            <pre className="text-xs bg-neutral-50 p-3 rounded border border-neutral-200 overflow-auto">{JSON.stringify(data?.memory, null, 2)}</pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


