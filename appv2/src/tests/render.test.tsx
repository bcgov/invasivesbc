import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import App from "../UI/App";
import { userEvent } from "@testing-library/user-event";
import React from "react";

describe("can render", function () {
  beforeEach(() => {
    render(<App />);
  });
  it("renders at all", function () {
    expect(document.getElementById("app-container") !== null).toBeTruthy();
  });
  it("renders main nav options", async function () {
    expect(document.getElementById("app-header") !== null).toBeTruthy();
    expect(document.getElementById("nav-home") !== null).toBeTruthy();
    expect(document.getElementById("nav-demo") !== null).toBeTruthy();
    expect(document.getElementById("nav-contact") !== null).toBeTruthy();
  });
  it("renders right body content based on tab/nav click", async function () {
    const user = userEvent.setup();
    await user.click(screen.getByText("Contact"));
    expect(screen.getByText("250250") !== null).toBeTruthy();
  });
});