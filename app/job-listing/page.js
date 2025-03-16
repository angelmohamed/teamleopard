import { redirect } from "next/navigation";

// Redirection Page for when no ID is provided.
// Brings the user to the Job Search Page.
export default function JobListingRedirect() {
  redirect("/dashboard"); //TBC: PUT JOB SEARCH WEBSITE URL
}