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

            const response = await fetch(`${process.env.REACT_APP_CUMM}/templates/${templateId}`, {
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
                dataSource={filteredData}
                loading={loading}
                 scroll={{ y: 400 }} 
                bordered
                pagination={{
                    total: filteredData.length,
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                }}
                // Custom table header styling
                components={{
                    header: {
                        cell: (props) => (
                            <th
                                {...props}
                                style={{
                                    backgroundColor: '#f5f5f5',
                                    color: '#333',
                                    fontWeight: '600',
                                    fontSize: '13px',
                                    padding: '12px 16px',
                                    borderBottom: '2px solid #e8e8e8',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                }}
                            />
                        ),
                    },
                }}
                style={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    overflow: 'hidden',
                }}
                rowClassName={() => 'template-table-row'}
                onRow={(record) => ({
                    style: {
                        borderBottom: '1px solid #f0f0f0',
                    },
                })}
            />

            {/* Custom CSS for table cells */}
            <style jsx="true">{`
        .template-table-row td {
          padding: 12px 16px !important;
          font-size: 14px !important;
          color: #333 !important;
        }
        
        .template-table-row:hover td {
          background-color: #fafafa !important;
        }
        
        .ant-table-thead > tr > th {
          background-color: #45669d !important;
          color: #fff !important;
          font-weight: 600 !important;
          font-size: 13px !important;
          padding: 12px 16px !important;
          border-bottom: 2px solid #e8e8e8 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
        }
        
        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f0f0f0 !important;
        }
        
        .ant-table-tbody > tr:last-child > td {
          border-bottom: none !important;
        }
        
        .ant-table-wrapper {
          border-radius: 8px !important;
          overflow: hidden !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
        }
      `}</style>

            {error && <p className="text-danger mt-2">Error: {error}</p>}
        </div>
    );
};

export default TempletsSummary;