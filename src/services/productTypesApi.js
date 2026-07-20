import axios from "axios";
import { getUserServiceBaseUrl } from "../config/serviceUrls";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const isMembershipProductType = (pt) => {
  const code = String(pt?.code || "").trim().toUpperCase();
  const name = String(pt?.name || "").trim().toLowerCase();
  return code === "MEM" || code === "MEMBERSHIP" || name.includes("membership");
};

/**
 * Real, active ProductType records (fetched live, not hardcoded) that an
 * Event's Category can reference - every ProductType except Membership,
 * which has its own separate pricing/fee model (a single annual `price`,
 * not member/non-member event pricing) and isn't a valid event category.
 */
export async function fetchEventCategoryProductTypes() {
  const { data } = await axios.get(`${getUserServiceBaseUrl()}/product-types`, {
    headers: authHeaders(),
  });
  const productTypes = data?.data || [];
  return productTypes.filter((pt) => pt.isActive !== false && !isMembershipProductType(pt));
}
