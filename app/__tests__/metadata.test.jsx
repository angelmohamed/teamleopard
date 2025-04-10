import { metadata } from "../metadata"; // adjust path as needed

describe("metadata", () => {
  test("exports the correct title, description, and icons", () => {
    expect(metadata).toEqual(
      expect.objectContaining({
        title: "Look for jobs now | Connect",
        description: "A Web App for Posting and Applying for Jobs",
        icons: "/favicon.ico",
      })
    );
  });
});
