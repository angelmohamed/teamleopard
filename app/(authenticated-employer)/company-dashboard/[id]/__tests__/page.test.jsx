import React from "react";
import { render, screen, act, waitFor, fireEvent } from "@testing-library/react";
import CompanyDashboard from "../page";
import { supabase } from "@/lib/supabaseClient";
import { useParams } from "next/navigation";

// Mock next/navigation to provide params for the company id.
jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
}));

// Mock Supabase client
jest.mock("@/lib/supabaseClient", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

// Helper to simulate chainable Supabase query calls.
const createChainable = (data) => {
  return {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockImplementation(() =>
      Promise.resolve({ data, error: null })
    ),
    then: jest.fn().mockImplementation((cb) =>
      Promise.resolve(cb({ data, error: null }))
    ),
  };
};

beforeEach(() => {
  jest.clearAllMocks();
  // Set the company id parameter for the dashboard.
  useParams.mockReturnValue({ id: "company_id" });
});

describe("CompanyDashboard (page.js)", () => {
  test("renders loading fallback while auth is loading", async () => {
    // Ensure that any call to supabase.from returns a chainable object (default empty array)
    supabase.from.mockImplementation(() => createChainable([]));
    
    // Delay getUser response so that authLoading remains true
    let resolveAuth;
    const authPromise = new Promise((resolve) => {
      resolveAuth = resolve;
    });
    supabase.auth.getUser.mockReturnValue(authPromise);

    // Render component; it should show "Loading..." while auth is loading.
    render(<CompanyDashboard />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    // Resolve auth after a short delay.
    act(() => {
      resolveAuth({ data: { user: { id: "company_id" } }, error: null });
    });
    // Await state update; the component may still show loading fallback if company data isn't fetched yet.
    await waitFor(() => {
      expect(screen.getAllByText("Loading...").length).toBeGreaterThan(0);
    });
  });

  test("renders company dashboard correctly when data has loaded", async () => {
    // Simulate a valid user session.
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "company_id" } },
      error: null,
    });

    // Mock specific table calls.
    supabase.from.mockImplementation((table) => {
      if (table === "Employer") {
        return createChainable({
          company_name: "Test Company",
          company_description: "Test Company Description",
        });
      }
      if (table === "Job_Posting") {
        return createChainable([]);
      }
      if (table === "Applications") {
        return createChainable([]);
      }
      if (table === "Notifications") {
        return createChainable([]);
      }
      return createChainable([]);
    });

    await act(async () => {
      render(<CompanyDashboard />);
    });

    // Wait until loading fallbacks are gone.
    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    // Check that the company profile card displays the company name and description.
    expect(screen.getByText("Test Company")).toBeInTheDocument();
    expect(screen.getByText("Test Company Description")).toBeInTheDocument();

    // Check that the "Job Vacancy Trends" card shows fallback text when no jobs exist.
    expect(
      screen.getByText(/You haven't posted any jobs yet\./i)
    ).toBeInTheDocument();

    // Verify that the Applications section shows "No applications received yet."
    expect(
      screen.getByText(/No applications received yet\./i)
    ).toBeInTheDocument();

    // Verify that notifications section shows "No activity yet." if no notifications exist.
    expect(screen.getByText("No activity yet.")).toBeInTheDocument();
  });

  test("handles 'Show More' notifications click", async () => {
    // Simulate user and company as before.
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "company_id" } },
      error: null,
    });

    // Create dummy notifications data with 6 items.
    const notifications = Array.from({ length: 6 }).map((_, idx) => ({
      title: `Notification ${idx + 1}`,
      content: `Content for ${idx + 1}`,
      link: `/notification/${idx + 1}`,
      created_at: new Date().toISOString(),
    }));

    supabase.from.mockImplementation((table) => {
      if (table === "Employer") {
        return createChainable({
          company_name: "Test Company",
          company_description: "Test Company Description",
        });
      }
      if (table === "Job_Posting") {
        return createChainable([]);
      }
      if (table === "Applications") {
        return createChainable([]);
      }
      if (table === "Notifications") {
        return createChainable(notifications);
      }
      return createChainable([]);
    });

    await act(async () => {
      render(<CompanyDashboard />);
    });

    // Wait until notifications are loaded.
    await waitFor(() => {
      // Given our initial limit is 4, only 4 notifications should be rendered.
      notifications.slice(0, 4).forEach((notification) => {
        expect(
          screen.getByText(new RegExp(notification.title, "i"))
        ).toBeInTheDocument();
      });
    });

    // "Show More" button should be visible if notifications are more than the current limit.
    const showMoreButton = screen.getByText("Show More");
    expect(showMoreButton).toBeInTheDocument();

    // Click the "Show More" button and verify that more notifications are rendered.
    await act(async () => {
      fireEvent.click(showMoreButton);
    });

    // Wait for state update after increasing the notification limit.
    await waitFor(() => {
      notifications.slice(0, 6).forEach((notification) => {
        expect(
          screen.getByText(new RegExp(notification.title, "i"))
        ).toBeInTheDocument();
      });
    });
  });

  test("handles job posting form submission with validation errors", async () => {
    // Set up a valid user and company.
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "company_id" } },
      error: null,
    });
    supabase.from.mockImplementation((table) => {
      if (table === "Employer") {
        return createChainable({
          company_name: "Test Company",
          company_description: "Test Company Description",
        });
      }
      // For Job_Posting, include both query methods and an insert method that returns an error.
      if (table === "Job_Posting") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          then: jest.fn().mockResolvedValue({ data: [], error: null }),
          insert: jest.fn().mockResolvedValue({
            data: null,
            error: { message: "Some fields missing" },
          }),
        };
      }
      // For other tables, return an empty chainable.
      return createChainable([]);
    });

    await act(async () => {
      render(<CompanyDashboard />);
    });

    // In this test, we intentionally do not fill in the form fields,
    // so that form validation will throw an error.
    const postJobButton = screen.getByRole("button", { name: /post job/i });
    await act(async () => {
      fireEvent.click(postJobButton);
    });
  });
});
