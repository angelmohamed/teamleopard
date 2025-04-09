import React from "react";
import { render, screen, act, fireEvent } from "@testing-library/react";
import FilterAside from "../filters-aside";
import { supabase } from "@/lib/supabaseClient";

// Mock the Accordion components so that all content is always rendered.
jest.mock("@/components/ui/accordion", () => {
  return {
    Accordion: ({ children }) => <div>{children}</div>,
    AccordionItem: ({ children }) => <div>{children}</div>,
    AccordionTrigger: ({ children, ...props }) => <button {...props}>{children}</button>,
    AccordionContent: ({ children }) => <div>{children}</div>,
  };
});

// Mock supabase.from for employers.
jest.mock("@/lib/supabaseClient", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("FilterAside Component", () => {
  test("applies and resets filters correctly", async () => {
    const onFilterChange = jest.fn();
    // Mock fetching employers.
    supabase.from.mockImplementation((table) => {
      if (table === "Employer") {
        return {
          select: jest.fn().mockReturnThis(),
          then: (cb) =>
            cb({
              data: [
                { id: "e1", company_name: "Company One" },
                { id: "e2", company_name: "Company Two" },
              ],
              error: null,
            }),
        };
      }
      return { then: (cb) => cb({ data: [], error: null }) };
    });
    
    await act(async () => {
      render(<FilterAside onFilterChange={onFilterChange} />);
    });
    
    // Since our Accordion is mocked to be always open, we can immediately query for elements.
    const minSalaryInput = screen.getByPlaceholderText("Min salary");
    expect(minSalaryInput).toBeInTheDocument();
    fireEvent.change(minSalaryInput, { target: { value: "50000" } });
    
    // Query the "Technology & IT" radio button.
    const sectorRadio = screen.getByLabelText("Technology & IT");
    expect(sectorRadio).toBeInTheDocument();
    fireEvent.click(sectorRadio);
    
    // Query the select element for job types.
    const jobTypeSelect = screen.getByDisplayValue("All Job Types");
    fireEvent.change(jobTypeSelect, { target: { value: "Full-time" } });
    
    // Click the Apply Filters button.
    const applyFiltersButton = screen.getByText("Apply Filters");
    fireEvent.click(applyFiltersButton);
    
    expect(onFilterChange).toHaveBeenCalledWith({
      salary: { min: 50000, max: null },
      sector: "Technology & IT",
      employer: null,
      jobType: "Full-time",
    });
    
    // Click "Clear all filters" and verify that filters are reset.
    const clearButton = screen.getByText("Clear all filters");
    fireEvent.click(clearButton);
    
    expect(onFilterChange).toHaveBeenCalledWith({});
  });

  test("filters employers based on search input", async () => {
    supabase.from.mockImplementation((table) => {
      if (table === "Employer") {
        return {
          select: jest.fn().mockReturnThis(),
          then: (cb) =>
            cb({
              data: [
                { id: "e1", company_name: "Alpha Inc." },
                { id: "e2", company_name: "Beta LLC" },
              ],
              error: null,
            }),
        };
      }
      return { then: (cb) => cb({ data: [], error: null }) };
    });
    
    await act(async () => {
      render(<FilterAside onFilterChange={jest.fn()} />);
    });
    
    // Query the employer search input by placeholder
    const employerSearchInput = screen.getByPlaceholderText("Search employer");
    expect(employerSearchInput).toBeInTheDocument();
    fireEvent.change(employerSearchInput, { target: { value: "Alpha" } });
    
    // For the select element, get it by its default display value.
    const selectElement = screen.getByDisplayValue("All Employers");
    fireEvent.change(selectElement, { target: { value: "e1" } });
    
    // Verify that the option "Alpha Inc." appears in the document.
    expect(screen.getByText("Alpha Inc.")).toBeInTheDocument();
  });
});
