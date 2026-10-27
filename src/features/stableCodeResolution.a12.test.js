/**
 * Phase A / A12 - CRM resolves WORKLOC and MEM / 4080 / 4090 by stable code for the session tenant.
 * axios is mocked (no network); the tenant comes from the session token only.
 */
import axios from "axios";
import { configureStore } from "@reduxjs/toolkit";
import { getHierarchicalLookups, readStoredHierarchicalLookups } from "./GetLocationWithHierarky";
import categoryLookupReducer, {
  categoryCacheKey,
  getCategoryLookup,
  RETIRED_ASSOCIATE_PRODUCT_CODE,
  UNDERGRADUATE_STUDENT_PRODUCT_CODE,
} from "./CategoryLookupSlice";
import { optionHasProductCode } from "../utils/membershipProductCode";

jest.mock("axios");

const A = "68cbf7806080b4621d469d34"; // MULTIAUTH
const B = "6acd6119b28a863c61361ae0"; // DEVTENANTB
const D = "6ad4e0c941376f7df605fd57"; // DEVDIRB
const b64url = (o) => btoa(JSON.stringify(o)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const signIn = (tenantId) => localStorage.setItem("token", `${b64url({ alg: "HS256" })}.${b64url({ tenantId, id: "65a0000000000000000000aa" })}.sig`);
const notFound = (code) => Object.assign(new Error("404"), { response: { status: 404, data: { error: { code } } } });

const MEM_A = {
  data: {
    data: {
      productType: { _id: "pt-a", code: "MEM", name: "Membership" },
      count: 3,
      products: [
        { _id: "p-4000", code: "4000", name: "General (all grades)" },
        { _id: "p-4080", code: "4080", name: "Retired Associate" },
        { _id: "p-4090", code: "4090", name: "Undergraduate Student" },
      ],
    },
  },
};

const newStore = () =>
  configureStore({ reducer: { categoryLookup: categoryLookupReducer, hierarchicalLookups: (s = {}) => s } });

beforeEach(() => {
  localStorage.clear();
  axios.get.mockReset();
});

describe("WORKLOC work-location hierarchy", () => {
  test("by stable code WORKLOC (never a lookup-type id); stored under the session tenant", async () => {
    signIn(A);
    axios.get.mockResolvedValue({ data: { results: [{ lookup: { code: "WL1" } }] } });
    const store = newStore();
    await store.dispatch(getHierarchicalLookups());
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get.mock.calls[0][0]).toMatch(/\/lookup\/by-type-code\/WORKLOC\/hierarchy$/);
    expect(axios.get.mock.calls[0][0]).not.toMatch(/[0-9a-f]{24}/);
    expect(axios.get.mock.calls[0][1].headers).not.toHaveProperty("x-tenant-id");
    expect(JSON.parse(localStorage.getItem(`hierarchicalLookups:v2:${A}`))).toEqual([{ lookup: { code: "WL1" } }]);
    expect(localStorage.getItem("hierarchicalLookups")).toBeNull();
    signIn(B);
    expect(readStoredHierarchicalLookups()).toEqual([]); // A's hierarchy is never read for B
  });

  test("unknown type (404) is a safe empty state, not an error", async () => {
    signIn(D);
    axios.get.mockRejectedValue(notFound("LOOKUP_TYPE_NOT_FOUND"));
    const action = await newStore().dispatch(getHierarchicalLookups());
    expect(action.type).toMatch(/fulfilled$/);
    expect(action.payload).toEqual([]);
  });

  test("missing / placeholder tenant: no request at all", async () => {
    for (const t of [undefined, "default", "unknown"]) {
      localStorage.clear();
      signIn(t);
      await newStore().dispatch(getHierarchicalLookups());
    }
    expect(axios.get).not.toHaveBeenCalled();
  });
});

describe("MEM membership categories and 4080 / 4090", () => {
  test("by product-type code MEM; options keep the product code; 4080 / 4090 resolve under MULTIAUTH", async () => {
    signIn(A);
    axios.get.mockResolvedValue(MEM_A);
    const store = newStore();
    await store.dispatch(getCategoryLookup());
    expect(axios.get.mock.calls[0][0]).toMatch(/\/products\/by-type-code\/MEM$/);
    expect(axios.get.mock.calls[0][0]).not.toMatch(/[0-9a-f]{24}/);
    const { categoryData, currentCategoryId } = store.getState().categoryLookup;
    expect(currentCategoryId).toBe(`${A}:MEM`);
    expect(categoryData.map((o) => o.code)).toEqual(["4000", "4080", "4090"]);
    expect(optionHasProductCode("p-4080", RETIRED_ASSOCIATE_PRODUCT_CODE, categoryData)).toBe(true);
    expect(optionHasProductCode("p-4090", UNDERGRADUATE_STUDENT_PRODUCT_CODE, categoryData)).toBe(true);
    expect(optionHasProductCode("p-4000", RETIRED_ASSOCIATE_PRODUCT_CODE, categoryData)).toBe(false);
    // Labels are not behaviour: a renamed product keeps its code-based behaviour.
    const renamed = categoryData.map((o) => (o.code === "4080" ? { ...o, label: "Renamed" } : o));
    expect(optionHasProductCode("p-4080", "4080", renamed)).toBe(true);
  });

  test("DEVTENANTB / DEVDIRB without MEM: 404 -> empty not-configured; no fallback to MULTIAUTH", async () => {
    for (const t of [B, D]) {
      signIn(t);
      axios.get.mockReset();
      axios.get.mockRejectedValue(notFound("PRODUCT_TYPE_NOT_FOUND"));
      const store = newStore();
      const action = await store.dispatch(getCategoryLookup());
      expect(action.type).toMatch(/fulfilled$/);
      const state = store.getState().categoryLookup;
      expect(state.categoryData).toEqual([]);
      expect(state.notConfigured).toBe(true);
      expect(state.currentCategoryId).toBe(`${t}:MEM`);
      expect(optionHasProductCode("p-4080", "4080", state.categoryData)).toBe(false);
      expect(axios.get).toHaveBeenCalledTimes(1);
    }
  });

  test("tenant change refetches and never keeps the prior tenant's categories", async () => {
    signIn(A);
    axios.get.mockResolvedValueOnce(MEM_A);
    const store = newStore();
    await store.dispatch(getCategoryLookup());
    signIn(D);
    expect(categoryCacheKey()).toBe(`${D}:MEM`);
    axios.get.mockRejectedValueOnce(notFound("PRODUCT_TYPE_NOT_FOUND"));
    await store.dispatch(getCategoryLookup());
    expect(axios.get).toHaveBeenCalledTimes(2);
    expect(store.getState().categoryLookup.categoryData).toEqual([]);
  });

  test("missing / placeholder tenant: no request", async () => {
    signIn("default");
    await newStore().dispatch(getCategoryLookup());
    localStorage.clear();
    await newStore().dispatch(getCategoryLookup());
    expect(axios.get).not.toHaveBeenCalled();
  });
});
