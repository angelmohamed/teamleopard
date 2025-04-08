require("dotenv").config({ path: ".env.local" });

const seedEmployees = require("./seedEmployees");
const seedEmployers = require("./seedEmployers");
const seedJobListings = require("./seedJobListings");

async function main() {
  console.log("🚀 Starting database seeding...");

  try {
    await seedEmployers();
    await seedEmployees();
    await seedJobListings(); // Job listings depend on seeded employers
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  }

  console.log("✅ Seeding completed!");
  process.exit(0);
}

main();
