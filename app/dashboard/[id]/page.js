"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Filter } from "lucide-react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function JobListings() {
  const [employee, setEmployee] = useState(null); // For storing employee data
  const [username, setUsername] = useState(""); // To store the username
  const param = useParams();
  const id = param.id;

  // Fetch employee data when component mounts or id changes
  useEffect(() => {
    const fetchEmployeeData = async () => {
      const { data, error } = await supabase
        .from("Employee")
        .select("username") // Fetch only the username
        .eq("id", id)
        .single(); // Assuming you want a single employee

      if (error) {
        console.error("Error fetching employee:", error);
      } else {
        setEmployee(data); // Store entire employee data if needed
        setUsername(data?.username); // Set the username
      }
    };

    if (id) {
      fetchEmployeeData();
    }
  }, [id]);

  const [filters, setFilters] = useState({
    location: "",
    employmentType: "",
    employer: "",
    sector: "",
    jobType: "",
  });

  // Update filter values
  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen flex justify-center">
      {/* Main Layout Container with Max Width */}
      <div className="w-full max-w-6xl flex">
        {/* Sidebar - Hidden on mobile, shown on md+ */}
        <aside className="hidden md:block w-1/4 p-6">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <Button variant="link" className="text-red-500 p-0 mb-2">
            Clear all filters
          </Button>

          <Accordion type="single" collapsible>
            {/* Content Types */}
            <AccordionItem value="contentTypes" className="border-b">
              <AccordionTrigger className="text-sm font-medium">
                Content Types
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center">
                    <input
                      type="radio"
                      name="contentType"
                      value="all"
                      defaultChecked
                      className="mr-2"
                    />
                    All
                  </li>
                  <li className="flex items-center">
                    <input
                      type="radio"
                      name="contentType"
                      value="jobs"
                      className="mr-2"
                    />
                    Jobs (3577)
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* Sectors */}
            <AccordionItem value="sectors" className="border-b">
              <AccordionTrigger className="text-sm font-medium">
                Sectors
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center">
                    <input
                      type="radio"
                      name="sector"
                      value="all"
                      defaultChecked
                      className="mr-2"
                    />
                    All
                  </li>
                  <li className="flex items-center">
                    <input
                      type="radio"
                      name="sector"
                      value="tech"
                      className="mr-2"
                    />
                    Technology & IT
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* Employers */}
            <AccordionItem value="employers" className="border-b">
              <AccordionTrigger className="text-sm font-medium">
                Employers
              </AccordionTrigger>
              <AccordionContent>
                <Input
                  placeholder="Search employer"
                  value={filters.employer}
                  onChange={(e) => updateFilter("employer", e.target.value)}
                />
              </AccordionContent>
            </AccordionItem>

            {/* Locations */}
            <AccordionItem value="locations" className="border-b">
              <AccordionTrigger className="text-sm font-medium">
                Locations
              </AccordionTrigger>
              <AccordionContent>
                <Input
                  placeholder="Enter a location"
                  value={filters.location}
                  onChange={(e) => updateFilter("location", e.target.value)}
                />
              </AccordionContent>
            </AccordionItem>

            {/* Job Types */}
            <AccordionItem value="jobTypes" className="border-b">
              <AccordionTrigger className="text-sm font-medium">
                Job Types
              </AccordionTrigger>
              <AccordionContent>
                <Select
                  onValueChange={(value) => updateFilter("jobType", value)}
                >
                  <option value="">Select job type</option>
                  <option value="graduate">Graduate</option>
                  <option value="placement">Placement</option>
                  <option value="internship">Internship</option>
                </Select>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button variant="default" className="w-full mt-4">
            Apply Filters
          </Button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Mobile Filter Button */}
          <div className="md:hidden mb-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Filter className="w-5 h-5" />
                  <span>Filters</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-6">
                <h2 className="text-lg font-semibold mb-4">Filters</h2>
                <Accordion type="single" collapsible>
                  <AccordionItem value="contentTypes" className="border-b">
                    <AccordionTrigger className="text-sm font-medium">
                      Content Types
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-center">
                          <input
                            type="radio"
                            name="contentType"
                            value="all"
                            defaultChecked
                            className="mr-2"
                          />
                          All
                        </li>
                        <li className="flex items-center">
                          <input
                            type="radio"
                            name="contentType"
                            value="jobs"
                            className="mr-2"
                          />
                          Jobs (3577)
                        </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <Button variant="default" className="w-full mt-4">
                  Apply Filters
                </Button>
              </SheetContent>
            </Sheet>
          </div>

          {/* Groupmate's Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Employee Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Your profile</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Welcome, @{username || "Loading..."}</p>
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle>Your upcoming deadlines</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Placeholder</p>
              </CardContent>
            </Card>

            {/* Applications */}
            <Card>
              <CardHeader>
                <CardTitle>Your applications</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Placeholder</p>
              </CardContent>
            </Card>
          </div>

          {/* Divider */}
          <div className="border-b my-6"></div>
        </main>
      </div>
    </div>
  );
}
