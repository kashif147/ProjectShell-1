// batchSlice.js
import { createSlice } from '@reduxjs/toolkit';
import moment from "moment";
import { useSelector, useDispatch } from "react-redux";
import dayjs from "dayjs"

// Initial state with static data
const initialState = {
    batches: [
        {
            id: 1,
            batchName: "Batch-2023-11",
            batchDate: "2023-11-15", // ✅ String
            batchStatus: "Pending",
            createdAt: "2023-11-10T09:30:00", // ✅ String
            createdBy: "admin1",
            Count: 5,
            batchRef: "REF12345",
            Comments: "Monthly payments",
            PaymentType: "Demand Draft",
            members: [
                {
                    id: 1,
                    "Membership No": "M-1001",
                    "Last name": "Last1",
                    "First name": "First1",
                    "Full name": "First1 Last1",
                    "Value for Periods Selected": 5100,
                },
                {
                    id: 2,
                    "Membership No": "M-1002",
                    "Last name": "Last2",
                    "First name": "First2",
                    "Full name": "First2 Last2",
                    "Value for Periods Selected": 7200,
                },
            ],
        },
        {
            id: 2,
            batchName: "Batch-2023-11",
            batchDate: "2023-11-15", // ✅ String
            batchStatus: "Approved",
            createdAt: "2023-11-10T10:15:00", // ✅ String
            createdBy: "admin2",
            Count: 3,
            PaymentType: "Bank Transfer",
            batchRef: "REF12345",
            Comments: "Monthly payments",
            members: [
                {
                    id: 1,
                    "Membership No": "M-2001",
                    "Last name": "Last3",
                    "First name": "First3",
                    "Full name": "First3 Last3",
                    "Value for Periods Selected": 6000,
                },
                {
                    id: 2,
                    "Membership No": "M-2002",
                    "Last name": "Last4",
                    "First name": "First4",
                    "Full name": "First4 Last4",
                    "Value for Periods Selected": 5400,
                },
            ],
        },
        {
            id: 3,
            batchName: "Batch-2023-12",
            batchDate: "2023-12-01", // ✅ String
            batchStatus: "Rejected",
            createdAt: "2023-11-28T14:45:00", // ✅ String
            createdBy: "admin3",
            Count: 7,
            PaymentType: "Cheque",
            batchRef: "REF12345",
            Comments: "Monthly payments",
            members: [
                {
                    id: 1,
                    "Membership No": "M-3001",
                    "Last name": "Last5",
                    "First name": "First5",
                    "Full name": "First5 Last5",
                    "Value for Periods Selected": 8000,
                },
            ],
        },
        {
            id: 4,
            batchName: "Batch-2023-11",
            batchDate: "2023-11-15", // ✅ String
            batchStatus: "Pending",
            createdAt: "2023-11-10T09:30:00", // ✅ String
            createdBy: "admin1",
            Count: 5,
            batchRef: "REF12345",
            Comments: "Monthly payments",
            PaymentType: "Cheque",
            members: [
                {
                    id: 1,
                    "Membership No": "M-1001",
                    "Last name": "Last1",
                    "First name": "First1",
                    "Full name": "First1 Last1",
                    "Value for Periods Selected": 5100,
                },
                {
                    id: 2,
                    "Membership No": "M-1002",
                    "Last name": "Last2",
                    "First name": "First2",
                    "Full name": "First2 Last2",
                    "Value for Periods Selected": 7200,
                },
            ],
        },
        {
            id: 5,
            batchName: "Batch-2023-11",
            batchDate: "2023-11-15", // ✅ String
            batchStatus: "Approved",
            createdAt: "2023-11-10T10:15:00", // ✅ String
            createdBy: "admin2",
            Count: 3,
            PaymentType: "Cheque",
            batchRef: "REF12345",
            Comments: "Monthly payments",
            members: [
                {
                    id: 1,
                    "Membership No": "M-2001",
                    "Last name": "Last3",
                    "First name": "First3",
                    "Full name": "First3 Last3",
                    "Value for Periods Selected": 6000,
                },
                {
                    id: 2,
                    "Membership No": "M-2002",
                    "Last name": "Last4",
                    "First name": "First4",
                    "Full name": "First4 Last4",
                    "Value for Periods Selected": 5400,
                },
            ],
        },
        {
            id: 6,
            batchName: "Batch-2023-12",
            batchDate: "2023-12-01", // ✅ String
            batchStatus: "Rejected",
            createdAt: "2023-11-28T14:45:00", // ✅ String
            createdBy: "admin3",
            Count: 7,
            PaymentType: "Cheque",
            batchRef: "REF12345",
            Comments: "Monthly payments",
            members: [
                {
                    id: 1,
                    "Membership No": "M-3001",
                    "Last name": "Last5",
                    "First name": "First5",
                    "Full name": "First5 Last5",
                    "Value for Periods Selected": 8000,
                },
            ],
        },
        {
            id: 7,
            batchName: "Batch-2023-12",
            batchDate: "2023-12-01", // ✅ String
            batchStatus: "Rejected",
            createdAt: "2023-11-28T14:45:00", // ✅ String
            createdBy: "admin3",
            Count: 7,
            PaymentType: "Cheque",
            batchRef: "REF12345",
            Comments: "Monthly payments",
            members: [
                {
                    id: 1,
                    "Membership No": "M-3001",
                    "Last name": "Last5",
                    "First name": "First5",
                    "Full name": "First5 Last5",
                    "Value for Periods Selected": 8000,
                },
            ],
        },
        {
            id: 8,
            batchName: "Batch-2023-12",
            batchDate: "2023-12-01", // ✅ String
            batchStatus: "Rejected",
            createdAt: "2023-11-28T14:45:00", // ✅ String
            createdBy: "admin3",
            Count: 7,
            PaymentType: "Cheque",
            batchRef: "REF12345",
            Comments: "Monthly payments",
            members: [
                {
                    id: 1,
                    "Membership No": "M-3001",
                    "Last name": "Last5",
                    "First name": "First5",
                    "Full name": "First5 Last5",
                    "Value for Periods Selected": 8000,
                },
            ],
        },
        {
            id: 9,
            batchName: "Batch-2023-12",
            batchDate: "2023-12-01", // ✅ String
            batchStatus: "Rejected",
            createdAt: "2023-11-28T14:45:00", // ✅ String
            createdBy: "admin3",
            Count: 7,
            PaymentType: "Standing Orders",
            batchRef: "REF12345",
            Comments: "Monthly payments",
            members: [
                {
                    id: 1,
                    "Membership No": "M-3001",
                    "Last name": "Last5",
                    "First name": "First5",
                    "Full name": "First5 Last5",
                    "Value for Periods Selected": 8000,
                },
            ],
        },
        {
            id: 10,
            batchName: "Batch-2023-12",
            batchDate: "2023-12-01", // ✅ String
            batchStatus: "Rejected",
            createdAt: "2023-11-28T14:45:00", // ✅ String
            createdBy: "admin3",
            Count: 7,
            PaymentType: "Standing Orders",
            batchRef: "REF12345",
            Comments: "Monthly payments",
            members: [
                {
                    id: 1,
                    "Membership No": "M-3001",
                    "Last name": "Last5",
                    "First name": "First5",
                    "Full name": "First5 Last5",
                    "Value for Periods Selected": 8000,
                },
            ],
        },
        {
            id: 11,
            batchName: "Batch-2023-12",
            batchDate: "2023-12-01", // ✅ String
            batchStatus: "Rejected",
            createdAt: "2023-11-28T14:45:00", // ✅ String
            createdBy: "admin3",
            Count: 7,
            PaymentType: "Standing Orders",
            batchRef: "REF12345",
            Comments: "Monthly payments",
            members: [
                {
                    id: 1,
                    "Membership No": "M-3001",
                    "Last name": "Last5",
                    "First name": "First5",
                    "Full name": "First5 Last5",
                    "Value for Periods Selected": 8000,
                },
            ],
        },
        {
            id: 12,
            batchName: "Batch-2023-12",
            batchDate: "2023-12-01", // ✅ String
            batchStatus: "Rejected",
            createdAt: "2023-11-28T14:45:00", // ✅ String
            createdBy: "admin3",
            Count: 7,
            PaymentType: "Deductions",
            batchRef: "REF12345",
            Comments: "Monthly payments",
            members: [
                {
                    id: 1,
                    "Membership No": "M-3001",
                    "Last name": "Last5",
                    "First name": "First5",
                    "Full name": "First5 Last5",
                    "Value for Periods Selected": 8000,
                },
            ],
        },
        {
            id: 13,
            batchName: "Batch-2023-12",
            batchDate: "2023-12-01", // ✅ String
            batchStatus: "Rejected",
            createdAt: "2023-11-28T14:45:00", // ✅ String
            createdBy: "admin3",
            Count: 7,
            PaymentType: "Deductions",
            batchRef: "REF12345",
            Comments: "Monthly payments",
            members: [
                {
                    id: 1,
                    "Membership No": "M-3001",
                    "Last name": "Last5",
                    "First name": "First5",
                    "Full name": "First5 Last5",
                    "Value for Periods Selected": 8000,
                },
            ],
        },
        {
            id: 14,
            batchName: "Batch-2023-12",
            batchDate: "2023-12-01", // ✅ String
            batchStatus: "Rejected",
            createdAt: "2023-11-28T14:45:00", // ✅ String
            createdBy: "admin3",
            Count: 7,
            PaymentType: "Deductions",
            batchRef: "REF12345",
            Comments: "Monthly payments",
            members: [
                {
                    id: 1,
                    "Membership No": "M-3001",
                    "Last name": "Last5",
                    "First name": "First5",
                    "Full name": "First5 Last5",
                    "Value for Periods Selected": 8000,
                },
            ],
        },
        {
            id: 15,
            batchName: "Batch-2023-12",
            batchDate: "2023-12-01", // ✅ String
            batchStatus: "Rejected",
            createdAt: "2023-11-28T14:45:00", // ✅ String
            createdBy: "admin3",
            Count: 7,
            PaymentType: "Online Payments",
            batchRef: "REF12345",
            Comments: "Monthly payments",
            members: [
                {
                    id: 1,
                    "Membership No": "M-3001",
                    "Last name": "Last5",
                    "First name": "First5",
                    "Full name": "First5 Last5",
                    "Value for Periods Selected": 8000,
                },
            ],
        },
        {
            id: 16,
            batchName: "Batch-2023-12",
            batchDate: "2023-12-01", // ✅ String
            batchStatus: "Rejected",
            createdAt: "2023-11-28T14:45:00", // ✅ String
            createdBy: "admin3",
            Count: 7,
            PaymentType: "Online Payments",
            batchRef: "REF12345",
            Comments: "Monthly payments",
            members: [
                {
                    id: 1,
                    "Membership No": "M-3001",
                    "Last name": "Last5",
                    "First name": "First5",
                    "Full name": "First5 Last5",
                    "Value for Periods Selected": 8000,
                },
            ],
        },
    ],
    selectedBatch: null,
    batchesloading: false,
    batcheserror: null,
};
// Create the slice
const batchSlice = createSlice({
    name: 'batches',
    initialState,
    reducers: {
        // Get all batches - just set loading to false immediately since data is already there
        getAllBatches: (state) => {
            state.batchesloading = false;
            state.batcheserror = null;
        },

        // Get batch by ID
        getBatchByID: (state, action) => {
            const batch = state.batches.find(batch => batch.id === action.payload);
            state.selectedBatch = batch || null;
        },

        // Add new batch with members
        addBatchWithMember: (state, action) => {
            const newBatch = {
                id: Math.max(...state.batches.map(b => b.id)) + 1,
                ...action.payload,
                createdAt: moment(),
                Count: action.payload.members ? action.payload.members.length : 0
            };
            state.batches.push(newBatch);
        },

        // Insert member into existing batch
        insertMemberIntoBatch: (state, action) => {
            const { batchId, memberData } = action.payload;
            const batchIndex = state.batches.findIndex(batch => batch.id === batchId);
            
            if (batchIndex !== -1) {
                const newMember = {
                    id: (state.batches[batchIndex].members?.length || 0) + 1,
                    ...memberData
                };
                
                if (!state.batches[batchIndex].members) {
                    state.batches[batchIndex].members = [];
                }
                
                state.batches[batchIndex].members.push(newMember);
                state.batches[batchIndex].Count = state.batches[batchIndex].members.length;
            }
        },

        // Update batch
        updateBatch: (state, action) => {
            const { id, updates } = action.payload;
            const batchIndex = state.batches.findIndex(batch => batch.id === id);
            if (batchIndex !== -1) {
                state.batches[batchIndex] = { ...state.batches[batchIndex], ...updates };
            }
        },

        // Delete batch
        deleteBatch: (state, action) => {
            state.batches = state.batches.filter(batch => batch.id !== action.payload);
        },

        // Set loading state
        setBatchesLoading: (state, action) => {
            state.batchesloading = action.payload;
        },

        // Set error state
        setBatchesError: (state, action) => {
            state.batcheserror = action.payload;
        },

        // Clear selected batch
        clearSelectedBatch: (state) => {
            state.selectedBatch = null;
        },

        // Clear error
        clearError: (state) => {
            state.batcheserror = null;
        },
    },
});

// Export actions
export const {
    getAllBatches,
    getBatchByID,
    addBatchWithMember,
    insertMemberIntoBatch,
    updateBatch,
    deleteBatch,
    setBatchesLoading,
    setBatchesError,
    clearSelectedBatch,
    clearError,
} = batchSlice.actions;

// Export reducer
export default batchSlice.reducer;