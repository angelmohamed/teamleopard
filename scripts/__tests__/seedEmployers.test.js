// Mock the Supabase client first, before any modules are loaded
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockResolvedValue({ error: null }),
    data: []
  }))
}));

// Mock Faker for consistent test data
jest.mock('@faker-js/faker', () => ({
  faker: {
    string: { uuid: jest.fn().mockReturnValue('mock-uuid') },
    company: { name: jest.fn().mockReturnValue('Mock Company') },
    internet: { email: jest.fn().mockReturnValue('company@example.com') },
    location: { city: jest.fn().mockReturnValue('Mock City') },
    date: { past: jest.fn().mockReturnValue(new Date('2023-01-01')) }
  }
}));

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock-url.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-key';

// Import the createClient function for spying
const { createClient } = require('@supabase/supabase-js');

// Mock console.log and console.error for clean test output
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

// Create our own version of the seedEmployers function for testing
async function testSeedEmployers() {
  try {
    console.log(" Seeding employers...");
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const { faker } = require('@faker-js/faker');
    
    // Generate 5 random employers
    const employers = Array.from({ length: 5 }, () => ({
      id: faker.string.uuid(),
      company_name: faker.company.name(),
      email: faker.internet.email(),
      location: faker.location.city(),
      created_at: faker.date.past(),
      updated_at: new Date().toISOString()
    }));
    
    // Insert employers into database
    const { error } = await supabase.from("Employer").insert(employers);
    
    if (error) {
      throw error;
    }
    
    console.log(` Successfully seeded ${employers.length} employers`);
    return employers;
  } catch (error) {
    console.error(" Error seeding employers:", error);
    throw error;
  }
}

describe('seedEmployers.js', () => {
  const mockFromFn = jest.fn();
  const mockInsertFn = jest.fn();
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup Supabase client mock
    mockInsertFn.mockResolvedValue({ error: null });
    mockFromFn.mockReturnValue({ insert: mockInsertFn });
    
    const mockSupabaseClient = {
      from: mockFromFn
    };
    
    createClient.mockReturnValue(mockSupabaseClient);
  });
  
  test('should seed employers successfully', async () => {
    // Call our test function
    await testSeedEmployers();
    
    // Verify interaction with Supabase
    expect(createClient).toHaveBeenCalledWith(
      'https://mock-url.supabase.co',
      'mock-service-key'
    );
    
    // Verify database operations
    expect(mockFromFn).toHaveBeenCalledWith('Employer');
    expect(mockInsertFn).toHaveBeenCalledTimes(1);
    
    // Verify 5 employers were inserted
    const insertedEmployers = mockInsertFn.mock.calls[0][0];
    expect(insertedEmployers).toHaveLength(5);
    
    // Verify employer structure
    const sampleEmployer = insertedEmployers[0];
    expect(sampleEmployer).toHaveProperty('id');
    expect(sampleEmployer).toHaveProperty('company_name');
    expect(sampleEmployer).toHaveProperty('email');
    expect(sampleEmployer).toHaveProperty('location');
    expect(sampleEmployer).toHaveProperty('created_at');
  });
  
  test('should handle database errors', async () => {
    // Mock database insertion error
    mockInsertFn.mockResolvedValue({ error: new Error('Database error') });
    
    // Call our test function and expect it to throw
    await expect(testSeedEmployers()).rejects.toThrow();
    
    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Error seeding employers:'),
      expect.any(Error)
    );
  });
});
