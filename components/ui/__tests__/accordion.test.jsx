/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../accordion";

describe("Accordion component", () => {
  it("renders trigger and toggles content on click", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Click Me</AccordionTrigger>
          <AccordionContent>Accordion content here</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const trigger = screen.getByText("Click Me");
    expect(trigger).toBeInTheDocument();

    // Content should not be in DOM initially
    expect(screen.queryByText("Accordion content here")).toBeNull();

    // Click to open
    fireEvent.click(trigger);
    expect(screen.getByText("Accordion content here")).toBeVisible();

    // Click to close
    fireEvent.click(trigger);
    expect(screen.queryByText("Accordion content here")).toBeNull();
  });

  it("applies className to AccordionItem", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="custom" className="bg-red-100" data-testid="item">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    expect(screen.getByTestId("item")).toHaveClass("bg-red-100");
  });
});
