const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Define the cutoff timestamp (March 3, 2025, 12:00 UTC)
const CUTOFF_DATE = "2025-03-03T12:00:00Z";

async function deleteSeededData() {
  console.log("🚀 Starting database cleanup...");

  try {
    // Delete from dependent tables first (Applications, Saved_Jobs)
    await deleteFromTable("Applications", "created_at");
    await deleteFromTable("Saved_Jobs", "saved_at");

    // Then delete from Job_Posting
    await deleteFromTable("Job_Posting", "posted_at");

    // Then Employees and Employers
    await deleteFromTable("Employee", "created_at");
    await deleteFromTable("Employer", "created_at");

    console.log("✅ Database cleanup complete!");
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
  }

  process.exit(0);
}

async function deleteFromTable(tableName, timestampColumn) {
  console.log(
    `🗑️ Deleting from ${tableName} where ${timestampColumn} >= ${CUTOFF_DATE}...`
  );

  const { error } = await supabase
    .from(tableName)
    .delete()
    .gte(timestampColumn, CUTOFF_DATE); // Keep older records safe

  if (error) {
    console.error(`❌ Error deleting from ${tableName}:`, error);
  } else {
    console.log(`✅ Successfully deleted from ${tableName}`);
  }
}

deleteSeededData();
