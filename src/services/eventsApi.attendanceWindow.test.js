import axios from "axios";
import { deleteEventSession, setEventTimezone, scanCheckinPass } from "./eventsApi";

jest.mock("axios");
jest.mock("../config/serviceUrls", () => ({ getEventsServiceBaseUrl: () => "https://gw/events-service/api" }));

beforeEach(() => {
  axios.delete.mockResolvedValue({ data: { data: {} } });
  axios.put.mockResolvedValue({ data: { data: {} } });
  axios.post.mockResolvedValue({ data: { data: {} } });
});

it("a schedule-change reason travels in the DELETE body, never the URL", async () => {
  await deleteEventSession("e1", "s1", "Room unavailable");
  const [url, cfg] = axios.delete.mock.calls[0];
  expect(url).toBe("https://gw/events-service/api/events/e1/sessions/s1");
  expect(url).not.toContain("Room");
  expect(cfg.data).toEqual({ scheduleChangeReason: "Room unavailable" });
});

it("timezone goes to the audited endpoint with the reason in the body", async () => {
  await setEventTimezone("e1", { timezone: "Europe/Dublin", scheduleChangeReason: "Created before timezones" });
  const [url, body] = axios.put.mock.calls[0];
  expect(url).toBe("https://gw/events-service/api/events/e1/timezone");
  expect(body).toEqual({ timezone: "Europe/Dublin", scheduleChangeReason: "Created before timezones" });
});

it("organiser scan posts the pass to the scan route", async () => {
  await scanCheckinPass("a.b");
  expect(axios.post.mock.calls[0][0]).toBe("https://gw/events-service/api/registrations/checkin/scan");
  expect(axios.post.mock.calls[0][1]).toEqual({ token: "a.b" });
});
