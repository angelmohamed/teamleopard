const { createClient } = require("@supabase/supabase-js");
const { faker } = require("@faker-js/faker");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedEmployees() {
  console.log("👤 Seeding Employee data...");

  const employees = Array.from({ length: 10 }, () => ({
    id: faker.string.uuid(),
    username: faker.internet.username(),
    email: faker.internet.email(),
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    phone_num: faker.phone.number(),
    bio: faker.person.bio(),
    created_at: new Date(),
  }));

  const { error } = await supabase.from("Employee").insert(employees);

  if (error) {
    console.error("❌ Error seeding employees:", error);
  } else {
    console.log("✅ Employee seeding successful!");
  }
}

module.exports = seedEmployees;
