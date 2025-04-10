import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import JobDetailPage from "../page"; // Adjust path if needed
import { supabase } from "@/lib/supabaseClient";
import { useParams } from "next/navigation";

// Mock next/navigation useParams.
jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
}));

// Mock supabase client.
jest.mock("@/lib/supabaseClient", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// A helper to simulate Supabase’s chainable query.
// It defines the chain for .select(...).eq(...).single() and returns a resolved Promise.
const createChainable = (data, error = null) => {
  return {
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data, error })),
      })),
    })),
  };
};

beforeEach(() => {
  jest.clearAllMocks();
  // Provide a dummy implementation for fetch used to increment views.
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({}),
    })
  );
});

describe("JobDetailPage", () => {
  test("renders loading state then displays job details", async () => {
    // Set useParams to return a valid numeric id.
    useParams.mockReturnValue({ id: "1" });
    const dummyJob = {
      posting_id: 1,
      title: "Frontend Developer",
      employment_type: "Full-time",
      location: "Remote",
      salary_range: "$70k - $90k",
      views: 150,
      deadline: "2025-12-31",
      description: "<p>Great job opportunity</p>",
    };

    // When supabase.from("Job_Posting") is called, return our dummy job.
    supabase.from.mockImplementation((table) => {
      if (table === "Job_Posting") {
        return createChainable(dummyJob);
      }
      return createChainable(null);
    });

    await act(async () => {
      render(<JobDetailPage />);
    });

    // Wait for the loading message to disappear.
    await waitFor(() =>
      expect(screen.queryByText("Loading job data...")).not.toBeInTheDocument()
    );

    // Verify that the job details are rendered.
    expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
    expect(screen.getByText("Full-time")).toBeInTheDocument();
    expect(screen.getByText("Remote")).toBeInTheDocument();
    expect(screen.getByText("$70k - $90k")).toBeInTheDocument();
    expect(screen.getByText("150")).toBeInTheDocument(); // Views
    expect(screen.getByText("2025-12-31")).toBeInTheDocument();
    expect(screen.getByText("Great job opportunity")).toBeInTheDocument();

    // Verify that the view increment API was called with the correct id.
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/view-job",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: 1 }),
      })
    );
  });

  test("renders error message when job id is invalid (non-numeric)", async () => {
    // Set useParams to a non-numeric id.
    useParams.mockReturnValue({ id: "abc" });

    await act(async () => {
      render(<JobDetailPage />);
    });

    // Expect error message is shown.
    expect(screen.getByText("Invalid job ID")).toBeInTheDocument();
  });

  test("renders error message when supabase returns an error", async () => {
    useParams.mockReturnValue({ id: "1" });
    // Simulate a Supabase error.
    supabase.from.mockImplementation((table) => {
      if (table === "Job_Posting") {
        return createChainable(null, { message: "Job not found" });
      }
      return createChainable(null);
    });

    // Spy on console.error.
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    await act(async () => {
      render(<JobDetailPage />);
    });

    // Wait until loading is complete.
    await waitFor(() =>
      expect(screen.queryByText("Loading job data...")).not.toBeInTheDocument()
    );
    // Expect the error text to be displayed.
    expect(screen.getByText("Job not found")).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalledWith("Supabase error:", "Job not found");
    consoleErrorSpy.mockRestore();
  });

  test("calls view-job API on mount with the correct id", async () => {
    // Set useParams to return id "2"
    useParams.mockReturnValue({ id: "2" });
    const dummyJob = {
      posting_id: 2,
      title: "Backend Developer",
      employment_type: "Part-time",
      location: "Office",
      salary_range: "$50k - $60k",
      views: 75,
      deadline: "2025-11-30",
      description: "<p>Join our team</p>",
    };

    supabase.from.mockImplementation((table) => {
      if (table === "Job_Posting") {
        return createChainable(dummyJob);
      }
      return createChainable(null);
    });

    await act(async () => {
      render(<JobDetailPage />);
    });

    await waitFor(() =>
      expect(screen.queryByText("Loading job data...")).not.toBeInTheDocument()
    );

    // Verify that the fetch call was made to /api/view-job with id: 2
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/view-job",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: 2 }),
      })
    );
  });
  
  test("renders fallback values when job fields are missing", async () => {
    // Simulate a valid numeric id in the URL.
    useParams.mockReturnValue({ id: "3" });
    // Dummy job with missing/falsy fields.
    const dummyJob = {
      posting_id: 3,
      title: "Test Job",
      employment_type: "",   // Falsy => fallback to "N/A"
      location: null,        // Falsy => fallback to "N/A"
      salary_range: "",      // Falsy => fallback to "N/A"
      views: null,           // Null => fallback to 0 via ?? operator
      deadline: undefined,   // Undefined => fallback to "N/A"
      description: null      // Falsy => should render "No description provided."
    };

    // When supabase.from("Job_Posting") is called, return our dummy job.
    supabase.from.mockImplementation((table) => {
      if (table === "Job_Posting") {
        return createChainable(dummyJob);
      }
      return createChainable(null);
    });

    await act(async () => {
      render(<JobDetailPage />);
    });

    // Wait until loading state is over.
    await waitFor(() =>
      expect(screen.queryByText("Loading job data...")).not.toBeInTheDocument()
    );

    // Check that the job title is rendered.
    expect(screen.getByText("Test Job")).toBeInTheDocument();

    // Verify fallback values in the job info card.
    // Employment Type fallback:
    expect(screen.getByText("💼 Employment Type:").nextSibling.textContent).toBe("N/A");
    // Location fallback:
    expect(screen.getByText("📍 Location:").nextSibling.textContent).toBe("N/A");
    // Salary Range fallback:
    expect(screen.getByText("💸 Salary Range:").nextSibling.textContent).toBe("N/A");
    // Views fallback:
    expect(screen.getByText("📈 Views:").nextSibling.textContent).toBe("0");
    // Deadline fallback:
    expect(screen.getByText("⏳ Deadline:").nextSibling.textContent).toBe("N/A");

    // Verify description fallback.
    expect(screen.getByText("No description provided.")).toBeInTheDocument();
  });
});
