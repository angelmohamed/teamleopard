/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "../tooltip";

describe("Tooltip", () => {
  it("renders tooltip content when forced open", () => {
    render(
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger asChild>
            <button>Hover me</button>
          </TooltipTrigger>
          <TooltipContent data-testid="tooltip-content">
            Tooltip text
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    const content = screen.getByTestId("tooltip-content");
    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent("Tooltip text");
  });
});
