import React, { useState } from 'react';
import { Button, Select, Tag } from 'antd';
import { FaSync } from 'react-icons/fa';
import MyTable from '../common/MyTable';
import MySearchInput from '../common/MySearchInput';
import MergeAndReview from './MergeAndReview';

const DuplicateMembers = () => {
    const [searchText, setSearchText] = useState("");
    const [view, setView] = useState("list"); // 'list' | 'merge'
    const [selectedMember, setSelectedMember] = useState(null);

    // Mock Data
    const initialData = [
        {
            key: '1',
            memberName: 'John Doe',
            email: 'j.doe@example.com',
            memberId: 'MBR-12345',
            dateFlagged: '2023-10-27',
            potentialMatch: 'Jane Smith',
            confidence: 'High',
            scoreColor: 'green',
        },
        {
            key: '2',
            memberName: 'Jane Smith',
            email: 'jane.s@example.com',
            memberId: 'MBR-12346',
            dateFlagged: '2023-10-27',
            potentialMatch: 'John Doe',
            confidence: 'High',
            scoreColor: 'green',
        },
        {
            key: '3',
            memberName: 'Sam Wilson',
            email: 'sam.w@example.com',
            memberId: 'MBR-12347',
            dateFlagged: '2023-10-26',
            potentialMatch: 'Samuel Wilson',
            confidence: 'Medium',
            scoreColor: 'gold', // 'amber' in Tailwind is 'gold' in AntD or custom
        },
        {
            key: '4',
            memberName: 'Emily Carter',
            email: 'e.carter@example.com',
            memberId: 'MBR-12348',
            dateFlagged: '2023-10-26',
            potentialMatch: 'Emilia Carter',
            confidence: 'Medium',
            scoreColor: 'gold',
        },
        {
            key: '5',
            memberName: 'Robert Brown',
            email: 'rob.b@example.com',
            memberId: 'MBR-12349',
            dateFlagged: '2023-10-25',
            potentialMatch: 'Rob Brown',
            confidence: 'Low',
            scoreColor: 'red',
        },
    ];

    const [dataSource, setDataSource] = useState(initialData);

    const columns = [
        {
            title: 'Member Name',
            dataIndex: 'memberName',
            key: 'memberName',
        },
        {
            title: 'Email Address',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Membership ID',
            dataIndex: 'memberId',
            key: 'memberId',
        },
        {
            title: 'Date Flagged',
            dataIndex: 'dateFlagged',
            key: 'dateFlagged',
        },
        {
            title: 'Potential Match',
            dataIndex: 'potentialMatch',
            key: 'potentialMatch',
        },
        {
            title: 'Match Confidence',
            dataIndex: 'confidence',
            key: 'confidence',
            render: (text, record) => (
                <Tag color={record.scoreColor} style={{ borderRadius: '12px', padding: '0 10px' }}>
                    {text}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Button
                    type="primary"
                    size="small"
                    style={{ backgroundColor: '#135bec', borderColor: '#135bec' }}
                    onClick={() => {
                        setSelectedMember(record);
                        setView('merge');
                    }}
                >
                    Review & Merge
                </Button>
            ),
        },
    ];

    const handleSearch = (e) => {
        setSearchText(e.target.value);
        // Implement search filtering logic here if needed
        const filtered = initialData.filter(item =>
            item.memberName.toLowerCase().includes(e.target.value.toLowerCase()) ||
            item.email.toLowerCase().includes(e.target.value.toLowerCase()) ||
            item.memberId.toLowerCase().includes(e.target.value.toLowerCase())
        );
        setDataSource(filtered);
    };

    if (view === 'merge') {
        return <MergeAndReview onBack={() => setView('list')} />;
    }

    return (
        <div className="p-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-0">
                        Duplicate Member Records
                    </h1>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-4 justify-between">
                    <div className="flex items-center gap-4 flex-1">
                        <Button
                            icon={<FaSync />}
                            onClick={() => setDataSource(initialData)}
                        >
                            Refresh List
                        </Button>
                        <div style={{ width: '300px' }}>
                            <MySearchInput
                                placeholder="Search by name, email, or ID..."
                                value={searchText}
                                onChange={handleSearch}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Select
                            defaultValue="Date Flagged"
                            style={{ width: 150 }}
                            options={[
                                { value: 'date', label: 'Date Flagged' },
                                { value: 'name', label: 'Name' },
                            ]}
                        />
                        <Select
                            defaultValue="Confidence Score"
                            style={{ width: 160 }}
                            options={[
                                { value: 'high', label: 'High Confidence' },
                                { value: 'medium', label: 'Medium Confidence' },
                                { value: 'low', label: 'Low Confidence' },
                            ]}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <MyTable
                    columns={columns}
                    dataSource={dataSource}
                    loading={false}
                    selection={true}
                />
            </div>
        </div>
    );
};

export default DuplicateMembers;
