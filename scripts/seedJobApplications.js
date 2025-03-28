// const { createClient } = require("@supabase/supabase-js");
// require("dotenv").config({ path: ".env.local" });
// const crypto = require("crypto");


// console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL || "MISSING");
// console.log(
//   "Supabase Service Role Key:",
//   process.env.SUPABASE_SERVICE_ROLE_KEY ? "Loaded" : "MISSING"
// );

// if (
//   !process.env.NEXT_PUBLIC_SUPABASE_URL ||
//   !process.env.SUPABASE_SERVICE_ROLE_KEY
// ) {
//   console.error(
//     "❌ ERROR: Missing environment variables. Check your .env.local file."
//   );
//   process.exit(1);
// }


// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// );


// function generateBigInt() {
//   return Math.floor(Math.random() * 1000000);
// }

// function generateUUID() {
//   return crypto.randomUUID();
// }

// async function seedEmployers() {
//   console.log("🌱 Seeding Employers...");

//   const employers = [
//     { 
//       id: generateUUID(), 
//       username: "tech_corp",
//       email: "hr@techcorp.com",
//       company_name: "TechCorp",
//       company_description: "Leading tech company specializing in AI solutions.",
//       phone_num: "+1-555-1000",
//       created_at: new Date().toISOString()
//     },
//     { 
//       id: generateUUID(), 
//       username: "ai_innovations",
//       email: "contact@aiinnovations.com",
//       company_name: "AI Innovations",
//       company_description: "Startup focused on machine learning applications.",
//       phone_num: "+1-555-2000",
//       created_at: new Date().toISOString()
//     },
//     { 
//       id: generateUUID(), 
//       username: "web_solutions",
//       email: "info@websolutions.com",
//       company_name: "Web Solutions",
//       company_description: "Provides cutting-edge web development services.",
//       phone_num: "+1-555-3000",
//       created_at: new Date().toISOString()
//     },
//   ];

//   const { data, error } = await supabase
//     .from("Employer")
//     .insert(employers)
//     .select("id"); // ✅ Retrieve `id` (not `company_ID`)

//   if (error) {
//     console.error("❌ Error seeding employers:", error);
//     return null;
//   } else {
//     console.log("✅ Employers seeding successful:", data);
//     return data; // Return inserted employer IDs
//   }
// }

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
//       company_ID: employers[0].id, 
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
//       company_ID: employers[1].id,
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
//       company_ID: employers[2].id,
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


// async function seedJobApplications() {
//   console.log("🌱 Seeding Job Applications data...");

//   const jobPostings = await seedJobPostings();
//   if (!jobPostings) return;

//   const jobApplications = [
//     {
//       Application_id: generateBigInt(),
//       created_at: new Date(),
//       job_posting_id: jobPostings[0].posting_id,
//       application_date: new Date().toISOString(),
//       status: "pending",
//       relevant_skills: JSON.stringify(["JavaScript", "React"]),
//       personalised_message: "Looking forward to this opportunity!",
//       employee_ID: generateUUID(),
//     },
//     {
//       Application_id: generateBigInt(),
//       created_at: new Date(),
//       job_posting_id: jobPostings[1].posting_id,
//       application_date: new Date().toISOString(),
//       status: "accepted",
//       relevant_skills: JSON.stringify(["Python", "Machine Learning"]),
//       personalised_message: "Excited to apply my AI skills!",
//       employee_ID: generateUUID(),
//     },
//     {
//       Application_id: generateBigInt(),
//       created_at: new Date(),
//       job_posting_id: jobPostings[2].posting_id,
//       application_date: new Date().toISOString(),
//       status: "rejected",
//       relevant_skills: JSON.stringify(["Node.js", "Express"]),
//       personalised_message: "Would love feedback on my application.",
//       employee_ID: generateUUID(),
//     },
//   ];

//   const { data, error } = await supabase.from("Applications").insert(jobApplications);

//   if (error) {
//     console.error("❌ Error seeding job applications:", error);
//   } else {
//     console.log("✅ Job Applications seeding successful:", data);
//   }
// }

// // Run the seeding function
// seedJobApplications();


const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });
const crypto = require("crypto");

// Log environment variables
console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL || "MISSING");
console.log(
  "Supabase Service Role Key:",
  process.env.SUPABASE_SERVICE_ROLE_KEY ? "Loaded" : "MISSING"
);

