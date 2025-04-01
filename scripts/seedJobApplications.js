// const { createClient } = require("@supabase/supabase-js");
// require("dotenv").config({ path: ".env.local" });
// const crypto = require("crypto");

// // Log environment variables
// console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL || "MISSING");
// console.log(
//   "Supabase Service Role Key:",
//   process.env.SUPABASE_SERVICE_ROLE_KEY ? "Loaded" : "MISSING"
// );

// // Ensure required environment variables exist
// if (
//   !process.env.NEXT_PUBLIC_SUPABASE_URL ||
//   !process.env.SUPABASE_SERVICE_ROLE_KEY
// ) {
//   console.error(
//     "❌ ERROR: Missing environment variables. Check your .env.local file."
//   );
//   process.exit(1);
// }

// // Initialize Supabase client
// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// );

// // generate random BIGINT for `posting_id` and `Application_id`
// function generateBigInt() {
//   return Math.floor(Math.random() * 1000000);
// }

// // Fetch Existing Employees
// async function fetchEmployees() {
//   console.log("🌱 Fetching existing employees...");

//   const { data, error } = await supabase
//     .from("Employee")
//     .select("id, username")
//     .limit(3); // at least 3 employees

//   if (error) {
//     console.error("❌ Error fetching employees:", error);
//     return null;
//   }

//   console.log("✅ Found Employees:", data);
//   return data;
// }

// // Insert Employers (Only If Needed)
// async function seedEmployers() {
//   console.log("🌱 Checking Employers...");

//   const employerUsernames = ["tech_corp", "ai_innovations", "web_solutions"];

//   const { data: existingEmployers, error } = await supabase
//     .from("Employer")
//     .select("id, username")
//     .in("username", employerUsernames);

//   if (error) {
//     console.error("❌ Error fetching employers:", error);
//     return null;
//   }

//   const existingMap = new Map(existingEmployers.map(emp => [emp.username, emp.id]));

//   const newEmployers = employerUsernames
//     .filter(username => !existingMap.has(username))
//     .map(username => ({
//       id: crypto.randomUUID(),
//       username,
//       email: `${username}@example.com`,
//       company_name: username.replace("_", " ").toUpperCase(),
//       company_description: `A company specializing in ${username.replace("_", " ")}.`,
//       phone_num: `+1-555-${Math.floor(Math.random() * 1000)}`,
//       created_at: new Date().toISOString(),
//     }));

//   if (newEmployers.length > 0) {
//     const { data, error } = await supabase
//       .from("Employer")
//       .insert(newEmployers)
//       .select("id, username");

//     if (error) {
//       console.error("❌ Error seeding employers:", error);
//       return null;
//     }

//     for (const emp of data) {
//       existingMap.set(emp.username, emp.id);
//     }
//   }

//   return employerUsernames.map(username => ({
//     id: existingMap.get(username),
//     username,
//   }));
// }

// // Insert Job Postings using real employer `id`
// async function seedJobPostings() {
//   console.log("🌱 Seeding Job Postings...");

//   const employers = await seedEmployers();
//   if (!employers) return;

//   const jobPostings = [
//     {
//       posting_id: generateBigInt(),
//       title: "Software Engineer",
//       description: "Full-stack developer role",
//       location: "Remote",
//       employment_type: "Full-time",
//       salary_range: "$80k - $100k",
//       status: "open",
//       posted_at: new Date().toISOString(),
//       deadline: "2025-05-01",
//       expected_skills: "JavaScript, React, Node.js",
//       company_ID: employers.find(emp => emp.username === "tech_corp").id, 
//     },
//     {
//       posting_id: generateBigInt(),
//       title: "Data Scientist",
//       description: "Machine Learning & AI role",
//       location: "New York",
//       employment_type: "Contract",
//       salary_range: "$90k - $120k",
//       status: "open",
//       posted_at: new Date().toISOString(),
//       deadline: "2025-06-15",
//       expected_skills: "Python, TensorFlow, SQL",
//       company_ID: employers.find(emp => emp.username === "ai_innovations").id,
//     },
//     {
//       posting_id: generateBigInt(),
//       title: "Frontend Developer",
//       description: "React & Next.js expert",
//       location: "London",
//       employment_type: "Part-time",
//       salary_range: "$50k - $70k",
//       status: "closed",
//       posted_at: new Date().toISOString(),
//       deadline: "2025-04-10",
//       expected_skills: "React, Next.js, Tailwind CSS",
//       company_ID: employers.find(emp => emp.username === "web_solutions").id,
//     },
//   ];

