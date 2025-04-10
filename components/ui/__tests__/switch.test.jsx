/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Switch } from "../switch";

describe("Switch", () => {
  it("renders with correct initial state", () => {
    const { rerender } = render(
      <Switch checked={true} onCheckedChange={() => {}} />
    );
    // Check background for "on"
    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(screen.getByRole("checkbox").nextSibling).toHaveClass("bg-blue-500");

    // Re-render with unchecked
    rerender(<Switch checked={false} onCheckedChange={() => {}} />);
    expect(screen.getByRole("checkbox")).not.toBeChecked();
    expect(screen.getByRole("checkbox").nextSibling).toHaveClass("bg-gray-400");
  });

  it("calls onCheckedChange when clicked", () => {
    const handleChange = jest.fn();
    render(<Switch checked={false} onCheckedChange={handleChange} />);

    fireEvent.click(screen.getByRole("checkbox"));
    expect(handleChange).toHaveBeenCalled();
  });

  it("moves the thumb when checked", () => {
    const { container, rerender } = render(
      <Switch checked={false} onCheckedChange={() => {}} />
    );

    // Grab all divs inside the inner wrapper (label > div > div)
    const allDivs = container.querySelectorAll("label > div > div");

    // The last div should be the thumb
    const thumb = allDivs[allDivs.length - 1];
    expect(thumb).not.toHaveClass("translate-x-5");

    // Re-render with checked = true
    rerender(<Switch checked={true} onCheckedChange={() => {}} />);
    expect(allDivs[allDivs.length - 1]).toHaveClass("translate-x-5");
  });
});
