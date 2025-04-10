import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { act } from 'react';
import ApplicationsPage from '../page';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '../../layout';

// Fix the Next.js Link mock implementation
jest.mock('next/link', () => {
  return {
    __esModule: true,
    default: ({ children, href }) => (
      <a href={href} data-testid="next-link">
        {children}
      </a>
    ),
  };
});

// Mock the Lucide React Icons
jest.mock('lucide-react', () => ({
  ArrowLeft: () => <span data-testid="arrow-left-icon">←</span>,
}));

// Mock the Auth context
jest.mock('../../layout', () => ({
  useAuth: jest.fn(),
}));

// Mock the Supabase client
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn(),
    order: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    auth: {
      getUser: jest.fn(),
    },
  },
}));

describe('ApplicationsPage', () => {
  // Sample mock data and user
  const mockUser = { id: 'test-user-id' };
  const mockApplications = [
    {
      Application_id: '1',
      created_at: '2025-03-15T12:00:00Z',
      status: 'pending',
      resume_file_name: 'resume1.pdf',
      cover_letter: 'Cover letter content',
      job_posting_id: '101',
      Job_Posting: {
        posting_id: '101',
        title: 'Frontend Developer',
        company_ID: 'company1',
        Employer: {
          company_name: 'Tech Corp',
        },
      },
    },
    {
      Application_id: '2',
      created_at: '2025-03-10T10:30:00Z',
      status: 'accepted',
      resume_file_name: 'resume2.pdf',
      cover_letter: 'Another cover letter',
      job_posting_id: '102',
      Job_Posting: {
        posting_id: '102',
        title: 'UX Designer',
        company_ID: 'company2',
        Employer: {
          company_name: 'Design Studios',
        },
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock for authenticated user
    useAuth.mockReturnValue({ user: mockUser });

    // Default mock for employee record check (exists)
    supabase.maybeSingle.mockResolvedValue({
      data: { id: mockUser.id },
      error: null,
    });
  });

  test('shows loading state', async () => {
    // Do not resolve promise to simulate loading
    supabase.order.mockReturnValueOnce(new Promise(() => {}));

    await act(async () => {
      render(<ApplicationsPage />);
    });
    expect(screen.getByText('Loading your applications...')).toBeInTheDocument();
  });

  test('renders empty state when no applications exist', async () => {
    supabase.order.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    await act(async () => {
      render(<ApplicationsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("You haven&apost applied to any jobs yet.")).toBeInTheDocument();
      expect(screen.getByText("Browse jobs to apply")).toBeInTheDocument();
    });
  });

  test('renders applications when they exist', async () => {
    supabase.order.mockResolvedValueOnce({
      data: mockApplications,
      error: null,
    });

    await act(async () => {
      render(<ApplicationsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Your Applications')).toBeInTheDocument();
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
      expect(screen.getByText('Tech Corp')).toBeInTheDocument();
      expect(screen.getByText('UX Designer')).toBeInTheDocument();
      expect(screen.getByText('Design Studios')).toBeInTheDocument();
    });
    expect(screen.getByText('pending')).toBeInTheDocument();
    expect(screen.getByText('accepted')).toBeInTheDocument();
    expect(screen.getByText('Applied on Mar 15, 2025')).toBeInTheDocument();
    expect(screen.getByText('Applied on Mar 10, 2025')).toBeInTheDocument();
  });

  test('creates employee record if it does not exist', async () => {
    // Simulate missing employee record initially
    supabase.maybeSingle.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    // Mock supabase.auth.getUser to return additional profile information
    supabase.auth.getUser.mockResolvedValueOnce({
      data: {
        user: {
          email: 'test@example.com',
          user_metadata: { first_name: 'Test', last_name: 'User' },
        },
      },
      error: null,
    });

    // Simulate successful insert into Employee table
    supabase.insert.mockResolvedValueOnce({ error: null });

    // Simulate empty applications list
    supabase.order.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    await act(async () => {
      render(<ApplicationsPage />);
    });

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('Employee');
      expect(supabase.insert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'test-user-id',
            email: 'test@example.com',
            first_name: 'Test',
            last_name: 'User',
            username: expect.any(String), // new field added; adjust if you expect a specific value like "test"
          }),
        ])
      );
    });
  });

  test('handles error when fetching applications', async () => {
    console.error = jest.fn();
    supabase.order.mockResolvedValueOnce({
      data: null,
      error: { message: 'Database error' },
    });

    await act(async () => {
      render(<ApplicationsPage />);
    });

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error fetching applications:', { message: 'Database error' });
      expect(screen.getByText("You haven&apost applied to any jobs yet.")).toBeInTheDocument();
    });
  });

  test('handles case when user is not authenticated', async () => {
    useAuth.mockReturnValue({ user: null });

    await act(async () => {
      render(<ApplicationsPage />);
    });

    expect(supabase.order).not.toHaveBeenCalled();
  });

  test('correctly formats application status badges', async () => {
    const allStatuses = [
      { ...mockApplications[0], status: 'pending', Application_id: '1' },
      { ...mockApplications[0], status: 'reviewed', Application_id: '2' },
      { ...mockApplications[0], status: 'interview', Application_id: '3' },
      { ...mockApplications[0], status: 'rejected', Application_id: '4' },
      { ...mockApplications[0], status: 'accepted', Application_id: '5' },
    ];

    supabase.order.mockResolvedValueOnce({
      data: allStatuses,
      error: null,
    });

    await act(async () => {
      render(<ApplicationsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('pending')).toBeInTheDocument();
      expect(screen.getByText('reviewed')).toBeInTheDocument();
      expect(screen.getByText('interview')).toBeInTheDocument();
      expect(screen.getByText('rejected')).toBeInTheDocument();
      expect(screen.getByText('accepted')).toBeInTheDocument();
    });
  });

  // New tests to increase coverage for the ensureEmployeeRecord branch
  describe('ApplicationsPage - ensureEmployeeRecord branch', () => {
    const newUser = { id: 'missing-employee-id' };

    test('automatically creates employee record if missing', async () => {
      // Simulate user missing from Employee table.
      useAuth.mockReturnValue({ user: newUser });
      supabase.maybeSingle.mockResolvedValueOnce({ data: null, error: null });

      // Mock supabase.auth.getUser to return user profile details.
      supabase.auth.getUser.mockResolvedValueOnce({
        data: {
          user: {
            email: 'new@example.com',
            user_metadata: { first_name: 'New', last_name: 'User' },
          },
        },
        error: null,
      });

      // Simulate successful employee insertion.
      supabase.insert.mockResolvedValueOnce({ error: null });
      supabase.order.mockResolvedValueOnce({ data: [], error: null });

      await act(async () => {
        render(<ApplicationsPage />);
      });

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('Employee');
        expect(supabase.insert).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              id: 'missing-employee-id',
              email: 'new@example.com',
              first_name: 'New',
              last_name: 'User',
              username: expect.any(String), // expecting a username field, e.g. "new"
            }),
          ])
        );
      });
    });

    test('handles error during employee creation gracefully', async () => {
      useAuth.mockReturnValue({ user: newUser });
      supabase.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
      
      // Simulate error when fetching user profile.
      supabase.auth.getUser.mockResolvedValueOnce({
        data: null,
        error: { message: 'User profile fetch error' },
      });
      
      supabase.order.mockResolvedValueOnce({ data: [], error: null });

      await act(async () => {
        render(<ApplicationsPage />);
      });

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          "Error getting user data:",
          expect.objectContaining({ message: 'User profile fetch error' })
        );
      });
    });
  });
});

