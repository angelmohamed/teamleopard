/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Avatar, AvatarImage, AvatarFallback } from "../avatar";

describe("Avatar component", () => {
  it("renders Avatar with fallback content", () => {
    render(
      <Avatar data-testid="avatar">
        <AvatarImage src="invalid-url" />
        <AvatarFallback data-testid="fallback">JD</AvatarFallback>
      </Avatar>
    );

    const avatar = screen.getByTestId("avatar");
    const fallback = screen.getByTestId("fallback");

    expect(avatar).toBeInTheDocument();
    expect(fallback).toBeInTheDocument();
    expect(fallback).toHaveTextContent("JD");
  });

  it("applies custom className to Avatar", () => {
    render(
      <Avatar data-testid="avatar" className="bg-blue-500">
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    );

    const avatar = screen.getByTestId("avatar");
    expect(avatar).toHaveClass("bg-blue-500");
  });
});
