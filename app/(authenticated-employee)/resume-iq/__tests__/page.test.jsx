import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResumeAnalysis from '../page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }) => <a href={href}>{children}</a>;
});

// Mock supabase client
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: {
              username: 'testuser',
              first_name: 'Test',
              last_name: 'User',
              email: 'test@example.com',
              phone_num: '1234567890',
              bio: 'Test bio'
            },
            error: null
          })),
          neq: jest.fn(() => ({
            maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null }))
          }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null }))
      })),
      upsert: jest.fn(() => Promise.resolve({ error: null }))
    })),
    storage: {
      from: jest.fn(() => ({
        createSignedUrl: jest.fn(() => Promise.resolve({ 
          data: { signedUrl: 'https://example.com/cv.pdf' }, 
          error: null 
        })),
        upload: jest.fn(() => Promise.resolve({ error: null }))
      }))
    }
  }
}));

// Mock auth context
const mockAuthContext = {
  user: { id: 'user-123' },
  loading: false
};

// Fix layout mock path - using ../../layout instead of ../layout
jest.mock('../../layout', () => ({
  useAuth: jest.fn(() => mockAuthContext)
}));

// Mock UI components to simplify testing
jest.mock('@/components/ui/card', () => ({
  Card: ({ children }) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }) => <div data-testid="card-title">{children}</div>,
  CardContent: ({ children }) => <div data-testid="card-content">{children}</div>,
}));

jest.mock('@/components/ui/input', () => ({
  Input: (props) => <input data-testid={props.id || "input"} {...props} />,
}));

jest.mock('@/components/ui/button', () => ({
  Button: (props) => <button data-testid="button" {...props}>{props.children}</button>,
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }) => <label data-testid={`label-${htmlFor}`} htmlFor={htmlFor}>{children}</label>,
}));

jest.mock('lucide-react', () => ({
  ArrowLeft: () => <span data-testid="arrow-left-icon">Arrow</span>,
  FileText: () => <span data-testid="file-text-icon">File</span>,
  User: () => <span data-testid="user-icon">User</span>,
  Mail: () => <span data-testid="mail-icon">Mail</span>,
  Phone: () => <span data-testid="phone-icon">Phone</span>,
  Info: () => <span data-testid="info-icon">Info</span>,
}));

describe('ResumeAnalysis Component', () => {
  // Authentication state tests
  test('shows loading state when auth is checking', () => {
    // Fix path in require statement as well
    require('../../layout').useAuth.mockReturnValueOnce({
      user: null,
      loading: true
    });
    render(<ResumeAnalysis />);
    expect(screen.getByText('Checking authentication...')).toBeInTheDocument();
  });

  test('shows unauthenticated message when user is not logged in', () => {
    // Fix path in require statement as well
    require('../../layout').useAuth.mockReturnValueOnce({
      user: null,
      loading: false
    });
    render(<ResumeAnalysis />);
    expect(screen.getByText('You must be logged in to edit your profile.')).toBeInTheDocument();
  });

  // The rest of the tests remain unchanged
  test('renders profile form for authenticated users', async () => {
    render(<ResumeAnalysis />);
    
    await waitFor(() => {
      // Card titles
      expect(screen.getByText('Edit Your Profile')).toBeInTheDocument();
      expect(screen.getByText('Upload Your CV')).toBeInTheDocument();
      
      // Form fields
      expect(screen.getByTestId('username')).toBeInTheDocument();
      expect(screen.getByTestId('firstName')).toBeInTheDocument();
      expect(screen.getByTestId('lastName')).toBeInTheDocument();
      expect(screen.getByTestId('email')).toBeInTheDocument();
      expect(screen.getByTestId('phone')).toBeInTheDocument();
      expect(screen.getByTestId('bio')).toBeInTheDocument();
    });
  });

  test('allows form submission and shows success message', async () => {
    const user = userEvent.setup();
    render(<ResumeAnalysis />);
    
    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByTestId('username')).toBeInTheDocument();
    });
    
    // Submit the form
    await user.click(screen.getByText('Save Changes'));
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
    });
  });
  
  test('displays CV upload area', async () => {
    render(<ResumeAnalysis />);
    
    await waitFor(() => {
      expect(screen.getByText('Drag & drop your CV or click to upload')).toBeInTheDocument();
    });
  });
  
  test('back to dashboard link is present', async () => {
    render(<ResumeAnalysis />);
    
    const backLink = screen.getByText('Back to Dashboard');
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest('a')).toHaveAttribute('href', '/dashboard');
  });
});