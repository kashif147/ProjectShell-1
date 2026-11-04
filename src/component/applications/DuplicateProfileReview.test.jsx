import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import { Modal } from "antd";
import DuplicateProfileReview from "./DuplicateProfileReview";
import { APPLICATION_DUPLICATE_REVIEW_LOCKED_MESSAGE } from "../../utils/duplicateReviewApproval";

jest.mock("axios");

jest.mock("react-redux", () => ({
  useDispatch: () => jest.fn(),
  useSelector: (selector) =>
    selector({
      lookups: {
        membershipCategoryOptions: [],
      },
    }),
}));

jest.mock("../../features/ApplicationDetailsSlice", () => ({
  getApplicationById: jest.fn((payload) => payload),
}));

jest.mock("../common/MyTable", () => ({ columns, dataSource }) => (
  <div>
    {dataSource.map((row) => (
      <div key={row.key || row.sourceId}>
        {columns.map((column) => (
          <div key={column.key || column.dataIndex}>
            {column.render
              ? column.render(row[column.dataIndex], row)
              : row[column.dataIndex]}
          </div>
        ))}
      </div>
    ))}
  </div>
));

jest.mock("./DuplicateProfileMergeDrawer", () => () => null);

beforeAll(() => {
  window.matchMedia =
    window.matchMedia ||
    jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
});

describe("DuplicateProfileReview", () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({
      data: {
        data: {
          applicationStatus: "processed",
          isReadOnly: true,
          duplicateReview: {
            status: "MERGED",
            reviewedAt: "2026-06-18T10:00:00.000Z",
            auditHistory: [{ action: "MERGE" }],
          },
          matchingProfiles: [
            {
              sourceType: "PROFILE",
              sourceId: "profile-1",
              name: "Existing Member",
              score: 95,
            },
          ],
          matchingApplications: [],
        },
      },
    });
  });

  test("renders processed application duplicate drawer as read-only", async () => {
    render(
      <DuplicateProfileReview
        open
        applicationId="app-1"
        applicationStatus="processed"
      />,
    );

    expect(
      await screen.findByText(APPLICATION_DUPLICATE_REVIEW_LOCKED_MESSAGE),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Previous duplicate decisions"),
    ).toBeInTheDocument();
    expect(await screen.findByText("Merge")).toBeInTheDocument();
    expect(screen.queryByText("Create New Profile")).not.toBeInTheDocument();
    expect(screen.queryByText("Refresh")).not.toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("/applications/app-1/duplicate-matches"),
        expect.any(Object),
      );
    });
    expect(axios.post).not.toHaveBeenCalled();
  });

  test("keeps duplicate actions available before processing", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        data: {
          applicationStatus: "submitted",
          isReadOnly: false,
          duplicateReview: { status: "POTENTIAL_MATCH" },
          matchingProfiles: [],
          matchingApplications: [],
        },
      },
    });

    render(
      <DuplicateProfileReview
        open
        applicationId="app-1"
        applicationStatus="submitted"
      />,
    );

    await waitFor(() => {
      expect(screen.getAllByText("Create New Profile").length).toBeGreaterThan(0);
    });
    expect(screen.getByRole("button", { name: /refresh/i })).toBeInTheDocument();
  });

  describe("P5 decision preconditions", () => {
    const pendingReview = {
      data: {
        data: {
          applicationStatus: "submitted",
          isReadOnly: false,
          reviewVersion: 4,
          duplicateReview: { status: "POTENTIAL_MATCH", reviewVersion: 4 },
          matchingProfiles: [],
          matchingApplications: [],
        },
      },
    };

    const renderPending = async () => {
      axios.get.mockReset();
      axios.post.mockReset();
      axios.get.mockResolvedValue(pendingReview);
      render(
        <DuplicateProfileReview
          open
          applicationId="app-9"
          applicationStatus="submitted"
        />,
      );
      // the review payload (and its reviewVersion) has loaded
      expect(await screen.findByText("POTENTIAL_MATCH")).toBeInTheDocument();
    };

    afterEach(() => {
      Modal.destroyAll();
    });

    const clickCreateNewAndConfirm = async () => {
      Modal.destroyAll();
      await waitFor(() =>
        expect(document.querySelectorAll(".ant-modal-confirm").length).toBe(0),
      );
      fireEvent.click(document.querySelector(".duplicate-review-create-new-btn"));
      let ok;
      await waitFor(() => {
        ok = document.querySelector(".ant-modal-confirm .ant-modal-confirm-btns .ant-btn-primary");
        expect(ok).toBeTruthy();
      });
      fireEvent.click(ok);
    };

    const conflict = (code, status = 409) =>
      Object.assign(new Error(code), {
        response: { status, data: { success: false, error: { code, status, message: code } } },
      });

    test("sends the loaded review version and a per-action idempotency key", async () => {
      await renderPending();
      axios.post.mockResolvedValueOnce({ data: { data: { reviewVersion: 5 } } });
      await clickCreateNewAndConfirm();
      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
      const [url, body] = axios.post.mock.calls[0];
      expect(url).toContain("/applications/app-9/duplicate-review");
      expect(body).toMatchObject({ action: "MARKED_NEW", expectedReviewVersion: 4 });
      expect(typeof body.idempotencyKey).toBe("string");
      expect(body.idempotencyKey.length).toBeGreaterThan(8);
    });

    test("a retry of the same action after a network failure reuses its key", async () => {
      await renderPending();
      axios.post.mockRejectedValueOnce(Object.assign(new Error("Network Error"), { request: {} }));
      await clickCreateNewAndConfirm();
      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
      axios.post.mockResolvedValueOnce({ data: { data: { reviewVersion: 5 } } });
      await clickCreateNewAndConfirm();
      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(2));
      expect(axios.post.mock.calls[1][1].idempotencyKey).toBe(axios.post.mock.calls[0][1].idempotencyKey);
    });

    test("409 REVIEW_VERSION_CONFLICT reloads the review and the next click is a new action", async () => {
      await renderPending();
      const getsBefore = axios.get.mock.calls.length;
      axios.post.mockRejectedValueOnce(conflict("REVIEW_VERSION_CONFLICT"));
      await clickCreateNewAndConfirm();
      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(axios.get.mock.calls.length).toBeGreaterThan(getsBefore));
      expect(axios.get.mock.calls[axios.get.mock.calls.length - 1][0]).toContain(
        "/applications/app-9/duplicate-matches",
      );
      axios.post.mockResolvedValueOnce({ data: { data: { reviewVersion: 5 } } });
      await clickCreateNewAndConfirm();
      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(2));
      expect(axios.post.mock.calls[1][1].idempotencyKey).not.toBe(axios.post.mock.calls[0][1].idempotencyKey);
    });

    test("PROFILE_EMAIL_EXISTS is shown and does not reload the review", async () => {
      await renderPending();
      const getsBefore = axios.get.mock.calls.length;
      axios.post.mockRejectedValueOnce(conflict("PROFILE_EMAIL_EXISTS"));
      await clickCreateNewAndConfirm();
      expect(await screen.findByText(/Profile already exists/)).toBeInTheDocument();
      expect(axios.get.mock.calls.length).toBe(getsBefore);
    });
  });
});
