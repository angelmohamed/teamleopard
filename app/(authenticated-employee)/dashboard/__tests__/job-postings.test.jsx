import React from "react";
import { render, screen, act, fireEvent } from "@testing-library/react";
import JobPostings from "../job-postings";
import { supabase } from "@/lib/supabaseClient";

jest.mock("@/lib/supabaseClient", () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

// Helper function to return an object that is fully chainable for a query.
const createChainable = (data) => {
  const chainable = {
    select: jest.fn(() => chainable),
    limit: jest.fn(() => chainable),
    eq: jest.fn(() => chainable),
    then: (cb) => Promise.resolve(cb({ data, error: null })),
  };
  return chainable;
};

// Helper function to generate dummy job data.
const generateJobData = (count) =>
  Array.from({ length: count }).map((_, index) => ({
    posting_id: `job${index + 1}`,
    title: `Job ${index + 1}`,
    description: `<p>Description</p>`,
    location: "City",
    employment_type: "Part-time",
    salary_range: "$50k - $70k",
    company_ID: "comp1",
  }));

describe("JobPostings Component", () => {
  test("renders job postings and load more button when there are 5 or more jobs", async () => {
    const dummyJobs = generateJobData(5); // Create 5 dummy job objects.
    
    supabase.from.mockImplementation((table) => {
      if (table === "Job_Posting") {
        return createChainable(dummyJobs);
      }
      if (table === "Saved_Jobs") {
        return createChainable([]);  // No saved jobs.
      }
      return createChainable(null);
    });
    supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "user1" } } });
    
    await act(async () => {
      render(<JobPostings onSavedJobsChange={jest.fn()} filters={{}} />);
    });
    
    // Verify that all dummy job postings are rendered.
    dummyJobs.forEach((job) => {
      expect(screen.getByText(job.title)).toBeInTheDocument();
    });
    // With 5 jobs, the "Load More" button should now be visible.
    expect(screen.getByText("Load More")).toBeInTheDocument();
  });

  test("does not render load more button when less than 5 jobs available", async () => {
    const dummyJobs = generateJobData(3); // Create 3 dummy job objects.
    
    supabase.from.mockImplementation((table) => {
      if (table === "Job_Posting") {
        return createChainable(dummyJobs);
      }
      if (table === "Saved_Jobs") {
        return createChainable([]);
      }
      return createChainable(null);
    });
    supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "user1" } } });
    
    await act(async () => {
      render(<JobPostings onSavedJobsChange={jest.fn()} filters={{}} />);
    });
    
    // Check that the "Load More" button is not present.
    expect(screen.queryByText("Load More")).not.toBeInTheDocument();
  });

  test("toggles favourite button and triggers onSavedJobsChange", async () => {
    // Single job for testing favourite toggle.
    const singleJob = {
      posting_id: "job1",
      title: "Job Title 1",
      description: "<p>Description 1</p>",
      location: "City A",
      employment_type: "Full-time",
      salary_range: "$50k",
      company_ID: "comp1",
    };
    supabase.from.mockImplementation((table) => {
      if (table === "Job_Posting") {
        return createChainable([singleJob]);
      }
      if (table === "Saved_Jobs") {
        // For toggle, initially no saved jobs.
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              then: () => Promise.resolve({ data: [], error: null }),
            })),
          })),
          // Also provide insert and delete methods.
          insert: jest.fn().mockResolvedValue({ data: { id: 1 }, error: null }),
          delete: jest.fn().mockResolvedValue({ data: { id: 1 }, error: null }),
        };
      }
      return createChainable(null);
    });
    supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "user1" } } });
    const onSavedJobsChange = jest.fn();

    await act(async () => {
      render(<JobPostings onSavedJobsChange={onSavedJobsChange} filters={{}} />);
    });

    // Assume the favourite button is rendered as a button element; getByRole("button") returns the first one.
    const favButton = screen.getByRole("button");
    await act(async () => {
      fireEvent.click(favButton);
    });
    expect(onSavedJobsChange).toHaveBeenCalled();
  });
});
