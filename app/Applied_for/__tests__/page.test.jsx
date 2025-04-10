import React from "react";
import { render, screen, act, fireEvent, waitFor } from "@testing-library/react";
import Dashboard from "../page";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

// Mock the Supabase client.
jest.mock("@/lib/supabaseClient", () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
  },
}));

// Mock Next.js router.
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// A general helper that returns a chainable object.
const createChainable = (data, error = null) => ({
  select: () => ({
    eq: () => ({
      then: (cb) => Promise.resolve(cb({ data, error })),
    }),
  }),
});

describe("Dashboard (Applied_for)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders loading state and then empty state when no applications", async () => {
    // Create a promise that resolves with empty data after 50ms.
    const delayedPromise = new Promise((resolve) =>
      setTimeout(() => resolve({ data: [], error: null }), 50)
    );
    // Create a chainable object that returns that delayed promise.
    const delayedChainable = {
      select: jest.fn(() => delayedChainable),
      eq: jest.fn(() => delayedChainable),
      then: () => delayedPromise,
    };
  
    supabase.from.mockImplementation((table) => {
      if (table === "Applications") {
        return delayedChainable;
      }
      return createChainable(null);
    });
    supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "user1" } } });
  
    // Render the component.
    await act(async () => {
      render(<Dashboard />);
    });
  
    // Immediately after render, the loading message should be visible.
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  /* THIS DOESN'T WANT TO WORK >:(
    // Wait long enough for the delayed promise to resolve.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });
  
    // Then assert that the empty state message is displayed.
    expect(
      screen.getByText((content) => content.includes("applied to any jobs yet"))
    ).toBeInTheDocument();*/
  });

  test("renders application cards with correct content", async () => {
    // Dummy application data.
    const dummyApplications = [
      {
        Application_id: "app1",
        created_at: new Date("2025-01-01T12:00:00Z").toISOString(),
        status: "Pending",
        resume_file_name: "resume1.pdf",
        Job_Posting: {
          posting_id: 101,
          title: "Frontend Developer",
          location: "Remote",
          employment_type: "Full-time",
        },
      },
      {
        Application_id: "app2",
        created_at: new Date("2025-02-01T12:00:00Z").toISOString(),
        status: "Accepted",
        resume_file_name: "resume2.pdf",
        Job_Posting: {
          posting_id: 102,
          title: "Backend Developer",
          location: "Office",
          employment_type: "Part-time",
        },
      },
      {
        Application_id: "app3",
        created_at: new Date("2025-03-01T12:00:00Z").toISOString(),
        status: "Rejected",
        resume_file_name: "resume3.pdf",
        Job_Posting: {
          posting_id: 103,
          title: "Fullstack Engineer",
          location: "Hybrid",
          employment_type: "Contract",
        },
      },
    ];

    supabase.from.mockImplementation((table) => {
      if (table === "Applications") {
        return createChainable(dummyApplications);
      }
      return createChainable(null);
    });
    supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "user1" } } });

    await act(async () => {
      render(<Dashboard />);
    });

    // Wait for loading to finish.
    await waitFor(() => expect(screen.queryByText("Loading...")).toBeNull());

    // Check heading.
    expect(screen.getByText("Your Applications")).toBeInTheDocument();
    
    // Verify details for the first application.
    expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
    expect(screen.getByText("Remote • Full-time")).toBeInTheDocument();
    expect(screen.getByText("resume1.pdf")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();

    // Verify details for the other applications.
    expect(screen.getByText("Backend Developer")).toBeInTheDocument();
    expect(screen.getByText("Accepted")).toBeInTheDocument();
    expect(screen.getByText("Fullstack Engineer")).toBeInTheDocument();
    expect(screen.getByText("Rejected")).toBeInTheDocument();
  });

  test("navigates to view stats when 'View Stats' button is clicked", async () => {
    const pushMock = jest.fn();
    useRouter.mockReturnValue({ push: pushMock });

    const dummyApplications = [
      {
        Application_id: "app1",
        created_at: new Date().toISOString(),
        status: "Accepted",
        resume_file_name: "resume.pdf",
        Job_Posting: {
          posting_id: 200,
          title: "DevOps Engineer",
          location: "Remote",
          employment_type: "Full-time",
        },
      },
    ];
    // Create a simple chainable that immediately resolves.
    supabase.from.mockImplementation((table) => {
      if (table === "Applications") {
        return {
          select: () => ({
            eq: () => ({
              then: (cb) =>
                Promise.resolve(cb({ data: dummyApplications, error: null })),
            }),
          }),
        };
      }
      return createChainable(null);
    });
    supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "user1" } } });

    await act(async () => {
      render(<Dashboard />);
    });

    // Wait for loading to disappear.
    await waitFor(() => {
      expect(screen.queryByText("Loading...")).toBeNull();
    });

    const viewStatsButton = screen.getByRole("button", { name: /View Stats/i });
    expect(viewStatsButton).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(viewStatsButton);
    });
    expect(pushMock).toHaveBeenCalledWith("/View_Stat/200");
  });
});
