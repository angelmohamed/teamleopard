"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MapPin, Briefcase, DollarSign, CalendarDays } from "lucide-react"; // Import proper icons
import PostedTimeDisplay from "./posted-time"; //for displaying the Published Date

export default function JobDetails() {
    const { id } = useParams();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobDetails = async () => {
            const { data, error } = await supabase
                .from("Job_Posting")
                .select(`
                    posting_id, title, description, location, employment_type, salary_range, posted_at, deadline, expected_skills,
                    Employer (company_name, company_description)
                `)
                .eq("posting_id", id)
                .single();

            if (error) {
                console.error("Error fetching job:", error);
            } else {
                setJob({
                    ...data,
                    company_name: data.Employer?.company_name || "Unknown Company",
                    company_description: data.Employer?.company_description || "No description available",
                });
            }
            setLoading(false);
        };

        if (id) fetchJobDetails();
    }, [id]);

    if (loading) return <p className="text-center text-gray-500 mt-6">Loading job details...</p>;
    if (!job) return <p className="text-center text-red-500 mt-6">Job not found.</p>;

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Job Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
                {/* Left Card (Main Job Info - 70%) */}
                <Card className="border p-4 ">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">{job.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-gray-600 space-y-4">
                        {/* Job Details Badges */}
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 border px-3 py-1 rounded-full text-sm text-gray-700">
                                <MapPin size={16} />
                                {job.location}
                            </div>
                            <div className="flex items-center gap-2 border px-3 py-1 rounded-full text-sm text-gray-700">
                                <Briefcase size={16} />
                                {job.employment_type}
                            </div>
                            {job.salary_range && (
                                <div className="flex items-center gap-2 border px-3 py-1 rounded-full text-sm text-gray-700">
                                    <DollarSign size={16} />
                                    Salary: {job.salary_range}
                                </div>
                            )}
                            {job.deadline && (
                                <div className="flex items-center gap-2 border px-3 py-1 rounded-full text-sm text-gray-700">
                                    <CalendarDays size={16} />
                                    Deadline: {new Date(job.deadline).toDateString()}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Right Card (Empty - 30%) */}
                <Card className="border p-4 ">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">
                            {job.company_name}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-500">{job.company_description}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Job Description */}
            <div className="mt-10">
                <PostedTimeDisplay published={job.posted_at.replace(" ", "T")}/>
                <h2 className="text-xl font-semibold mb-4">Job Description</h2>
                <p className="text-gray-700">{job.description}</p>

                {/* Expected Skills */}
                {job.expected_skills && (
                    <div className="mt-6">
                        <h3 className="font-semibold text-gray-700">Expected Skills:</h3>
                        <p className="text-gray-600">{job.expected_skills}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
