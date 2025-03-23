import React from "react";

//TODO: TIMEZONE HANDLING?
//Optional: Hover card to display exact publishing date.

// Handles the displayed text in the Published Time section
export default async function PublishedTimeDisplay({published}) {
  // Current Date
  const currentDate = new Date();

  // Publishing Date for comparison
  const publishedDate = new Date(published);

  // Time Difference in ms, will be used to determine what to display.
  const timeDifference = currentDate - publishedDate;

  // Published Date Formatting from DB to be displayed
  const formatPublished = (isoString) => {
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

  // Displays the time since the date was published
  // Text varies with how long its been

  if (timeDifference > 63072000000) { //>2 years
    // Maximum, display amount of years.
    return (<h1 className="text-3xl md:text-4xl text-slate-800 mb-3">{Math.floor(timeDifference / 31536000000)} years ago</h1>);
  }
  if (timeDifference > 31536000000) { //>1 year
    return (<h1 className="text-3xl md:text-4xl text-slate-800 mb-3">1 year ago</h1>);
  }
  if (timeDifference > 5256000000) { //>2 months
    // Display amount of months
    return (<h1 className="text-3xl md:text-4xl text-slate-800 mb-3">{Math.floor(timeDifference / 2628000000)} months ago</h1>);
  }
  if (timeDifference > 172800000) { //>2 days
    // Display amount of days
    return (<h1 className="text-3xl md:text-4xl text-slate-800 mb-3">{Math.floor(timeDifference / 86400000)} days ago</h1>);
  }
  if (timeDifference > 7200000) { //>2 hours
    // Display amount of hours
    return (<h1 className="text-3xl md:text-4xl text-slate-800 mb-3">{Math.floor(timeDifference / 3600000)} hours ago</h1>);
  }
  // Minimum, display generic text.
  return (<h1 className="text-3xl md:text-4xl text-slate-800 mb-3">Under 2 hours ago</h1>);
}