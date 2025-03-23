import React from "react";

//TODO: TIMEZONE HANDLING?
//TODO: ROLLING DEADLINE HANDLING (change the == if necessary)

// Handles the displayed text in the Deadline section
export default async function DeadlineDisplay({deadline}) {
  // 1. The job posting has Rolling Deadline submitted
  if (deadline == "rolling") {
    return (<div>
      <h1 className="text-3xl md:text-4xl text-slate-800">Rolling Deadline.</h1>  
    </div>);
  }

  // Current Date
  const currentDate = new Date();

  // Deadline Date for comparison
  const deadlineDate = new Date(deadline);

  const timeDifference = deadlineDate - currentDate;

  //TimeDifference is calculated in milliseconds.
  //We divide by 86400000 (1000 x 60 x 60 x 24) to convert to days.
  //After this, using the Math Floor function to round down.
  const daysLeft = Math.floor(timeDifference / 86400000);

  //In the last 24h, display hours left instead.
  //Same as before, but divde by 3600000 (1000 x 60 x 60) to convert to hours.
  const hoursLeft = Math.floor(timeDifference / 3600000);

  // Deadline Date Formatting from DB to be displayed
  const formatDeadline = (isoString) => {
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

  // Takes these two values and compares them, displaying varying urgency depending on how close the Deadline is.

  // 2. The current date is beyond the deadline. The Job Listing is closed.
  if (deadlineDate < currentDate) {
    return (<div>
      <h1 className="text-3xl md:text-4xl text-red-500 italic">Passed.</h1>  
      <p className="italic text-lg text-red-400">Closed on {formatDeadline(deadline)}.</p>
    </div>);
  }

  // 3. The current date is <7 days before the deadline. The date is displayed in red with a warning below.
  if (daysLeft < 7) {
    // The warning below will display hours left if under a day remains
    if (daysLeft == 0) {
      // Also displays <1 hours if true.
      if (hoursLeft == 0) {
        return (<div>
          <h1 className="text-3xl md:text-4xl text-red-800">{formatDeadline(deadline)}</h1> 
          <p className="italic text-lg text-red-400">&lt;1 hour left.</p>
        </div>);
      } else {
        return (<div>
          <h1 className="text-3xl md:text-4xl text-red-800">{formatDeadline(deadline)}</h1> 
          <p className="italic text-lg text-red-400">{hoursLeft} hours left.</p>
        </div>);
      }
    } else {
      return (<div>
        <h1 className="text-3xl md:text-4xl text-red-800">{formatDeadline(deadline)}</h1> 
        <p className="italic text-lg text-red-500">{daysLeft} days left.</p>
      </div>);
    }
  }

  // 4. The current date is over a week away from the deadline. Display the date with no warnings.
  return (
    <div>
      <h1 className="text-3xl md:text-4xl text-slate-800">{formatDeadline(deadline)}</h1> 
    </div>
  );
}