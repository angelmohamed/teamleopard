import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Textarea } from "../textarea"; // Adjust the path accordingly

describe("Textarea Component", () => {
  it("renders the textarea with the correct className and id", () => {
    const { container } = render(
      <Textarea id="test-textarea" className="custom-class" />
    );
    const textarea = screen.getByRole("textbox");

    // Check if the correct className and id are applied
    expect(textarea).toHaveClass("custom-class");
    expect(textarea).toHaveAttribute("id", "test-textarea");
  });

  it("applies focus styles when focused", () => {
    const { container } = render(<Textarea id="test-textarea" />);
    const textarea = screen.getByRole("textbox");

    // Focus the textarea
    fireEvent.focus(textarea);

    // Check if focus styles are applied
    expect(textarea).toHaveClass("focus:ring-indigo-500");
  });

  it("allows user input", () => {
    render(<Textarea id="test-textarea" />);
    const textarea = screen.getByRole("textbox");

    // Simulate user input
    fireEvent.change(textarea, { target: { value: "Hello, world!" } });

    // Check if the input value is correct
    expect(textarea.value).toBe("Hello, world!");
  });
});
