import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Textarea } from "../textarea"; // Adjust the path as needed

describe("Textarea Component", () => {
  it("renders the textarea with the correct id and className", () => {
    render(<Textarea id="test-textarea" className="custom-class" />);

    const textarea = screen.getByRole("textbox");

    // Check if the textarea has the provided id and className
    expect(textarea).toHaveClass("custom-class");
    expect(textarea).toHaveAttribute("id", "test-textarea");
  });

  it("applies the correct focus styles on focus", () => {
    render(<Textarea id="test-textarea" />);

    const textarea = screen.getByRole("textbox");

    // Simulate focus on the textarea
    fireEvent.focus(textarea);

    // Check if the focus styles are applied
    expect(textarea).toHaveClass("focus:ring-indigo-500");
  });

  it("can handle user input", () => {
    render(<Textarea id="test-textarea" />);

    const textarea = screen.getByRole("textbox");

    // Simulate user input
    fireEvent.change(textarea, { target: { value: "Test input" } });

    // Verify that the input value has been updated
    expect(textarea.value).toBe("Test input");
  });

  it("does not trigger change event when input value doesn't change", () => {
    const handleChange = jest.fn();
    render(<Textarea id="test-textarea" onChange={handleChange} />);

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "" } });

    expect(handleChange).not.toHaveBeenCalled();
  });
});
