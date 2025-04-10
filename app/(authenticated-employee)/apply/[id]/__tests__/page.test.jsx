import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils'; // Use this instead of 'react'
import ApplicationForm from '../page';
import { supabase } from '@/lib/supabaseClient';
import { useParams } from 'next/navigation';
import { useAuth } from '../../../layout';

// --- Mocks ---
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}));

jest.mock('../../../layout', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
    storage: {
      from: jest.fn().mockReturnThis(),
      upload: jest.fn(),
    },
    auth: {
      getUser: jest.fn(),
    },
  },
}));

// Mock framer-motion to avoid animation issues
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

// Helper for chainable Supabase queries
const createSingleMock = (resolveValue) => ({
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue(resolveValue),
});

describe('ApplicationForm Page', () => {
  // Mock window.alert before all tests
  const originalAlert = window.alert;
  
  beforeAll(() => {
    window.alert = jest.fn();
  });
  
  afterAll(() => {
    window.alert = originalAlert;
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows loading state when job details are still loading', async () => {
    useParams.mockReturnValue({ id: 'job123' });
    useAuth.mockReturnValue({ user: { id: 'user1' } });

    // Mock Employee data to avoid unresolved promises
    supabase.from.mockImplementation((table) => {
      if (table === 'Job_Posting') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: () => new Promise(() => {}), // never resolves
        };
      }
      if (table === 'Employee') {
        return createSingleMock({ 
          data: { first_name: 'Test', last_name: 'User', email: 'test@example.com', phone_num: '1234567890' }, 
          error: null 
        });
      }
      return createSingleMock({ data: { file_name: 'cv.pdf' }, error: null });
    });

    let rendered;
    await act(async () => {
      rendered = render(<ApplicationForm />);
    });

    expect(screen.getByText(/Loading application details/i)).toBeInTheDocument();
    
    // Cleanup to prevent act warnings from lingering effects
    rendered.unmount();
  });

  test('shows "Job not found" when job details are missing', async () => {
    useParams.mockReturnValue({ id: 'job123' });
    useAuth.mockReturnValue({ user: { id: 'user1' } });

    supabase.from.mockImplementation((table) => {
      if (table === 'Job_Posting') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        };
      }
      if (table === 'Employee') {
        return createSingleMock({ 
          data: { first_name: 'Test', last_name: 'User', email: 'test@example.com', phone_num: '1234567890' }, 
          error: null 
        });
      }
      return createSingleMock({ data: { file_name: 'cv.pdf' }, error: null });
    });

    let rendered;
    await act(async () => {
      rendered = render(<ApplicationForm />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Job not found/i)).toBeInTheDocument();
    });
    
    rendered.unmount();
  });

  test('renders the application form and handles a successful submission using profile CV', async () => {
    useParams.mockReturnValue({ id: 'job123' });
    useAuth.mockReturnValue({ user: { id: 'user1' } });

    const jobData = {
      data: {
        title: 'Software Engineer',
        location: 'Remote',
        employment_type: 'Full-time',
        salary_range: '$100k-$150k',
        expected_skills: '["JavaScript", "React"]',
        company_ID: 'company1',
        Employer: { company_name: 'Test Corp', company_description: 'Test description' },
      },
      error: null,
    };

    supabase.from.mockImplementation((table) => {
      if (table === 'Job_Posting') return createSingleMock(jobData);
      if (table === 'Employee') {
        return createSingleMock({ 
          data: { first_name: 'John', last_name: 'Doe', email: 'john@example.com', phone_num: '1234567890' }, 
          error: null 
        });
      }
      if (table === 'CVs') {
        return createSingleMock({ data: { file_name: 'profile_cv.pdf' }, error: null });
      }
      if (table === 'Applications') {
        return {
          insert: jest.fn().mockResolvedValue({ error: null }),
        };
      }
      if (table === 'Notifications') {
        return {
          insert: jest.fn().mockResolvedValue({ error: null }),
        };
      }
      return createSingleMock({ data: {}, error: null });
    });

    supabase.storage.upload.mockResolvedValue({ error: null });
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { email: 'john@example.com', user_metadata: { first_name: 'John', last_name: 'Doe' } } },
      error: null,
    });

    let rendered;
    await act(async () => {
      rendered = render(<ApplicationForm />);
    });

    // Wait for job details to load
    await waitFor(() => {
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });
    
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();

    // Toggle cover letter editor
    await act(async () => {
      fireEvent.click(screen.getByText(/Edit Cover Letter/i));
    });
    
    const coverLetterInput = screen.getByPlaceholderText(/Keep your cover letter concise/i);
    
    await act(async () => {
      fireEvent.change(coverLetterInput, { target: { value: 'This is my cover letter that fulfills the 20 character minimum.' } });
    });
    
    await act(async () => {
      fireEvent.click(screen.getByText(/Back to Form/i));
    });

    // Use profile CV
    await act(async () => {
      fireEvent.click(screen.getByText(/Attach Profile CV/i));
    });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Submit Application/i });
    await act(async () => {
      fireEvent.submit(submitButton.closest('form'));
    });

    // Assert success message
    await waitFor(() => {
      expect(screen.getByText(/Your application has been submitted successfully!/i)).toBeInTheDocument();
    });
    
    rendered.unmount();
  });

  test('shows "Submitting..." state when form submission is in progress', async () => {
    useParams.mockReturnValue({ id: 'job123' });
    useAuth.mockReturnValue({ user: { id: 'user1' } });

    const jobData = {
      data: {
        title: 'UI Designer',
        location: 'Onsite',
        employment_type: 'Part-time',
        salary_range: '$50k-$70k',
        expected_skills: '["Design", "Photoshop"]',
        company_ID: 'company2',
        Employer: { company_name: 'Design Studio', company_description: 'Creative work' },
      },
      error: null,
    };

    let insertCallStarted = false;
    
    supabase.from.mockImplementation((table) => {
      if (table === 'Job_Posting') return createSingleMock(jobData);
      if (table === 'Employee') {
        return createSingleMock({ 
          data: { first_name: 'Alice', last_name: 'Smith', email: 'alice@example.com', phone_num: '123456789' }, 
          error: null 
        });
      }
      if (table === 'CVs') {
        return createSingleMock({ data: { file_name: 'alice_cv.pdf' }, error: null });
      }
      if (table === 'Applications') {
        return {
          insert: () => {
            insertCallStarted = true;
            return new Promise(() => {}); // Never resolves
          }
        };
      }
      return createSingleMock({ data: {}, error: null });
    });

    let rendered;
    await act(async () => {
      rendered = render(<ApplicationForm />);
    });

    // Wait for job details to load
    await waitFor(() => {
      expect(screen.getByText('UI Designer')).toBeInTheDocument();
    });

    // Toggle cover letter editor and fill form
    await act(async () => {
      fireEvent.click(screen.getByText(/Edit Cover Letter/i));
    });
    
    const coverLetterInput = screen.getByPlaceholderText(/Keep your cover letter concise/i);
    
    await act(async () => {
      fireEvent.change(coverLetterInput, { target: { value: 'This is my cover letter that fulfills the 20 character minimum.' } });
    });
    
    await act(async () => {
      fireEvent.click(screen.getByText(/Back to Form/i));
    });

    // Use profile CV
    await act(async () => {
      fireEvent.click(screen.getByText(/Attach Profile CV/i));
    });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Submit Application/i });
    
    await act(async () => {
      fireEvent.submit(submitButton.closest('form'));
      // Small delay to allow state to update
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    
    // Check that it shows submitting state
    expect(screen.getByText(/Submitting.../i)).toBeInTheDocument();
    
    rendered.unmount();
  });
});