import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, Tag, Space, Button, Tooltip } from "antd";
import { EditOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import CustomSelect from "../../component/common/CustomSelect";
import MyInput from "../../component/common/MyInput";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { getTemplates } from "../../features/templete/GetTemplateSlice";
import MyConfirm from "../../component/common/MyConfirm";
import MyAlert from "../../component/common/MyAlert";
import { loadtempletedetails } from "../../features/templete/templeteDetailsSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getUnifiedPaginationConfig } from "../../component/common/UnifiedPagination";
// Add these imports at the top of your file

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

            const response = await axios(`${process.env.REACT_APP_CUMM}/templates/${templateId}`, {
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
    const [deletingId, setDeletingId] = useState(null);

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
                categoryFilter ? t.category.toLowerCase() === String(categoryFilter).toLowerCase() : true
            )
            .filter((t) =>
                statusFilter ? t.status.toLowerCase() === String(statusFilter).toLowerCase() : true
            )
            .map((t) => ({
                key: t._id,
                templateName: t.name,
                category: t.category.charAt(0).toUpperCase() + t.category.slice(1),
                lastUpdated: dayjs.utc(t.createdAt).local().format("DD/MM/YYYY HH:mm"),
                status: t.status || "Active", // Use API status if available
            }));
    }, [templates, searchValue, categoryFilter, statusFilter]);

    const columns = [
        {
            title: "TEMPLATE NAME",
            dataIndex: "templateName",
            key: "templateName",
            sorter: (a, b) => a.templateName.localeCompare(b.templateName),
        },
        {
            title: "CATEGORY",
            dataIndex: "category",
            key: "category",
            sorter: (a, b) => a.category.localeCompare(b.category),
        },
        {
            title: "LAST UPDATED",
            dataIndex: "lastUpdated",
            key: "lastUpdated",
            sorter: (a, b) => dayjs(a.lastUpdated, "DD/MM/YYYY HH:mm").unix() - dayjs(b.lastUpdated, "DD/MM/YYYY HH:mm").unix(),
        },
        {
            title: "STATUS",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>
            ),
            filters: [
                { text: "Active", value: "Active" },
                { text: "Inactive", value: "Inactive" },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: "ACTIONS",
            key: "actions",
            width: 90,
            align: "center",
            render: (_, record) => (
                <div className="d-flex justify-content-center gap-1">
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
                        onClick={() => handleDelete && handleDelete(record)}
                        title="Delete"
                    >
                        <DeleteOutlined className="text-danger" />
                    </button>
                </div>
            ),
        }
    ];

    const handleEdit = async (record) => {
        try {
            await dispatch(loadtempletedetails(record?.key)).unwrap();
            navigate('/templeteConfig');
        } catch (error) {
            // Handle error if needed
            console.error('Failed to load template:', error);
        }
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
                pagination={getUnifiedPaginationConfig({
                    total: filteredData.length,
                    itemName: "items",
                })}
                className="drawer-tbl"
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