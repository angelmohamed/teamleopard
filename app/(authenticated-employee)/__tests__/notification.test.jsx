import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import NotificationCard from "../notification";
import { supabase } from "@/lib/supabaseClient";

// Mock Supabase
jest.mock("@/lib/supabaseClient", () => ({
    supabase: {
        from: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnValue({ 
            then: jest.fn().mockImplementation(cb => cb({ error: null }))
        }),
    },
}));

// Mock next/link
jest.mock("next/link", () => {
    return ({ children, href }) => {
        return <div data-testid="mock-link" href={href}>{children}</div>;
    };
});

describe("NotificationCard Component", () => {
    const mockNotification = {
        id: 1,
        title: "Test Notification",
        content: "This is a test notification content",
        created_at: new Date().toISOString(),
        read: false,
        hidden: false,
        link: "/test-link"
    };

    const mockUpdateNotification = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        // Mock Date.now for stable time-based tests
        jest.spyOn(Date, 'now').mockImplementation(() => new Date(mockNotification.created_at).getTime() + 60000);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("renders empty card when no notification is provided", () => {
        render(<NotificationCard initNotification={null} onUpdateNotification={mockUpdateNotification} />);
        expect(screen.getByText("...")).toBeInTheDocument();
    });

    test("renders notification with correct title and content", () => {
        render(<NotificationCard initNotification={mockNotification} onUpdateNotification={mockUpdateNotification} />);
        expect(screen.getByText("Test Notification")).toBeInTheDocument();
        expect(screen.getByText("This is a test notification content")).toBeInTheDocument();
    });

    test("renders unread notification with different background", () => {
        const { container } = render(
            <NotificationCard initNotification={mockNotification} onUpdateNotification={mockUpdateNotification} />
        );
        const card = container.querySelector(".bg-gradient-to-b");
        expect(card).toBeInTheDocument();
    });

    test("renders read notification with white background", () => {
        const readNotification = { ...mockNotification, read: true };
        const { container } = render(
            <NotificationCard initNotification={readNotification} onUpdateNotification={mockUpdateNotification} />
        );
        const card = container.querySelector(".bg-white");
        expect(card).toBeInTheDocument();
    });

    test("handles marking notification as read", async () => {
        render(<NotificationCard initNotification={mockNotification} onUpdateNotification={mockUpdateNotification} />);
        
        const readButton = screen.getByTitle("Mark as read");
        fireEvent.click(readButton);
        
        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalledWith("Notifications");
            expect(supabase.update).toHaveBeenCalledWith({ read: true });
            expect(supabase.eq).toHaveBeenCalledWith("id", mockNotification.id);
        });
        
        expect(mockUpdateNotification).toHaveBeenCalledWith(expect.objectContaining({ read: true }));
    });

    test("handles marking notification as unread", async () => {
        const readNotification = { ...mockNotification, read: true };
        render(<NotificationCard initNotification={readNotification} onUpdateNotification={mockUpdateNotification} />);
        
        const unreadButton = screen.getByTitle("Mark as unread");
        fireEvent.click(unreadButton);
        
        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalledWith("Notifications");
            expect(supabase.update).toHaveBeenCalledWith({ read: false });
            expect(supabase.eq).toHaveBeenCalledWith("id", readNotification.id);
        });
        
        expect(mockUpdateNotification).toHaveBeenCalledWith(expect.objectContaining({ read: false }));
    });

    test("handles deleting notification", async () => {
        render(<NotificationCard initNotification={mockNotification} onUpdateNotification={mockUpdateNotification} />);
        
        const deleteButton = screen.getByTitle("Delete notification");
        fireEvent.click(deleteButton);
        
        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalledWith("Notifications");
            expect(supabase.update).toHaveBeenCalledWith({ hidden: true });
            expect(supabase.eq).toHaveBeenCalledWith("id", mockNotification.id);
        });
        
        expect(mockUpdateNotification).toHaveBeenCalledWith(expect.objectContaining({ hidden: true }));
    });

    test("renders deleted notification with undo button", () => {
        const hiddenNotification = { ...mockNotification, hidden: true };
        render(<NotificationCard initNotification={hiddenNotification} onUpdateNotification={mockUpdateNotification} />);
        
        expect(screen.getByText("This notification was deleted.")).toBeInTheDocument();
        expect(screen.getByText("Undo")).toBeInTheDocument();
    });

    test("handles restoring deleted notification", async () => {
        const hiddenNotification = { ...mockNotification, hidden: true };
        render(<NotificationCard initNotification={hiddenNotification} onUpdateNotification={mockUpdateNotification} />);
        
        const undoButton = screen.getByText("Undo");
        fireEvent.click(undoButton);
        
        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalledWith("Notifications");
            expect(supabase.update).toHaveBeenCalledWith({ hidden: false });
            expect(supabase.eq).toHaveBeenCalledWith("id", hiddenNotification.id);
        });
        
        expect(mockUpdateNotification).toHaveBeenCalledWith(expect.objectContaining({ hidden: false }));
    });

    test("updates notification when initNotification prop changes", () => {
        const { rerender } = render(
            <NotificationCard initNotification={mockNotification} onUpdateNotification={mockUpdateNotification} />
        );
        
        const updatedNotification = { ...mockNotification, title: "Updated Title" };
        rerender(
            <NotificationCard initNotification={updatedNotification} onUpdateNotification={mockUpdateNotification} />
        );
        
        expect(screen.getByText("Updated Title")).toBeInTheDocument();
    });

    test("displays 'Just now' for very recent notifications", () => {
        const recentNotification = { 
            ...mockNotification, 
            created_at: new Date().toISOString() 
        };
        jest.spyOn(Date, 'now').mockImplementation(() => new Date(recentNotification.created_at).getTime() + 30000); // 30 seconds later
        
        render(<NotificationCard initNotification={recentNotification} onUpdateNotification={mockUpdateNotification} />);
        expect(screen.getByText("Just now")).toBeInTheDocument();
    });

    test("renders notification with very long title correctly", () => {
        const longTitleNotification = { 
            ...mockNotification,
            title: "This is an extremely long notification title that should test the truncation capabilities of the component" 
        };
        
        render(<NotificationCard initNotification={longTitleNotification} onUpdateNotification={mockUpdateNotification} />);
        
        // The component should render without errors with long title
        expect(screen.getByText(longTitleNotification.title)).toBeInTheDocument();
    });

    test("renders notification with very long content correctly", () => {
        const longContentNotification = { 
            ...mockNotification,
            content: "This is a very long notification content that spans multiple lines. It should test how the component handles overflow text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." 
        };
        
        render(<NotificationCard initNotification={longContentNotification} onUpdateNotification={mockUpdateNotification} />);
        
        // The component should render without errors with long content
        expect(screen.getByText(longContentNotification.content)).toBeInTheDocument();
    });

    test("all buttons have accessible title attributes", () => {
        render(<NotificationCard initNotification={mockNotification} onUpdateNotification={mockUpdateNotification} />);
        
        expect(screen.getByTitle("Mark as read")).toBeInTheDocument();
        expect(screen.getByTitle("Delete notification")).toBeInTheDocument();
        
        // Test read notification buttons
        const readNotification = { ...mockNotification, read: true };
        const { rerender } = render(
            <NotificationCard initNotification={readNotification} onUpdateNotification={mockUpdateNotification} />
        );
        
        expect(screen.getByTitle("Mark as unread")).toBeInTheDocument();
    });
});