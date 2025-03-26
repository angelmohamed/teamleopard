// /components/FilterAside.jsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export default function FilterAside() {
  return (
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
            <Input placeholder="Search employer" />
          </AccordionContent>
        </AccordionItem>

        {/* Locations */}
        <AccordionItem value="locations" className="border-b">
          <AccordionTrigger className="text-sm font-medium">
            Locations
          </AccordionTrigger>
          <AccordionContent>
            <Input placeholder="Enter a location" />
          </AccordionContent>
        </AccordionItem>

        {/* Job Types */}
        <AccordionItem value="jobTypes" className="border-b">
          <AccordionTrigger className="text-sm font-medium">
            Job Types
          </AccordionTrigger>
          <AccordionContent>
            <Select>
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
  );
}
