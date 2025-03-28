"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { supabase } from "@/lib/supabaseClient";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export default function FilterAside({ onFilterChange }) {
  // Filter states
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [selectedSector, setSelectedSector] = useState("all");
  const [selectedEmployer, setSelectedEmployer] = useState("");
  const [employerSearch, setEmployerSearch] = useState("");
  const [selectedJobType, setSelectedJobType] = useState("");
  const [employers, setEmployers] = useState([]);
  const [sectors] = useState([
    "Technology & IT",
    "Healthcare",
    "Finance",
    "Education",
    "Manufacturing",
    "Retail",
    "Other",
  ]);

  // Fetch employers for the dropdown
  useEffect(() => {
    const fetchEmployers = async () => {
      const { data, error } = await supabase
        .from("Employer")
        .select("id, company_name");

      if (!error && data) {
        setEmployers(data);
      }
    };

    fetchEmployers();
  }, []);

  // Create filter object and pass to parent
  const applyFilters = () => {
    const filters = {
      salary: {
        min: salaryMin ? parseInt(salaryMin, 10) : null,
        max: salaryMax ? parseInt(salaryMax, 10) : null,
      },
      sector: selectedSector !== "all" ? selectedSector : null,
      employer: selectedEmployer || null,
      jobType: selectedJobType || null,
    };

    if (onFilterChange) {
      onFilterChange(filters);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSalaryMin("");
    setSalaryMax("");
    setSelectedSector("all");
    setSelectedEmployer("");
    setEmployerSearch("");
    setSelectedJobType("");

    if (onFilterChange) {
      onFilterChange({});
    }
  };

  // Filter employers based on search
  const filteredEmployers = employerSearch
    ? employers.filter((emp) =>
        emp.company_name.toLowerCase().includes(employerSearch.toLowerCase())
      )
    : employers;

  // For displaying the employer name in the active filters section
  const chosenEmployerName = selectedEmployer
    ? employers.find((e) => e.id === selectedEmployer)?.company_name
    : "";

  // Check if any filters are active
  const anyFiltersActive =
    salaryMin ||
    salaryMax ||
    selectedSector !== "all" ||
    selectedEmployer ||
    selectedJobType;

  return (
    <aside className="hidden md:block w-1/4 p-6">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>
      <Button
        variant="link"
        className="text-red-500 p-0 mb-2"
        onClick={clearFilters}
      >
        Clear all filters
      </Button>

      <Accordion type="single" collapsible defaultValue="salary">
        {/* Salary Range */}
        <AccordionItem value="salary" className="border-b">
          <AccordionTrigger className="text-sm font-medium">
            Salary Range
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-700 block mb-1">
                  Minimum Salary
                </label>
                <Input
                  type="number"
                  placeholder="Min salary"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm text-gray-700 block mb-1">
                  Maximum Salary
                </label>
                <Input
                  type="number"
                  placeholder="Max salary"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
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
                  id="sector-all"
                  value="all"
                  checked={selectedSector === "all"}
                  onChange={() => setSelectedSector("all")}
                  className="mr-2"
                />
                <label htmlFor="sector-all">All Sectors</label>
              </li>
              {sectors.map((sector) => (
                <li key={sector} className="flex items-center">
                  <input
                    type="radio"
                    name="sector"
                    id={`sector-${sector}`}
                    value={sector}
                    checked={selectedSector === sector}
                    onChange={() => setSelectedSector(sector)}
                    className="mr-2"
                  />
                  <label htmlFor={`sector-${sector}`}>{sector}</label>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>

        {/* Employers */}
        <AccordionItem value="employers" className="border-b">
          <AccordionTrigger className="text-sm font-medium">
            Employers
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <Input
                placeholder="Search employer"
                value={employerSearch}
                onChange={(e) => setEmployerSearch(e.target.value)}
                className="mb-2"
              />
              <Select
                value={selectedEmployer}
                onChange={(e) => setSelectedEmployer(e.target.value)}
                className="w-full"
              >
                <option value="">All Employers</option>
                {filteredEmployers.map((employer) => (
                  <option key={employer.id} value={employer.id}>
                    {employer.company_name}
                  </option>
                ))}
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Job Types */}
        <AccordionItem value="jobTypes" className="border-b">
          <AccordionTrigger className="text-sm font-medium">
            Job Types
          </AccordionTrigger>
          <AccordionContent>
            <Select
              value={selectedJobType}
              onChange={(e) => setSelectedJobType(e.target.value)}
              className="w-full"
            >
              <option value="">All Job Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
              <option value="Remote">Remote</option>
            </Select>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Apply Filters button */}
      <Button variant="default" className="w-full mt-4" onClick={applyFilters}>
        Apply Filters
      </Button>

      {/* Only show "Reset filters" and chosen filter summary if any filters are active */}
      {anyFiltersActive && (
        <div className="mt-4">
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:underline"
          >
            Reset filters
          </button>
          <div className="text-xs text-gray-600 mt-2">
            <p className="font-medium mb-1">Active filters:</p>
            <ul className="list-disc ml-5">
              {salaryMin && <li>Min Salary: {salaryMin}</li>}
              {salaryMax && <li>Max Salary: {salaryMax}</li>}
              {selectedSector !== "all" && <li>Sector: {selectedSector}</li>}
              {selectedEmployer && (
                <li>Employer: {chosenEmployerName || selectedEmployer}</li>
              )}
              {selectedJobType && <li>Job Type: {selectedJobType}</li>}
            </ul>
          </div>
        </div>
      )}
    </aside>
  );
}
