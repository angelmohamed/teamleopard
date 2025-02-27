"use client";

import React from "react";
import { Home, Inbox, Search, Settings, UserRound } from "lucide-react";

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
                      <p className="text-sm font-medium">John Doe</p>
                      <p className="text-xs text-gray-500">Admin</p>
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
