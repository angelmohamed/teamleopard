import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import JobListings from "../page";
import { supabase } from "@/lib/supabaseClient";

// Mock dependencies
jest.mock("@/lib/supabaseClient", () => ({
  supabase: {
    from: jest.fn(),
    channel: jest.fn().mockReturnValue({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    }),
    removeChannel: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
  },
}));

jest.mock("../../layout", () => ({
  useAuth: jest.fn().mockReturnValue({ user: { id: "user1" } }),
}));

// Mock child components
jest.mock("../job-postings", () => {
  return function MockJobPostings(props) {
    return <div data-testid="job-postings" data-filters={JSON.stringify(props.filters)}>Job Postings Component</div>;
  };
});

jest.mock("../filters-aside", () => {
  return function MockFilters(props) {
    return (
      <div data-testid="filters">
        <button 
          onClick={() => props.onFilterChange({ sector: "Technology" })}
          data-testid="filter-button"
        >
          Apply Filter
        </button>
      </div>
    );
  };
});

// Helper function to setup chainable mocks for Supabase queries
const createChainable = (data) => {
  return {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockImplementation(() => Promise.resolve({ data, error: null })),
    then: jest.fn().mockImplementation((cb) => Promise.resolve(cb({ data, error: null }))),
  };
};

describe("JobListings Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders component structure with loading states", async () => {
    // Create a delayed Promise to keep the loading state visible
    let resolveApplications;
    const delayedPromise = new Promise(resolve => {
      resolveApplications = resolve;
    });
    
    supabase.from.mockImplementation((table) => {
      if (table === "Employee") {
        return createChainable({ username: "testuser", first_name: "Test" });
      }
      if (table === "Saved_Jobs") {
        return createChainable([]);
      }
      if (table === "Applications") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          then: jest.fn().mockImplementation(() => delayedPromise) // Delay this promise
        };
      }
      return createChainable(null);
    });

    const { getByText } = render(<JobListings />);
    
    // Test initial loading state
    expect(getByText("Loading applications...")).toBeInTheDocument();
    
    // Now resolve the promise to complete the test
    resolveApplications({ data: [], error: null });
    
    // Check other static elements
    expect(getByText("Your profile")).toBeInTheDocument();
    expect(getByText("Your saved jobs")).toBeInTheDocument();
    expect(getByText("Your applications")).toBeInTheDocument();
    expect(screen.getByTestId("job-postings")).toBeInTheDocument();
  });

  test("displays employee information when loaded", async () => {
    supabase.from.mockImplementation((table) => {
      if (table === "Employee") {
        return createChainable({ username: "testuser", first_name: "John" });
      }
      return createChainable([]);
    });

    await act(async () => {
      render(<JobListings />);
    });

    await waitFor(() => {
      expect(screen.getByText("Welcome, John")).toBeInTheDocument();
    });
  });

  test("displays saved jobs with deadline indicators", async () => {
    const savedJobsData = [
      { job_posting_id: "job1" },
      { job_posting_id: "job2" }
    ];
    
    const jobsData = [
      { posting_id: "job1", title: "Frontend Developer", deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() },
      { posting_id: "job2", title: "Backend Engineer", deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString() }
    ];

    supabase.from.mockImplementation((table) => {
      if (table === "Employee") {
        return createChainable({ username: "testuser", first_name: "John" });
      }
      if (table === "Saved_Jobs") {
        return createChainable(savedJobsData);
      }
      if (table === "Job_Posting") {
        return {
          select: jest.fn().mockReturnThis(),
          in: jest.fn().mockReturnThis(),
          then: jest.fn().mockImplementation((cb) => Promise.resolve(cb({ data: jobsData, error: null })))
        };
      }
      if (table === "Applications") {
        return createChainable([]);
      }
      return createChainable(null);
    });

    await act(async () => {
      render(<JobListings />);
    });

    await waitFor(() => {
      expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
      expect(screen.getByText("Backend Engineer")).toBeInTheDocument();
      expect(screen.getByText("5 days left")).toBeInTheDocument();
      expect(screen.getByText("10 days left")).toBeInTheDocument();
    });
  });

  // Fix the first failing badge test
  test("displays applications with correct status badges", async () => {
    const applicationsData = [
      {
        Application_id: "app1",
        created_at: new Date().toISOString(),
        status: "pending",
        job_posting_id: "job1",
        Job_Posting: {
          posting_id: "job1",
          title: "Frontend Role",
          Employer: { company_name: "Tech Corp" }
        }
      },
      {
        Application_id: "app2",
        created_at: new Date().toISOString(),
        status: "accepted",
        job_posting_id: "job2",
        Job_Posting: {
          posting_id: "job2",
          title: "Backend Role",
          Employer: { company_name: "Dev Inc" }
        }
      }
    ];

    // Properly mock the Applications query
    supabase.from.mockImplementation((table) => {
      if (table === "Employee") {
        return createChainable({ username: "testuser", first_name: "John" });
      }
      if (table === "Saved_Jobs") {
        return createChainable([]);
      }
      if (table === "Applications") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnValue({
            then: jest.fn(cb => cb({ data: applicationsData, error: null }))
          })
        };
      }
      return createChainable(null);
    });

    // Render with proper act() wrapping
    await act(async () => {
      render(<JobListings />);
    });

    // Check for titles and companies
    expect(screen.getByText("Frontend Role")).toBeInTheDocument();
    expect(screen.getByText("Backend Role")).toBeInTheDocument();
    expect(screen.getByText("Tech Corp")).toBeInTheDocument();
    expect(screen.getByText("Dev Inc")).toBeInTheDocument();
    
    // UPDATED: Use data-testid to find badges instead
    const pendingBadge = screen.getByText(/pending/i);
    expect(pendingBadge).toBeInTheDocument();
    // Look for the Badge component directly
    expect(pendingBadge.closest("div[class*='bg-yellow-100']")).not.toBeNull();
    
    const acceptedBadge = screen.getByText(/accepted/i);
    expect(acceptedBadge).toBeInTheDocument();
    expect(acceptedBadge.closest("div[class*='bg-green-100']")).not.toBeNull();
  });

  test("handles filter changes from Filters component", async () => {
    supabase.from.mockImplementation((table) => {
      return createChainable([]);
    });

    await act(async () => {
      render(<JobListings />);
    });

    // Click the filter button in our mocked Filters component
    const filterButton = screen.getByTestId("filter-button");
    await act(async () => {
      userEvent.click(filterButton);
    });

    // Check if JobPostings received the updated filters
    await waitFor(() => {
      const jobPostings = screen.getByTestId("job-postings");
      const passedFilters = JSON.parse(jobPostings.dataset.filters);
      expect(passedFilters.sector).toBe("Technology");
    });
  });

  test("handles errors in fetching job data", async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    supabase.from.mockImplementation((table) => {
      if (table === "Saved_Jobs") {
        return createChainable([{ job_posting_id: "job1" }]);
      }
      if (table === "Job_Posting") {
        return {
          select: jest.fn().mockReturnThis(),
          in: jest.fn().mockImplementation(() => ({
            then: (cb) => Promise.resolve(cb({ data: null, error: new Error("Failed to fetch") }))
          }))
        };
      }
      return createChainable([]);
    });

    await act(async () => {
      render(<JobListings />);
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Error fetching job titles:", expect.any(Error));
      expect(screen.getByText("No saved jobs yet.")).toBeInTheDocument();
    });
    
    consoleSpy.mockRestore();
  });

  test("handles applications with missing job data", async () => {
    const applicationsData = [
      {
        Application_id: "app1",
        created_at: new Date().toISOString(),
        status: "pending",
        job_posting_id: "job1",
        Job_Posting: null
      }
    ];

    supabase.from.mockImplementation((table) => {
      if (table === "Applications") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockImplementation(() => ({
            then: (cb) => Promise.resolve(cb({ data: applicationsData, error: null }))
          }))
        };
      }
      return createChainable([]);
    });

    await act(async () => {
      render(<JobListings />);
    });

    await waitFor(() => {
      expect(screen.getByText("Job Unavailable")).toBeInTheDocument();
      expect(screen.getByText("Unknown Company")).toBeInTheDocument();
    });
  });

  test("sets up and cleans up Supabase subscription", async () => {
    // Create a proper subscription mock object that can be tracked
    const subscriptionMock = {
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnThis() // Return this to ensure it's the same object
    };
    
    supabase.channel.mockReturnValue(subscriptionMock);
    supabase.from.mockImplementation(() => createChainable([]));

    let component;
    await act(async () => {
      component = render(<JobListings />);
    });

    // Check subscription setup
    expect(supabase.channel).toHaveBeenCalledWith("saved_jobs_changes");
    expect(subscriptionMock.on).toHaveBeenCalled();
    expect(subscriptionMock.subscribe).toHaveBeenCalled();

    // Test cleanup
    await act(async () => {
      component.unmount();
    });
    
    expect(supabase.removeChannel).toHaveBeenCalledWith(subscriptionMock);
  });

  // Fix the second failing badge test
  test("handles multiple application status types with correct badge styling", async () => {
    const applicationsData = [
      {
        Application_id: "app1",
        created_at: new Date().toISOString(),
        status: "pending",
        job_posting_id: "job1",
        Job_Posting: { 
          posting_id: "job1", 
          title: "Job 1", 
          Employer: { company_name: "Company 1" } 
        }
      },
      {
        Application_id: "app2",
        created_at: new Date().toISOString(),
        status: "rejected",
        job_posting_id: "job2",
        Job_Posting: { 
          posting_id: "job2", 
          title: "Job 2", 
          Employer: { company_name: "Company 2" } 
        }
      },
      {
        Application_id: "app3",
        created_at: new Date().toISOString(),
        status: "interview",
        job_posting_id: "job3",
        Job_Posting: { 
          posting_id: "job3", 
          title: "Job 3", 
          Employer: { company_name: "Company 3" } 
        }
      }
    ];

    supabase.from.mockImplementation((table) => {
      if (table === "Applications") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnValue({
            then: jest.fn(cb => cb({ data: applicationsData, error: null }))
          })
        };
      }
      if (table === "Employee") {
        return createChainable({ username: "testuser", first_name: "Test" });
      }
      return createChainable([]);
    });

    // Use proper act() wrapping
    await act(async () => {
      render(<JobListings />);
    });

    // UPDATED: Use case-insensitive text matching and check badges with closest()
    const pendingBadge = screen.getByText(/pending/i);
    expect(pendingBadge).toBeInTheDocument();
    expect(pendingBadge.closest("div[class*='bg-yellow-100']")).not.toBeNull();
    
    const rejectedBadge = screen.getByText(/rejected/i);
    expect(rejectedBadge).toBeInTheDocument();
    expect(rejectedBadge.closest("div[class*='bg-red-100']")).not.toBeNull();
    
    const interviewBadge = screen.getByText(/interview/i);
    expect(interviewBadge).toBeInTheDocument();
    expect(interviewBadge.closest("div[class*='bg-purple-100']")).not.toBeNull();
  });
});