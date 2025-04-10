/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "../tabs";

describe("Tabs", () => {
  it("renders tabs and switches content when triggered", async () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content for Tab 1</TabsContent>
        <TabsContent value="tab2">Content for Tab 2</TabsContent>
      </Tabs>
    );

    // Tab 1 is selected by default
    expect(screen.getByText("Content for Tab 1")).toBeInTheDocument();
    expect(screen.queryByText("Content for Tab 2")).not.toBeInTheDocument();

    // Click Tab 2
    await userEvent.click(screen.getByText("Tab 2"));

    expect(await screen.findByText("Content for Tab 2")).toBeInTheDocument();
    expect(screen.queryByText("Content for Tab 1")).not.toBeInTheDocument();
  });

  it("applies custom classNames to list, trigger, and content", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList className="custom-list">
          <TabsTrigger className="custom-trigger" value="tab1">
            Tab 1
          </TabsTrigger>
        </TabsList>
        <TabsContent className="custom-content" value="tab1">
          Content
        </TabsContent>
      </Tabs>
    );

    expect(screen.getByText("Tab 1")).toHaveClass("custom-trigger");
    expect(screen.getByText("Content")).toHaveClass("custom-content");
  });
});
