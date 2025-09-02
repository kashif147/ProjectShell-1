// RemindersContext.jsx
import React, { createContext, useContext } from "react";
import { detailsData } from "../Data";
import { cancellationDetail } from "../Data"; // ✅ details dataset (by id)
import { useState } from "react";

const RemindersContext = createContext();

export const RemindersProvider = ({ children }) => {
    const [selectedId, setSelectedId] = useState(null);
    const [cancallationbyId, setcancallationbyId] = useState(null);

    const getRemindersById = (id) => {
        const idstring = String(id)
        const data = detailsData.find(item => item.id === idstring) || null;
        setSelectedId(data);
        return data;
    };

    const getCancellationById = (id) => {
        const data = cancellationDetail.find(item => item.id === id) || null;
        setcancallationbyId(data);
        return data;
    }

    return (
        <RemindersContext.Provider value={{ getRemindersById, selectedId, getCancellationById, cancallationbyId }}>
            {children}
        </RemindersContext.Provider>
    );
};

// ✅ Custom hook
export const useReminders = () => useContext(RemindersContext);
