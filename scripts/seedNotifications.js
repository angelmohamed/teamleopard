const { createClient } = require("@supabase/supabase-js");
const { faker } = require("@faker-js/faker");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedNotifications() {
  console.log("📄 Seeding Notifications...");

  // Fetch employee IDs
  const { data: employees, error: employeeError } = await supabase
    .from("Employee")
    .select("id, first_name");

  if (employeeError || !employees?.length) {
    console.error("❌ Error fetching employees:", employeeError);
    return;
  }

  // Fetch job listings
  const { data: jobs, error: jobError } = await supabase
    .from("Job_Posting")
    .select("id, title, company_ID");

  if (jobError || !jobs?.length) {
    console.error("❌ Error fetching jobs:", jobError);
    return;
  }

  // Employee Notifications (1+ per employee)
  const employeeNotis = employees.flatMap((emp) =>
    Array.from({ length: 2 }, () => ({
      employee_receiver_id: emp.id,
      created_at: new Date(),
      title: faker.helpers.arrayElement([
        "Application successful.",
        "New message.",
        "Interview scheduled.",
        "Status update.",
      ]),
      content: faker.helpers.arrayElement([
        `Your application to ${
          faker.helpers.arrayElement(jobs).title
        } has been received.`,
        `You have a new message regarding ${
          faker.helpers.arrayElement(jobs).title
        }.`,
        `Interview scheduled for ${faker.helpers.arrayElement(jobs).title}.`,
        `Click here to check your application status.`,
      ]),
      link: faker.helpers.arrayElement([
        "/dashboard",
        `/dashboard/listing/${faker.helpers.arrayElement(jobs).id}`,
        `/apply/${faker.helpers.arrayElement(jobs).id}`,
      ]),
      read: false,
      hidden: false,
    }))
  );

  // Employer Notifications (1+ per employer with jobs)
  const employersWithJobs = [...new Set(jobs.map((job) => job.company_ID))];

  const employerNotis = employersWithJobs.flatMap((employerId) =>
    Array.from({ length: 2 }, () => ({
      employer_receiver_id: employerId,
      created_at: new Date(),
      title: faker.helpers.arrayElement(["📬", "📅", "🔔", "📈", "📢"]),
      content: faker.helpers.arrayElement([
        `${faker.person.firstName()} just applied to ${
          faker.helpers.arrayElement(jobs).title
        }.`,
        `Interview scheduled with ${faker.person.firstName()}.`,
        `Job posting update: ${faker.helpers.arrayElement(jobs).title}.`,
        `Reminder: deadline approaching.`,
        `New applicant insights available.`,
      ]),
      link: "/company-dashboard",
      read: false,
      hidden: false,
    }))
  );

  const allNotifications = [...employeeNotis, ...employerNotis];

  const { error } = await supabase
    .from("Notifications")
    .insert(allNotifications);

  if (error) {
    console.error("❌ Error seeding notifications:", error);
  } else {
    console.log(
      `✅ Notifications seeded for ${employees.length} employees and ${employersWithJobs.length} employers.`
    );
  }
}

module.exports = seedNotifications;
