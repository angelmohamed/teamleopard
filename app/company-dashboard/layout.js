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
          <SidebarContent>
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
          </SidebarContent>
        </Sidebar>

        {/* ✅ Page Content goes here */}
        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
  );
}
