import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, Tag } from "antd";
import { EditOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import CustomSelect from "../../component/common/CustomSelect";
import MyInput from "../../component/common/MyInput";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { getTemplates } from "../../features/templete/GetTemplateSlice";
import MyConfirm from "../../component/common/MyConfirm";
import MyAlert from "../../component/common/MyAlert";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getUnifiedPaginationConfig } from "../../component/common/UnifiedPagination";
import { communicationServicePath } from "../../utils/communicationServiceUrl";

dayjs.extend(utc);
dayjs.extend(timezone);

const TempletsSummary = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { templates, loading, error } = useSelector((state) => state.getTemplate);
    const handleDelete = (record) => {
        MyConfirm({
            title: "Delete Template",
            message: `Are you sure you want to delete "${record.templateName}"? This action cannot be undone.`,
            onConfirm: () => performDelete(record.key),
        });
    };
    const performDelete = async (templateId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                // If MyAlert is a notification component, it might be called like this:
                MyAlert('Authentication token not found. Please login again.', 'error');
                // OR if it needs an objectempt:
                // MyAlert({ message: 'Authentication token not found', type: 'error' });
                return;
            }

            const response = await axios(`${communicationServicePath(`templates/${templateId}`)}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 200) {
                // Show success notification
                MyAlert('success', 'Template deleted successfully!',);
                dispatch(getTemplates());
                return
            }

            if (!response.ok) {
                const errorData = await response.json();
                MyAlert('Deleted Failed', 'error');
            }




        } catch (error) {
            console.error('Delete error:', error);

            // Show error notification
            // Pattern 1:
            MyAlert(error.message || 'Failed to delete template', 'error');

            // Pattern 2:
            // MyAlert({ message: error.message || 'Failed to delete template', type: 'error' });

            // Pattern 3:
            // MyAlert.show(error.message || 'Failed to delete template', 'error');

            // Pattern 4:
            // MyAlert.error(error.message || 'Failed to delete template');
        }
    };


    const [searchValue, setSearchValue] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    useEffect(() => {
        dispatch(getTemplates());
    }, [dispatch]);
    

    // Apply search and filters
    const filteredData = useMemo(() => {
        return templates
            .filter((t) =>
                t.name.toLowerCase().includes(searchValue.toLowerCase())
            )
            .filter((t) =>
                categoryFilter ? t.category?.toLowerCase() === String(categoryFilter).toLowerCase() : true
            )
            .filter((t) =>
                statusFilter ? (t.status || "Active").toLowerCase() === String(statusFilter).toLowerCase() : true
            )
            .map((t) => ({
                key: t._id,
                templateName: t.name,
                description: t.description || "No description available.",
                category: t.category ? t.category.charAt(0).toUpperCase() + t.category.slice(1) : "N/A",
                lastUpdated: dayjs.utc(t.createdAt).local().format("DD/MM/YYYY HH:mm"),
                updatedBy: typeof t.updatedBy === "string"
                    ? t.updatedBy
                    : t.updatedBy?.name || t.updatedBy?.fullName || t.updatedBy?.email || "System",
                status: t.status || "Active", // Use API status if available
            }));
    }, [templates, searchValue, categoryFilter, statusFilter]);

    const columns = [
        {
            title: "TEMPLATE NAME",
            dataIndex: "templateName",
            key: "templateName",
            sorter: (a, b) => a.templateName.localeCompare(b.templateName),
            onCell: () => ({
                style: { verticalAlign: "top", paddingTop: "10px", paddingBottom: "10px" },
            }),
            render: (_, record) => (
                <div style={{ lineHeight: 1.35 }}>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>{record.templateName}</div>
                    <div style={{ color: "#6b7280" }}>{record.description}</div>
                </div>
            ),
        },
        {
            title: "CATEGORY",
            dataIndex: "category",
            key: "category",
            sorter: (a, b) => a.category.localeCompare(b.category),
            onCell: () => ({
                style: { verticalAlign: "top", paddingTop: "10px", paddingBottom: "10px" },
            }),
        },
        {
            title: "STATUS",
            dataIndex: "status",
            key: "status",
            onCell: () => ({
                style: { verticalAlign: "top", paddingTop: "10px", paddingBottom: "10px" },
            }),
            render: (status) => (
                <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>
            ),
        },
        {
            title: "UPDATED BY",
            dataIndex: "updatedBy",
            key: "updatedBy",
            sorter: (a, b) => a.updatedBy.localeCompare(b.updatedBy),
            onCell: () => ({
                style: { verticalAlign: "top", paddingTop: "10px", paddingBottom: "10px" },
            }),
            render: (_, record) => (
                <div style={{ lineHeight: 1.35 }}>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>{record.updatedBy}</div>
                    <div style={{ color: "#6b7280" }}>{record.lastUpdated}</div>
                </div>
            ),
        },
        {
            title: "ACTIONS",
            key: "actions",
            width: 90,
            align: "center",
            onCell: () => ({
                style: { verticalAlign: "top", paddingTop: "10px", paddingBottom: "10px" },
            }),
            render: (_, record) => (
                <div className="d-flex justify-content-center align-items-start gap-1">
                    <button
                        type="button"
                        className="btn btn-sm p-1 rounded hover-bg-primary"
                        onClick={() => handleEdit(record)}
                        title="Edit"
                    >
                        <EditOutlined className="text-primary" />
                    </button>

                    <button
                        type="button"
                        className="btn btn-sm p-1 rounded hover-bg-success"
                        onClick={() => handlePreview(record)}
                        title="Preview"
                    >
                        <EyeOutlined className="text-success" />
                    </button>

                    <button
                        type="button"
                        className="btn btn-sm p-1 rounded hover-bg-danger"
                        onClick={() => handleDelete(record)}
                        title="Delete"
                    >
                        <DeleteOutlined className="text-danger" />
                    </button>
                </div>
            ),
        },
    ];

    const handleEdit = (record) => {
        navigate(`/templeteConfig?id=${encodeURIComponent(record?.key)}`);
    };
    const handlePreview = (record) => console.log("Preview:", record);

    return (
        <div className="template-management-wrapper p-4">
            <div className="row g-3 align-items-end">
                <div className="col-12 col-md-4">
                    <MyInput
                        label="Search"
                        placeholder="Search by template name..."
                        name="Search"
                        prefixIcon="search"
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                </div>
                <div className="col-12 col-md-2">
                    <CustomSelect
                        label="All Categories"
                        placeholder="All Categories"
                        options={[
                            { value: "approval", label: "Approval" },
                            { value: "notification", label: "Notification" },
                            { value: "letters", label: "Letters" },
                        ]}
                        onChange={(value) => setCategoryFilter(value)}
                    />
                </div>
                <div className="col-12 col-md-2">
                    <CustomSelect
                        label="Any Status"
                        placeholder="Any Status"
                        options={[
                            { value: "active", label: "Active" },
                            { value: "inactive", label: "Inactive" },
                        ]}
                        onChange={(value) => setStatusFilter(value)}
                    />
                </div>
            </div>

            <Table
                columns={columns}
                dataSource={filteredData || []}
                loading={loading}
                scroll={{ x: "max-content", y: 590 }}
                bordered
                className="drawer-tbl mt-3"
                pagination={getUnifiedPaginationConfig({
                    total: filteredData.length,
                    itemName: "templates",
                })}
                size="middle"
                locale={{
                    emptyText: "No Data"
                }}
            />

            {error && <p className="text-danger mt-2">Error: {error}</p>}
        </div>
    );
};

export default TempletsSummary;