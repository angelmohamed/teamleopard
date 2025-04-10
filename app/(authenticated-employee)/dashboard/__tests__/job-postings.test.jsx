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
    const dummyJobs = generateJobData(5);
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
    
    dummyJobs.forEach((job) => {
      expect(screen.getByText(job.title)).toBeInTheDocument();
    });
    expect(screen.getByText("Load More")).toBeInTheDocument();
  });

  test("does not render load more button when less than 5 jobs available", async () => {
    const dummyJobs = generateJobData(3);
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
    
    expect(screen.queryByText("Load More")).not.toBeInTheDocument();
  });

  test("toggles favourite button and triggers onSavedJobsChange", async () => {
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
        // Simulate no saved jobs initially.
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              then: () => Promise.resolve({ data: [], error: null }),
            })),
          })),
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

    const favButton = screen.getByRole("button");
    await act(async () => {
      fireEvent.click(favButton);
    });
    expect(onSavedJobsChange).toHaveBeenCalled();
  });

  test("renders no jobs available when job list is empty", async () => {
    supabase.from.mockImplementation((table) => {
      if (table === "Job_Posting") {
        return createChainable([]);
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
    expect(screen.getByText("No jobs available.")).toBeInTheDocument();
  });

  test("applies salary filtering correctly for single value salary", async () => {
    const jobSingle = {
      posting_id: "job1",
      title: "Job Single Salary",
      description: "<p>Description</p>",
      location: "City",
      employment_type: "Full-time",
      salary_range: "$136457",
      company_ID: "comp1",
    };
    const filters = {
      salary: {
        min: 100000,
      },
    };
    supabase.from.mockImplementation((table) => {
      if (table === "Job_Posting") {
        return createChainable([jobSingle]);
      }
      if (table === "Saved_Jobs") {
        return createChainable([]);
      }
      return createChainable(null);
    });
    supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "user1" } } });
    
    await act(async () => {
      render(<JobPostings onSavedJobsChange={jest.fn()} filters={filters} />);
    });
    expect(screen.getByText("Job Single Salary")).toBeInTheDocument();
  });

  test("handleFavourite does nothing and warns when no user session found", async () => {
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
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              then: () => Promise.resolve({ data: [], error: null }),
            })),
          })),
          insert: jest.fn().mockResolvedValue({ data: { id: 1 }, error: null }),
          delete: jest.fn().mockResolvedValue({ data: { id: 1 }, error: null }),
        };
      }
      return createChainable(null);
    });
    // Simulate no user session.
    supabase.auth.getUser.mockResolvedValue({ data: {} });
    
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    
    await act(async () => {
      render(<JobPostings onSavedJobsChange={jest.fn()} filters={{}} />);
    });
    const favButton = screen.getByRole("button");
    await act(async () => {
      fireEvent.click(favButton);
    });
    
    expect(warnSpy).toHaveBeenCalledWith("No user session found");
    warnSpy.mockRestore();
  });

  test("handleFavourite logs error when saving job fails", async () => {
    const singleJob = {
      posting_id: "job1",
      title: "Job Title 1",
      description: "<p>Description 1</p>",
      location: "City A",
      employment_type: "Full-time",
      salary_range: "$50k",
      company_ID: "comp1",
    };
    // Simulate that the job is not saved.
    supabase.from.mockImplementation((table) => {
      if (table === "Job_Posting") {
        return createChainable([singleJob]);
      }
      if (table === "Saved_Jobs") {
        const chain = createChainable([]);
        chain.insert = jest.fn().mockResolvedValue({ data: null, error: { message: "Insert error" } });
        chain.delete = jest.fn().mockResolvedValue({ data: null, error: null });
        return chain;
      }
      return createChainable(null);
    });
    supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "user1" } } });
    
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    
    await act(async () => {
      render(<JobPostings onSavedJobsChange={jest.fn()} filters={{}} />);
    });
    const favButton = screen.getByRole("button");
    await act(async () => {
      fireEvent.click(favButton);
    });
    expect(errorSpy).toHaveBeenCalledWith("Error saving job:", { message: "Insert error" });
    errorSpy.mockRestore();
  });

  test("handles load more button click and increases limit", async () => {
    const dummyJobs = generateJobData(6);
    const chainable = createChainable(dummyJobs);
    const limitSpy = chainable.limit;
    
    supabase.from.mockImplementation((table) => {
      if (table === "Job_Posting") {
        return chainable;
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
    
    const loadMoreButton = screen.getByText("Load More");
    expect(loadMoreButton).toBeInTheDocument();
    
    await act(async () => {
      fireEvent.click(loadMoreButton);
    });
    expect(limitSpy).toHaveBeenCalled();
  });
});
