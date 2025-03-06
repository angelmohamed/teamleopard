"use client";

import React, { useState, useEffect } from "react";
import { Home, Inbox, Search, Settings, UserRound } from "lucide-react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient"; // Import Supabase client

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
} from "@/components/ui/sidebar"; // Ensure this path is correct

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // shadcn Avatar
import { Separator } from "@/components/ui/separator"; // shadcn Separator
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"; // shadcn Dropdown Menu

// Menu items.
const items = [
  { title: "Home", url: "#", icon: Home },
  { title: "Search", url: "#", icon: Search },
  { title: "Inbox", url: "#", icon: Inbox },
  { title: "Company Profile", url: "#", icon: UserRound },
  { title: "Settings", url: "#", icon: Settings },
];

export default function Layout({ children }) {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const param = useParams();
  const id = param.id; // Get the company ID from the URL

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        // Fetch company data from the "Employer" table
        const { data, error } = await supabase
          .from("Employer") // Replace with the actual table name
          .select("company_name") // Columns you need
          .eq("id", id) // Use the id from the URL params
          .single(); // Get a single result (assuming id is unique)

        if (error) {
          throw error;
        }
        setCompany(data); // Set company data if fetch is successful
      } catch (error) {
        console.error("Error fetching company data:", error.message);
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };

    if (id) {
      fetchCompanyData();
    }
  }, [id]);

  return (
    <SidebarProvider>
      {/* ✅ Wrap Sidebar + Page Content in the same flex container */}
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

            {/* ✅ User Profile Section (shadcn UI) */}
            <div className="mt-auto p-4">
              <Separator className="mb-3" /> {/* Divider line */}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-3 cursor-pointer">
                    <Avatar>
                      <AvatarImage src="/profile.jpg" alt="User Avatar" />
                      <AvatarFallback>JD</AvatarFallback> {/* Initials if no image */}
                    </Avatar>
                    <div>
                      {/* Check if the company is loading */}
                      {loading ? (
                        <p>Loading...</p> // Show loading text while fetching
                      ) : (
                        <div>
                          <p className="text-sm font-medium">{company?.company_name}</p>
                          <p className="text-xs text-gray-500">Admin</p>
                        </div>
                      )}
                    </div>
                  </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-500">Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarContent>
        </Sidebar>

        {/* ✅ Page Content goes here */}
        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
  );
}