if (typeof ResizeObserver === 'undefined') {
  global.ResizeObserver = class {
    constructor(callback) {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };
} //makes resize observer work

import React from "react";
import { render, screen } from "@testing-library/react";
import ViewStatPage from "../page"; // adjust path as needed
import { supabase } from "@/lib/supabaseClient";

// Mock the Supabase client.
jest.mock("@/lib/supabaseClient", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// Create a chainable helper that returns a promise augmented with common query methods.
// It accepts `data` to resolve with and an optional `error` (default is null).
const createChainable = (data, error = null) => {
  // Start with a real promise that resolves to an object with data and error.
  const promise = Promise.resolve({ data, error });
  // Attach common chainable methods.
  promise.select = jest.fn(() => promise);
  promise.eq = jest.fn(() => promise);
  promise.then = jest.fn((cb) => promise.then(cb));
  promise.single = jest.fn(() =>
    Promise.resolve({
      data: Array.isArray(data) ? (data.length > 0 ? data[0] : null) : data,
      error,
    })
  );
  return promise;
};

describe("ViewStatPage", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders job application statistics correctly", async () => {
    // Dummy data: 6 applications (3 accepted, 2 rejected, 1 pending)
    const applicationsData = [
      { status: "accepted" },
      { status: "accepted" },
      { status: "accepted" },
      { status: "rejected" },
      { status: "rejected" },
      { status: "pending" },
    ];

    // When "Applications" is requested, resolve with our dummy data.
    supabase.from.mockImplementation((table) => {
      if (table === "Applications") {
        return createChainable(applicationsData);
      }
      return createChainable(null);
    });

    // Call the page's async function with a dummy job id.
    const params = { id: "job1" };
    const element = await ViewStatPage({ params });

    // Render the returned JSX.
    render(element);

    // Check that the main heading is rendered.
    expect(screen.getByText(/Job Application Statistics/i)).toBeInTheDocument();

    // The total applications should be 4.
    expect(screen.getByText("6")).toBeInTheDocument();

    // Check the status breakdown.
    // Accepted should count 2.
    expect(screen.getByTestId("card-accepted")).toHaveTextContent("Accepted");
    expect(screen.getByText("3")).toBeInTheDocument();

    // Rejected should count 1.
    expect(screen.getByTestId("card-rejected")).toHaveTextContent("Rejected");
    expect(screen.getByText("2")).toBeInTheDocument();

    // Pending should count 1.
    expect(screen.getByTestId("card-pending")).toHaveTextContent("Pending");
    expect(screen.getByText("1")).toBeInTheDocument();

    // Optionally, check that the chart headings are present.
    expect(screen.getByText(/Visual Breakdown \(Bar\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Percentage Breakdown \(Donut\)/i)).toBeInTheDocument();
  });

  test("renders error message when there is an error loading statistics", async () => {
    // Simulate an error response when fetching from "Applications"
    supabase.from.mockImplementation((table) => {
      if (table === "Applications") {
        return createChainable(null, { message: "Error" });
      }
      return createChainable(null);
    });

    const params = { id: "job1" };
    const element = await ViewStatPage({ params });

    render(element);

    // Check the error message appears.
    expect(screen.getByText(/Error loading job statistics/i)).toBeInTheDocument();
  });
});
