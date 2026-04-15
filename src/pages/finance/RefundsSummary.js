import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { message, Dropdown, Button } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import MyTable from "../../component/common/MyTable";
import { useTableColumns } from "../../context/TableColumnsContext ";
import AssociateMemberModal from "../../component/finanace/AssociateMemberModal";

const REFUNDS_ENDPOINT = "/reports/refunds";

const buildRefundsUrl = () => {
    const accountServiceBase = (
        process.env.REACT_APP_ACCOUNT_SERVICE_URL ||
        ""
    ).replace(/\/$/, "");
    if (!accountServiceBase) return REFUNDS_ENDPOINT;
    return `${accountServiceBase}${REFUNDS_ENDPOINT}`;
};

const RefundsSummary = () => {
    const { columns } = useTableColumns();
    const [refundsData, setRefundsData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [associateRecord, setAssociateRecord] = useState(null);

    const tableColumns = useMemo(() => {
        const base = columns["Refunds"] || [];
        return [
            ...base,
            {
                title: "Actions",
                key: "actions",
                fixed: "right",
                width: 72,
                render: (_, record) => (
                    <Dropdown
                        menu={{
                            items: [
                                {
                                    key: "associate",
                                    label: "Associate to member",
                                    onClick: () => setAssociateRecord(record),
                                },
                            ],
                        }}
                        trigger={["click"]}
                        placement="bottomRight"
                    >
                        <Button type="text" icon={<MoreOutlined style={{ fontSize: "20px" }} />} />
                    </Dropdown>
                ),
            },
        ];
    }, [columns]);

    const fetchRefunds = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(buildRefundsUrl(), {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const payload = response?.data;
            const rows = Array.isArray(payload)
                ? payload
                : payload?.data?.refunds ||
                payload?.data ||
                payload?.items ||
                payload?.results ||
                [];

            const normalizedRows = rows.map((item, index) => ({
                ...item,
                key: item?.key || item?.id || item?._id || `${item?.refundId || "refund"}-${index}`,
                refundType: item?.refundType ?? item?.payoutMethod ?? "—",
                refundSource: item?.refundSource ?? item?.mode ?? "—",
                refundAmount:
                    item?.refundAmount ??
                    (typeof item?.amount === "number" ? item.amount / 100 : 0),
                memberNo:
                    item?.memberNo ??
                    item?.membershipNo ??
                    item?.applicationNo ??
                    item?.applicationNumber ??
                    item?.memberId ??
                    "—",
            }));

            setRefundsData(normalizedRows);
        } catch (error) {
            console.error("Error fetching refunds report:", error);
            message.error("Failed to load refunds report");
            setRefundsData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRefunds();
    }, [fetchRefunds]);

    return (
        <div style={{ width: "100%", padding: "0" }}>
            <MyTable
                dataSource={refundsData}
                columns={tableColumns}
                loading={loading}
                selection={false}
                defaultSortField="createdAt"
                defaultSortOrder="descend"
            />
            <AssociateMemberModal
                open={associateRecord != null}
                onClose={() => setAssociateRecord(null)}
                onSuccess={() => fetchRefunds()}
                selectedRows={associateRecord ? [associateRecord] : []}
                variant="refunds"
            />
        </div>
    );
};

export default RefundsSummary;
