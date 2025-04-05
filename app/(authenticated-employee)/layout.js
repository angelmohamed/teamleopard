"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Bell, MessageSquare, User, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { usePathname } from 'next/navigation'

// Context to share user data across all dashboard pages
const AuthContext = createContext(null);

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname(); // Add this line

  useEffect(() => {
    const fetchUser = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        router.replace("/login");
        return;
      }

      const userId = authData.user.id;

      // Check if user is an employer
      const { data: employerData, error: employerError } = await supabase
        .from("Employer")
        .select("id")
        .eq("id", userId)
        .single();

      if (employerData && !employerError) {
        router.replace("/company-dashboard");
        return;
      }

      // Else, set as employee
      setUser(authData.user);
      setLoading(false);
    };

    fetchUser();
  }, [router]);


  return { user, loading };
}

export default function RootLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.replace("/login");
      } else {
        setUser(data.user);
      }
      setLoading(false);
    };
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (loading) {
    return <p className="text-center text-gray-600 mt-10">Loading...</p>;
  }
  if (!user) return null;

  return (
    <AuthContext.Provider value={user}>
      <html lang="en">
        <body className="pt-16">
          {/* Navigation Bar */}
          <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b shadow-sm">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-8 py-3">
              {/* Left Section - Logo */}
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="Company Logo"
                  width={140}
                  height={50}
                  priority
                />
              </Link>

              {/* Right Section - Icons + Divider + Employer Link */}
              <div className="flex items-center space-x-6 md:space-x-4">
                {/* Icons Section */}
                <div className="flex items-center space-x-4">
                  {/* Dashboard Icon */}
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard
                        size={28}
                        className={
                          pathname === "/dashboard"
                            ? "text-[#4259A8]"
                            : "text-gray-600"
                        }
                      />
                    </Link>
                  </Button>

                  {/* Profile Dropdown */}
                  <div className="relative">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={
                            pathname === "/edit-profile"
                              ? "text-[#4259A8] hover:text-black"
                              : "text-gray-600 hover:text-black"
                          }
                        >
                          <User size={28} />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-40 mt-2 bg-white shadow-md rounded-md border p-2">
                        <Link
                          href="/edit-profile"
                          className="block px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
                        >
                          View Profile
                        </Link>
                        <button
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
                          onClick={handleLogout}
                        >
                          Log Out
                        </button>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Divider - Hidden on Mobile */}
                <div className="hidden md:block h-6 border-l"></div>

                {/* Resume IQ Link */}
                <Link
                  href="/resume-iq"
                  className={
                    pathname === "/resume-iq"
                      ? "hidden md:block text-[#4259A8] hover:text-black text-sm font-medium"
                      : "hidden md:block text-gray-600 hover:text-black text-sm font-medium"
                  }
                >
                  Resume IQ™
                </Link>
              </div>
            </div>
          </nav>

          {/* Page Content */}
          <main className="max-w-7xl mx-auto mt-2 px-6 md:px-8">
            {children}
          </main>
        </body>
      </html>
    </AuthContext.Provider>
  );
}
