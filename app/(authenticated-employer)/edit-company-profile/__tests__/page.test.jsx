import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import EditCompanyProfile from '../page.js';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

// Mock the Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the Supabase client
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  },
}));

describe('EditCompanyProfile', () => {
  const mockRouter = { replace: jest.fn(), push: jest.fn() };
  
  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue(mockRouter);
  });

  test('renders loading state initially', async () => {
    // Mock authenticated user
    supabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'test-employer-id' } },
      error: null,
    });
    
    // Delay the supabase profile response to show loading state
    let resolveProfile;
    const profilePromise = new Promise(resolve => {
      resolveProfile = resolve;
    });
    
    supabase.single.mockReturnValue(profilePromise);
    
    // Render the component
    await act(async () => {
      render(<EditCompanyProfile />);
    });

    // Verify loading state is shown
    expect(screen.getByText('Loading profile data...')).toBeInTheDocument();
    
    // Resolve the promise with mock data
    await act(async () => {
      resolveProfile({
        data: {
          username: 'testuser',
          email: 'test@example.com',
          company_name: 'Test Company',
          company_description: 'A test company',
          phone_num: '123-456-7890',
        },
        error: null,
      });
    });
  });

  test('redirects to login if not authenticated', async () => {
    // Mock unauthenticated user
    supabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Not authenticated' },
    });
    
    // Render the component
    await act(async () => {
      render(<EditCompanyProfile />);
    });

    // Verify redirect to login page
    expect(mockRouter.replace).toHaveBeenCalledWith('/login');
  });

  test('renders form with profile data correctly', async () => {
    // Mock authenticated user
    supabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'test-employer-id' } },
      error: null,
    });
    
    // Mock profile data
    const mockProfileData = {
      username: 'testuser',
      email: 'test@example.com',
      company_name: 'Test Company',
      company_description: 'A test company',
      phone_num: '123-456-7890',
    };
    
    supabase.single.mockResolvedValueOnce({
      data: mockProfileData,
      error: null,
    });
    
    // Render the component
    await act(async () => {
      render(<EditCompanyProfile />);
    });

    // Verify form title
    expect(screen.getByText('Edit Your Company Profile')).toBeInTheDocument();
    
    // Verify form fields are populated with profile data
    expect(screen.getByLabelText(/Username/i)).toHaveValue('testuser');
    expect(screen.getByLabelText(/Email/i)).toHaveValue('test@example.com');
    expect(screen.getByLabelText(/Company Name/i)).toHaveValue('Test Company');
    expect(screen.getByLabelText(/Company Description/i)).toHaveValue('A test company');
    expect(screen.getByLabelText(/Phone Number/i)).toHaveValue('123-456-7890');
    
    // Verify submit button
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
  });

  test('handles error when loading profile data', async () => {
    // Mock console.error to prevent actual logging during tests
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // Mock authenticated user
    supabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'test-employer-id' } },
      error: null,
    });
    
    // Mock profile data with error
    supabase.single.mockResolvedValueOnce({
      data: null,
      error: { message: 'Error loading employer profile' },
    });
    
    // Render the component
    await act(async () => {
      render(<EditCompanyProfile />);
    });

    // Verify error message is shown
    expect(screen.getByText('Failed to load profile data.')).toBeInTheDocument();
    
    // Verify console.error was called
    expect(console.error).toHaveBeenCalledWith(
      'Error loading employer profile:',
      { message: 'Error loading employer profile' }
    );
    
    // Restore original console.error
    console.error = originalConsoleError;
  });

  test('handles successful form submission', async () => {
    // Mock authenticated user for initial load
    supabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'test-employer-id' } },
      error: null,
    });
    
    // Mock profile data
    supabase.single.mockResolvedValueOnce({
      data: {
        username: 'testuser',
        email: 'test@example.com',
        company_name: 'Test Company',
        company_description: 'A test company',
        phone_num: '123-456-7890',
      },
      error: null,
    });
    
    // Render the component
    await act(async () => {
      render(<EditCompanyProfile />);
    });
    
    // Mock authenticated user for form submission
    supabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'test-employer-id' } },
      error: null,
    });
    
    // Mock successful profile update
    supabase.eq.mockResolvedValueOnce({
      error: null,
    });
    
    // Update form fields
    fireEvent.change(screen.getByLabelText(/Company Name/i), { 
      target: { value: 'Updated Company Name' } 
    });
    
    fireEvent.change(screen.getByLabelText(/Company Description/i), { 
      target: { value: 'Updated company description' } 
    });
    
    // Submit the form
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: 'Save Changes' }));
    });
    
    // Verify success message
    expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
    
    // Verify correct data was sent to Supabase
    expect(supabase.from).toHaveBeenCalledWith('Employer');
    expect(supabase.update).toHaveBeenCalledWith({
      username: 'testuser',
      email: 'test@example.com',
      company_name: 'Updated Company Name',
      company_description: 'Updated company description',
      phone_num: '123-456-7890',
    });
    expect(supabase.eq).toHaveBeenCalledWith('id', 'test-employer-id');
  });

  test('handles error during form submission', async () => {
    // Mock authenticated user for initial load
    supabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'test-employer-id' } },
      error: null,
    });
    
    // Mock profile data
    supabase.single.mockResolvedValueOnce({
      data: {
        username: 'testuser',
        email: 'test@example.com',
        company_name: 'Test Company',
        company_description: 'A test company',
        phone_num: '123-456-7890',
      },
      error: null,
    });
    
    // Render the component
    await act(async () => {
      render(<EditCompanyProfile />);
    });
    
    // Mock authenticated user for form submission
    supabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'test-employer-id' } },
      error: null,
    });
    
    // Mock failed profile update
    supabase.eq.mockResolvedValueOnce({
      error: { message: 'Database error' },
    });
    
    // Submit the form without changes
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: 'Save Changes' }));
    });
    
    // Verify error message
    expect(screen.getByText('Failed to update profile.')).toBeInTheDocument();
  });

  test('shows submitting state during form submission', async () => {
    // Mock authenticated user for initial load
    supabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'test-employer-id' } },
      error: null,
    });
    
    // Mock profile data
    supabase.single.mockResolvedValueOnce({
      data: {
        username: 'testuser',
        email: 'test@example.com',
        company_name: 'Test Company',
        company_description: 'A test company',
        phone_num: '123-456-7890',
      },
      error: null,
    });
    
    // Render the component
    await act(async () => {
      render(<EditCompanyProfile />);
    });
    
    // Mock authenticated user for form submission
    supabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'test-employer-id' } },
      error: null,
    });
    
    // Delay the update response to show submitting state
    let resolveUpdate;
    const updatePromise = new Promise(resolve => {
      resolveUpdate = resolve;
    });
    
    supabase.eq.mockReturnValue(updatePromise);
    
    // Submit the form
    fireEvent.submit(screen.getByRole('button', { name: 'Save Changes' }));
    
    // Verify submitting state
    expect(screen.getByRole('button', { name: 'Saving...' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
    
    // Resolve the promise
    await act(async () => {
      resolveUpdate({ error: null });
    });
    
    // Verify button returns to normal state
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Changes' })).not.toBeDisabled();
  });
});
