import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import EmployeeSignup from '../page';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

// Mock CSS imports
jest.mock('../globals.css', () => ({}));

// Mock the Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the Supabase client
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    insert: jest.fn().mockReturnThis(),
  },
}));

// Mock location.origin
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost:3000'
  },
  writable: true
});

// Enable fake timers
jest.useFakeTimers();

describe('Employee Signup Page', () => {
  const mockRouter = { push: jest.fn() };
  
  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue(mockRouter);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('renders signup form correctly', async () => {
    await act(async () => {
      render(<EmployeeSignup />);
    });

    // Check if all form elements are rendered
    expect(screen.getByText('Employee Sign Up')).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
    expect(screen.getByLabelText('Bio')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
    
    // Check for login link
    expect(screen.getByText('Already have an account?')).toBeInTheDocument();
    expect(screen.getByText('Log In')).toBeInTheDocument();
  });

  test('shows error when passwords do not match', async () => {
    await act(async () => {
      render(<EmployeeSignup />);
    });

    // Fill form with non-matching passwords
    fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'testuser' }
    });
    
    fireEvent.change(screen.getByLabelText('First Name'), {
      target: { value: 'John' }
    });
    
    fireEvent.change(screen.getByLabelText('Last Name'), {
      target: { value: 'Doe' }
    });
    
    fireEvent.change(screen.getByLabelText('Phone Number'), {
      target: { value: '123-456-7890' }
    });
    
    fireEvent.change(screen.getByLabelText('Bio'), {
      target: { value: 'Test bio' }
    });
    
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });
    
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'password456' } // Different password
    });

    // Submit form
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: 'Sign Up' }));
    });

    // Check for error message
    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    
    // Supabase checks shouldn't be called for password mismatch
    expect(supabase.auth.signUp).not.toHaveBeenCalled();
  });

  test('shows error when email already exists', async () => {
    // Mock the email check to return an existing user
    supabase.from().select().eq().single.mockResolvedValueOnce({
      data: { id: 'existing-user-id' },
      error: null
    });

    await act(async () => {
      render(<EmployeeSignup />);
    });

    // Fill form with valid data
    fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: 'existing@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'existinguser' }
    });
    
    fireEvent.change(screen.getByLabelText('First Name'), {
      target: { value: 'Existing' }
    });
    
    fireEvent.change(screen.getByLabelText('Last Name'), {
      target: { value: 'User' }
    });
    
    fireEvent.change(screen.getByLabelText('Phone Number'), {
      target: { value: '123-456-7890' }
    });
    
    fireEvent.change(screen.getByLabelText('Bio'), {
      target: { value: 'Existing user bio' }
    });
    
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });
    
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'password123' }
    });

    // Submit form
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: 'Sign Up' }));
    });

    // Check for error message
    expect(screen.getByText('Email is already registered. Try logging in.')).toBeInTheDocument();
    
    // Verify that no auth signup was attempted
    expect(supabase.auth.signUp).not.toHaveBeenCalled();
  });

  test('completes signup process successfully', async () => {
    // Mock the email check to return no existing user
    supabase.from().select().eq().single.mockResolvedValueOnce({
      data: null,
      error: { message: 'No user found' }
    });
    
    // Mock the auth signup to succeed
    supabase.auth.signUp.mockResolvedValueOnce({
      data: { user: { id: 'new-user-id' } },
      error: null
    });
    
    // Mock the employee insertion to succeed
    supabase.from().insert.mockResolvedValueOnce({
      error: null
    });
    
    // Mock the notification insertion to succeed
    supabase.from().insert.mockResolvedValueOnce({
      error: null
    });

    await act(async () => {
      render(<EmployeeSignup />);
    });

    // Fill form with valid data
    fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: 'new@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'newuser' }
    });
    
    fireEvent.change(screen.getByLabelText('First Name'), {
      target: { value: 'New' }
    });
    
    fireEvent.change(screen.getByLabelText('Last Name'), {
      target: { value: 'User' }
    });
    
    fireEvent.change(screen.getByLabelText('Phone Number'), {
      target: { value: '123-456-7890' }
    });
    
    fireEvent.change(screen.getByLabelText('Bio'), {
      target: { value: 'New user bio' }
    });
    
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });
    
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'password123' }
    });

    // Submit form
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: 'Sign Up' }));
    });

    await waitFor(() => {
      // Check for success message
      expect(screen.getByText('Account created successfully! Please log in.')).toBeInTheDocument();
    });
    
    // Verify auth signup was called with correct parameters
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'password123',
      options: { emailRedirectTo: 'http://localhost:3000/auth/callback' }
    });
    
    // Verify employee data was inserted correctly
    expect(supabase.from).toHaveBeenCalledWith('Employee');
    expect(supabase.from().insert).toHaveBeenCalledWith([
      {
        id: 'new-user-id',
        email: 'new@example.com',
        username: 'newuser',
        first_name: 'New',
        last_name: 'User',
        phone_num: '123-456-7890',
        bio: 'New user bio'
      }
    ]);
    
    // Verify notification was created
    expect(supabase.from).toHaveBeenCalledWith('Notifications');
    
    // Fast-forward timer to check redirect
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    expect(mockRouter.push).toHaveBeenCalledWith('/login');
  });

  test('handles Supabase auth error', async () => {
    // Mock the email check to return no existing user
    supabase.from().select().eq().single.mockResolvedValueOnce({
      data: null,
      error: { message: 'No user found' }
    });
    
    // Mock the auth signup to fail
    supabase.auth.signUp.mockResolvedValueOnce({
      data: null,
      error: { message: 'Auth error occurred' }
    });

    await act(async () => {
      render(<EmployeeSignup />);
    });

    // Fill form with valid data
    fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'testuser' }
    });
    
    fireEvent.change(screen.getByLabelText('First Name'), {
      target: { value: 'Test' }
    });
    
    fireEvent.change(screen.getByLabelText('Last Name'), {
      target: { value: 'User' }
    });
    
    fireEvent.change(screen.getByLabelText('Phone Number'), {
      target: { value: '123-456-7890' }
    });
    
    fireEvent.change(screen.getByLabelText('Bio'), {
      target: { value: 'Test user bio' }
    });
    
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });
    
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'password123' }
    });

    // Submit form
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: 'Sign Up' }));
    });

    await waitFor(() => {
      // Check for error message
      expect(screen.getByText('Auth error occurred')).toBeInTheDocument();
    });
  });

  test('shows loading state during signup', async () => {
    // Mock the email check to return no existing user
    supabase.from().select().eq().single.mockResolvedValueOnce({
      data: null,
      error: { message: 'No user found' }
    });
    
    // Create a promise that won't resolve immediately to show loading state
    let resolveAuthSignup;
    const authSignupPromise = new Promise(resolve => {
      resolveAuthSignup = resolve;
    });
    
    supabase.auth.signUp.mockReturnValueOnce(authSignupPromise);

    await act(async () => {
      render(<EmployeeSignup />);
    });

    // Fill form with valid data
    fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'testuser' }
    });
    
    fireEvent.change(screen.getByLabelText('First Name'), {
      target: { value: 'Test' }
    });
    
    fireEvent.change(screen.getByLabelText('Last Name'), {
      target: { value: 'User' }
    });
    
    fireEvent.change(screen.getByLabelText('Phone Number'), {
      target: { value: '123-456-7890' }
    });
    
    fireEvent.change(screen.getByLabelText('Bio'), {
      target: { value: 'Test user bio' }
    });
    
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });
    
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'password123' }
    });

    // Submit form but don't resolve auth signup yet
    fireEvent.submit(screen.getByRole('button', { name: 'Sign Up' }));

    // Check loading state
    expect(screen.getByRole('button', { name: 'Signing Up...' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Signing Up...' })).toBeDisabled();

    // Now resolve auth signup
    await act(async () => {
      resolveAuthSignup({
        data: { user: { id: 'test-user-id' } },
        error: null
      });
    });
    
    // Mock the remaining database operations
    supabase.from().insert.mockResolvedValueOnce({
      error: null
    });
    
    supabase.from().insert.mockResolvedValueOnce({
      error: null
    });

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Signing Up...' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
    });
  });
});