// Ensure required environment variables exist
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY
) {
  console.error(
    "❌ ERROR: Missing environment variables. Check your .env.local file."
  );
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Function to generate random BIGINT for `posting_id` and `Application_id`
function generateBigInt() {
  return Math.floor(Math.random() * 1000000);
}

// ✅ Step 1: Fetch Existing Employees
async function fetchEmployees() {
  console.log("🌱 Fetching existing employees...");

  const { data, error } = await supabase
    .from("Employee")
    .select("id, username")
    .limit(3); // Get at least 3 employees

  if (error) {
    console.error("❌ Error fetching employees:", error);
    return null;
  }

  console.log("✅ Found Employees:", data);
  return data;
}

// ✅ Step 2: Insert Employers (Only If Needed)
async function seedEmployers() {
  console.log("🌱 Checking Employers...");

  const employerUsernames = ["tech_corp", "ai_innovations", "web_solutions"];

  const { data: existingEmployers, error } = await supabase
    .from("Employer")
    .select("id, username")
    .in("username", employerUsernames);

  if (error) {
    console.error("❌ Error fetching employers:", error);
    return null;
  }

  const existingMap = new Map(existingEmployers.map(emp => [emp.username, emp.id]));

  const newEmployers = employerUsernames
    .filter(username => !existingMap.has(username))
    .map(username => ({
      id: crypto.randomUUID(),
      username,
      email: `${username}@example.com`,
      company_name: username.replace("_", " ").toUpperCase(),
      company_description: `A company specializing in ${username.replace("_", " ")}.`,
      phone_num: `+1-555-${Math.floor(Math.random() * 1000)}`,
      created_at: new Date().toISOString(),
    }));

  if (newEmployers.length > 0) {
    const { data, error } = await supabase
      .from("Employer")
      .insert(newEmployers)
      .select("id, username");

    if (error) {
      console.error("❌ Error seeding employers:", error);
      return null;
    }

    for (const emp of data) {
      existingMap.set(emp.username, emp.id);
    }
  }

  return employerUsernames.map(username => ({
    id: existingMap.get(username),
    username,
  }));
}

// ✅ Step 3: Insert Job Postings using real employer `id`
async function seedJobPostings() {
  console.log("🌱 Seeding Job Postings...");

  const employers = await seedEmployers();
  if (!employers) return;

  const jobPostings = [
    {
      posting_id: generateBigInt(),
      title: "Software Engineer",
      description: "Full-stack developer role",
      location: "Remote",
      employment_type: "Full-time",
      salary_range: "$80k - $100k",
      status: "open",
      posted_at: new Date().toISOString(),
      deadline: "2025-05-01",
      expected_skills: "JavaScript, React, Node.js",
      company_ID: employers.find(emp => emp.username === "tech_corp").id, 
    },
    {
      posting_id: generateBigInt(),
      title: "Data Scientist",
      description: "Machine Learning & AI role",
      location: "New York",
      employment_type: "Contract",
      salary_range: "$90k - $120k",
      status: "open",
      posted_at: new Date().toISOString(),
      deadline: "2025-06-15",
      expected_skills: "Python, TensorFlow, SQL",
      company_ID: employers.find(emp => emp.username === "ai_innovations").id,
    },
    {
      posting_id: generateBigInt(),
      title: "Frontend Developer",
      description: "React & Next.js expert",
      location: "London",
      employment_type: "Part-time",
      salary_range: "$50k - $70k",
      status: "closed",
      posted_at: new Date().toISOString(),
      deadline: "2025-04-10",
      expected_skills: "React, Next.js, Tailwind CSS",
      company_ID: employers.find(emp => emp.username === "web_solutions").id,
    },
  ];

  const { data, error } = await supabase
    .from("Job_Posting")
    .insert(jobPostings)
    .select("posting_id");

  if (error) {
    console.error("❌ Error seeding job postings:", error);
    return null;
  } else {
    console.log("✅ Job Postings seeding successful:", data);
    return data;
  }
}

// ✅ Step 4: Insert Job Applications using real `posting_id` and `employee_ID`
async function seedJobApplications() {
  console.log("🌱 Seeding Job Applications data...");

  const jobPostings = await seedJobPostings();
  if (!jobPostings) return;

  const employees = await fetchEmployees();
  if (!employees || employees.length < 3) {
    console.error("❌ Not enough employees found!");
    return;
  }

  const jobApplications = [
    {
      Application_id: generateBigInt(),
      created_at: new Date(),
      job_posting_id: jobPostings[0].posting_id,
      application_date: new Date().toISOString(),
      status: "pending",
      relevant_skills: JSON.stringify(["JavaScript", "React"]),
      personalised_message: "Looking forward to this opportunity!",
      employee_ID: employees[0].id, // ✅ Uses real employee ID
    },
    {
      Application_id: generateBigInt(),
      created_at: new Date(),
      job_posting_id: jobPostings[1].posting_id,
      application_date: new Date().toISOString(),
      status: "accepted",
      relevant_skills: JSON.stringify(["Python", "Machine Learning"]),
      personalised_message: "Excited to apply my AI skills!",
      employee_ID: employees[1].id,
    },
    {
      Application_id: generateBigInt(),
      created_at: new Date(),
      job_posting_id: jobPostings[2].posting_id,
      application_date: new Date().toISOString(),
      status: "rejected",
      relevant_skills: JSON.stringify(["Node.js", "Express"]),
      personalised_message: "Would love feedback on my application.",
      employee_ID: employees[2].id,
    },
  ];

  const { data, error } = await supabase.from("Applications").insert(jobApplications);

  if (error) {
    console.error("❌ Error seeding job applications:", error);
  } else {
    console.log("✅ Job Applications seeding successful:", data);
  }
}

// Run the seeding function
seedJobApplications();
