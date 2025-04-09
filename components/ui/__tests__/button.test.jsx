import React from "react"; // <-- ADD THIS LINE
import { render, screen } from "@testing-library/react";
import { Button } from "../button";

test("renders button with correct text", () => {
  render(<Button>Click Me</Button>);
  const button = screen.getByText("Click Me");
  expect(button).toBeInTheDocument();
});
