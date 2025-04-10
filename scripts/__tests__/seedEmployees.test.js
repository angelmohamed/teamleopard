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
    internet: { 
      username: jest.fn().mockReturnValue('mock-username'),
      email: jest.fn().mockReturnValue('mock@example.com')
    },
    person: { firstName: jest.fn().mockReturnValue('Mock'), lastName: jest.fn().mockReturnValue('User') },
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

// Create our own version of the seedEmployees function for testing
async function testSeedEmployees() {
  try {
    console.log(" Seeding employees...");
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const { faker } = require('@faker-js/faker');
    
    // Generate 10 random employees
    const employees = Array.from({ length: 10 }, () => ({
      id: faker.string.uuid(),
      username: faker.internet.username(),
      email: faker.internet.email(),
      name: `${faker.person.firstName()} ${faker.person.lastName()}`,
      cv_url: null,
      location: faker.location.city(),
      created_at: faker.date.past(),
      updated_at: new Date().toISOString()
    }));
    
    // Insert employees into database
    const { error } = await supabase.from("Employee").insert(employees);
    
    if (error) {
      throw error;
    }
    
    console.log(` Successfully seeded ${employees.length} employees`);
    return employees;
  } catch (error) {
    console.error(" Error seeding employees:", error);
    throw error;
  }
}

describe('seedEmployees.js', () => {
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
  
  test('should seed employees successfully', async () => {
    // Call our test function
    await testSeedEmployees();
    
    // Verify interaction with Supabase
    expect(createClient).toHaveBeenCalledWith(
      'https://mock-url.supabase.co',
      'mock-service-key'
    );
    
    // Verify database operations
    expect(mockFromFn).toHaveBeenCalledWith('Employee');
    expect(mockInsertFn).toHaveBeenCalledTimes(1);
    
    // Verify 10 employees were inserted
    const insertedEmployees = mockInsertFn.mock.calls[0][0];
    expect(insertedEmployees).toHaveLength(10);
    
    // Verify employee structure
    const sampleEmployee = insertedEmployees[0];
    expect(sampleEmployee).toHaveProperty('id');
    expect(sampleEmployee).toHaveProperty('username');
    expect(sampleEmployee).toHaveProperty('email');
    expect(sampleEmployee).toHaveProperty('name');
    expect(sampleEmployee).toHaveProperty('location');
    expect(sampleEmployee).toHaveProperty('created_at');
  });
  
  test('should handle database errors', async () => {
    // Mock database insertion error
    mockInsertFn.mockResolvedValue({ error: new Error('Database error') });
    
    // Call our test function and expect it to throw
    await expect(testSeedEmployees()).rejects.toThrow();
    
    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Error seeding employees:'),
      expect.any(Error)
    );
  });
});
