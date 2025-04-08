"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MapPin, Briefcase, DollarSign, CalendarDays, FolderHeart, Share2 } from "lucide-react";
import PostedTimeDisplay from "./posted-time";
import { Button } from "@/components/ui/button";
import 'react-quill/dist/quill.snow.css'; //to display formatted description

export default function JobDetails() {
    const { id } = useParams();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);

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

            if (!error && data) {
                setJob({
                    ...data,
                    company_name: data.Employer?.company_name || "Unknown Company",
                    company_description: data.Employer?.company_description || "No description available",
                });
            }

            const { data: authData } = await supabase.auth.getUser();
            if (authData?.user?.id) {
                const { data: saved, error: savedErr } = await supabase
                    .from("Saved_Jobs")
                    .select("*")
                    .eq("employee_ID", authData.user.id)
                    .eq("job_posting_id", id)
                    .maybeSingle();

                if (!savedErr && saved) setIsSaved(true);
            }

            setLoading(false);
        };

        if (id) fetchJobDetails();
    }, [id]);

    // Helper function to ensure user has an Employee record
    const ensureEmployeeRecord = async (userId) => {
        try {
            // First check if user exists in Employee table
            const { data: employeeData, error: employeeError } = await supabase
                .from("Employee")
                .select("id")
                .eq("id", userId)
                .maybeSingle();
                
            if (employeeError) {
                console.error("Error checking employee data:", employeeError);
                return false;
            }
            
            // If employee record exists, we're good
            if (employeeData) {
                return true;
            }
            
            // Get user profile data from auth
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError) {
                console.error("Error getting user data:", userError);
                return false;
            }
            
            // Create employee record with basic info
            const firstName = userData.user.user_metadata?.first_name || userData.user.email.split('@')[0];
            const lastName = userData.user.user_metadata?.last_name || ''; // Optional last name

            const { error: insertError } = await supabase
                .from("Employee")
                .insert({
                    id: userId,
                    email: userData.user.email,
                    username: userData.user.email.split('@')[0],
                    first_name: firstName,
                    last_name: lastName,
                    created_at: new Date().toISOString()
                });
            
            if (insertError) {
                console.error("Error creating employee record:", insertError);
                return false;
            }
            
            return true;
        } catch (err) {
            console.error("Unexpected error in ensureEmployeeRecord:", err);
            return false;
        }
    };

    const handleFavourite = async () => {
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData?.user?.id;
        if (!userId || !id) return;

        // Ensure employee record exists
        const employeeExists = await ensureEmployeeRecord(userId);
        if (!employeeExists) {
            alert("Your employee profile could not be verified. Please try again.");
            return;
        }

        if (isSaved) {
            await supabase
                .from("Saved_Jobs")
                .delete()
                .eq("employee_ID", userId)
                .eq("job_posting_id", id);
            setIsSaved(false);
        } else {
            await supabase.from("Saved_Jobs").insert({
                job_posting_id: id,
                employee_ID: userId,
                saved_at: new Date().toISOString(),
            });
            setIsSaved(true);
        }
    };

    const handleShare = async () => {
        const url = `${window.location.origin}/dashboard/listing/${id}`;
        await navigator.clipboard.writeText(url);
        alert("Job link copied to clipboard");
    };

    if (loading) return <p className="text-center text-gray-500 mt-6">Loading job details...</p>;
    if (!job) return <p className="text-center text-red-500 mt-6">Job not found.</p>;

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
                <Card className="border p-4">
                    <CardHeader className="flex justify-between items-start">
                        <CardTitle className="text-2xl font-bold">{job.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-gray-600 space-y-4">
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

                <Card className="border p-4">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">{job.company_name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-500">{job.company_description}</p>
                    </CardContent>
                </Card>
            </div>
            <div className="flex items-center gap-2 pt-6">
                <button
                    onClick={handleFavourite}
                    className={`w-9 h-9 flex items-center justify-center rounded-md transition border ${isSaved ? "text-red-500 bg-red-100 border-red-200" : "text-gray-600 hover:text-red-500 border-gray-300"}`}
                >
                    <FolderHeart size={20} />
                </button>
                <button
                    onClick={handleShare}
                    className="w-9 h-9 flex items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:text-blue-600"
                >
                    <Share2 size={20} />
                </button>
                <Button 
                    onClick={async () => {
                        try {
                            // Get current user
                            const { data: authData, error: authError } = await supabase.auth.getUser();
                            if (authError || !authData?.user?.id) {
                                alert('Please log in to apply');
                                return;
                            }
                            
                            // Ensure employee record exists
                            const employeeExists = await ensureEmployeeRecord(authData.user.id);
                            if (!employeeExists) {
                                alert('Your employee profile could not be created. Please contact support.');
                                return;
                            }
                            
                            // Check if already applied
                            const { data: existingApp, error: appCheckError } = await supabase
                                .from("Applications")
                                .select("Application_id")
                                .eq("employee_ID", authData.user.id)
                                .eq("job_posting_id", id)
                                .maybeSingle();
                                
                            if (appCheckError) {
                                console.error('Error checking existing application:', appCheckError);
                                alert('Could not verify your application status. Please try again.');
                                return;
                            }
                                
                            if (existingApp) {
                                alert('You have already applied to this job');
                                return;
                            }
                            
                            // Submit application
                            const { error: insertError } = await supabase
                                .from("Applications")
                                .insert({
                                    employee_ID: authData.user.id,
                                    job_posting_id: id,
                                    status: "pending",
                                    created_at: new Date().toISOString()
                                });
                                
                            if (insertError) {
                                console.error('Error applying:', insertError);
                                if (insertError.code === '23503') {
                                    alert('There was an error with your application. Please try again later.');
                                } else {
                                    alert('There was an error submitting your application. Please try again later.');
                                }
                            } else {
                                alert('Application submitted successfully!');
                                window.location.href = '/applications';
                            }
                        } catch (error) {
                            console.error('Unexpected error:', error);
                            alert('An unexpected error occurred. Please try again later.');
                        }
                    }}
                    className="text-sm px-4 py-1.5"
                >
                    Apply Now
                </Button>
            </div>
            <div className="mt-10">
                <PostedTimeDisplay published={job.posted_at.replace(" ", "T")} />
                <h2 className="text-xl font-semibold mb-4">Job Description:</h2>
                {/* Display formatted description */}
                <div className="text-gray-700" dangerouslySetInnerHTML={{
                     __html: job.description
                     .replace(/class="ql-size-large"/g, 'class="text-2xl font-bold"')
                }}/>
                {/*The .replace converts quill css into tailwind*/}

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
