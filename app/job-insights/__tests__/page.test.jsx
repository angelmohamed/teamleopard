import React from "react";
import { render, screen, act, fireEvent, waitFor } from "@testing-library/react";
import JobOverviewPage from "../page"; // adjust path as needed
import { supabase } from "@/lib/supabaseClient";

// Mock supabase client.
jest.mock("@/lib/supabaseClient", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// Helper function to return an object that is fully chainable for a query.
const createChainable = (data, error = null) => {
  const chainable = {
    select: jest.fn(() => chainable),
    then: (cb) => Promise.resolve(cb({ data, error })),
  };
  return chainable;
};

describe("JobOverviewPage", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders loading message and then job cards", async () => {
    // Define some dummy job data.
    const dummyJobs = [
      { posting_id: "job1", title: "Frontend Developer", salary_range: "$60k", views: 100 },
      { posting_id: "job2", title: "Backend Developer", salary_range: "$70k", views: 200 }
    ];

    supabase.from.mockImplementation((table) => {
      if (table === "Job_Posting") {
        return createChainable(dummyJobs);
      }
      return createChainable(null);
    });
    
    await act(async () => {
      render(<JobOverviewPage />);
    });
    
    // Check that the heading is rendered.
    expect(screen.getByText("📊 Job Listings Overview")).toBeInTheDocument();
    
    // Check that job cards are rendered after loading.
    expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
    expect(screen.getByText("Backend Developer")).toBeInTheDocument();
    expect(screen.getByText("💸 Salary: $60k")).toBeInTheDocument();
    expect(screen.getByText("📈 Views: 100")).toBeInTheDocument();
  });

  test("filters jobs based on search input", async () => {
    const dummyJobs = [
      { posting_id: "job1", title: "Frontend Developer", salary_range: "$60k", views: 100 },
      { posting_id: "job2", title: "Backend Developer", salary_range: "$70k", views: 200 },
      { posting_id: "job3", title: "Fullstack Engineer", salary_range: "$80k", views: 150 }
    ];

    supabase.from.mockImplementation((table) => {
      if (table === "Job_Posting") {
        return createChainable(dummyJobs);
      }
      return createChainable(null);
    });

    await act(async () => {
      render(<JobOverviewPage />);
    });

    expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
    expect(screen.getByText("Backend Developer")).toBeInTheDocument();
    expect(screen.getByText("Fullstack Engineer")).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText("Search job titles...");
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "backend" } });
    });

    expect(screen.getByText("Backend Developer")).toBeInTheDocument();
    expect(screen.queryByText("Frontend Developer")).not.toBeInTheDocument();
    expect(screen.queryByText("Fullstack Engineer")).not.toBeInTheDocument();
  });

  test("renders error when fetching jobs fails", async () => {
    supabase.from.mockImplementation((table) => {
      if (table === "Job_Posting") {
        return createChainable(null, { message: "Fetch error" });
      }
      return createChainable(null);
    });

    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    await act(async () => {
      render(<JobOverviewPage />);
    });

    expect(screen.queryByText("💸 Salary:")).not.toBeInTheDocument();
    expect(errorSpy).toHaveBeenCalledWith("❌ Error fetching jobs:", "Fetch error");

    errorSpy.mockRestore();
  });

  test("renders 'Loading jobs...' while fetching", async () => {
    let resolvePromise;
    const delayedChainable = {
      select: jest.fn(() => delayedChainable),
      then: jest.fn(
        () =>
          new Promise((resolve) => {
            resolvePromise = resolve;
          })
      ),
    };
    
    supabase.from.mockImplementation((table) => {
      if (table === "Job_Posting") {
        return delayedChainable;
      }
      return createChainable(null);
    });

    await act(async () => {
      render(<JobOverviewPage />);
    });
    
    // Immediately after render, the loading message should be visible.
    expect(screen.getByText("Loading jobs...")).toBeInTheDocument();
  });

  test("renders fallback values for salary and views when missing", async () => {
    // Dummy job without salary and views.
    const dummyJobs = [
      {
        posting_id: "job1",
        title: "No Salary Job",
        salary_range: null,  // Missing salary_range should fallback to "N/A"
        views: null          // Missing views should fallback to 0
      }
    ];
    
    // When supabase.from("Job_Posting") is called, return our dummy job.
    supabase.from.mockImplementation((table) => {
      if (table === "Job_Posting") {
        return createChainable(dummyJobs);
      }
      return createChainable(null);
    });
    
    await act(async () => {
      render(<JobOverviewPage />);
    });
    
    // Check that fallback values appear in the job card.
    expect(screen.getByText("💸 Salary: N/A")).toBeInTheDocument();
    expect(screen.getByText("📈 Views: 0")).toBeInTheDocument();
  });
});
