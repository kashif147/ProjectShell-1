import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CheckinScan, { extractPass } from "./CheckinScan";
import { scanCheckinPass } from "../../services/eventsApi";

jest.mock("../../services/eventsApi", () => ({ scanCheckinPass: jest.fn() }));

const PASS = "eyJ2IjoyfQ.c2lnbmF0dXJl";

describe("extractPass", () => {
  it("accepts a bare pass or a link ending in one", () => {
    expect(extractPass(PASS)).toBe(PASS);
    expect(extractPass(`https://host/events-service/api/public/checkin/${PASS}`)).toBe(PASS);
    expect(extractPass(`  ${PASS}\n`)).toBe(PASS);
    expect(extractPass("")).toBe("");
  });
});

describe("CheckinScan", () => {
  beforeEach(() => scanCheckinPass.mockReset());

  it("submits the scanned pass to the organiser scan API and shows the attendee", async () => {
    scanCheckinPass.mockResolvedValue({ alreadyCheckedIn: false, attendee: { firstName: "Ada", lastName: "Byrne" }, session: { label: "Day 1" } });
    render(<CheckinScan />);
    const input = screen.getByLabelText("Check-in pass");
    fireEvent.change(input, { target: { value: PASS } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter", charCode: 13 });
    await waitFor(() => expect(screen.getByText("Ada Byrne checked in - Day 1.")).toBeInTheDocument());
    expect(scanCheckinPass).toHaveBeenCalledWith(PASS);
  });

  it("maps a closed window to a correction hint", async () => {
    scanCheckinPass.mockRejectedValue({ response: { data: { error: { code: "ATTENDANCE_CLOSED" } } } });
    render(<CheckinScan />);
    fireEvent.change(screen.getByLabelText("Check-in pass"), { target: { value: PASS } });
    fireEvent.click(screen.getByText("Check in"));
    await waitFor(() => expect(screen.getByText(/has closed - record a correction/)).toBeInTheDocument());
  });
});