// Additional tests to increase branch coverage for ensureEmployeeRecord
describe('ApplicationsPage - ensureEmployeeRecord additional branches', () => {
  const newUser = { id: 'some-user-id' };

  test('does not attempt to create employee record if one already exists', async () => {
    // Simulate that an employee record is already present
    useAuth.mockReturnValue({ user: newUser });
    supabase.maybeSingle.mockResolvedValueOnce({
      data: { id: newUser.id },
      error: null,
    });

    // Clear getUser and insert mocks so they should not be called
    supabase.auth.getUser.mockClear();
    supabase.insert.mockClear();

    // Also simulate an empty applications list, so fetchApplications completes normally
    supabase.order.mockResolvedValueOnce({ data: [], error: null });
    
    await act(async () => {
      render(<ApplicationsPage />);
    });

    await waitFor(() => {
      // Verify that getUser is not called when employeeData is returned
      expect(supabase.auth.getUser).not.toHaveBeenCalled();
      // And insert is not called either
      expect(supabase.insert).not.toHaveBeenCalled();
    });
  });

  test('handles error when employee insertion fails', async () => {
    useAuth.mockReturnValue({ user: newUser });
    // Simulate no existing employee record
    supabase.maybeSingle.mockResolvedValueOnce({
      data: null,
      error: null,
    });
    // Simulate getting user profile correctly
    supabase.auth.getUser.mockResolvedValueOnce({
      data: {
        user: {
          email: 'fail@example.com',
          user_metadata: { first_name: 'Fail', last_name: 'Case' },
        },
      },
      error: null,
    });
    // Simulate an error during insertion
    supabase.insert.mockResolvedValueOnce({ error: { message: 'Insert failed' } });
    // Simulate empty applications list
    supabase.order.mockResolvedValueOnce({ data: [], error: null });

    await act(async () => {
      render(<ApplicationsPage />);
    });

    await waitFor(() => {
      // The error from insert should be logged and ensureEmployeeRecord returns false,
      // which prevents further processing.
      expect(console.error).toHaveBeenCalledWith(
        "Error creating employee record:",
        { message: 'Insert failed' }
      );
    });
  });

  test('handles error checking employee data gracefully', async () => {
    useAuth.mockReturnValue({ user: newUser });
    // Simulate an error while checking for an existing employee record
    supabase.maybeSingle.mockResolvedValueOnce({
      data: null,
      error: { message: 'Check failed' },
    });
    // Simulate empty applications list
    supabase.order.mockResolvedValueOnce({ data: [], error: null });

    await act(async () => {
      render(<ApplicationsPage />);
    });

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith("Error checking employee data:", { message: 'Check failed' });
    });
  });
});