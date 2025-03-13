const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Debug credentials (easy for groupmates to use)
const TEST_EMPLOYER = {
  email: "leopard_employer@gmail.com",
  password: "testpassword", // Used for authentication
  username: "test_employer",
  company_name: "TestCorp",
  company_description: "A test company for debugging.",
  phone_num: "1234567890",
};

const TEST_EMPLOYEE = {
  email: "leopard_employee@gmail.com",
  password: "testpassword", // Used for authentication
  username: "test_employee",
  first_name: "Test",
  last_name: "User",
  phone_num: "0987654321",
  bio: "This is a test employee for debuggi@ng.",
};

async function seedDebugUsers() {
  console.log("🚀 Seeding a test employer & employee...");

  try {
    // 1️⃣ Create employer in Supabase Auth
    const { data: employerAuth, error: employerAuthError } =
      await supabase.auth.signUp({
        email: TEST_EMPLOYER.email,
        password: TEST_EMPLOYER.password,
      });

    if (employerAuthError) throw employerAuthError;
    const employerId = employerAuth.user.id; // Get employer ID from auth

    // 2️⃣ Create employee in Supabase Auth
    const { data: employeeAuth, error: employeeAuthError } =
      await supabase.auth.signUp({
        email: TEST_EMPLOYEE.email,
        password: TEST_EMPLOYEE.password,
      });

    if (employeeAuthError) throw employeeAuthError;
    const employeeId = employeeAuth.user.id; // Get employee ID from auth

    // 3️⃣ Insert Employer into database using Auth ID
    const { error: employerError } = await supabase.from("Employer").insert([
      {
        id: employerId, // Use the same ID from Auth
        email: TEST_EMPLOYER.email,
        username: TEST_EMPLOYER.username,
        company_name: TEST_EMPLOYER.company_name,
        company_description: TEST_EMPLOYER.company_description,
        phone_num: TEST_EMPLOYER.phone_num,
      },
    ]);
    if (employerError) throw employerError;

    // 4️⃣ Insert Employee into database using Auth ID
    const { error: employeeError } = await supabase.from("Employee").insert([
      {
        id: employeeId, // Use the same ID from Auth
        email: TEST_EMPLOYEE.email,
        username: TEST_EMPLOYEE.username,
        first_name: TEST_EMPLOYEE.first_name,
        last_name: TEST_EMPLOYEE.last_name,
        phone_num: TEST_EMPLOYEE.phone_num,
        bio: TEST_EMPLOYEE.bio,
      },
    ]);
    if (employeeError) throw employeeError;

    console.log("✅ Test users seeded successfully!");
    console.log("\n--- LOGIN DETAILS ---");
    console.log("Employer Login:");
    console.log(`  ✉️  Email: ${TEST_EMPLOYER.email}`);
    console.log(`  🔑 Password: ${TEST_EMPLOYER.password}`);
    console.log("\nEmployee Login:");
    console.log(`  ✉️  Email: ${TEST_EMPLOYEE.email}`);
    console.log(`  🔑 Password: ${TEST_EMPLOYEE.password}`);
    console.log("----------------------");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  }

  process.exit(0);
}

seedDebugUsers();
