import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { message } from "antd";
import TableComponent from "../../component/common/TableComponent";

const WriteOffsSummary = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchWriteOffs = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${process.env.REACT_APP_ACCOUNT_SERVICE_URL}/journal`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    params: {
                        docType: "WriteOff",
                        skip: 0,
                        limit: 50,
                    },
                }
            );

            const items = response?.data?.data?.items;
            const safeItems = Array.isArray(items) ? items : [];
            const mappedRows = safeItems.map((item, index) => {
                const memberEntry = Array.isArray(item?.entries)
                    ? item.entries.find((entry) => entry?.memberId)
                    : null;

                return {
                    key: item?._id || `writeoff-${index}`,
                    _id: item?._id,
                    writeOff: item?.docNo || "-",
                    writeOffDate: item?.date || item?.createdAt || null,
                    ref: item?._id || item?.docNo || "-",
                    amount: memberEntry?.amount ?? "-",
                    type: item?.txType?.description || item?.docType || "-",
                    createdBy: item?.createdBy || "System",
                    createdAt: item?.createdAt || "-",
                    updatedBy: item?.updatedBy || "System",
                    updatedAt: item?.updatedAt || "-",
                };
            });

            setRows(mappedRows);
        } catch (error) {
            console.error("Failed to fetch write-offs:", error);
            message.error("Failed to load write-offs");
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWriteOffs();
    }, [fetchWriteOffs]);

    return (
        <div style={{ width: "100%", padding: "0" }}>
            <TableComponent
                data={rows}
                isGrideLoading={loading}
                screenName="WriteOffs"
            />
        </div>
    );
};

export default WriteOffsSummary;
