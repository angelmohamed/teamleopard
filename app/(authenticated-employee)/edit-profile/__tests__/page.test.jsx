import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditProfile from '../page';
import { useAuth } from '../../layout';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

// Mock the dependencies
jest.mock('next/navigation', () => ({
    useRouter: jest.fn()
}));

jest.mock('../../layout', () => ({
    useAuth: jest.fn()
}));

jest.mock('@/lib/supabaseClient', () => ({
    supabase: {
        from: jest.fn(() => ({
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    single: jest.fn(),
                    neq: jest.fn(() => ({
                        maybeSingle: jest.fn()
                    })),
                    update: jest.fn()
                }))
            })),
            update: jest.fn(() => ({
                eq: jest.fn()
            })),
            upsert: jest.fn()
        })),
        storage: {
            from: jest.fn(() => ({
                upload: jest.fn().mockResolvedValue({ data: { path: 'some/path' }, error: null }),
                createSignedUrl: jest.fn().mockResolvedValue({ data: { signedUrl: 'https://example.com/cv.pdf' }, error: null })
            }))
        }
    }
}));

describe('EditProfile Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useRouter.mockReturnValue({ push: jest.fn() });
    });

    test('shows loading state when authentication is being checked', () => {
        useAuth.mockReturnValue({ user: null, loading: true });
        
        render(<EditProfile />);
        
        expect(screen.getByText('Checking authentication...')).toBeInTheDocument();
    });

    test('shows authentication required message when user is not authenticated', () => {
        useAuth.mockReturnValue({ user: null, loading: false });
        
        render(<EditProfile />);
        
        expect(screen.getByText('You must be logged in to edit your profile.')).toBeInTheDocument();
    });

    test('renders the form with user data when authenticated', async () => {
        const mockUser = { id: 'user123' };
        const mockProfileData = {
            username: 'testuser',
            first_name: 'Test',
            last_name: 'User',
            email: 'test@example.com',
            phone_num: '1234567890',
            bio: 'Test bio'
        };

        useAuth.mockReturnValue({ user: mockUser, loading: false });
        
        const selectMock = jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockProfileData, error: null }),
                neq: jest.fn().mockReturnValue({
                    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null })
                })
            })
        });
        
        supabase.from.mockReturnValue({
            select: selectMock,
            update: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ error: null })
            })
        });

        render(<EditProfile />);
        
        // Wait for the component to load user data
        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalledWith('Employee');
            expect(selectMock).toHaveBeenCalledWith('*');
        });
        
        // Verify form inputs are rendered
        expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Bio/i)).toBeInTheDocument();
    });

    test('updates form values when input changes', async () => {
        const mockUser = { id: 'user123' };
        const mockProfileData = {
            username: 'testuser',
            first_name: 'Test',
            last_name: 'User',
            email: 'test@example.com',
            phone_num: '1234567890',
            bio: 'Test bio'
        };

        useAuth.mockReturnValue({ user: mockUser, loading: false });
        
        const selectMock = jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockProfileData, error: null }),
                neq: jest.fn().mockReturnValue({
                    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null })
                })
            })
        });
        
        supabase.from.mockReturnValue({
            select: selectMock,
            update: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ error: null })
            })
        });

        render(<EditProfile />);
        
        // Wait for the form to be populated
        await waitFor(() => {
            expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
        });

        // Update form fields
        const usernameInput = screen.getByLabelText(/Username/i);
        fireEvent.change(usernameInput, { target: { value: 'newusername' } });
        expect(usernameInput.value).toBe('newusername');
        
        const firstNameInput = screen.getByLabelText(/First Name/i);
        fireEvent.change(firstNameInput, { target: { value: 'New' } });
        expect(firstNameInput.value).toBe('New');
        
        const bioInput = screen.getByLabelText(/Bio/i);
        fireEvent.change(bioInput, { target: { value: 'Updated bio' } });
        expect(bioInput.value).toBe('Updated bio');
    });

    test('submits form and shows success message', async () => {
        const mockUser = { id: 'user123' };
        const mockProfileData = {
            username: 'testuser',
            first_name: 'Test',
            last_name: 'User',
            email: 'test@example.com',
            phone_num: '1234567890',
            bio: 'Test bio'
        };

        useAuth.mockReturnValue({ user: mockUser, loading: false });
        
        const selectMock = jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockProfileData, error: null }),
                neq: jest.fn().mockReturnValue({
                    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null })
                })
            })
        });
        
        const updateMock = jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null })
        });
        
        supabase.from.mockImplementation((table) => {
            if (table === 'Employee') {
                return {
                    select: selectMock,
                    update: updateMock
                };
            }
            return {
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({ data: null, error: null })
                    })
                })
            };
        });

        render(<EditProfile />);
        
        // Wait for the form to be populated
        await waitFor(() => {
            expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
        });

        // Submit the form
        const submitButton = screen.getByText(/Save Changes/i);
        fireEvent.click(submitButton);
        
        // Wait for the success message
        await waitFor(() => {
            expect(screen.getByText(/Profile updated successfully!/i)).toBeInTheDocument();
        });
        
        // Verify the form was submitted with the correct data
        expect(updateMock).toHaveBeenCalled();
        expect(updateMock().eq).toHaveBeenCalledWith('id', mockUser.id);
    });
});