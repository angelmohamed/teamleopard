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
    .select("id, first_name"); //relevant info for realistic notis

  if (employeeError) {
    console.error("❌ Error fetching employers:", employeeError);
    return;
  }

  if (!employees.length) {
    console.error("⚠️ No employees found! Notifications cannot be seeded.");
    return;
  }

  // Fetch job listings
  const { data: jobs, error: jobError } = await supabase
    .from("Job_Posting")
    .select("id, title, company_ID"); //relevant info for realistic notis

  if (jobError) {
    console.error("❌ Error fetching employers:", jobError);
    return;
  }

  if (!jobs.length) {
    console.error("⚠️ No jobs found! Notifications cannot be seeded.");
    return;
  }

  const employeeNotis = Array.from({ length: 30 }, () => ({
    employee_receiver_id: faker.helpers.arrayElement(employees).id, // Assign random receiving user
    created_at: new Date(),
    title: faker.helpers.arrayElement([ //random noti titles
      "Application successful.",
      "New message.",
      "Settings changed.",
      "Interview scheduled.",
    ]),
    content: faker.helpers.arrayElement([ //random noti content - wont necessarily match title
      "Your application to " + faker.helpers.arrayElement(jobs).title + " has been accepted!",
      "Unfortunately, your application to " + faker.helpers.arrayElement(jobs).title, " has been rejected.",
      "Your application to " + faker.helpers.arrayElement(jobs).title + " has been sent.",
      "Your interview for "  + faker.helpers.arrayElement(jobs).title + " has been scheduled.",
      "Click to see more details.",
    ]),
    link: faker.helpers.arrayElement([ //either the dashboard or a random job
      "/dashboard",
      "/dashboard/listing/" + faker.helpers.arrayElement(jobs).id,
      "/apply/" + faker.helpers.arrayElement(jobs).id,
    ]),
    read: faker.datatype.boolean(), //true or false
    hidden: false, //don't want them to be hidden otherwise theres no point in making them
  }));

  const employerNotis = Array.from({ length: 30 }, () => ({
    employer_receiver_id: faker.helpers.arrayElement(jobs).company_ID, // Assign random receiving user (note that only employers with a job listing can be picked)
    created_at: new Date(),
    title: faker.helpers.arrayElement([ //random noti titles (employer dashboard makes use of emojis)
      "📅",
      "🟢",
      "🟡",
      "🔵",
      "👋",
      "❗",
    ]),
    content: faker.helpers.arrayElement([ //random noti content - wont necessarily match title
      faker.helpers.arrayElement(employees).first_name + " has applied for " + faker.helpers.arrayElement(jobs).title + ".",
      "Interview scheduled with " + faker.helpers.arrayElement(employees).first_name,
      "Interview date with " + faker.helpers.arrayElement(employees).first_name + " has been rescheduled.",
      "Your profile settings have been updated.",
      "The deadline for " + faker.helpers.arrayElement(jobs).title + " has now passed.",
      "Message from " + faker.helpers.arrayElement(employees).first_name + ".",
    ]),
    link: "/company-dashboard", //simpler
    read: faker.datatype.boolean(), //true or false
    hidden: false, //don't want them to be hidden otherwise theres no point in making them
  }));

  const { error } = await supabase.from("Notifications").insert(...employeeNotis, ...employerNotis); //send both

  if (error) {
    console.error("❌ Error seeding notificaitons:", error);
  } else {
    console.log("✅ Notifications seeding successful!");
  }
}

module.exports = seedNotifications;
