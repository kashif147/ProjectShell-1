import axios from "axios";

const baseUrl = () =>
  `${process.env.REACT_APP_PROFILE_SERVICE_URL || ""}/payment-forms`.replace(
    /\/$/,
    ""
  );

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function filterPaymentForms(payload = {}) {
  const res = await axios.put(`${baseUrl()}/filter`, payload, {
    headers: authHeaders(),
  });
  return res.data?.data || res.data;
}

export async function prefillPaymentForm(profileId, formType) {
  const params = { profileId };
  if (formType) params.formType = formType;
  const res = await axios.get(`${baseUrl()}/prefill`, {
    headers: authHeaders(),
    params,
  });
  return res.data?.data?.paymentForm || res.data?.paymentForm;
}

export async function createPaymentForm({ profileId, formType, ...payload }) {
  const res = await axios.post(
    `${baseUrl()}/`,
    { profileId, formType, ...payload },
    { headers: authHeaders() }
  );
  return res.data?.data?.paymentForm || res.data?.paymentForm;
}

export async function getPaymentForm(id) {
  const res = await axios.get(`${baseUrl()}/${id}`, {
    headers: authHeaders(),
  });
  return res.data?.data?.paymentForm || res.data?.paymentForm;
}

export async function downloadPaymentFormPdf(id) {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${baseUrl()}/${id}/pdf`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: "blob",
  });
  return {
    blob: res.data,
    filename:
      res.headers["content-disposition"] ||
      res.headers["Content-Disposition"] ||
      "",
  };
}

export async function updatePaymentForm(id, body) {
  const res = await axios.patch(`${baseUrl()}/${id}`, body, {
    headers: authHeaders(),
  });
  return res.data?.data?.paymentForm || res.data?.paymentForm;
}

export async function submitPaymentForm(id) {
  const res = await axios.post(`${baseUrl()}/${id}/submit`, {}, {
    headers: authHeaders(),
  });
  return res.data?.data?.paymentForm || res.data?.paymentForm;
}

export async function verifyPaymentForm(id) {
  const res = await axios.post(`${baseUrl()}/${id}/verify`, {}, {
    headers: authHeaders(),
  });
  return res.data?.data?.paymentForm || res.data?.paymentForm;
}

export async function approvePaymentForm(id) {
  const res = await axios.post(`${baseUrl()}/${id}/approve`, {}, {
    headers: authHeaders(),
  });
  return res.data?.data?.paymentForm || res.data?.paymentForm;
}

export async function rejectPaymentForm(id, reason) {
  const res = await axios.post(
    `${baseUrl()}/${id}/reject`,
    { reason },
    { headers: authHeaders() }
  );
  return res.data?.data?.paymentForm || res.data?.paymentForm;
}

export async function deletePaymentForm(id) {
  const res = await axios.delete(`${baseUrl()}/${id}`, {
    headers: authHeaders(),
  });
  return res.data?.data || res.data;
}

export async function listProfilePaymentForms(profileId) {
  const res = await axios.get(`${baseUrl()}/profile/${profileId}`, {
    headers: authHeaders(),
  });
  return res.data?.data?.paymentForms || res.data?.paymentForms || [];
}

export async function uploadPaperPaymentForm(id, file) {
  const fd = new FormData();
  fd.append("file", file);
  const token = localStorage.getItem("token");
  const res = await axios.post(`${baseUrl()}/${id}/upload-paper`, fd, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data?.data?.paymentForm || res.data?.paymentForm;
}

export async function uploadSignedPaymentForm(id, file) {
  const fd = new FormData();
  fd.append("file", file);
  const token = localStorage.getItem("token");
  const res = await axios.post(`${baseUrl()}/${id}/upload-signed`, fd, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data?.data?.paymentForm || res.data?.paymentForm;
}

export async function sendPaymentFormEmail(id, emailOptions) {
  const res = await axios.post(`${baseUrl()}/${id}/send-email`, emailOptions, {
    headers: authHeaders(),
  });
  return res.data?.data?.paymentForm || res.data?.paymentForm;
}

/** Portal member APIs */
const portalBase = () => `${baseUrl()}/portal`;

export async function portalListMyPaymentForms() {
  const res = await axios.get(`${portalBase()}/mine`, {
    headers: authHeaders(),
  });
  return res.data?.data?.paymentForms || [];
}

export async function portalCreatePaymentForm(formType) {
  const res = await axios.post(
    `${portalBase()}/`,
    { formType },
    { headers: authHeaders() }
  );
  return res.data?.data?.paymentForm || res.data?.paymentForm;
}

export async function portalUpdatePaymentForm(id, body) {
  const res = await axios.patch(`${portalBase()}/${id}`, body, {
    headers: authHeaders(),
  });
  return res.data?.data?.paymentForm || res.data?.paymentForm;
}

export async function portalSubmitPaymentForm(id) {
  const res = await axios.post(`${portalBase()}/${id}/submit`, {}, {
    headers: authHeaders(),
  });
  return res.data?.data?.paymentForm || res.data?.paymentForm;
}

/** Canvas / drawn signature – PNG/JPEG file or base64 data URL */
export async function portalUploadPaymentFormSignature(id, payload) {
  const { file, imageBase64, slot = 0, signedDate } = payload || {};
  if (file) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("slot", String(slot));
    if (signedDate) fd.append("signedDate", signedDate);
    const token = localStorage.getItem("token");
    const res = await axios.post(`${portalBase()}/${id}/upload-signature`, fd, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data?.data?.paymentForm || res.data?.paymentForm;
  }
  const res = await axios.post(
    `${portalBase()}/${id}/upload-signature`,
    { imageBase64, slot, signedDate },
    { headers: authHeaders() }
  );
  return res.data?.data?.paymentForm || res.data?.paymentForm;
}
