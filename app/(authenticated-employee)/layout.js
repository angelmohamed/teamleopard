"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  Bell,
  User,
  LogOut,
  LayoutDashboard,
  MoveLeft,
  MoveRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { usePathname } from "next/navigation";
import NotificationCard from "./notification";
import { Label } from "recharts";

// Context to share user data across all dashboard pages
const AuthContext = createContext(null);

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname(); // Add this line

  useEffect(() => {
    const fetchUser = async () => {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();
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
        router.replace(`/company-dashboard/${userId}`);
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

  const [notificationList, setNotificationList] = useState([]);
  const [loadingNotis, setLoadingNotis] = useState(true); //loading notifications
  const [unreadNotis, setUnreadNotis] = useState(false); //whether the user has unread notifications

  //variables for pages
  const [notiPage, setNotiPage] = useState(1);
  const [nextPage, setNextPage] = useState(false);
  const [prevPage, setPrevPage] = useState(false);

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

  //fetch notification info
  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from("Notifications")
      .select(`*`)
      .eq("employee_receiver_id", user.id)
      .eq("hidden", false) //hide hidden notis
      .order("created_at", { ascending: false }); //newest notis first
    //console.log("Notifications data:", data, "Error:", error);
    if (!error && data) {
      setNotificationList(data);
      setUnreadNotis(data.some((notification) => notification.read === false)); //check for unread notifications
    }
    setLoadingNotis(false);
  };

  useEffect(() => {
    //run when user changes
    if (!user) return;
    fetchNotifications();
  }, [user]);

  useEffect(() => {
    //run when notifications list changes
    if (notificationList.length > 0) {
      handleChangePage(0); //0 just refreshes the status of pages
    }
  }, [notificationList]);

  //locally update first for instant response
  const handleMarkReadLocal = () => {
    setNotificationList((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
    setUnreadNotis(false);
  };

  //mark all notifications as read in the database
  const handleMarkReadDB = async () => {
    const { error } = await supabase
      .from("Notifications")
      .update({ read: true })
      .eq("employee_receiver_id", user.id)
      .eq("read", false); // only update those that are unread

    if (error) {
      return;
    }
    await fetchNotifications(); //re-update notifications list to ensure consistency
  };

  const handleChangePage = (delta) => {
    const newPage = notiPage + delta;
    setNotiPage(newPage);
    setPrevPage(newPage != 1);
    setNextPage(newPage * 3 < notificationList.length);
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
                  {/* Notification Dropdown */}
                  <div className="relative">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Bell size={28} />
                          {/* unread notis icon */}
                          {unreadNotis && (
                            <span className="absolute top-1 right-2 block h-2 w-2 rounded-full bg-red-500"></span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="mt-2 w-auto items-center bg-white shadow-md rounded-md border p-2">
                        {loadingNotis ? (
                          <p className="text-sm text-black text-center">
                            Loading...
                          </p>
                        ) : notificationList.length > 0 ? (
                          <div>
                            <div className="flex flex-row justify-between items-center">
                              <h1 className="text-2xl underline font-semibold mb-1 ml-1">
                                Notifications
                              </h1>
                              <Button
                                onClick={() => {
                                  handleMarkReadLocal();
                                  handleMarkReadDB();
                                }}
                                variant="outline"
                                className="text-xs mb-1"
                              >
                                Mark all as read
                              </Button>
                            </div>
                            {/* display 3 notifications at once */}
                            <div className="space-y-2">
                              {[3, 2, 1].map((i) => (
                                <NotificationCard
                                  key={i}
                                  initNotification={
                                    notificationList[notiPage * 3 - i]
                                  }
                                  onUpdateNotification={(updatedNoti) => {
                                    //this function updates the fetched data in layout.js to remain consistent with the cards
                                    setNotificationList((prevList) => {
                                      const newList = prevList.map((n) =>
                                        n.id === updatedNoti.id
                                          ? updatedNoti
                                          : n
                                      );
                                      setUnreadNotis(
                                        newList.some(
                                          (notification) =>
                                            notification.read === false
                                        )
                                      );
                                      return newList;
                                    });
                                  }}
                                />
                              ))}
                              {/* arrows to go between pages */}
                            </div>
                            <div className="flex items-center justify-center mt-1 space-x-6">
                              <Button
                                onClick={() => {
                                  handleChangePage(-1 /*-1 page*/);
                                }}
                                disabled={!prevPage}
                                variant="outline"
                              >
                                <MoveLeft size={20} />
                              </Button>
                              <h1 className="text-xl font-semibold mb-1 w-12 text-center">
                                {notiPage}
                              </h1>
                              <Button
                                onClick={() => {
                                  handleChangePage(1 /*+1 page*/);
                                }}
                                disabled={!nextPage}
                                variant="outline"
                              >
                                <MoveRight size={20} />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray text-center">
                            All quiet here.
                          </p>
                        )}
                      </PopoverContent>
                    </Popover>
                  </div>

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
