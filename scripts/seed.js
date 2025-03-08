const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });
const crypto = require("crypto");

// Log environment variables to check if they are loaded
console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL || "MISSING");
console.log(
  "Supabase Service Role Key:",
  process.env.SUPABASE_SERVICE_ROLE_KEY ? "Loaded" : "MISSING"
);

// Ensure environment variables are present
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY
) {
  console.error(
    "❌ ERROR: Missing environment variables. Check your .env.local file."
  );
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Function to generate UUID
function generateUUID() {
  return crypto.randomUUID();
}

async function seedEmployees() {
  console.log("Seeding Employee data...");

  const { data, error } = await supabase.from("Employee").insert([
    {
      id: generateUUID(), // Ensure UUID is generated
      username: "john_doe",
      email: "john.doe@email.com",
      first_name: "John",
      last_name: "Doe",
      phone_num: "+447423489150",
      bio: "Software Engineer with 5 years of experience.",
      password: "hashedpassword", // Ensure to hash passwords in production
      created_at: new Date(),
    },
    {
      id: generateUUID(),
      username: "jane_smith",
      email: "jane.smith@email.com",
      first_name: "Jane",
      last_name: "Smith",
      phone_num: "+447423489151",
      bio: "Data Scientist passionate about AI.",
      password: "hashedpassword",
      created_at: new Date(),
    },
    {
      id: generateUUID(),
      username: "michael_brown",
      email: "michael.brown@email.com",
      first_name: "Michael",
      last_name: "Brown",
      phone_num: "+447423489152",
      bio: "Full-stack developer specializing in Next.js.",
      password: "hashedpassword",
      created_at: new Date(),
    },
  ]);

  if (error) {
    console.error("❌ Error seeding employees:", error);
  } else {
    console.log("✅ Employee seeding successful:", data);
  }
}

seedEmployees();
