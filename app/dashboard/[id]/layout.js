import Image from "next/image";
import Link from "next/link";
import { Bell, MessageSquare, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RootLayout({ children }) {
  return (
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
                {/* Messages */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:text-black"
                  asChild
                >
                  <Link href="/messages">
                    <MessageSquare size={28} />
                  </Link>
                </Button>

                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-gray-600 hover:text-black"
                  asChild
                >
                  <Link href="/notifications">
                    <Bell size={28} />
                    <span className="absolute -top-1 right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      1
                    </span>
                  </Link>
                </Button>

                {/* Profile */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:text-black"
                  asChild
                >
                  <Link href="/profile">
                    <User size={28} />
                  </Link>
                </Button>
              </div>

              {/* Divider - Hidden on Mobile */}
              <div className="hidden md:block h-6 border-l"></div>

              {/* Employer / Post Job - Hidden on Mobile */}
              <Link
                href="/employer"
                className="hidden md:block text-gray-700 hover:text-black text-sm font-medium"
              >
                Employers / Post Job
              </Link>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <main className="max-w-7xl mx-auto mt-2 px-6 md:px-8">{children}</main>
      </body>
    </html>
  );
}
