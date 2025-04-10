import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import ViewStatPage from "../page"; // adjust the relative path as needed
import { supabase } from "@/lib/supabaseClient";

// Ensure our Supabase module is mocked before any import of modules that use it.
jest.mock("@/lib/supabaseClient", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// Optionally, if your component uses dynamic imports for charts or similar,
// you can mock them to resolve immediately.
// For example:
jest.mock("@/components/ui/chartstats", () => () => <div>ChartStats Mock</div>);
jest.mock("@/components/ui/donutchart", () => () => <div>DonutChart Mock</div>);

/**
 * Returns a thenable (an actual Promise) that has chainable methods attached.
 * This ensures that await calls on Supabase queries resolve immediately.
 */
const createChainable = (data, error = null) => {
  const chainableMethods = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
  };
  const promise = Promise.resolve({ data, error });
  return Object.assign(promise, chainableMethods);
};

describe("ViewStatPage", () => {
  const jobId = "job1";

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders error message when Supabase query fails", async () => {
    // Immediately resolve an error for the Applications query.
    supabase.from.mockImplementation((table) => {
      if (table === "Applications") {
        return createChainable(null, new Error("Test error"));
      }
      return createChainable([]);
    });

    let pageContent;
    await act(async () => {
      pageContent = await ViewStatPage({ params: { jobId } });
    });
    render(pageContent);

    // Expect the error fallback message.
    expect(screen.getByText("Error loading job statistics.")).toBeInTheDocument();
  });

  test("renders 'no applications' message when there are no applications", async () => {
    // Simulate no applications by returning an empty array.
    supabase.from.mockImplementation((table) => {
      if (table === "Applications") {
        return createChainable([]);
      }
      return createChainable([]);
    });

    let pageContent;
    await act(async () => {
      pageContent = await ViewStatPage({ params: { jobId } });
    });
    render(pageContent);

    // Verify that the heading and no applications message appear.
    expect(screen.getByText("📊 Job Application Statistics")).toBeInTheDocument();
    expect(
      screen.getByText("No applications yet for this job posting.")
    ).toBeInTheDocument();
  });

  test("renders job statistics correctly when applications exist", async () => {
    // Prepare dummy applications data.
    const dummyApplications = [
      { status: "accepted" },
      { status: "accepted" },
      { status: "accepted" },
      { status: "rejected" },
      { status: "pending" },
      { status: "rejected" },
    ];
    // Total = 6, Accepted = 3, Rejected = 2, Pending = 1

    supabase.from.mockImplementation((table) => {
      if (table === "Applications") {
        return createChainable(dummyApplications);
      }
      return createChainable([]);
    });

    let pageContent;
    await act(async () => {
      pageContent = await ViewStatPage({ params: { jobId } });
    });
    render(pageContent);

    // Check that the total applications count is rendered.
    expect(screen.getByText("6")).toBeInTheDocument();

    // Check that individual counts (2 and 1) appear.
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();

    // Verify that card titles and chart headings are present.
    expect(screen.getByText(/Total Applications Received/i)).toBeInTheDocument();
    expect(screen.getByText(/Visual Breakdown \(Bar\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Percentage Breakdown \(Donut\)/i)).toBeInTheDocument();
  });
});
