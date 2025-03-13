const { createClient } = require("@supabase/supabase-js");
const { faker } = require("@faker-js/faker");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedEmployers() {
  console.log("🏢 Seeding Employer data...");

  const employers = Array.from({ length: 5 }, () => ({
    id: faker.string.uuid(),
    username: faker.internet.username(),
    email: faker.internet.email(),
    company_name: faker.company.name(),
    company_description: faker.company.buzzPhrase(),
    phone_num: faker.phone.number(),
    created_at: new Date(),
  }));

  const { error } = await supabase.from("Employer").insert(employers);

  if (error) {
    console.error("❌ Error seeding employers:", error);
  } else {
    console.log("✅ Employer seeding successful!");
  }
}

module.exports = seedEmployers;
