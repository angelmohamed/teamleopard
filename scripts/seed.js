require("dotenv").config({ path: ".env.local" });

const seedEmployees = require("./seedEmployees");
const seedEmployers = require("./seedEmployers");
const seedJobListings = require("./seedJobListings");
const seedNotifications = require("./seedNotifications");

async function main() {
  console.log("🚀 Starting database seeding...");

  try {
    await seedEmployers();
    await seedEmployees();
    await seedJobListings(); // Job listings depend on seeded employers
    await seedNotifications(); // relies on everything above
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  }

  console.log("✅ Seeding completed!");
  process.exit(0);
}

main();
