"use client";
import React, { useState, useEffect } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

//Optional: Hover card to display exact publishing date.

// Handles the displayed text in the Published Time section
export default function PostedTimeDisplay({published}) {
  // Initialize default message
  const [postedMessage, setPosted] = useState("Posted recently."); // Default message

  useEffect(() => {
    // Check for valid date
    if (!published) return;

    // Current Date
    const currentDate = new Date();
    // Taken from parameter in page.js
    const publishedDate = new Date(published);
    // Difference calculated in milliseconds
    const timeDifference = currentDate - publishedDate;

    // Displays the time since the date was published
    // Text varies with how long its been
    let displayText = "Posted recently.";
    if (timeDifference > 63072000000) { //>2 years
      displayText = `Posted ${Math.floor(timeDifference / 31536000000)} years ago`;
    } else if (timeDifference > 31536000000) { //>1 year
      displayText = "Posted 1 year ago";
    } else if (timeDifference > 5256000000) { //>2 months
      displayText = `Posted ${Math.floor(timeDifference / 2628000000)} months ago`;
    } else if (timeDifference > 172800000) { //>2 days
      displayText = `Posted ${Math.floor(timeDifference / 86400000)} days ago`;
    } else if (timeDifference > 7200000) { //>2 hours
      displayText = `Posted ${Math.floor(timeDifference / 3600000)} hours ago`;
    }

    setPosted(displayText);
  }, [published]); // Runs when `published` prop changes

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

  return (
    <div>
      {/* HoverCard to display exact date and time */}
      <HoverCard className="relative inline-block">
        <HoverCardTrigger>
          <h1 className="text-sm text-gray-500 mb-2">{postedMessage}</h1>
        </HoverCardTrigger>
        <HoverCardContent side="top" align="start" className="p-1 bg-white border rounded-md text-xs text-gray-700 shadow-md w-auto min-w-fit">
          <h1 className="text-center">{formatDate(published)} UTC.</h1>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}