"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { UploadCloud, Loader2, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

// Validation schema using Zod
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Enter a valid phone number"),
  position: z.string().min(2, "Specify the position"),
  coverLetter: z.string().min(20, "Cover letter must be at least 20 characters"),
  resume: z.any(),
});

export default function ApplicationForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
  });

  const [resume, setResume] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const onSubmit = (data) => {
    setLoading(true);
    setTimeout(() => {
      console.log("Form Data:", data);
      setLoading(false);
      setSubmitted(true);
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
      className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600 p-4"
    >
      <Card className="w-full max-w-lg p-6 shadow-2xl rounded-xl bg-white">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800 text-center">🚀 Job Application Form</CardTitle>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <motion.div 
              initial={{ scale: 0.8 }} 
              animate={{ scale: 1 }} 
              className="flex flex-col items-center text-green-600 text-lg font-semibold"
            >
              <CheckCircle className="w-10 h-10 text-green-500 mb-2" />
              Your application has been submitted successfully!
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                {errors.position && <p className="text-red-500 text-sm">{errors.position.message}</p>}
              </div>

              <div className="flex flex-col items-center gap-2 border border-gray-300 rounded-lg p-4 bg-gray-100">
                <Label className="text-gray-700">Upload Resume</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => setResume(e.target.files?.[0] || null)}
                />
                <Button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2">
                  <UploadCloud className="w-5 h-5" /> Upload Resume
                </Button>
                {resume && <p className="text-green-600 text-sm">Selected File: {resume.name}</p>}
              </div>

              <div>
                <Label htmlFor="coverLetter">Cover Letter</Label>
                <Textarea id="coverLetter" {...register("coverLetter")} className="rounded-md" />
                {errors.coverLetter && <p className="text-red-500 text-sm">{errors.coverLetter.message}</p>}
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-medium py-2 rounded-lg flex justify-center items-center">
                {loading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : "Submit Application"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
