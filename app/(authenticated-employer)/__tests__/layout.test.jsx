import React from "react";
import { render, screen, waitFor, act, fireEvent } from "@testing-library/react";
import Layout from "../layout";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, usePathname } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock("@/lib/supabaseClient", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(),
    channel: jest.fn(),
    removeChannel: jest.fn(),
  },
}));

// Helper to simulate chainable Supabase query calls.
const createChainable = (data) => {
  return {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockImplementation(() => Promise.resolve({ data, error: null })),
    then: jest.fn().mockImplementation((cb) => Promise.resolve(cb({ data, error: null }))),
  };
};

// Mock UI Components used inside Layout
jest.mock("@/components/ui/sidebar", () => {
  return {
    Sidebar: ({ children, className }) => <div data-testid="sidebar" className={className}>{children}</div>,
    SidebarProvider: ({ children }) => <div>{children}</div>,
    SidebarContent: ({ children }) => <div data-testid="sidebar-content">{children}</div>,
    SidebarGroup: ({ children }) => <div>{children}</div>,
    SidebarGroupContent: ({ children }) => <div>{children}</div>,
    SidebarGroupLabel: ({ children }) => <div>{children}</div>,
    SidebarMenu: ({ children }) => <div>{children}</div>,
    SidebarMenuButton: ({ children }) => <div>{children}</div>,
    SidebarMenuItem: ({ children }) => <div>{children}</div>,
  };
});

jest.mock("@/components/ui/avatar", () => {
  return {
    Avatar: ({ children }) => <div data-testid="avatar">{children}</div>,
    AvatarImage: (props) => <img {...props} alt="avatar" />,
    AvatarFallback: ({ children }) => <div>{children}</div>,
  };
});

jest.mock("@/components/ui/separator", () => {
  return {
    Separator: () => <hr data-testid="separator" />,
  };
});

jest.mock("@/components/ui/dropdown-menu", () => {
  return {
    DropdownMenu: ({ children }) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }) => <div data-testid="dropdown-trigger">{children}</div>,
    DropdownMenuContent: ({ children, align, className }) => (
      <div data-testid="dropdown-menu-content" className={className}>
        {children}
      </div>
    ),
    DropdownMenuItem: ({ children, onClick, className }) => (
      <div data-testid="dropdown-menu-item" className={className} onClick={onClick}>
        {children}
      </div>
    ),
  };
});

// Configure mocks for Next.js router and pathname
const mockRouterReplace = jest.fn();
useRouter.mockReturnValue({
  replace: mockRouterReplace,
});
usePathname.mockReturnValue("/company-dashboard");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Layout (Employer Sidebar)", () => {
  test("renders loading state while fetching user and company data", async () => {
    let resolveAuth, resolveCompany;
    const authPromise = new Promise((resolve) => { resolveAuth = resolve; });
    const companyPromise = new Promise((resolve) => { resolveCompany = resolve; });
    
    supabase.auth.getUser.mockReturnValue(authPromise);
    supabase.from.mockImplementation((table) => {
      if (table === "Employer") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockImplementation(() => companyPromise),
        };
      }
      return createChainable(null);
    });
    
    render(<Layout><div>Child Content</div></Layout>);
    
    // Check that the loading state is rendered initially
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    act(() => {
      resolveAuth({ data: { user: { id: "user1" } }, error: null });
      resolveCompany({ data: { company_name: "Test Company", username: "employer1" }, error: null });
    });
    
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
  });
  
  test("renders sidebar with correct navigation links and company info after successful fetch", async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "user1" } }, error: null });
    supabase.from.mockImplementation((table) => {
      if (table === "Employer") {
        return createChainable({ company_name: "Test Company", username: "employer1" });
      }
      return createChainable(null);
    });
    
    await act(async () => {
      render(<Layout><div>Child Content</div></Layout>);
    });
    
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    
    // Verify links render correctly.
    const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
    expect(dashboardLink).toHaveAttribute("href", "/company-dashboard/user1");
    const editProfileLink = screen.getByRole("link", { name: /edit profile/i });
    expect(editProfileLink).toHaveAttribute("href", "/edit-company-profile");
    
    // Check company info and children.
    expect(screen.getByText("employer1")).toBeInTheDocument();
    expect(screen.getByText("Test Company")).toBeInTheDocument();
    expect(screen.getByText("Child Content")).toBeInTheDocument();
  });
  
  test("handles logout action correctly", async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "user1" } }, error: null });
    supabase.from.mockImplementation((table) => {
      if (table === "Employer") {
        return createChainable({ company_name: "Test Company", username: "employer1" });
      }
      return createChainable(null);
    });
    supabase.auth.signOut.mockResolvedValue({ error: null });
    
    await act(async () => {
      render(<Layout><div>Child Content</div></Layout>);
    });
    
    // Click the dropdown trigger to reveal the dropdown menu.
    const dropdownTrigger = screen.getByTestId("dropdown-trigger");
    await act(async () => {
      fireEvent.click(dropdownTrigger);
    });
    
    // Now ensure the logout menu item is rendered and click it.
    const logoutItem = screen.getByTestId("dropdown-menu-item");
    expect(logoutItem).toHaveTextContent(/logout/i);
    await act(async () => {
      fireEvent.click(logoutItem);
    });
    
    // Verify that signOut was triggered and routing redirected to "/login".
    expect(supabase.auth.signOut).toHaveBeenCalled();
    expect(mockRouterReplace).toHaveBeenCalledWith("/login");
  });
  
  test("redirects to /login if user fetch fails", async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: new Error("No user") });
    
    await act(async () => {
      render(<Layout><div>Child Content</div></Layout>);
    });
    
    expect(mockRouterReplace).toHaveBeenCalledWith("/login");
  });
  
  test("redirects to /dashboard if employer fetch fails", async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "user1" } }, error: null });
    supabase.from.mockImplementation((table) => {
      if (table === "Employer") {
        return createChainable(null);
      }
      return createChainable(null);
    });
    
    await act(async () => {
      render(<Layout><div>Child Content</div></Layout>);
    });
    
    expect(mockRouterReplace).toHaveBeenCalledWith("/dashboard");
  });
});
