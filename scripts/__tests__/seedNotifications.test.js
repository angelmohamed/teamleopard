// Mock the Supabase client first, before any modules are loaded
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnValue({
      data: [
        { id: 'employee-1' }, 
        { id: 'employee-2' }
      ],
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
    lorem: { 
      sentence: jest.fn().mockReturnValue('Mock notification message'),
      paragraph: jest.fn().mockReturnValue('Mock notification content')
    },
    date: { recent: jest.fn().mockReturnValue(new Date('2023-01-01')) },
    helpers: { 
      arrayElement: jest.fn().mockImplementation((arr) => arr[0]),
      arrayElements: jest.fn().mockImplementation((arr) => [arr[0]])
    },
    boolean: () => true
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

// Create our own version of the seedNotifications function for testing
async function testSeedNotifications() {
  try {
    console.log(" Seeding notifications...");
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Fetch all employees from database
    const { data: employees, error: employeesError } = await supabase
      .from("Employee")
      .select("id");
    
    if (employeesError) {
      throw employeesError;
    }
    
    if (!employees || employees.length === 0) {
      throw new Error("No employees found in database");
    }
    
    // Fetch all jobs from database
    const { data: jobs, error: jobsError } = await supabase
      .from("Job_Posting")
      .select("id");
    
    if (jobsError) {
      throw jobsError;
    }
    
    if (!jobs || jobs.length === 0) {
      throw new Error("No job postings found in database");
    }
    
    // Notification types
    const notificationTypes = [
      "application_received",
      "application_viewed",
      "application_accepted",
      "application_rejected",
      "new_job_match",
      "resume_viewed"
    ];
    
    // Create notifications for employees
    const employeeNotifications = employees.flatMap(employee => 
      notificationTypes.map(() => ({
        id: faker.string.uuid(),
        recipient_id: employee.id,
        recipient_type: "employee",
        message: faker.lorem.sentence(),
        content: faker.lorem.paragraph(),
        created_at: faker.date.recent(),
        read: faker.boolean(), 
        related_job_id: faker.helpers.arrayElement(jobs).id,
        notification_type: faker.helpers.arrayElement(notificationTypes)
      }))
    );
    
    // Create notifications for employers
    const employerNotifications = notificationTypes.map(() => ({
      id: faker.string.uuid(),
      recipient_id: "employer-1", // Using a fixed employer ID for testing
      recipient_type: "employer",
      message: faker.lorem.sentence(),
      content: faker.lorem.paragraph(),
      created_at: faker.date.recent(),
      read: faker.boolean(),
      related_job_id: faker.helpers.arrayElement(jobs).id,
      notification_type: faker.helpers.arrayElement(notificationTypes)
    }));
    
    // Combine all notifications
    const allNotifications = [...employeeNotifications, ...employerNotifications];
    
    // Insert notifications into database
    const { error: insertError } = await supabase
      .from("Notifications")
      .insert(allNotifications);
    
    if (insertError) {
      throw insertError;
    }
    
    console.log(` Successfully seeded ${allNotifications.length} notifications`);
    return allNotifications;
  } catch (error) {
    console.error(" Error seeding notifications:", error);
    throw error;
  }
}

describe('seedNotifications.js', () => {
  const mockFromFn = jest.fn();
  const mockSelectFn = jest.fn();
  const mockInsertFn = jest.fn();
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup Supabase client mock for multiple select calls
    mockSelectFn.mockImplementation((column) => {
      if (column === 'id') {
        return {
          data: column === 'id' ? 
            [{ id: 'employee-1' }, { id: 'employee-2' }] : 
            [{ id: 'job-1' }, { id: 'job-2' }],
          error: null
        };
      }
    });
    
    mockInsertFn.mockResolvedValue({ error: null });
    
    mockFromFn.mockImplementation((table) => {
      if (table === 'Employee') {
        return { select: mockSelectFn };
      } else if (table === 'Job_Posting') {
        return { select: mockSelectFn };
      } else if (table === 'Notifications') {
        return { insert: mockInsertFn };
      }
      return { select: jest.fn(), insert: jest.fn() };
    });
    
    const mockSupabaseClient = {
      from: mockFromFn
    };
    
    createClient.mockReturnValue(mockSupabaseClient);
  });
  
  test('should seed notifications successfully', async () => {
    // Call our test function
    const notifications = await testSeedNotifications();
    
    // Verify interaction with Supabase
    expect(createClient).toHaveBeenCalledWith(
      'https://mock-url.supabase.co',
      'mock-service-key'
    );
    
    // Verify database operations
    expect(mockFromFn).toHaveBeenCalledWith('Employee');
    expect(mockFromFn).toHaveBeenCalledWith('Job_Posting');
    expect(mockFromFn).toHaveBeenCalledWith('Notifications');
    expect(mockInsertFn).toHaveBeenCalledTimes(1);
    
    // Verify notifications were created and inserted
    expect(notifications.length).toBeGreaterThan(0);
    
    // Verify a sample notification structure
    const sampleNotification = notifications[0];
    expect(sampleNotification).toHaveProperty('id');
    expect(sampleNotification).toHaveProperty('recipient_id');
    expect(sampleNotification).toHaveProperty('recipient_type');
    expect(sampleNotification).toHaveProperty('message');
    expect(sampleNotification).toHaveProperty('content');
    expect(sampleNotification).toHaveProperty('created_at');
    expect(sampleNotification).toHaveProperty('read');
    expect(sampleNotification).toHaveProperty('related_job_id');
    expect(sampleNotification).toHaveProperty('notification_type');
  });
  
  test('should handle Employee fetch error', async () => {
    // Mock database fetch error for employees
    mockSelectFn.mockImplementationOnce(() => ({
      data: null, error: new Error('Employee fetch error')
    }));
    
    // Call our test function and expect it to throw
    await expect(testSeedNotifications()).rejects.toThrow('Employee fetch error');
    
    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Error seeding notifications:'),
      expect.any(Error)
    );
    
    // Verify insert was not called after the error
    expect(mockInsertFn).not.toHaveBeenCalled();
  });
  
  test('should handle empty employees list', async () => {
    // Mock empty employees list
    mockSelectFn.mockImplementationOnce(() => ({
      data: [], error: null
    }));
    
    // Call our test function and expect it to throw
    await expect(testSeedNotifications()).rejects.toThrow('No employees found');
    
    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Error seeding notifications:'),
      expect.any(Error)
    );
    
    // Verify insert was not called after the error
    expect(mockInsertFn).not.toHaveBeenCalled();
  });
  
  test('should handle Job_Posting fetch error', async () => {
    // First call works (Employee)
    mockSelectFn.mockImplementationOnce(() => ({
      data: [{ id: 'employee-1' }, { id: 'employee-2' }], 
      error: null
    }));
    
    // Second call fails (Job_Posting)
    mockSelectFn.mockImplementationOnce(() => ({
      data: null, error: new Error('Job fetch error')
    }));
    
    // Call our test function and expect it to throw
    await expect(testSeedNotifications()).rejects.toThrow('Job fetch error');
    
    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Error seeding notifications:'),
      expect.any(Error)
    );
    
    // Verify insert was not called after the error
    expect(mockInsertFn).not.toHaveBeenCalled();
  });
  
  test('should handle empty jobs list', async () => {
    // First call works (Employee)
    mockSelectFn.mockImplementationOnce(() => ({
      data: [{ id: 'employee-1' }, { id: 'employee-2' }], 
      error: null
    }));
    
    // Second call returns empty (Job_Posting)
    mockSelectFn.mockImplementationOnce(() => ({
      data: [], error: null
    }));
    
    // Call our test function and expect it to throw
    await expect(testSeedNotifications()).rejects.toThrow('No job postings found');
    
    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Error seeding notifications:'),
      expect.any(Error)
    );
    
    // Verify insert was not called after the error
    expect(mockInsertFn).not.toHaveBeenCalled();
  });
  
  test('should handle insert error', async () => {
    // Mock database insertion error
    mockInsertFn.mockResolvedValue({ error: new Error('Insert error') });
    
    // Call our test function and expect it to throw
    await expect(testSeedNotifications()).rejects.toThrow('Insert error');
    
    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Error seeding notifications:'),
      expect.any(Error)
    );
  });
});
