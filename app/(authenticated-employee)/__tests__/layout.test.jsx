import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RootLayout, { useAuth } from '../layout';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    single: jest.fn(),
  },
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => <img {...props} />,
}));

jest.mock('lucide-react', () => ({
  Bell: () => <div data-testid="bell-icon">Bell Icon</div>,
  User: () => <div data-testid="user-icon">User Icon</div>,
  LogOut: () => <div>Logout Icon</div>,
  LayoutDashboard: () => <div data-testid="dashboard-icon">Dashboard Icon</div>,
  MoveLeft: () => <div>Move Left</div>,
  MoveRight: () => <div>Move Right</div>,
}));

jest.mock('../notification', () => ({
  __esModule: true,
  default: ({ initNotification, onUpdateNotification }) => (
    <div data-testid="notification-card">
      Notification: {initNotification?.message || 'No message'}
      <button onClick={() => onUpdateNotification({...initNotification, read: true})}>
        Mark as read
      </button>
    </div>
  ),
}));

const mockRouter = {
  replace: jest.fn(),
};

const mockUseRouter = jest.requireMock('next/navigation').useRouter;
const mockUsePathname = jest.requireMock('next/navigation').usePathname;
const mockSupabase = jest.requireMock('@/lib/supabaseClient').supabase;

describe('RootLayout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter);
    mockUsePathname.mockReturnValue('/dashboard');
    
    // Default authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id', email: 'test@example.com' } },
      error: null,
    });
    
    // Default empty notifications
    mockSupabase.from().select().eq().eq().order.mockResolvedValue({
      data: [
        { 
          id: 1, 
          employee_receiver_id: 'test-user-id', 
          message: 'Test notification', 
          read: false,
          hidden: false,
          created_at: new Date().toISOString()
        }
      ],
      error: null,
    });
    
    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: null,
      error: { message: 'No employer found' },
    });
  });

  test('redirects to login when no user is found', async () => {
    // Mock no authenticated user
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Not authenticated' },
    });

    render(
      <RootLayout>
        <div>Test Child</div>
      </RootLayout>
    );

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/login');
    });
  });

  test('redirects employer users to company dashboard', async () => {
    // Mock employer user
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'employer-id' } },
      error: null,
    });
    
    mockSupabase.from().select().eq().single.mockResolvedValueOnce({
      data: { id: 'employer-id' },
      error: null,
    });

    const { useAuth: useAuthHook } = jest.requireActual('../layout');
    
    const TestComponent = () => {
      useAuthHook();
      return <div>Test</div>;
    };
    
    render(<TestComponent />);

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/company-dashboard/employer-id');
    });
  });

  test('renders navigation bar with correct elements', async () => {
    render(
      <RootLayout>
        <div>Test Child Content</div>
      </RootLayout>
    );

    await waitFor(() => {
      expect(screen.getByAltText('Company Logo')).toBeInTheDocument();
      expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-icon')).toBeInTheDocument();
      expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    });
  });

  test('handles logout correctly', async () => {
    mockSupabase.auth.signOut.mockResolvedValueOnce({});

    render(
      <RootLayout>
        <div>Test Child</div>
      </RootLayout>
    );

    await waitFor(() => {
      const userIcon = screen.getByTestId('user-icon');
      fireEvent.click(userIcon);
    });

    const logoutButton = await screen.findByText('Log Out');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      expect(mockRouter.replace).toHaveBeenCalledWith('/login');
    });
  });

  test('displays notification and handles marking as read', async () => {
    // Mock notifications
    mockSupabase.from().select().eq().eq().order.mockResolvedValue({
      data: [
        {
          id: 1,
          employee_receiver_id: 'test-user-id',
          message: 'Test notification 1',
          read: false,
          hidden: false,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          employee_receiver_id: 'test-user-id',
          message: 'Test notification 2',
          read: false,
          hidden: false,
          created_at: new Date().toISOString()
        }
      ],
      error: null,
    });

    render(
      <RootLayout>
        <div>Test Child</div>
      </RootLayout>
    );

    // Wait for notifications to load
    await waitFor(() => {
      const bellIcon = screen.getByTestId('bell-icon');
      fireEvent.click(bellIcon);
    });

    // Check if notifications appear
    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getAllByTestId('notification-card').length).toBeGreaterThan(0);
    });

    // Test mark all as read
    const markAllButton = await screen.findByText('Mark all as read');
    fireEvent.click(markAllButton);

    await waitFor(() => {
      expect(mockSupabase.from().update).toHaveBeenCalled();
    });
  });
});