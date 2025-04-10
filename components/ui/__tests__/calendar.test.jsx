/**
 * @jest-environment jsdom
 */

import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Calendar } from "../calendar";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Mock DayPicker
jest.mock("react-day-picker", () => ({
  DayPicker: jest.fn(() => <div data-testid="day-picker" />),
}));

describe("Calendar Component", () => {
  const mockedDayPicker = require("react-day-picker").DayPicker;

  beforeEach(() => {
    mockedDayPicker.mockClear();
  });

  it("renders without crashing", () => {
    const { getByTestId } = render(<Calendar />);
    expect(getByTestId("day-picker")).toBeInTheDocument();
  });

  it("passes showOutsideDays prop correctly", () => {
    render(<Calendar showOutsideDays={false} />);
    expect(mockedDayPicker).toHaveBeenCalledWith(
      expect.objectContaining({ showOutsideDays: false }),
      {}
    );
  });

  it("merges custom classNames with default classNames", () => {
    const customClassNames = { month: "custom-month-class" };

    render(<Calendar classNames={customClassNames} />);

    expect(mockedDayPicker).toHaveBeenCalledWith(
      expect.objectContaining({
        classNames: expect.objectContaining({
          month: expect.stringContaining("custom-month-class"),
        }),
      }),
      {}
    );
  });

  it("forwards className prop correctly", () => {
    render(<Calendar className="my-calendar" />);
    expect(mockedDayPicker).toHaveBeenCalledWith(
      expect.objectContaining({
        className: expect.stringContaining("my-calendar"),
      }),
      {}
    );
  });

  it("includes custom IconLeft and IconRight components that render chevrons", () => {
    render(<Calendar />);
    const args = mockedDayPicker.mock.calls[0][0];

    const { container: leftContainer } = render(
      args.components.IconLeft({ className: "extra-left" })
    );
    const { container: rightContainer } = render(
      args.components.IconRight({ className: "extra-right" })
    );

    expect(leftContainer.querySelector("svg")).toBeInTheDocument();
    expect(rightContainer.querySelector("svg")).toBeInTheDocument();
    expect(leftContainer.innerHTML).toMatch(/extra-left/);
    expect(rightContainer.innerHTML).toMatch(/extra-right/);
  });
});
