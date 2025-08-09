import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function AdminHelp() {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const submitMutation = useMutation({
    mutationFn: async () => {
      // Send as an admin notification for demo purposes
      await apiRequest("POST", "/api/admin/logs", {
        action: `Support request: ${subject}`,
        description: `${message}\n\nFrom: ${email || 'n/a'}`,
        severity: "low",
      });
    },
    onSuccess: () => {
      setEmail("");
      setSubject("");
      setMessage("");
      alert("Support request submitted");
    }
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Help & Support</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Documentation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-neutral-700">
            <p>Find guides and FAQs:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Managing users and roles</li>
              <li>Creating and moderating courses</li>
              <li>Understanding analytics and reports</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact Support</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Input placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)} />
              <Input placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} />
              <Textarea placeholder="Describe your issue" value={message} onChange={e => setMessage(e.target.value)} />
              <Button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending || !subject || !message}>Submit</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">System Alerts</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-neutral-700">
          If you encounter issues, check the System Status page for any ongoing incidents and view System Logs for details.
        </CardContent>
      </Card>
    </div>
  );
}


