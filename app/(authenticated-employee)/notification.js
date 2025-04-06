"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Trash2, Eye, EyeOff, Undo } from "lucide-react";

// Displays a single notification (or an empty card if none is provided)
export default function NotificationCard({initNotification, onUpdateNotification}) {
  //store read/unread status in local var for instant updating.
  const [notification, setNotification] = useState(initNotification);
  useEffect(() => { //incase of change
    setNotification(initNotification);
  }, [initNotification]);

  // recycles code from dashboard/listing/id/posted-time.js to display recency
  const [postedMessage, setPosted] = useState("Just now"); // Default time message
  useEffect(() => {
    if (!notification) return;
    // Current Date
    const currentDate = new Date();
    // Taken from 'notification' data
    const publishedDate = new Date(notification.created_at);
    // Difference calculated in milliseconds
    const timeDifference = currentDate - publishedDate;

    // Displays the time since the date was published
    // Text varies with how long its been
    let displayText = "Just now";
    if (timeDifference > 63072000000) { //>2 years
      displayText = `${Math.floor(timeDifference / 31536000000)} years ago`;
    } else if (timeDifference > 31536000000) { //>1 year
      displayText = "1 year ago";
    } else if (timeDifference > 5256000000) { //>2 months
      displayText = `${Math.floor(timeDifference / 2628000000)} months ago`;
    } else if (timeDifference > 172800000) { //>2 days
      displayText = `${Math.floor(timeDifference / 86400000)} days ago`;
    } else if (timeDifference > 7200000) { //>2 hours
      displayText = `${Math.floor(timeDifference / 3600000)} hours ago`;
    } else if (timeDifference > 3600000) { //>1 hour
      displayText = "1 hour ago";
    } else if (timeDifference > 120000) { //>2 minutes
      displayText = `${Math.floor(timeDifference / 60000)} minutes ago`;
    } //otherwise says recently
  
    setPosted(displayText);
  }, [notification]);
  // Published Date Formatting from DB to be displayed
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // 24-hour
      timeZone: "UTC",
    }).format(date);
  };

  const handleSetRead = async (e, setTo) => {
    e.preventDefault(); // Prevents clicking the box behind
    const updatedNoti = { ...notification, read: setTo };
    setNotification(updatedNoti);
    onUpdateNotification(updatedNoti); //send update back to layout.js to inform it of the change

    const { error } = await supabase
      .from("Notifications")
      .update({ read: setTo })
      .eq("id", notification.id)
    if (error) {
      console.error("Error updating read:", error);
      return;
    }
  }
  
  const handleSetHidden = async (e, setTo) => {
    e.preventDefault(); // Prevents clicking the box behind
    const updatedNoti = { ...notification, hidden: setTo };
    setNotification(updatedNoti);
    onUpdateNotification(updatedNoti); //send update back to layout.js to inform it of the change

    const { error } = await supabase
      .from("Notifications")
      .update({ hidden: setTo })
      .eq("id", notification.id)
    if (error) {
      console.error("Error updating deletion:", error);
      return;
    }
  }

  return (
    <div>
      {!notification ? (
        //empty card when no notification is present
        <Card className="border justify-center items-center w-[450px] h-[150px] shadow-sm hover:shadow-md transition flex flex-col bg-white">
          ...
        </Card>
      ) : (
        notification.hidden ? (
          <Card className="border justify-center items-center w-[450px] h-[150px] shadow-sm hover:shadow-md transition flex flex-col bg-white">
            <p className="text-gray-700 italic mb-2">This notification was deleted.</p>
            <button 
              onClick={(e) => handleSetHidden(e, false)}
              className="flex items-center justify-center border rounded-md text-sm">
              <Undo size={16} /> Undo
            </button>
          </Card>
        ) : (
          <Link key={notification.id} href={notification.link} passHref>
            <Card className={`border w-[450px] h-[150px] shadow-sm hover:shadow-md transition flex flex-col cursor-pointer 
              ${notification.read ? 'bg-white' : 'bg-gradient-to-b from-red-100 to-white'}`}>
              <CardHeader className="flex flex-row items-center">
                <CardTitle className="flex-1 text-xl font-semibold truncate whitespace-nowrap">
                  {notification.title}
                  {/*Roughly 28 character limit for title*/}
                </CardTitle>
                {/* HoverCard to display exact date and time */}
                <HoverCard className="relative inline-block">
                  <HoverCardTrigger>
                    <h1 className="text-sm text-gray-500 mr-2">{postedMessage}</h1>
                  </HoverCardTrigger>
                  <HoverCardContent side="top" align="start" className="p-1 bg-white border rounded-md text-xs text-gray-700 shadow-md w-auto min-w-fit">
                    <h1 className="text-center">{formatDate(notification.created_at)} UTC.</h1>
                  </HoverCardContent>
                </HoverCard>
                {/* icons */}
                <div className="flex items-center space-x-2">
                  {notification.read ? (
                    <button 
                      onClick={(e) => handleSetRead(e, false)}
                      title="Mark as unread"
                      className="flex items-center justify-center bg-transparent rounded-md">
                      <EyeOff size={16} />
                    </button>
                  ) : (
                    <button 
                      onClick={(e) => handleSetRead(e, true)}
                      title="Mark as read"
                      className="flex items-center justify-center bg-transparent rounded-md">
                      <Eye size={16} />
                    </button>
                  )}

                  <button 
                    onClick={(e) => handleSetHidden(e, true)}
                    title="Delete notification"
                    className="flex items-center justify-center bg-transparent rounded-md">
                    <Trash2 size={16} />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="text-sm flex-grow overflow-hidden leading-tight">
                {notification.content}
                {/*3 line limit for content*/}
              </CardContent>
            </Card>
          </Link>
        )
      )}
    </div>
  );
}