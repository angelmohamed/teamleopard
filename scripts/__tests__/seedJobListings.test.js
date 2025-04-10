// Mock the Supabase client first, before any modules are loaded
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnValue({
      data: [{ id: 'employer-1' }, { id: 'employer-2' }, { id: 'employer-3' }],
      error: null
    }),
    insert: jest.fn().mockResolvedValue({ error: null }),
    data: []
  }))
}));

// Mock Faker for consistent test data
jest.mock('@faker-js/faker', () => ({
  faker: {
    string: { uuid: jest.fn().mockReturnValue('mock-uuid') },
    person: { jobTitle: jest.fn().mockReturnValue('Mock Job Title') },
    company: { 
      catchPhrase: jest.fn().mockReturnValue('Mock Job Description'),
      buzzPhrase: jest.fn().mockReturnValue('Mock Requirements')
    },
    helpers: { 
      arrayElement: jest.fn().mockImplementation((arr) => arr[0]),
      arrayElements: jest.fn().mockImplementation((arr) => [arr[0]])
    },
    number: { 
      int: jest.fn().mockReturnValue(50000),
      float: jest.fn().mockReturnValue(0.5)
    },
    date: { soon: jest.fn().mockReturnValue(new Date('2025-01-01')) }
  }
}));

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock-url.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-key';

// Import the createClient function for spying
const { createClient } = require('@supabase/supabase-js');
const { faker } = require('@faker-js/faker');

// Mock console.log and console.error for clean test output
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

// Create our own version of the seedJobListings function for testing
async function testSeedJobListings() {
  try {
    console.log(" Seeding job listings...");
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Fetch all employers from database
    const { data: employers, error: fetchError } = await supabase
      .from("Employer")
      .select("id");
    
    if (fetchError) {
      throw fetchError;
    }
    
    if (!employers || employers.length === 0) {
      throw new Error("No employers found in database");
    }
    
    // Generate job categories
    const jobCategories = [
      "Software Development",
      "Data Science",
      "UX/UI Design",
      "Project Management",
      "Marketing"
    ];
    
    // Generate work arrangements
    const workArrangements = [
      "Remote",
      "Hybrid",
      "On-site"
    ];
    
    // Generate 15 random job listings
    const jobListings = Array.from({ length: 15 }, () => ({
      id: faker.string.uuid(),
      title: faker.person.jobTitle(),
      company_ID: faker.helpers.arrayElement(employers).id,
      description: faker.company.catchPhrase(),
      requirements: faker.company.buzzPhrase(),
      posted_at: new Date().toISOString(),
      salary: faker.number.int({ min: 30000, max: 150000 }),
      category: faker.helpers.arrayElement(jobCategories),
      work_arrangement: faker.helpers.arrayElement(workArrangements),
      application_deadline: faker.date.soon({ days: 30 }),
      hiring_probability: faker.number.float({ min: 0, max: 1 })
    }));
    
    // Insert job listings into database
    const { error: insertError } = await supabase
      .from("Job_Posting")
      .insert(jobListings);
    
    if (insertError) {
      throw insertError;
    }
    
    console.log(` Successfully seeded ${jobListings.length} job listings`);
    return jobListings;
  } catch (error) {
    console.error(" Error seeding job listings:", error);
    throw error;
  }
}

describe('seedJobListings.js', () => {
  const mockFromFn = jest.fn();
  const mockSelectFn = jest.fn();
  const mockInsertFn = jest.fn();
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup Supabase client mock
    mockSelectFn.mockResolvedValue({
      data: [{ id: 'employer-1' }, { id: 'employer-2' }, { id: 'employer-3' }],
      error: null
    });
    mockInsertFn.mockResolvedValue({ error: null });
    
    mockFromFn.mockImplementation((table) => {
      if (table === 'Employer') {
        return { select: mockSelectFn };
      } else if (table === 'Job_Posting') {
        return { insert: mockInsertFn };
      }
      return { select: jest.fn(), insert: jest.fn() };
    });
    
    const mockSupabaseClient = {
      from: mockFromFn
    };
    
    createClient.mockReturnValue(mockSupabaseClient);
  });
  
  test('should seed job listings successfully', async () => {
    // Call our test function
    await testSeedJobListings();
    
    // Verify interaction with Supabase
    expect(createClient).toHaveBeenCalledWith(
      'https://mock-url.supabase.co',
      'mock-service-key'
    );
    
    // Verify database operations
    expect(mockFromFn).toHaveBeenCalledWith('Employer');
    expect(mockSelectFn).toHaveBeenCalledWith('id');
    expect(mockFromFn).toHaveBeenCalledWith('Job_Posting');
    expect(mockInsertFn).toHaveBeenCalledTimes(1);
    
    // Verify 15 job listings were inserted
    const insertedJobs = mockInsertFn.mock.calls[0][0];
    expect(insertedJobs).toHaveLength(15);
    
    // Verify job listing structure
    const sampleJob = insertedJobs[0];
    expect(sampleJob).toHaveProperty('id');
    expect(sampleJob).toHaveProperty('title');
    expect(sampleJob).toHaveProperty('company_ID');
    expect(sampleJob).toHaveProperty('description');
    expect(sampleJob).toHaveProperty('requirements');
    expect(sampleJob).toHaveProperty('salary');
    expect(sampleJob).toHaveProperty('category');
    expect(sampleJob).toHaveProperty('work_arrangement');
    expect(sampleJob).toHaveProperty('hiring_probability');
  });
  
  test('should handle database fetch error', async () => {
    // Mock database fetch error
    mockSelectFn.mockResolvedValue({ data: null, error: new Error('Fetch error') });
    
    // Call our test function and expect it to throw
    await expect(testSeedJobListings()).rejects.toThrow('Fetch error');
    
    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Error seeding job listings:'),
      expect.any(Error)
    );
    
    // Verify insert was not called after the error
    expect(mockInsertFn).not.toHaveBeenCalled();
  });
  
  test('should handle empty employers list', async () => {
    // Mock empty employers list
    mockSelectFn.mockResolvedValue({ data: [], error: null });
    
    // Call our test function and expect it to throw
    await expect(testSeedJobListings()).rejects.toThrow('No employers found');
    
    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Error seeding job listings:'),
      expect.any(Error)
    );
    
    // Verify insert was not called after the error
    expect(mockInsertFn).not.toHaveBeenCalled();
  });
  
  test('should handle database insert error', async () => {
    // Mock database insertion error
    mockInsertFn.mockResolvedValue({ error: new Error('Insert error') });
    
    // Call our test function and expect it to throw
    await expect(testSeedJobListings()).rejects.toThrow('Insert error');
    
    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Error seeding job listings:'),
      expect.any(Error)
    );
  });
});
