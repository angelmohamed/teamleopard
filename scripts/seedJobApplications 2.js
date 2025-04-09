const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });
const { faker } = require("@faker-js/faker");
const crypto = require("crypto");

// Log environment variables
console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL || "MISSING");
console.log(
  "Supabase Service Role Key:",
  process.env.SUPABASE_SERVICE_ROLE_KEY ? "Loaded" : "MISSING"
);

// Ensure required environment variables exist
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ ERROR: Missing environment variables. Check your .env.local file.");
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Generate random BIGINT for IDs
function generateBigInt() {
  return faker.number.int({ min: 100000, max: 999999 });
}

// Fetch Existing Employees
async function fetchEmployees() {
  console.log("🌱 Fetching existing employees...");

  const { data, error } = await supabase.from("Employee").select("id, username").limit(3);
  if (error) {
    console.error("❌ Error fetching employees:", error);
    return null;
  }

  console.log("✅ Found Employees:", data);
  return data;
}

// Insert Employers
async function seedEmployers() {
  console.log("🌱 Seeding Employers...");

  const newEmployers = Array.from({ length: 3 }).map(() => ({
    id: crypto.randomUUID(),
    username: faker.internet.username(),
    email: faker.internet.email(),
    company_name: faker.company.name(),
    company_description: faker.company.catchPhrase(),
    phone_num: faker.phone.number(),
    created_at: new Date().toISOString(),
  }));

  const { data, error } = await supabase.from("Employer").insert(newEmployers).select("id, username");
  if (error) {
    console.error("❌ Error seeding employers:", error);
    return null;
  }

  return data;
}

// Insert Job Postings
async function seedJobPostings() {
  console.log("🌱 Seeding Job Postings...");
  const employers = await seedEmployers();
  if (!employers) return;

  const jobPostings = employers.map((emp) => ({
    posting_id: generateBigInt(),
    title: faker.person.jobTitle(),
    description: faker.lorem.sentence(),
    location: faker.location.city(),
    employment_type: faker.helpers.arrayElement(["Full-time", "Part-time", "Contract", "Remote"]),
    salary_range: `$${faker.number.int({ min: 50000, max: 150000 })} - $${faker.number.int({ min: 60000, max: 160000 })}`,
    status: faker.helpers.arrayElement(["open", "closed", "pending"]),
    posted_at: new Date().toISOString(),
    deadline: faker.date.future().toISOString().split("T")[0],
    expected_skills: faker.helpers.arrayElements(["JavaScript", "React", "Node.js", "Python", "SQL", "TensorFlow"], 3).join(", "),
    company_ID: emp.id,
  }));

  const { data, error } = await supabase.from("Job_Posting").insert(jobPostings).select("posting_id");
  if (error) {
    console.error("❌ Error seeding job postings:", error);
    return null;
  }

  console.log("✅ Job Postings seeding successful:", data);
  return data;
}

// Insert Job Applications
async function seedJobApplications() {
  console.log("🌱 Seeding Job Applications...");

  const jobPostings = await seedJobPostings();
  if (!jobPostings) return;
  const employees = await fetchEmployees();
  if (!employees || employees.length < 3) {
    console.error("❌ Not enough employees found!");
    return;
  }

  const jobApplications = employees.map((emp, index) => ({
    Application_id: generateBigInt(),
    created_at: new Date(),
    last_updated: new Date(),
    job_posting_id: jobPostings[index % jobPostings.length].posting_id,
    status: faker.helpers.arrayElement(["pending", "accepted", "rejected"]),
    cover_letter: faker.lorem.sentences(2),
    resume_file_name: faker.system.commonFileName('pdf'),
    employee_ID: emp.id,
  }));

  const { data, error } = await supabase.from("Applications").insert(jobApplications).select("*");

  if (error) {
    console.error("❌ Error seeding job applications:", error);
  } else {
    console.log("✅ Job Applications seeding successful:", data);
  }
}

// Fetch Insights
async function fetchInsights() {
  console.log("📊 Fetching insights...");

  const { count, error: countError } = await supabase.from("Applications").select("*", { count: "exact", head: true });
  if (countError) {
    console.error("❌ Error fetching application count:", countError);
    return;
  }
  console.log(`✅ Total Applications Posted: ${count}`);

  const { data: deadlines, error: deadlineError } = await supabase.from("Job_Posting").select("title, deadline");
  if (deadlineError) {
    console.error("❌ Error fetching application deadlines:", deadlineError);
    return;
  }
  console.log("✅ Application Deadlines:", deadlines);
}

// Run Everything
seedJobApplications().then(() => fetchInsights());
