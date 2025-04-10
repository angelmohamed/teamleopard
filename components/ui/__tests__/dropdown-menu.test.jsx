/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuShortcut,
} from "../dropdown-menu";

function TestDropdown({ onLogout = jest.fn() }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button>Open Menu</button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={onLogout}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

describe("DropdownMenu", () => {
  it("renders trigger and shows content on click", async () => {
    render(<TestDropdown />);

    const trigger = screen.getByText("Open Menu");
    expect(trigger).toBeInTheDocument();

    // Menu should not be visible initially
    expect(screen.queryByText("Logout")).not.toBeInTheDocument();

    // Click trigger
    await userEvent.click(trigger);

    // Now "Logout" should appear
    expect(await screen.findByText("Logout")).toBeInTheDocument();
  });

  it("calls onClick when dropdown item is clicked", async () => {
    const onLogout = jest.fn();
    render(<TestDropdown onLogout={onLogout} />);

    const trigger = screen.getByText("Open Menu");
    await userEvent.click(trigger);

    const item = await screen.findByText("Logout");
    await userEvent.click(item);

    expect(onLogout).toHaveBeenCalled();
  });
});
describe("DropdownMenu coverage for all components", () => {
  it("renders submenus, checkboxes, radios, label, separator, and shortcut", async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button>Open</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel inset>Actions</DropdownMenuLabel>

          <DropdownMenuItem>Simple Item</DropdownMenuItem>

          <DropdownMenuCheckboxItem checked>
            Enable Feature
          </DropdownMenuCheckboxItem>

          <DropdownMenuRadioGroup>
            <DropdownMenuRadioItem value="option1">
              Option 1
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>

          <DropdownMenuSeparator />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger inset>More Options</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>
                Nested Action <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const trigger = screen.getByText("Open");
    await userEvent.click(trigger); // Open main menu

    expect(await screen.findByText("Actions")).toBeInTheDocument();
    expect(await screen.findByText("Enable Feature")).toBeInTheDocument();
    expect(await screen.findByText("Option 1")).toBeInTheDocument();

    // ✅ Click "More Options" to open the submenu
    const submenuTrigger = await screen.findByText("More Options");
    await userEvent.hover(submenuTrigger); // Optional: hover to mimic real behavior
    await userEvent.click(submenuTrigger); // Ensure submenu opens

    // ✅ Now we can safely check the nested item
    expect(await screen.findByText("Nested Action")).toBeInTheDocument();
    expect(await screen.findByText("⌘K")).toBeInTheDocument();
  });
});
