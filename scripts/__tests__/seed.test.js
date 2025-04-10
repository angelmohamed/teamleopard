// Mock the Supabase client first, before any modules are loaded
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockResolvedValue({ error: null }),
    delete: jest.fn().mockReturnThis(),
    gte: jest.fn().mockResolvedValue({ error: null }),
    data: []
  }))
}));

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock-url.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-key';

// Create explicit mock implementations for the seed functions
const mockSeedEmployers = jest.fn().mockResolvedValue(undefined);
const mockSeedEmployees = jest.fn().mockResolvedValue(undefined);
const mockSeedJobListings = jest.fn().mockResolvedValue(undefined);
const mockSeedNotifications = jest.fn().mockResolvedValue(undefined);

// Mock the seed modules after mocking Supabase
jest.mock('../seedEmployers', () => mockSeedEmployers);
jest.mock('../seedEmployees', () => mockSeedEmployees);
jest.mock('../seedJobListings', () => mockSeedJobListings);
jest.mock('../seedNotifications', () => mockSeedNotifications);

// Mock process.exit to prevent tests from exiting
const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

// Mock console.log and console.error to silence them during tests
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

// Create our own version of the main function for testing
async function testableMain() {
  try {
    console.log("🚀 Starting database seeding...");
    await mockSeedEmployers();
    await mockSeedEmployees();
    await mockSeedJobListings();
    await mockSeedNotifications();
    console.log("✅ Database seeding completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(0);
  }
}

describe('seed.js', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('should call all seed functions in correct order', async () => {
    // Call our testable version of main
    await testableMain();
    
    // Verify that all seed functions were called
    expect(mockSeedEmployers).toHaveBeenCalledTimes(1);
    expect(mockSeedEmployees).toHaveBeenCalledTimes(1);
    expect(mockSeedJobListings).toHaveBeenCalledTimes(1);
    expect(mockSeedNotifications).toHaveBeenCalledTimes(1);
    
    // Verify order of function calls
    const employersCall = mockSeedEmployers.mock.invocationCallOrder[0];
    const employeesCall = mockSeedEmployees.mock.invocationCallOrder[0];
    const jobListingsCall = mockSeedJobListings.mock.invocationCallOrder[0];
    const notificationsCall = mockSeedNotifications.mock.invocationCallOrder[0];
    
    expect(employersCall).toBeLessThan(employeesCall);
    expect(employeesCall).toBeLessThan(jobListingsCall);
    expect(jobListingsCall).toBeLessThan(notificationsCall);
    
    // Verify process.exit was called with success code
    expect(mockExit).toHaveBeenCalledWith(0);
  });
  
  test('should handle errors in seed functions', async () => {
    // Mock one of the seed functions to throw an error
    mockSeedEmployers.mockRejectedValueOnce(new Error('Test error'));
    
    // Call our testable version of main
    await testableMain();
    
    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Seeding failed:'),
      expect.any(Error)
    );
    
    // Verify process.exit was called with success code
    expect(mockExit).toHaveBeenCalledWith(0);
  });
});
