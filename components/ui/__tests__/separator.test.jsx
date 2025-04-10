/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Separator } from "../separator";

describe("Separator", () => {
  it("renders a horizontal separator by default", () => {
    render(<Separator data-testid="separator" />);
    const sep = screen.getByTestId("separator");

    expect(sep).toBeInTheDocument();
    expect(sep).toHaveClass("h-[1px]");
    expect(sep).toHaveClass("w-full");
  });

  it("renders a vertical separator when specified", () => {
    render(
      <Separator orientation="vertical" data-testid="separator-vertical" />
    );
    const sep = screen.getByTestId("separator-vertical");

    expect(sep).toBeInTheDocument();
    expect(sep).toHaveClass("h-full");
    expect(sep).toHaveClass("w-[1px]");
  });
});
