import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    activeTemplateId: null,
};

const activeTemplateSlice = createSlice({
    name: 'activeTemplate',
    initialState,
    reducers: {
        setActiveTemplateId: (state, action) => {
            state.activeTemplateId = action.payload;
        },
        clearActiveTemplateId: (state) => {
            state.activeTemplateId = null;
        },
    },
});

export const { setActiveTemplateId, clearActiveTemplateId } = activeTemplateSlice.actions;

export default activeTemplateSlice.reducer;
