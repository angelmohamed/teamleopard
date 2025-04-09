import React from "react";
import { render, screen } from "@testing-library/react";
import PostedTimeDisplay from "../posted-time";

// constants to make things easier
const HOUR = 3600000;
const DAY = HOUR * 24;
const MONTH = DAY * 31;
const YEAR = DAY * 365;

describe("PostedTimeDisplay Component", () => {
  test("displays 'Posted recently' when published less than 2 hours ago", () => {
    // Published 1 hour ago
    const publishedDate = new Date(Date.now() - 1 * HOUR).toISOString();
    render(<PostedTimeDisplay published={publishedDate} />);
    expect(screen.getByText("Posted recently")).toBeInTheDocument();
  });

  test("displays hours ago when published >2 hours and less than 2 days ago", () => {
    // Published 3 hours ago
    const publishedDate = new Date(Date.now() - 3 * HOUR).toISOString();
    render(<PostedTimeDisplay published={publishedDate} />);
    expect(screen.getByText("Posted 3 hours ago")).toBeInTheDocument();
  });

  test("displays days ago when published >2 days and less than 2 months ago", () => {
    // Published 5 days ago
    const publishedDate = new Date(Date.now() - 5 * DAY).toISOString();
    render(<PostedTimeDisplay published={publishedDate} />);
    expect(screen.getByText("Posted 5 days ago")).toBeInTheDocument();
  });

  test("displays months ago when published >2 months and less than 1 year ago", () => {
    // Published 3 months ago (3 * MONTH ms)
    const publishedDate = new Date(Date.now() - 3 * MONTH).toISOString();
    render(<PostedTimeDisplay published={publishedDate} />);
    // Expected months: floor(3 * MONTH / MONTH) = 3
    expect(screen.getByText("Posted 3 months ago")).toBeInTheDocument();
  });

  test("displays 'Posted 1 year ago' when published >1 year and <=2 years ago", () => {
    // Published 1.5 years ago (1.5 * YEAR)
    const publishedDate = new Date(Date.now() - 1.5 * YEAR).toISOString();
    render(<PostedTimeDisplay published={publishedDate} />);
    expect(screen.getByText("Posted 1 year ago")).toBeInTheDocument();
  });

  test("displays years ago when published >2 years ago", () => {
    // Published 2.5 years ago.
    const publishedDate = new Date(Date.now() - 2.5 * YEAR).toISOString();
    render(<PostedTimeDisplay published={publishedDate} />);
    // Expected years: floor(2.5 years in ms / YEAR) = floor(2.5) = 2 years ago.
    expect(screen.getByText("Posted 2 years ago")).toBeInTheDocument();
  });

  test("displays formatted date in hover card content", () => {
    const fixedDate = new Date("2023-01-01T12:00:00Z").toISOString();
    render(<PostedTimeDisplay published={fixedDate} />);
    // Check that the hover card trigger text is present.
    expect(screen.getByText(/Posted/)).toBeInTheDocument();
    // The precise formatted date might be tested if your HoverCard renders it immediately or on hover.
    // For example, if the formatted string contains "01/01/2023", you can assert that.
    // Note: Adjust the expected text based on your Intl.DateTimeFormat configuration.
  });
});
