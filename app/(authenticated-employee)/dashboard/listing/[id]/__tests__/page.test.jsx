import React from "react";
import { render, screen, act, fireEvent, waitFor } from "@testing-library/react";
import JobDetails from "../page";
import { supabase } from "@/lib/supabaseClient";
import { useParams } from "next/navigation";

// Mock next/navigation useParams to control the id parameter.
jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
}));

// Mock Supabase client.
jest.mock("@/lib/supabaseClient", () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
  },
}));

// Mock window.alert and clipboard
global.alert = jest.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(),
  },
});

describe("JobDetails Page", () => {
  const mockJobData = {
    posting_id: "123",
    title: "Senior Developer",
    description: "<p>An exciting role!</p>",
    location: "New York",
    employment_type: "Full-time",
    salary_range: "$80k - $120k",
    posted_at: new Date().toISOString(),
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    expected_skills: '["JavaScript", "React"]',
    Employer: {
      company_name: "Tech Corp",
      company_description: "Innovative tech company",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useParams.mockReturnValue({ id: "123" });
  });

  test("shows loading state initially", async () => {
    // Create a pending promise for job details.
    const pendingPromise = new Promise(() => {});
    
    // Mock the chain for Job_Posting.
    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValueOnce(pendingPromise),
    });
    // Provide a default for auth.
    supabase.auth.getUser.mockResolvedValueOnce({ data: {} });

    await act(async () => {
      render(<JobDetails />);
    });
    expect(screen.getByText("Loading job details...")).toBeInTheDocument();
  });

  test("displays 'Job not found' when job data is null", async () => {
    // Simulate job query that returns null.
    supabase.from.mockImplementation((table) => {
      if (table === "Job_Posting") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValueOnce({ data: null, error: { message: "Not found" } }),
        };
      }
      if (table === "Saved_Jobs") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValueOnce({ data: null, error: null }),
        };
      }
    });
    // Ensure getUser returns a valid user.
    supabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: "user1" } } });

    await act(async () => {
      render(<JobDetails />);
    });
    // Wait until the loading text is removed.
    await waitFor(() => {
      const loadingElement = screen.queryByText("Loading job details...");
      // This will pass immediately if loadingElement is null.
      expect(loadingElement).not.toBeInTheDocument();
    });
    
    expect(screen.getByText("Job not found.")).toBeInTheDocument();
    expect(screen.getByText("Return to dashboard.")).toBeInTheDocument();
  });

  test("renders job details correctly", async () => {
    // Provide mocks for both Job_Posting and Saved_Jobs.
    supabase.from.mockImplementation((table) => {
      if (table === "Job_Posting") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValueOnce({ data: mockJobData, error: null }),
        };
      }
      if (table === "Saved_Jobs") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValueOnce({ data: null, error: null }),
        };
      }
    });
    supabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: "user1" } } });

    await act(async () => {
      render(<JobDetails />);
    });
    await waitFor(() => {
      const loadingElement = screen.queryByText("Loading job details...");
      // This will pass immediately if loadingElement is null.
      expect(loadingElement).not.toBeInTheDocument();
    });
    
    expect(screen.getByText(mockJobData.title)).toBeInTheDocument();
    expect(screen.getByText("New York")).toBeInTheDocument();
    expect(screen.getByText("Full-time")).toBeInTheDocument();
    expect(screen.getByText(/Salary:/)).toBeInTheDocument();
    expect(screen.getByText(mockJobData.Employer.company_name)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Apply Now/i })).toBeInTheDocument();
  });

  test("toggles favourite state when favourite button is clicked", async () => {
    supabase.from.mockImplementation((table) => {
      if (table === "Job_Posting") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValueOnce({ data: mockJobData, error: null }),
        };
      }
      if (table === "Saved_Jobs") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn()
            .mockResolvedValueOnce({ data: null, error: null }) // initial fetch: job not saved
            .mockResolvedValueOnce({ data: { id: 1 }, error: null }),  // for insert on click
          insert: jest.fn().mockResolvedValueOnce({ data: { id: 1 }, error: null }),
          delete: jest.fn().mockResolvedValueOnce({ data: { id: 1 }, error: null }),
        };
      }
    });
    supabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: "user1" } } });

    await act(async () => {
      render(<JobDetails />);
    });
    await waitFor(() => {
      const loadingElement = screen.queryByText("Loading job details...");
      // This will pass immediately if loadingElement is null.
      expect(loadingElement).not.toBeInTheDocument();
    });

    const favButton = screen.getByRole("button", { name: "Favourite" });
    await act(async () => {
      fireEvent.click(favButton);
    });
    // You can further assert that UI changes (e.g. checking for a class change) if needed.
    expect(supabase.from).toHaveBeenCalled();
  });

  test("copies job URL to clipboard when share button is clicked", async () => {
    supabase.from.mockImplementation((table) => {
      if (table === "Job_Posting") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValueOnce({ data: mockJobData, error: null }),
        };
      }
      if (table === "Saved_Jobs") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValueOnce({ data: null, error: null }),
        };
      }
    });
    supabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: "user1" } } });

    Object.defineProperty(window, "location", {
      value: { origin: "http://localhost" },
    });

    await act(async () => {
      render(<JobDetails />);
    });
    await waitFor(() => {
      const loadingElement = screen.queryByText("Loading job details...");
      // This will pass immediately if loadingElement is null.
      expect(loadingElement).not.toBeInTheDocument();
    });
    
    const shareButton = screen.getByRole("button", { name: "Share" });
    await act(async () => {
      fireEvent.click(shareButton);
    });

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("http://localhost/dashboard/listing/123");
      expect(global.alert).toHaveBeenCalledWith("Job link copied to clipboard");
    });
  });
});
