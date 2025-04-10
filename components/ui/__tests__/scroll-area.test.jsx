/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { ScrollArea } from "../scroll-area";

describe("ScrollArea", () => {
  it("renders a scrollable list of items", () => {
    render(
      <ScrollArea className="h-40 w-64" data-testid="scroll-area">
        <div>
          {Array.from({ length: 50 }, (_, i) => (
            <div key={i} data-testid="item">
              Item {i + 1}
            </div>
          ))}
        </div>
      </ScrollArea>
    );

    // Check ScrollArea container exists
    const scroll = screen.getByTestId("scroll-area");
    expect(scroll).toBeInTheDocument();

    // Ensure all items rendered
    const items = screen.getAllByTestId("item");
    expect(items.length).toBe(50);
  });
});
