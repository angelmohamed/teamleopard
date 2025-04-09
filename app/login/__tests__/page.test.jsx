import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react'; // Fixed: import act from react instead of react-dom/test-utils
import Login from '../page';
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
      signInWithPassword: jest.fn(),
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  },
}));

// Mock fetch for CAPTCHA API
global.fetch = jest.fn();

// Mock sessionStorage
const mockSessionStorage = {};
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: jest.fn((key) => mockSessionStorage[key] || null),
    setItem: jest.fn((key, value) => {
      mockSessionStorage[key] = value;
    }),
    removeItem: jest.fn((key) => delete mockSessionStorage[key]),
    clear: jest.fn(() => Object.keys(mockSessionStorage).forEach(key => delete mockSessionStorage[key])),
  },
  writable: true
});

describe('Login Page', () => {
  const mockRouter = { push: jest.fn() };
  const mockCaptchaResponse = {
    svg: '<svg>mock captcha</svg>',
    text: 'captcha123'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue(mockRouter);
    
    // Mock CAPTCHA API response
    fetch.mockResolvedValue({
      json: () => Promise.resolve(mockCaptchaResponse)
    });
  });

  test('renders login form correctly', async () => {
    await act(async () => {
      render(<Login />);
    });

    // Check if all form elements are rendered
    expect(screen.getByText('Log In')).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter CAPTCHA')).toBeInTheDocument();
    expect(screen.getByText('Refresh CAPTCHA')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    
    // Check for sign-up links
    expect(screen.getByText('Don\'t have an account?')).toBeInTheDocument();
    expect(screen.getByText('Sign Up as Employee')).toBeInTheDocument();
    expect(screen.getByText('Sign Up as Employer')).toBeInTheDocument();
  });

  test('loads CAPTCHA on initial render', async () => {
    await act(async () => {
      render(<Login />);
    });

    expect(fetch).toHaveBeenCalledWith('/api/captcha');
    expect(document.body.innerHTML).toContain('mock captcha');
  });

  test('refreshes CAPTCHA when button is clicked', async () => {
    await act(async () => {
      render(<Login />);
    });

    fetch.mockClear();
    
    await act(async () => {
      fireEvent.click(screen.getByText('Refresh CAPTCHA'));
    });

    expect(fetch).toHaveBeenCalledWith('/api/captcha');
  });

  test('shows error when CAPTCHA is incorrect', async () => {
    await act(async () => {
      render(<Login />);
    });

    // Fill form with valid data but incorrect CAPTCHA
    fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Enter CAPTCHA'), {
      target: { value: 'wrong-captcha' }
    });

    // Submit form
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: 'Login' }));
    });

    expect(screen.getByText('Incorrect CAPTCHA. Please try again.')).toBeInTheDocument();
    expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  test('handles Employee login correctly', async () => {
    // Mock successful authentication
    supabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: { id: 'test-user-id' } },
      error: null
    });

    // Mock employee check
    supabase.from().select().eq().single.mockResolvedValueOnce({
      data: { id: 'test-user-id', name: 'Test Employee' },
      error: null
    });

    // Mock employer check
    supabase.from().select().eq().single.mockResolvedValueOnce({
      data: null,
      error: { message: 'Record not found' }
    });

    await act(async () => {
      render(<Login />);
    });

    // Fill form with correct data
    fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: 'employee@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Enter CAPTCHA'), {
      target: { value: 'captcha123' }
    });

    // Submit form
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: 'Login' }));
    });

    await waitFor(() => {
      // Verify Supabase was called correctly
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'employee@example.com',
        password: 'password123'
      });
      
      // Verify user info was stored in session
      expect(window.sessionStorage.setItem).toHaveBeenCalledWith('userId', 'test-user-id');
      expect(window.sessionStorage.setItem).toHaveBeenCalledWith('role', 'Employee');
      
      // Verify correct redirect
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/');
    });
  });

  test('handles Employer login correctly', async () => {
    // Mock successful authentication
    supabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: { id: 'employer-id' } },
      error: null
    });

    // Mock employee check (not found)
    supabase.from().select().eq().single.mockResolvedValueOnce({
      data: null,
      error: { message: 'Record not found' }
    });

    // Mock employer check (found)
    supabase.from().select().eq().single.mockResolvedValueOnce({
      data: { id: 'employer-id', company_name: 'Test Company' },
      error: null
    });

    await act(async () => {
      render(<Login />);
    });

    // Fill form with correct data
    fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: 'employer@company.com' }
    });
    
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'company123' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Enter CAPTCHA'), {
      target: { value: 'captcha123' }
    });

    // Submit form
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: 'Login' }));
    });

    await waitFor(() => {
      // Verify user info was stored in session
      expect(window.sessionStorage.setItem).toHaveBeenCalledWith('userId', 'employer-id');
      expect(window.sessionStorage.setItem).toHaveBeenCalledWith('role', 'Employer');
      
      // Verify correct redirect
      expect(mockRouter.push).toHaveBeenCalledWith('/company-dashboard/employer-id');
    });
  });

  test('handles authentication error', async () => {
    // Mock authentication failure
    supabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: null,
      error: { message: 'Invalid login credentials' }
    });

    await act(async () => {
      render(<Login />);
    });

    // Fill form
    fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: 'wrong@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrongpassword' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Enter CAPTCHA'), {
      target: { value: 'captcha123' }
    });

    // Submit form
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: 'Login' }));
    });

    await waitFor(() => {
      expect(screen.getByText('Invalid login credentials')).toBeInTheDocument();
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });

  test('handles user profile not found error', async () => {
    // Mock successful authentication but no profile found
    supabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: { id: 'no-profile-id' } },
      error: null
    });

    // Mock both employee and employer checks returning null
    supabase.from().select().eq().single.mockResolvedValueOnce({
      data: null,
      error: { message: 'Record not found' }
    });
    
    supabase.from().select().eq().single.mockResolvedValueOnce({
      data: null,
      error: { message: 'Record not found' }
    });

    await act(async () => {
      render(<Login />);
    });

    // Fill and submit form
    fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: 'noprofile@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Enter CAPTCHA'), {
      target: { value: 'captcha123' }
    });

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: 'Login' }));
    });

    await waitFor(() => {
      expect(screen.getByText('User profile not found.')).toBeInTheDocument();
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });

  test('shows loading state during login', async () => {
    // Delay the resolution of the auth promise to show loading state
    let resolveAuth;
    const authPromise = new Promise(resolve => {
      resolveAuth = resolve;
    });
    
    supabase.auth.signInWithPassword.mockReturnValueOnce(authPromise);

    await act(async () => {
      render(<Login />);
    });

    // Fill form
    fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Enter CAPTCHA'), {
      target: { value: 'captcha123' }
    });

    // Start submit but don't resolve auth yet
    fireEvent.submit(screen.getByRole('button', { name: 'Login' }));

    // Check loading state
    expect(screen.getByRole('button', { name: 'Logging in...' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Logging in...' })).toBeDisabled();

    // Now resolve auth
    await act(async () => {
      resolveAuth({
        data: { user: { id: 'test-id' } },
        error: null
      });
    });

    // Complete the test by mocking the profile checks
    supabase.from().select().eq().single.mockResolvedValueOnce({
      data: { id: 'test-id' },
      error: null
    });
    
    supabase.from().select().eq().single.mockResolvedValueOnce({
      data: null,
      error: { message: 'Not found' }
    });

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Logging in...' })).not.toBeInTheDocument();
    });
  });
});