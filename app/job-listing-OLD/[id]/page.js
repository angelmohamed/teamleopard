import React from "react";
import { supabase } from "@/lib/supabaseClient";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import PublishedTimeDisplay from "./publishedTimeDisplay"; //for displaying the Published Date
import DeadlineDisplay from "./deadlineDisplay"; //for displaying the Deadline

//TODO: LINKS TO APPLY, COMPANY PROFILE, AND JOB LISTING PAGE (+ REDIRECT)

export default async function JobListingPage({params}) {
  // Obtain Job Listing Id from url:
  const {id} = params;

  // Fetch the data for the specified job listing
  const { data: job, errorJob } = await supabase
    .from("Job_Posting")
    .select("*")
    .eq("posting_id", id)
    .single(); //one row

  // Handle error or non-existent job id.
  if (errorJob || !job) {
    console.error("Error fetching job details:", errorJob);
    return (
      <div>
        This job no longer exists.
      </div>
    );
  }

  // Fetch extra data for the company that posted the job listing
  const { data: company, errorCompany } = await supabase
    .from("Employer")
    .select("*")
    .eq("id", job.company_ID)
    .single(); //one row

  if (errorCompany || !company) {
    console.error("Error fetching company details:", errorCompany);
  }

  // Actual page display
  return (
    <div>
      {/* TOP SECTION - DETAILS DISPLAY */}
      <section className="flex flex-col justify-between items-center w-screen min-h-[500px] text-white bg-slate-100 font-bold py-6 space-y-4">
        {/* Job Title Display */}
        <div className="h-1/4 text-black text-4xl md:text-6xl flex-grow flex items-center justify-center mt-4 md:mt-0"> 
          {job.title}
        </div>
        {/* Job Listing Aspects in cards. */}
        <div className="h-3/4 flex flex-col md:flex-row justify-center gap-6 text-slate-800 mt-auto w-[80%] items-center"> 

          {/* Card 1 - General Details*/}
          <Card className="h-full flex flex-col min-h-[300px] w-[90%] md:w-1/3 text-2xl text-left ml-2">
            <CardContent>
              <p className="italic text-sm text-slate-500 mt-2">Employment Type</p>
              <h1 className="text-3xl md:text-4xl mb-3">{job.employment_type}</h1> 
              <p className="italic text-sm text-slate-500">Location</p>
              <h1 className="text-3xl md:text-4xl mb-3">{job.location}</h1> 
              <p className="italic text-sm text-slate-500">Expected Salary</p>
              <h1 className="text-3xl md:text-4xl">{job.salary_range}</h1> 
            </CardContent>
          </Card>

          {/* Card 2 - List of tagged skills*/}
          <Card className="h-full flex flex-col min-h-[300px] w-[90%] md:w-1/3 text-2xl text-left ml-2">
            <CardContent className="flex flex-col justify-between flex-grow">
              <p className="italic text-sm text-slate-500 mt-2">Details</p>
              <h1 className="text-3xl md:text-4xl mb-3">Tags on this listing</h1> 
              {/* ScrollArea filled with badges */}
              <ScrollArea className="flex-grow flex justify-start w-full bg-slate-100 rounded-md border p-4">
                {/* Create a Badge for each parsed element in job.expected_skills */}
                {JSON.parse(job.expected_skills).map((item, i) => (
                  <Badge key={i} variant="outline" className="text-2xl bg-white mr-2 mb-2 truncate" style={{maxWidth: "80%"}}>
                    {item}
                  </Badge>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Card 3 - Timings and Context*/}
          <Card className="h-full flex flex-col min-h-[300px] w-[90%] md:w-1/3 text-2xl text-left ml-2">
            <CardContent>
              <p className="italic text-sm text-slate-500 mt-2">Listed by</p>
              {/* HoverCard to display extra company details */}
              <HoverCard>
                <HoverCardTrigger>
                  <h1 className="underline text-3xl md:text-4xl mb-3">{company.company_name}</h1>
                </HoverCardTrigger>
                <HoverCardContent className="items-center text-center min-w-[300px] bg-slate-200">
                  <h1 className="underline text-3xl mb-2">{company.company_name}</h1>
                  <h1 className="whitespace-nowrap text-xl truncate w-[280px] overflow-hidden text-ellipsis mb-2">{company.company_description}</h1>
                  <Button variant="link" className="bg-white italic font-bold">View Profile.</Button> DO THE LINK
                </HoverCardContent>
              </HoverCard>
              <p className="italic text-sm text-slate-500">Listing published</p>
              {/* Date published is stored differently to Deadline. The replace() fixes the format. */}
              <PublishedTimeDisplay published={job.posted_at.replace(" ", "T")}/>
              <p className="italic text-sm text-slate-500">Deadline</p>
              <DeadlineDisplay deadline={job.deadline}/>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* BOTTOM SECTION - DESCRIPTION */}
      <section className="flex flex-col md:flex-row justify-center items-center w-screen min-h-[200px] text-white py-6 px-6 md:space-x-6">
        <div className="flex flex-col-reverse md:flex-row justify-center items-start w-[85%] space-x-0 md:space-x-4 space-y-4 md:space-y-0">
          {/* Description Card */}
          <Card className="w-full md:w-5/6 bg-slate-200 text-black min-h-[200px]">
            <CardContent>
              <h1 className="text-3xl md:text-4xl mt-3 font-bold">Job Description:</h1> 
              <p className="text-xl md:text-2xl text-black mt-2">{job.description}</p>
            </CardContent>
          </Card>

          {/* Apply Button */}
          <div className="w-full md:w-1/6 self-start">
            {/*LINK TBC*/}
            <Button variant="secondary" className="w-full min-h-[50px] text-3xl bg-slate-300 mb-4 md:mb-0" asChild>
              <Link href="">Apply Now</Link> 
            </Button>

            <Button variant="secondary" className="w-full min-h-[50px] text-3xl bg-slate-200 mt-0 md:mt-4 mb-4 md:mb-0" asChild>
              <Link href="">Button 2 idk</Link> 
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}