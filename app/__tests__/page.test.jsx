// __tests__/homepage.test.jsx

// --- Mock Next/Image so it renders a plain <img> element ---
jest.mock("next/image", () => (props) => {
  return <img {...props} />;
});

// --- Mock Next/Navigation ---
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// --- Mock Supabase ---
jest.mock("@/lib/supabaseClient", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
  },
}));

// --- Mock Carousel components to bypass embla-carousel code ---
jest.mock("@/components/ui/carousel", () => ({
  Carousel: ({ children, opts, className }) => (
    <div data-testid="carousel" className={className}>
      {children}
    </div>
  ),
  CarouselContent: ({ children, className }) => (
    <div data-testid="carousel-content" className={className}>
      {children}
    </div>
  ),
  CarouselItem: ({ children, className }) => (
    <div data-testid="carousel-item" className={className}>
      {children}
    </div>
  ),
  CarouselNext: (props) => <button data-testid="carousel-next" {...props}>Next</button>,
  CarouselPrevious: (props) => <button data-testid="carousel-prev" {...props}>Previous</button>,
}));

import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import HomePage from "../page"; // Adjust path as needed
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

describe("HomePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("redirects to dashboard if user is authenticated", async () => {
    const pushMock = jest.fn();
    useRouter.mockReturnValue({ push: pushMock });
    // Simulate that getUser resolves with a user.
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "test-user" } },
    });

    await act(async () => {
      render(<HomePage />);
    });

    // Wait for the useEffect to run and verify that router.push was called.
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/dashboard");
    });
  });

  test("renders homepage content when user is not authenticated", async () => {
    const pushMock = jest.fn();
    useRouter.mockReturnValue({ push: pushMock });
    // Simulate that getUser resolves with no user.
    supabase.auth.getUser.mockResolvedValue({
      data: { user: null },
    });

    await act(async () => {
      render(<HomePage />);
    });

    // Wait for the useEffect to finish and verify that push wasn't called.
    await waitFor(() => {
      expect(pushMock).not.toHaveBeenCalled();
    });

    // Check for key pieces of static content.
    expect(screen.getByText(/Join them today for free/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Log In/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Sign Up As Employee/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Sign Up As Employer/i })).toBeInTheDocument();

    // Instead of getByTestId, use getAllByTestId to check that at least one carousel exists.
    const carouselContainers = screen.getAllByTestId("carousel");
    expect(carouselContainers.length).toBeGreaterThan(0);

    // Check for carousel images (the images have alt text "Example" as defined in your component).
    const images = screen.getAllByAltText("Example");
    expect(images.length).toBeGreaterThan(0);
  });
});
