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

export async function cancelRegistration(id) {
  const { data } = await axios.put(
    `${getEventsServiceBaseUrl()}/registrations/${id}/cancel`,
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
