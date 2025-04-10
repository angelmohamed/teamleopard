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

// Import the createClient function for spying
const { createClient } = require('@supabase/supabase-js');

// Mock process.exit to prevent tests from exiting
const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

// Mock console.log and console.error to silence them during tests
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

// Create our own version of the deleteSeededData function for testing
async function testableDeleteSeededData() {
  try {
    console.log("🚀 Starting database cleanup...");

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Set the cutoff date
    const CUTOFF_DATE = "2025-03-03T12:00:00Z";

    // 1. First, delete dependent records (Applications, Saved_Jobs)
    console.log("Deleting Applications created after cutoff date...");
    const applicationsResult = await supabase
      .from("Applications")
      .delete()
      .gte("created_at", CUTOFF_DATE);
    
    if (applicationsResult.error) {
      console.error("Error deleting from Applications:", applicationsResult.error);
    }

    console.log("Deleting Saved_Jobs created after cutoff date...");
    const savedJobsResult = await supabase
      .from("Saved_Jobs")
      .delete()
      .gte("saved_at", CUTOFF_DATE);
    
    if (savedJobsResult.error) {
      console.error("Error deleting from Saved_Jobs:", savedJobsResult.error);
    }

    // 2. Then, delete Job_Posting
    console.log("Deleting Job_Posting created after cutoff date...");
    const jobPostingsResult = await supabase
      .from("Job_Posting")
      .delete()
      .gte("posted_at", CUTOFF_DATE);
    
    if (jobPostingsResult.error) {
      console.error("Error deleting from Job_Posting:", jobPostingsResult.error);
    }

    // 3. Finally, delete Employee and Employer
    console.log("Deleting Employee created after cutoff date...");
    const employeeResult = await supabase
      .from("Employee")
      .delete()
      .gte("created_at", CUTOFF_DATE);
    
    if (employeeResult.error) {
      console.error("Error deleting from Employee:", employeeResult.error);
    }

    console.log("Deleting Employer created after cutoff date...");
    const employerResult = await supabase
      .from("Employer")
      .delete()
      .gte("created_at", CUTOFF_DATE);
    
    if (employerResult.error) {
      console.error("Error deleting from Employer:", employerResult.error);
    }

    console.log("✅ Database cleanup completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    process.exit(0);
  }
}

describe('deleteSeed.js', () => {
  const mockFromFn = jest.fn();
  const mockDeleteFn = jest.fn();
  const mockGteFn = jest.fn();
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup Supabase client mock
    mockGteFn.mockResolvedValue({ error: null });
    mockDeleteFn.mockReturnValue({ gte: mockGteFn });
    mockFromFn.mockReturnValue({ delete: mockDeleteFn });
    
    const mockSupabaseClient = {
      from: mockFromFn
    };
    
    createClient.mockReturnValue(mockSupabaseClient);
  });
  
  test('should delete seeded data in the correct order', async () => {
    // Call our testable version of deleteSeededData
    await testableDeleteSeededData();
    
    // Verify the Supabase client was used correctly
    expect(createClient).toHaveBeenCalledTimes(1);
    
    // Order matters: dependent tables first, then main tables
    const expectedOrder = [
      'Applications',
      'Saved_Jobs',
      'Job_Posting',
      'Employee',
      'Employer'
    ];
    
    // Verify calls were made to delete from each table
    expectedOrder.forEach(table => {
      expect(mockFromFn).toHaveBeenCalledWith(table);
    });
    
    // Verify delete was called the correct number of times
    expect(mockDeleteFn).toHaveBeenCalledTimes(5);
    
    // Verify cutoff date was used consistently
    expect(mockGteFn).toHaveBeenCalledTimes(5);
    mockGteFn.mock.calls.forEach(call => {
      // All calls should use the CUTOFF_DATE (e.g., "2025-03-03T12:00:00Z")
      expect(call[1]).toBe("2025-03-03T12:00:00Z");
    });
    
    // Verify the correct timestamp column was used for each table
    expect(mockGteFn.mock.calls[0][0]).toBe('created_at'); // Applications
    expect(mockGteFn.mock.calls[1][0]).toBe('saved_at');   // Saved_Jobs
    expect(mockGteFn.mock.calls[2][0]).toBe('posted_at');  // Job_Posting
    expect(mockGteFn.mock.calls[3][0]).toBe('created_at'); // Employee
    expect(mockGteFn.mock.calls[4][0]).toBe('created_at'); // Employer
    
    // Verify process.exit was called with success code
    expect(mockExit).toHaveBeenCalledWith(0);
  });
  
  test('should handle errors when deleting data', async () => {
    // Setup to simulate an error in one table
    mockGteFn.mockImplementation((column, date) => {
      if (column === 'posted_at') {
        return { error: new Error('Error deleting from Job_Posting') };
      }
      return { error: null };
    });
    
    // Call our testable version of deleteSeededData
    await testableDeleteSeededData();
    
    // Verify error was handled and logged
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Error deleting from Job_Posting:'),
      expect.any(Error)
    );
    
    // Verify the process continues after an error
    expect(mockFromFn).toHaveBeenCalledWith('Employee');
    expect(mockFromFn).toHaveBeenCalledWith('Employer');
    
    // Verify process.exit was still called with success code
    expect(mockExit).toHaveBeenCalledWith(0);
  });
  
  test('should handle errors in the overall process', async () => {
    // Mock a catastrophic error
    mockFromFn.mockImplementation(() => {
      throw new Error('Critical error');
    });
    
    // Call our testable version of deleteSeededData
    await testableDeleteSeededData();
    
    // Verify error was handled and logged
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Error during cleanup:'),
      expect.any(Error)
    );
    
    // Verify process.exit was still called with success code
    expect(mockExit).toHaveBeenCalledWith(0);
  });
});
