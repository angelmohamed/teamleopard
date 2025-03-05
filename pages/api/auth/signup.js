import { supabase } from "@/lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password, role, username, company_name } = req.body;

  // Create user in Supabase Auth
  const { user, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { role, username, company_name } },
  });

  if (error) return res.status(400).json({ error: error.message });

  if (role === "employee") {
    await supabase.from("Employees").insert([{ user_id: user.id, email, username }]);
  } else if (role === "employer") {
    await supabase.from("Employers").insert([{ company_id: user.id, email, company_name }]);
  }

  return res.status(200).json({ user });
}