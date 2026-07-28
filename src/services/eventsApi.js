import axios from "axios";
import { getEventsServiceBaseUrl } from "../config/serviceUrls";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function unwrap(response) {
  return response?.data?.data ?? response?.data;
}

// Events
export async function fetchEvents(params = {}) {
  const { data } = await axios.get(`${getEventsServiceBaseUrl()}/events`, {
    params,
    headers: authHeaders(),
  });
  return unwrap({ data });
}

export async function fetchEventById(id) {
  const { data } = await axios.get(`${getEventsServiceBaseUrl()}/events/${id}`, {
    headers: authHeaders(),
  });
  return unwrap({ data });
}

// Live price quote (member/non-member, early bird, student, group student -
// all resolved server-side from the attendee's real, active membership).
// profileId is optional - omit it for a not-yet-linked/new attendee.
export async function fetchEventPriceQuote(eventId, { profileId, quantity } = {}) {
  const { data } = await axios.get(
    `${getEventsServiceBaseUrl()}/events/${eventId}/price-quote`,
    {
      params: { profileId: profileId || undefined, quantity },
      headers: authHeaders(),
    },
  );
  return unwrap({ data });
}

// Attaches a non-fatal `__syncWarning` (e.g. Product/Pricing link failure) from
// the response envelope onto the unwrapped event, without disturbing the
// `unwrap` contract every other call here relies on.
function withSyncWarning(data) {
  const event = unwrap({ data });
  if (event && data?.warning) {
    event.__syncWarning = data.warning;
  }
  return event;
}

export async function createEvent(payload) {
  const { data } = await axios.post(`${getEventsServiceBaseUrl()}/events`, payload, {
    headers: authHeaders(),
  });
  return withSyncWarning(data);
}

export async function updateEvent(id, payload) {
  const { data } = await axios.put(`${getEventsServiceBaseUrl()}/events/${id}`, payload, {
    headers: authHeaders(),
  });
  return withSyncWarning(data);
}

// eventId is optional - pass "draft" while the event hasn't been saved yet;
// the returned URL rides along in the create/update payload afterwards.
export async function uploadEventImage(eventId, file) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await axios.post(
    `${getEventsServiceBaseUrl()}/events/${eventId || "draft"}/image`,
    formData,
    {
      headers: { ...authHeaders(), "Content-Type": "multipart/form-data" },
    },
  );
  return unwrap({ data });
}

export async function deleteEvent(id) {
  const { data } = await axios.delete(`${getEventsServiceBaseUrl()}/events/${id}`, {
    headers: authHeaders(),
  });
  return unwrap({ data });
}

export async function addEventSession(eventId, payload) {
  const { data } = await axios.post(
    `${getEventsServiceBaseUrl()}/events/${eventId}/sessions`,
    payload,
    { headers: authHeaders() },
  );
  return unwrap({ data });
}

export async function updateEventSession(eventId, sessionId, payload) {
  const { data } = await axios.put(
    `${getEventsServiceBaseUrl()}/events/${eventId}/sessions/${sessionId}`,
    payload,
    { headers: authHeaders() },
  );
  return unwrap({ data });
}

export async function deleteEventSession(eventId, sessionId) {
  const { data } = await axios.delete(
    `${getEventsServiceBaseUrl()}/events/${eventId}/sessions/${sessionId}`,
    { headers: authHeaders() },
  );
  return unwrap({ data });
}

// Courses
export async function fetchCourses(params = {}) {
  const { data } = await axios.get(`${getEventsServiceBaseUrl()}/courses`, {
    params,
    headers: authHeaders(),
  });
  return unwrap({ data });
}

export async function createCourse(payload) {
  const { data } = await axios.post(`${getEventsServiceBaseUrl()}/courses`, payload, {
    headers: authHeaders(),
  });
  return unwrap({ data });
}

// Registrations (attendees)
export async function fetchRegistrations(params = {}) {
  const { data } = await axios.get(`${getEventsServiceBaseUrl()}/registrations`, {
    params,
    headers: authHeaders(),
  });
  return unwrap({ data });
}

export async function fetchRegistrationsByProfile(profileId) {
  const { data } = await axios.get(
    `${getEventsServiceBaseUrl()}/registrations/profile/${profileId}`,
    { headers: authHeaders() },
  );
  return unwrap({ data });
}

export async function createRegistration(payload) {
  const { data } = await axios.post(`${getEventsServiceBaseUrl()}/registrations`, payload, {
    headers: authHeaders(),
  });
  return unwrap({ data });
}

// Read-only duplicate check for a would-be new attendee, run before
// registering them - resolves to "exact" (reuse this profile silently),
// "review" (show these candidates and let the CRM user pick one or confirm
// creating new), or "none" (safe to create a new profile).
export async function checkAttendeeDuplicates({
  email,
  firstName,
  lastName,
  phone,
  nmbiNumber,
  addressLine1,
  townCity,
  countyState,
  eircode,
  country,
}) {
  const { data } = await axios.post(
    `${getEventsServiceBaseUrl()}/registrations/attendee-duplicate-check`,
    { email, firstName, lastName, phone, nmbiNumber, addressLine1, townCity, countyState, eircode, country },
    { headers: authHeaders() },
  );
  return unwrap({ data });
}

export async function cancelRegistration(id) {
  const { data } = await axios.put(
    `${getEventsServiceBaseUrl()}/registrations/${id}/cancel`,
    {},
    { headers: authHeaders() },
  );
  return unwrap({ data });
}

// Resolves/links the attendee's Profile (per the recorded duplicateReview
// verdict, or the reviewer's decision below when it's a POTENTIAL_MATCH) and
// captures/posts payment - the point where a Profile actually gets created
// and money actually moves. `decision`/`candidateProfileId` are only
// required when the registration's duplicateReview.status is
// "POTENTIAL_MATCH".
export async function approveRegistration(id, { decision, candidateProfileId } = {}) {
  const { data } = await axios.put(
    `${getEventsServiceBaseUrl()}/registrations/${id}/approve`,
    { decision, candidateProfileId },
    { headers: authHeaders() },
  );
  return unwrap({ data });
}

// Releases the Stripe authorization (no refund - nothing was captured) or
// voids the recorded-but-unposted manual/comp/invoice payment, then cancels
// the registration and frees the seat.
export async function rejectRegistration(id) {
  const { data } = await axios.put(
    `${getEventsServiceBaseUrl()}/registrations/${id}/reject`,
    {},
    { headers: authHeaders() },
  );
  return unwrap({ data });
}

// Certificates
export async function issueCertificate(registrationId, templateId) {
  const { data } = await axios.post(
    `${getEventsServiceBaseUrl()}/certificates/${registrationId}/issue`,
    { templateId },
    { headers: authHeaders() },
  );
  return unwrap({ data });
}
