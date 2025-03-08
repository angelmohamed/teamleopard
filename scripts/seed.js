import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedEmployees() {
  console.log("Seeding Employee data...");

  const { data, error } = await supabase.from("Employee").insert([
    {
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
    console.error("Error seeding employees:", error);
  } else {
    console.log("Employee seeding successful:", data);
  }
}

seedEmployees();
