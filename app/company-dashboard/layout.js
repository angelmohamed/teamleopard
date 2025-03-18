"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

import {
  Home,
  Inbox,
  Search,
  Settings,
  UserRound,
} from "lucide-react";

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

// Menu items (unchanged)
const items = [
  { title: "Home", url: "#", icon: Home },
  { title: "Search", url: "#", icon: Search },
  { title: "Inbox", url: "#", icon: Inbox },
  { title: "Company Profile", url: "#", icon: UserRound },
  { title: "Settings", url: "#", icon: Settings },
];

// 1️⃣ Local hook for session-based user
function useAuth() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        console.warn("No user found; redirecting or showing fallback...");
        setUser(null);
        setAuthLoading(false);
      } else {
        setUser(data.user);
        setAuthLoading(false);
      }
    }

    fetchUser();
  }, []);

  return { user, authLoading };
}

export default function Layout({ children }) {
  // 2️⃣ Get the logged-in user from our local hook
  const { user, authLoading } = useAuth();

  // 3️⃣ Local state for Employer’s data
  const [company, setCompany] = useState(null);
  const [companyLoading, setCompanyLoading] = useState(true);

  // 4️⃣ Fetch the employer row once we have a user
  useEffect(() => {
    if (!user) {
      // If user is null, either show fallback or just skip
      setCompanyLoading(false);
      return;
    }

    const fetchCompanyData = async () => {
      try {
        // Query your "Employer" table using user.id
        const { data, error } = await supabase
          .from("Employer")
          .select("company_name")
          .eq("id", user.id) // or .eq("user_id", user.id) if your column name differs
          .single();

        if (error) throw error;

        setCompany(data);
      } catch (err) {
        console.error("Error fetching company data:", err.message);
      } finally {
        setCompanyLoading(false);
      }
    };

    fetchCompanyData();
  }, [user]);

  // 5️⃣ If auth or company is still loading, show a fallback
  if (authLoading || companyLoading) {
    return <p className="text-center text-gray-600 mt-10">Loading...</p>;
  }

  return (
    <SidebarProvider>
      {/* Same UI as before */}
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar>
          <SidebarContent className="flex flex-col h-full">
            <SidebarGroup>
              <SidebarGroupLabel>Company Dashboard</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <a href={item.url} className="flex items-center gap-2">
                          {React.createElement(item.icon)}
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* User Profile Section */}
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
                            {company.company_name}
                          </p>
                          <p className="text-xs text-gray-500">Admin</p>
                        </>
                      ) : (
                        <p>Unknown Company</p>
                      )}
                    </div>
                  </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-500">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarContent>
        </Sidebar>

        {/* Main Page Content */}
        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
  );
}
