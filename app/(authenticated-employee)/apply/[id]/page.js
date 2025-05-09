"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "../../layout";
import { supabase } from "@/lib/supabaseClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import { UploadCloud, Loader2, CheckCircle } from "lucide-react";
import { MapPin, Briefcase, DollarSign, Pencil } from "lucide-react";
import { motion } from "framer-motion";

// Validation schema using Zod
const formSchema = z.object({
  //name: z.string().min(2, "Name must be at least 2 characters"),
  //email: z.string().email("Invalid email"),
  //phone: z.string().min(10, "Enter a valid phone number"),
  //position: z.string().min(2, "Specify the position"),
  coverLetter: z
    .string()
    .min(20, "Cover letter must be at least 20 characters"),
  /*resume: z //<- this one just doesnt work for some reason
   *  .instanceof(File, { message: "Please upload a resume" })
   *  .refine(file => file.size <= 10485760, { message: "Max upload is 10MB" }),
   */
});

export default function ApplicationForm() {
  //reset is used for pre-filling data (incase that is re-iplemented)
  //setValue and watch are used for the cover letter text editor
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(formSchema),
  });
  const coverLetterValue = watch("coverLetter");
  const [coverLetterEditor, setCoverLetterEditor] = useState(false);

  const [resume, setResume] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loadingJob, setLoadingJob] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingSubmission, setLoadingSubmission] = useState(false);
  const fileInputRef = useRef(null);

  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [invalidUser, setInvalidUser] = useState(false); //block user from applying more than once (unnecessary function?)

  const { user } = useAuth();
  const [cvName, setCvName] = useState(null);
  const [usingCv, setUsingCv] = useState(false);
  const [employee, setEmployee] = useState(null);

  {
    /*Supabase fetching - Job*/
  }
  useEffect(() => {
    const fetchJobDetails = async () => {
      const { data, error } = await supabase
        .from("Job_Posting")
        .select(
          `
          title, location, employment_type, salary_range, expected_skills, company_ID,
          Employer (company_name, company_description)`
        )
        .eq("posting_id", id)
        .single();

      if (!error && data) {
        setJob({
          ...data,
          company_name: data.Employer?.company_name || "Unknown Company",
          company_description:
            data.Employer?.company_description || "No description available",
        });
      }
      setLoadingJob(false);
    };

    if (id) fetchJobDetails(); //loads job listing details to display mini version on apply page
  }, [id]);

  {
    /*Supabase fetching - User + CV*/
  }
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("Employee")
        .select("first_name, last_name, email, phone_num")
        .eq("id", user.id)
        .single();

      if (!error && data) setEmployee(data);

      //fetch cv attached to this user
      const { data: cvData, error: cvError } = await supabase
        .from("CVs")
        .select("file_name")
        .eq("employee_id", user.id)
        .single();
      if (cvData && !cvError) {
        setCvName(cvData.file_name);
      }

      setLoadingUser(false);
    })();
  }, [user]);

  {
    /*Pre-fill user data when user is fetched - only need if using form
  useEffect(() => {
    if (employee) {
      reset({
        name: `${employee.first_name} ${employee.last_name}`,
        email: employee.email,
        phone: employee.phone_num,
      });
    }
  }, [employee, reset]);*/
  }

  {
    /*Supabase fetching - Application (if it exists)*/
  } /*
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("Applications")
        .select("*")
        .eq("user_id", user.id)
        .eq("job_posting_id", id)
  
      if (data) setInvalidUser(true);
    })();
  }, [user]);
  //prevent users from applying to the same job more than once
  if (invalidUser) return (
    <div className="text-center text-red-500 mt-6">
      <p>You already have an application for this job.</p>
      <Link href={`/dashboard`} className="underline text-gray-800">Return to dashboard.</Link>
    </div>
  ); */

  {
    /* Form submission stuff */
  }

  const handleFileUpload = async (file) => {
    const filePath = `cv/${user.id}/${file.name}`;
    const { error } = await supabase.storage
      .from("cv-uploads")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

    if (error) {
      alert("Upload failed: " + error.message);
      return null;
    }

    //return name
    return file.name;
  };

  const onSubmit = async (data) => {
    setLoadingSubmission(true);
    let fileName = null;

    if (usingCv && cvName) {
      fileName = cvName;
    } else {
      if (resume) {
        if (resume.size > 10485760) {
          alert("Max upload is 10MB. Please submit a smaller file.");
          setLoadingSubmission(false);
          return;
        }
        const uploadedName = await handleFileUpload(resume);
        if (!uploadedName) {
          setLoadingSubmission(false);
          return; // breaks if the upload fails.
        }
        fileName = uploadedName;
      } else {
        alert("Please upload a resume");
        setLoadingSubmission(false);
        return;
      }
    }

    const { error } = await supabase.from("Applications").insert({
      cover_letter: data.coverLetter,
      resume_file_name: fileName,
      job_posting_id: id,
      employee_ID: user.id,
      status: "pending",
    });

    if (error) {
      alert("Error uploading application: " + error.message);
      setLoadingSubmission(false);
      return;
    }

    //send notification to employee
    const { error: notiError } = await supabase.from("Notifications").insert([
      {
        employee_receiver_id: user.id,
        title: "Application submitted.",
        content:
          "You have successfully applied to the position of " +
          job.title +
          ". You can track this application in the 'My Applications' tab.",
        link: "/dashboard/listing/" + id, //TODO: change to application page
      },
    ]);
    if (notiError) console.log("Notification error: ", notiError);

    //send notification to employer
    const { error: notiError2 } = await supabase.from("Notifications").insert([
      {
        employer_receiver_id: job.company_ID,
        title: "🟢",
        content: employee.first_name + " has applied for " + job.title + ".",
        link: `/company-dashboard/${job.company_ID}`,
      },
    ]);
    if (notiError2) console.log("Notification error: ", notiError2);

    setSubmitted(true);
    setLoadingSubmission(false);
  };

  if (loadingJob || loadingUser)
    return (
      <p className="text-center text-gray-500 mt-6">
        Loading application details...
      </p>
    );
  if (loadingSubmission)
    return <p className="text-center text-gray-500 mt-6">Submitting...</p>;
  if (!job)
    return (
      <div className="text-center text-red-500 mt-6">
        <p>Job not found.</p>
        <Link href={`/dashboard`} className="underline text-gray-800">
          Return to dashboard.
        </Link>
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex justify-center min-h-[90vh] bg-gradient-to-r from-blue-500 to-indigo-600 p-4"
    >
      <Card className="flex flex-col w-full max-w-xl min-h-[85vh] p-4 shadow-2xl rounded-xl bg-white">
        <CardHeader>
          <CardTitle className="text-sm text-gray-800 text-center">
            Applying for the following position:
          </CardTitle>
          <CardTitle className="md:text-3xl text-2xl font-bold text-gray-800 text-center">
            {job.title}
          </CardTitle>
          {/*Details displayed in small hovercard*/}
          <HoverCard>
            <HoverCardTrigger className="text-sm text-gray-800 text-center underline">
              View details
            </HoverCardTrigger>
            <HoverCardContent className="justify-center pd-2">
              <div className="flex items-center gap-2 border px-3 py-1 rounded-full text-sm text-gray-700 mb-1">
                <MapPin size={16} />
                {job.location}
              </div>
              <div className="flex items-center gap-2 border px-3 py-1 rounded-full text-sm text-gray-700 mb-1">
                <Briefcase size={16} />
                {job.employment_type}
              </div>
              {job.salary_range && (
                <div className="flex items-center gap-2 border px-3 py-1 rounded-full text-sm text-gray-700 mb-1">
                  <DollarSign size={16} />
                  Salary: {job.salary_range}
                </div>
              )}
              {job.expected_skills && (
                <div className="flex items-center gap-2 border px-3 py-1 rounded-full text-sm text-gray-700 mb-1">
                  <span>Skills: {typeof job.expected_skills === 'string' && job.expected_skills.startsWith('[') 
                    ? JSON.parse(job.expected_skills).join(', ') 
                    : job.expected_skills.replace(/<[^>]*>/g, '').replace(/\n/g, ', ')}</span>
                </div>
              )}
              <div className="flex items-center gap-2 px-3 py-1 text-sm text-black font-bold">
                {job.company_name}
              </div>
            </HoverCardContent>
            <div className="w-full bg-gray-200 rounded h-[2px] mt-6" />
          </HoverCard>
          {/*<CardTitle className="text-xl font-bold text-gray-800 text-center">🚀 Job Application Form</CardTitle>*/}
        </CardHeader>
        <CardContent className="relative flex flex-col flex-1 overflow-hidden">
          {submitted ? (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center text-green-600 text-lg font-semibold"
            >
              <CheckCircle className="w-10 h-10 text-green-500 mb-2" />
              Your application has been submitted successfully!
              <div className="flex flex-col items-center gap-2 mt-4">
                <Link
                  href={`/applications`}
                  className="text-blue-600 hover:underline"
                >
                  View your applications
                </Link>
                <Link
                  href={`/dashboard`}
                  className="text-sm text-gray-600 hover:underline"
                >
                  Return to dashboard
                </Link>
              </div>
            </motion.div>
          ) : coverLetterEditor ? (
            <div className="flex flex-col items-center gap-2 border border-gray-300 rounded-lg p-4 bg-gray-100 flex-1">
              <h2 className="text-xl font-bold mb-4">Edit Cover Letter</h2>
              <Textarea
                placeholder="Keep your cover letter concise and compelling."
                className="w-full flex-1 p-2 border rounded-md resize-none"
                value={coverLetterValue || ""}
                onChange={(e) => setValue("coverLetter", e.target.value)}
              />
              <div className="mt-4 flex justify-end">
                <Button
                  type="button"
                  onClick={() => setCoverLetterEditor(false)}
                >
                  Back to Form
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex flex-col items-center gap-2 mb-4">
                <p>
                  Full Name:
                  <b>
                    {" "}
                    {employee.first_name} {employee.last_name}
                  </b>
                </p>
                <p>
                  Email:<b> {employee.email}</b>
                </p>
                <p>
                  Phone Number:<b> {employee.phone_num}</b>
                </p>
              </div>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col h-full "
              >
                <div className="flex-1 space-y-6">
                  {/* old form stuff - don't need since these details are attached to the user
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" {...register("name")} className="rounded-md" />
                      {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" {...register("email")} className="rounded-md" />
                      {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" {...register("phone")} className="rounded-md" />
                      {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
                    </div>

                    <div>
                      <Label htmlFor="position">Position Applying For</Label>
                      <Input id="position" {...register("position")} className="rounded-md" />
                      errors.position && <p className="text-red-500 text-sm"> errors.position.message </p>
                    </div>
                    */}
                  <div className="flex flex-col items-center gap-2 border border-gray-300 rounded-lg p-4 bg-gray-100">
                    <Label className="text-gray-700">Upload Resume</Label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => setResume(e.target.files?.[0] || null)}
                    />
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        onClick={() => {
                          fileInputRef.current?.click();
                          setUsingCv(false);
                        }}
                        className="flex items-center gap-2 min-w-[150px]"
                      >
                        <UploadCloud className="w-5 h-5" /> Upload PDF
                      </Button>
                      <Button
                        type="button"
                        onClick={() =>
                          cvName
                            ? setUsingCv(true)
                            : alert(
                                "Error: No CV has been attached to this user. Upload one in profile edit page."
                              )
                        }
                        className="flex items-center gap-2 min-w-[150px]"
                      >
                        Attach Profile CV
                      </Button>
                    </div>
                    {resume && resume.size > 10485760 ? (
                      <p className="text-red-500 text-sm">
                        Maximum upload size of 10mb.
                      </p>
                    ) : resume ? (
                      <p className="text-green-600 text-sm">
                        Selected File: {resume.name}
                      </p>
                    ) : usingCv ? (
                      <p className="text-green-600 text-sm">
                        Using Profile CV: {cvName}
                      </p>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        Attach your Resume.
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-2 border border-gray-300 rounded-lg p-4 bg-gray-100">
                    <Label htmlFor="coverLetter">Cover Letter</Label>
                    {/* Scrollable display area */}
                    <div className="w-full min-h-24 max-h-24 overflow-y-auto overflow-x-hidden break-words border rounded-md p-2 bg-white whitespace-pre-wrap">
                      {coverLetterValue}
                    </div>
                    {/* Hidden input so the cover letter is still part of the form submission */}
                    <input
                      type="hidden"
                      {...register("coverLetter")}
                      value={coverLetterValue || ""}
                    />
                    <Button
                      type="button"
                      onClick={() => setCoverLetterEditor(true)}
                      className="mt-2"
                    >
                      <Pencil className="w-5 h-5" /> Edit Cover Letter
                    </Button>
                    {errors.coverLetter ? (
                      <p className="text-red-500 text-sm">
                        {errors.coverLetter.message}
                      </p>
                    ) : coverLetterValue ? (
                      <p className="text-green-600 text-sm">
                        Cover letter validated.
                      </p>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        Write your cover letter.
                      </p>
                    )}
                  </div>
                  <div className="w-full bg-white p-4">
                    <Button
                      type="submit"
                      value="send"
                      disabled={loadingJob || loadingUser}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-medium py-2 rounded-lg flex justify-center items-end"
                    >
                      {loadingJob || loadingUser ? (
                        <Loader2 className="animate-spin w-5 h-5 mr-2" />
                      ) : (
                        "Submit Application"
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
