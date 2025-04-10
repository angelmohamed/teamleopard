import React from 'react';
 import { render, screen, fireEvent, waitFor } from '@testing-library/react';
 import { act } from 'react';
 import CompanySignup from '../page';
 import { supabase } from '@/lib/supabaseClient';
 import { useRouter } from 'next/navigation';
 
 // Mock CSS imports
 jest.mock('../../../globals.css', () => ({}));
 
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
 
 describe('Company Signup Page', () => {
   const mockRouter = { push: jest.fn() };
   
   beforeEach(() => {
     jest.clearAllMocks();
     useRouter.mockReturnValue(mockRouter);
   });
 
   afterAll(() => {
     jest.useRealTimers();
   });
 
   test('renders company signup form correctly', async () => {
     await act(async () => {
       render(<CompanySignup />);
     });
 
     // Check if all form elements are rendered
     expect(screen.getByText('Register As Employer')).toBeInTheDocument();
     expect(screen.getByLabelText('Username')).toBeInTheDocument();
     expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
     expect(screen.getByLabelText('Company Name')).toBeInTheDocument();
     expect(screen.getByLabelText('Company Description')).toBeInTheDocument();
     expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
     expect(screen.getByLabelText('Password')).toBeInTheDocument();
     expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
     expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
     
     // Check for login link
     expect(screen.getByText('Already have an account?')).toBeInTheDocument();
     expect(screen.getByText('Log In')).toBeInTheDocument();
   });
 
   test('shows error when passwords do not match', async () => {
     await act(async () => {
       render(<CompanySignup />);
     });
 
     // Fill form with non-matching passwords
     fireEvent.change(screen.getByLabelText('Username'), {
       target: { value: 'companyuser' }
     });
     
     fireEvent.change(screen.getByLabelText('E-mail'), {
       target: { value: 'company@example.com' }
     });
     
     fireEvent.change(screen.getByLabelText('Company Name'), {
       target: { value: 'Test Company' }
     });
     
     fireEvent.change(screen.getByLabelText('Company Description'), {
       target: { value: 'A software company' }
     });
     
     fireEvent.change(screen.getByLabelText('Phone Number'), {
       target: { value: '+44 7423 489150' }
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
     
     // Verify that no API calls were made
     expect(supabase.auth.signUp).not.toHaveBeenCalled();
   });
 
   test('completes signup process successfully', async () => {
     // Mock the auth signup to succeed
     supabase.auth.signUp.mockResolvedValueOnce({
       data: { user: { id: 'new-company-id' } },
       error: null
     });
     
     // Mock the employer insertion to succeed
     supabase.from().insert.mockResolvedValueOnce({
       error: null
     });
     
     // Mock the notification insertion to succeed
     supabase.from().insert.mockResolvedValueOnce({
       error: null
     });
 
     await act(async () => {
       render(<CompanySignup />);
     });
 
     // Fill form with valid data
     fireEvent.change(screen.getByLabelText('Username'), {
       target: { value: 'companyuser' }
     });
     
     fireEvent.change(screen.getByLabelText('E-mail'), {
       target: { value: 'company@example.com' }
     });
     
     fireEvent.change(screen.getByLabelText('Company Name'), {
       target: { value: 'Test Company' }
     });
     
     fireEvent.change(screen.getByLabelText('Company Description'), {
       target: { value: 'A software company' }
     });
     
     fireEvent.change(screen.getByLabelText('Phone Number'), {
       target: { value: '+44 7423 489150' }
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
       expect(screen.getByText('Account created successfully!')).toBeInTheDocument();
     });
     
     // Verify auth signup was called with correct parameters
     expect(supabase.auth.signUp).toHaveBeenCalledWith({
       email: 'company@example.com',
       password: 'password123',
       options: { emailRedirectTo: 'http://localhost:3000/auth/callback' }
     });
     
     // Verify employer data was inserted correctly
     expect(supabase.from).toHaveBeenCalledWith('Employer');
     expect(supabase.from().insert).toHaveBeenCalledWith([
       {
         id: 'new-company-id',
         username: 'companyuser',
         email: 'company@example.com',
         company_name: 'Test Company',
         company_description: 'A software company',
         phone_num: '+44 7423 489150'
       }
     ]);
     
     // Verify notification was created
     expect(supabase.from).toHaveBeenCalledWith('Notifications');
   });
 
   test('handles Supabase auth error', async () => {
     // Mock the auth signup to fail
     supabase.auth.signUp.mockResolvedValueOnce({
       data: null,
       error: { message: 'Email already registered' }
     });
 
     await act(async () => {
       render(<CompanySignup />);
     });
 
     // Fill form with valid data
     fireEvent.change(screen.getByLabelText('Username'), {
       target: { value: 'companyuser' }
     });
     
     fireEvent.change(screen.getByLabelText('E-mail'), {
       target: { value: 'existing@example.com' }
     });
     
     fireEvent.change(screen.getByLabelText('Company Name'), {
       target: { value: 'Test Company' }
     });
     
     fireEvent.change(screen.getByLabelText('Company Description'), {
       target: { value: 'A software company' }
     });
     
     fireEvent.change(screen.getByLabelText('Phone Number'), {
       target: { value: '+44 7423 489150' }
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
       expect(screen.getByText('Email already registered')).toBeInTheDocument();
     });
     
     // Verify no data insertion was attempted
     expect(supabase.from().insert).not.toHaveBeenCalled();
   });
 
   test('handles Supabase employer insertion error', async () => {
     // Mock the auth signup to succeed
     supabase.auth.signUp.mockResolvedValueOnce({
       data: { user: { id: 'new-company-id' } },
       error: null
     });
     
     // Mock the employer insertion to fail
     supabase.from().insert.mockResolvedValueOnce({
       error: { message: 'Database constraint violation' }
     });
 
     await act(async () => {
       render(<CompanySignup />);
     });
 
     // Fill form with valid data
     fireEvent.change(screen.getByLabelText('Username'), {
       target: { value: 'companyuser' }
     });
     
     fireEvent.change(screen.getByLabelText('E-mail'), {
       target: { value: 'company@example.com' }
     });
     
     fireEvent.change(screen.getByLabelText('Company Name'), {
       target: { value: 'Test Company' }
     });
     
     fireEvent.change(screen.getByLabelText('Company Description'), {
       target: { value: 'A software company' }
     });
     
     fireEvent.change(screen.getByLabelText('Phone Number'), {
       target: { value: '+44 7423 489150' }
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
       expect(screen.getByText('Database constraint violation')).toBeInTheDocument();
     });
   });
 
   test('shows loading state during signup', async () => {
     // Create a promise that won't resolve immediately to show loading state
     let resolveAuthSignup;
     const authSignupPromise = new Promise(resolve => {
       resolveAuthSignup = resolve;
     });
     
     supabase.auth.signUp.mockReturnValueOnce(authSignupPromise);
 
     await act(async () => {
       render(<CompanySignup />);
     });
 
     // Fill form with valid data
     fireEvent.change(screen.getByLabelText('Username'), {
       target: { value: 'companyuser' }
     });
     
     fireEvent.change(screen.getByLabelText('E-mail'), {
       target: { value: 'company@example.com' }
     });
     
     fireEvent.change(screen.getByLabelText('Company Name'), {
       target: { value: 'Test Company' }
     });
     
     fireEvent.change(screen.getByLabelText('Company Description'), {
       target: { value: 'A software company' }
     });
     
     fireEvent.change(screen.getByLabelText('Phone Number'), {
       target: { value: '+44 7423 489150' }
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
         data: { user: { id: 'test-company-id' } },
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
       expect(screen.getByText('Account created successfully!')).toBeInTheDocument();
     });
   });
 
   test('handles case with null user ID', async () => {
     // Mock the auth signup to succeed but with no user ID
     supabase.auth.signUp.mockResolvedValueOnce({
       data: { user: null },
       error: null
     });
 
     await act(async () => {
       render(<CompanySignup />);
     });
 
     // Fill form with valid data
     fireEvent.change(screen.getByLabelText('Username'), {
       target: { value: 'companyuser' }
     });
     
     fireEvent.change(screen.getByLabelText('E-mail'), {
       target: { value: 'company@example.com' }
     });
     
     fireEvent.change(screen.getByLabelText('Password'), {
       target: { value: 'password123' }
     });
     
     fireEvent.change(screen.getByLabelText('Confirm Password'), {
       target: { value: 'password123' }
     });
 
     // Fill other required fields
     fireEvent.change(screen.getByLabelText('Company Name'), {
       target: { value: 'Test Company' }
     });
     
     fireEvent.change(screen.getByLabelText('Company Description'), {
       target: { value: 'A software company' }
     });
     
     fireEvent.change(screen.getByLabelText('Phone Number'), {
       target: { value: '+44 7423 489150' }
     });
 
     // Submit form
     await act(async () => {
       fireEvent.submit(screen.getByRole('button', { name: 'Sign Up' }));
     });
 
     await waitFor(() => {
       // Check for verification message
       expect(screen.getByText('Check your email to verify your account.')).toBeInTheDocument();
       expect(supabase.from).not.toHaveBeenCalled();
     });
   });
 });