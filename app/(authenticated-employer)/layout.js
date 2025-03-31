"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { LayoutDashboard, UserRound } from "lucide-react";
import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

// 1️⃣ Local hook for session-based user
function useAuth() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        setUser(null);
      } else {
        setUser(data.user);
      }
      setAuthLoading(false);
    }

    fetchUser();
  }, []);

  return { user, authLoading };
}

export default function Layout({ children }) {
  const { user, authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [company, setCompany] = useState(null);
  const [companyLoading, setCompanyLoading] = useState(true);

  useEffect(() => {
    const checkEmployer = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError || !authData?.user) {
        router.replace("/login");
        return;
      }

      const userId = authData.user.id;
      const { data: employerData, error: employerError } = await supabase
        .from("Employer")
        .select("company_name, username")
        .eq("id", userId)
        .single();

      if (employerError || !employerData) {
        router.replace("/dashboard");
        return;
      }

      setCompany(employerData);
      setCompanyLoading(false);
    };

    checkEmployer();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (authLoading || companyLoading) {
    return <p className="text-center text-gray-600 mt-10">Loading...</p>;
  }

  return (
    <SidebarProvider>
      {/*
        Using a single .flex.h-screen container 
        so the sidebar stays at a fixed width 
        and the main content fills the remaining space
      */}
      <div className="flex h-screen">

        {/* Sidebar at fixed width (e.g., w-64) */}
        <Sidebar className="w-64">
          <SidebarContent className="flex flex-col h-full">
            <SidebarGroup>
              <SidebarGroupLabel>Company Dashboard</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>

                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a
                        href="/company-dashboard"
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors hover:bg-gray-100 ${pathname === "/company-dashboard"
                            ? "text-[#4259A8]"
                            : "text-gray-600 hover:text-black"
                          }`}
                      >
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a
                        href="/edit-company-profile"
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors hover:bg-gray-100 ${pathname === "/edit-company-profile"
                            ? "text-[#4259A8]"
                            : "text-gray-600 hover:text-black"
                          }`}
                      >
                        <UserRound size={20} />
                        <span>Edit Profile</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* User info & logout at the bottom of the sidebar */}
            <div className="mt-auto p-4">
              <Separator className="mb-3" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-3 cursor-pointer">
                    <Avatar>
                      <AvatarImage src="/profile.jpg" alt="User Avatar" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div>
                      {company ? (
                        <>
                          <p className="text-sm font-medium">
                            {company.username || "Unknown User"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {company.company_name}
                          </p>
                        </>
                      ) : (
                        <p>Unknown Company</p>
                      )}
                    </div>
                  </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  <a
                    href="/edit-company-profile"
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-sm"
                  >
                    Profile
                  </a>

                  <DropdownMenuItem
                    className="text-red-500"
                    onClick={handleLogout}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarContent>
        </Sidebar>

        {/* Main content area takes up all remaining width */}
        <main className="max-w-7xl mx-auto px-6 md:px-8">
          {children}
        </main>

      </div>
    </SidebarProvider>
  );
}