//   const { data, error } = await supabase
//     .from("Job_Posting")
//     .insert(jobPostings)
//     .select("posting_id");

//   if (error) {
//     console.error("❌ Error seeding job postings:", error);
//     return null;
//   } else {
//     console.log("✅ Job Postings seeding successful:", data);
//     return data;
//   }
// }

// // Insert Job Applications using real `posting_id` and `employee_ID`
// async function seedJobApplications() {
//   console.log("🌱 Seeding Job Applications data...");

//   const jobPostings = await seedJobPostings();
//   if (!jobPostings) return;

//   const employees = await fetchEmployees();
//   if (!employees || employees.length < 3) {
//     console.error("❌ Not enough employees found!");
//     return;
//   }

//   const jobApplications = [
//     {
//       Application_id: generateBigInt(),
//       created_at: new Date(),
//       job_posting_id: jobPostings[0].posting_id,
//       application_date: new Date().toISOString(),
//       status: "pending",
//       relevant_skills: JSON.stringify(["JavaScript", "React"]),
//       personalised_message: "Looking forward to this opportunity!",
//       employee_ID: employees[0].id, 
//     },
//     {
//       Application_id: generateBigInt(),
//       created_at: new Date(),
//       job_posting_id: jobPostings[1].posting_id,
//       application_date: new Date().toISOString(),
//       status: "accepted",
//       relevant_skills: JSON.stringify(["Python", "Machine Learning"]),
//       personalised_message: "Excited to apply my AI skills!",
//       employee_ID: employees[1].id,
//     },
//     {
//       Application_id: generateBigInt(),
//       created_at: new Date(),
//       job_posting_id: jobPostings[2].posting_id,
//       application_date: new Date().toISOString(),
//       status: "rejected",
//       relevant_skills: JSON.stringify(["Node.js", "Express"]),
//       personalised_message: "Would love feedback on my application.",
//       employee_ID: employees[2].id,
//     },
//   ];

//   const { data, error } = await supabase.from("Applications").insert(jobApplications);

//   if (error) {
//     console.error("❌ Error seeding job applications:", error);
//   } else {
//     console.log("✅ Job Applications seeding successful:", data);
//   }


// }
// async function fetchInsights() {
//   console.log("📊 Fetching insights...");

//   // Count total applications
//   const { count, error: countError } = await supabase
//     .from("Applications")
//     .select("*", { count: "exact", head: true });

//   if (countError) {
//     console.error("❌ Error fetching application count:", countError);
//     return;
//   }

//   console.log(`✅ Total Applications Posted: ${count}`);

//   // Fetch deadlines for applications
//   const { data: deadlines, error: deadlineError } = await supabase
//     .from("Job_Posting")
//     .select("title, deadline");

//   if (deadlineError) {
//     console.error("❌ Error fetching application deadlines:", deadlineError);
//     return;
//   }

//   console.log("✅ Application Deadlines:", deadlines);
// }

// // Run Seeding & Fetch Insights
// seedJobApplications().then(() => fetchInsights());
// // Run the seeding function
// seedJobApplications();



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
    title: faker.person.jobTitle(), // ✅ FIXED
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
    job_posting_id: jobPostings[index % jobPostings.length].posting_id,
    application_date: new Date().toISOString(),
    status: faker.helpers.arrayElement(["pending", "accepted", "rejected"]),
    relevant_skills: JSON.stringify(faker.helpers.arrayElements(["JavaScript", "React", "Python", "Machine Learning"], 2)),
    personalised_message: faker.lorem.sentence(),
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

// Run Seeding & Fetch Insights
seedJobApplications().then(() => fetchInsights());
