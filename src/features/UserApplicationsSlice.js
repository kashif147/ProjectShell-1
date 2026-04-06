import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    applications: [
        {
            _id: "APP-001",
            id: "APP-001",
            subscriptionDetails: { membershipCategory: "General" },
            applicationStatus: "Approved",
            createdAt: "2024-01-01T10:00:00Z",
            updatedAt: "2024-01-05T15:30:00Z",
            personalDetails: {
                personalInfo: {
                    forename: "John",
                    surname: "Doe",
                    title: "Mr",
                    gender: "Male",
                    dateOfBirth: "1990-05-15"
                }
            }
        },
        {
            _id: "APP-002",
            id: "APP-002",
            subscriptionDetails: { membershipCategory: "Student" },
            applicationStatus: "In-Progress",
            createdAt: "2024-02-10T09:00:00Z",
            updatedAt: "2024-02-12T11:45:00Z",
            personalDetails: {
                personalInfo: {
                    forename: "Jane",
                    surname: "Smith",
                    title: "Ms",
                    gender: "Female",
                    dateOfBirth: "1995-10-20"
                }
            }
        },
        {
            _id: "APP-003",
            id: "APP-003",
            subscriptionDetails: { membershipCategory: "Retired" },
            applicationStatus: "Pending",
            createdAt: "2024-03-15T14:20:00Z",
            updatedAt: "2024-03-16T10:10:00Z",
            personalDetails: {
                personalInfo: {
                    forename: "Robert",
                    surname: "Brown",
                    title: "Mr",
                    gender: "Male",
                    dateOfBirth: "1955-08-12"
                }
            }
        }
    ],
    loading: false,
    error: null,
};

const userApplicationsSlice = createSlice({
    name: 'userApplications',
    initialState,
    reducers: {
        setUserApplications: (state, action) => {
            state.applications = action.payload;
        },
        clearUserApplications: (state) => {
            state.applications = [];
        },
    },
});

export const { setUserApplications, clearUserApplications } = userApplicationsSlice.actions;
export default userApplicationsSlice.reducer;
