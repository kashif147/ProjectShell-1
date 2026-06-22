import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
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
});
