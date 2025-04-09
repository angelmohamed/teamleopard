import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function JobVacancyTrends({ jobs }) {
  const [selectedJob, setSelectedJob] = useState(null);

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Job Listings</h3>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {jobs.map((job) => (
          <Dialog key={job.posting_id}>
            <DialogTrigger asChild>
              <Card
                onClick={() => setSelectedJob(job)}
                className="min-w-[240px] cursor-pointer hover:shadow-md transition-all"
              >
                <CardContent className="p-4">
                  <h4 className="font-medium">{job.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {job.company_name}
                  </p>
                  <p className="text-xs">{job.location}</p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <h3 className="text-xl font-semibold">{selectedJob?.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {selectedJob?.company_name} – {selectedJob?.location}
              </p>
              <p>👁 Views: {selectedJob?.views}</p>
              <p>📝 Applicants: {selectedJob?.applicants}</p>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
}
