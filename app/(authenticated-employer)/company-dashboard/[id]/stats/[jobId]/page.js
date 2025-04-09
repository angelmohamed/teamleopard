import ChartStats from "@/components/ui/chartstats";
import ApplicationDonutChart from "@/components/ui/donutchart";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export default async function ViewStatPage({ params }) {
  const jobId = params.id;

  const { data: applications, error } = await supabase
    .from("Applications")
    .select("status")
    .eq("job_posting_id", jobId);

  console.log("📦 Applications:", applications);
  console.log("🐞 Error:", error);

  if (error) {
    return (
      <div className="p-6 text-destructive">Error loading job statistics.</div>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <section className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">
          📊 Job Application Statistics
        </h1>
        <p className="text-muted-foreground">
          No applications yet for this job posting.
        </p>
      </section>
    );
  }

  const total = applications.length;
  const accepted = applications.filter(
    (app) => app.status?.toLowerCase() === "accepted"
  ).length;
  const rejected = applications.filter(
    (app) => app.status?.toLowerCase() === "rejected"
  ).length;
  const pending = applications.filter(
    (app) => app.status?.toLowerCase() === "pending"
  ).length;

  const chartData = [
    { status: "accepted", label: "Accepted", count: accepted },
    { status: "rejected", label: "Rejected", count: rejected },
    { status: "pending", label: "Pending", count: pending },
  ];

  return (
    <section className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">📊 Job Application Statistics</h1>

      <Card className="border-primary shadow-md">
        <CardHeader>
          <CardTitle className="text-xl text-primary">
            📥 Total Applications Received
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-primary">{total}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" /> Accepted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{accepted}</p>
            <p className="text-sm text-muted-foreground">
              Applications accepted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" /> Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{rejected}</p>
            <p className="text-sm text-muted-foreground">
              Applications rejected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2 text-yellow-600">
              <Clock className="w-5 h-5" /> Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{pending}</p>
            <p className="text-sm text-muted-foreground">
              Applications pending
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">
          📈 Visual Breakdown (Bar)
        </h2>
        <ChartStats chartData={chartData} />
      </div>

      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">
          {" "}
          % Percentage Breakdown (Donut)
        </h2>
        <ApplicationDonutChart data={chartData} />
      </div>
    </section>
  );
}
