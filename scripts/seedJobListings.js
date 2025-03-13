const { createClient } = require("@supabase/supabase-js");
const { faker } = require("@faker-js/faker");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedJobListings() {
  console.log("📄 Seeding Job Listings...");

  // Fetch employer IDs
  const { data: employers, error: employerError } = await supabase
    .from("Employer")
    .select("id");

  if (employerError) {
    console.error("❌ Error fetching employers:", employerError);
    return;
  }

  if (!employers.length) {
    console.error("⚠️ No employers found! Job listings cannot be seeded.");
    return;
  }

  const jobListings = Array.from({ length: 15 }, () => ({
    posting_id: faker.number.int({ min: 1000, max: 9999 }),
    title: faker.person.jobTitle(),
    description: faker.lorem.paragraph(),
    location: faker.location.city(),
    employment_type: faker.helpers.arrayElement([
      "Full-time",
      "Part-time",
      "Contract",
    ]),
    salary_range: `$${faker.number.int({ min: 50000, max: 150000 })}`,
    status: "open",
    posted_at: new Date(),
    deadline: faker.date.soon({ days: 30 }),
    expected_skills: JSON.stringify([
      faker.person.jobDescriptor(),
      faker.person.jobDescriptor(),
    ]),
    company_ID: faker.helpers.arrayElement(employers).id, // Assign random employer
  }));

  const { error } = await supabase.from("Job_Posting").insert(jobListings);

  if (error) {
    console.error("❌ Error seeding job listings:", error);
  } else {
    console.log("✅ Job Listings seeding successful!");
  }
}

module.exports = seedJobListings;
