import React from "react";
import TestRenderer from "react-test-renderer";
import RootLayout from "../layout";

// Mock next/font/local so that the layout receives predictable classes.
jest.mock("next/font/local", () => {
  return jest.fn(() => ({
    variable: "--mock-font-variable",
  }));
});

describe("RootLayout", () => {
  test("renders html with correct lang attribute and contains children", () => {
    const testRenderer = TestRenderer.create(
      <RootLayout>
        <div data-testid="child">Test Content</div>
      </RootLayout>
    );
    const tree = testRenderer.toJSON();

    // Check that the top-level element is an <html> element with lang="en"
    expect(tree.type).toBe("html");
    expect(tree.props.lang).toBe("en");

    // Instead of joining children as strings, use the test instance to locate the child.
    const testInstance = testRenderer.root;
    const childInstance = testInstance.findByProps({ "data-testid": "child" });
    expect(childInstance.props.children).toBe("Test Content");
  });

  test("applies the mocked font variable in the <html> element's className", () => {
    const testRenderer = TestRenderer.create(
      <RootLayout>
        <div>Content</div>
      </RootLayout>
    );
    const tree = testRenderer.toJSON();

    // The className should include the mock font variable.
    expect(tree.props.className).toMatch(/--mock-font-variable/);
  });
});
