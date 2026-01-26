import React, { useState, useEffect } from "react";
import { Table, Input, Select, DatePicker, Button, Card, Row, Col, Spin, message } from "antd";
import dayjs from "dayjs";
import axios from "axios";
import { useTableColumns } from "../../context/TableColumnsContext ";

const { Option } = Select;
const { RangePicker } = DatePicker;

const TransactionHistory = () => {
  const { ProfileDetails } = useTableColumns();
  const [searchText, setSearchText] = useState("");
  const [transactionType, setTransactionType] = useState("All");
  const [dateRange, setDateRange] = useState([]);
  const [amountRange, setAmountRange] = useState("All");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      sorter: (a, b) => dayjs(a.date, "D/M/YYYY") - dayjs(b.date, "D/M/YYYY"),
      render: (text) => text ? dayjs(text).format("DD/MM/YYYY") : "",
    },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Reference", dataIndex: "reference", key: "reference" },
    {
      title: "Debit",
      dataIndex: "debit",
      key: "debit",
      render: (value) => value ? <span style={{ color: "red" }}>€{value}</span> : "-",
    },
    {
      title: "Credit",
      dataIndex: "credit",
      key: "credit",
      render: (value) => value ? <span style={{ color: "green" }}>€{value}</span> : "-",
    },
    {
      title: "Running Balance",
      dataIndex: "balance",
      key: "balance",
      render: (value) => (
        <span style={{ color: value < 0 ? "red" : "green" }}>€{value}</span>
      ),
    },
  ];

  useEffect(() => {
    const fetchLedger = async () => {
      const memberId = ProfileDetails?.[0]?.regNo;
      if (!memberId) return;

      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.REACT_APP_ACCOUNT_SERVICE_URL}/reports/member/${memberId}/ledger`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Add keys to data if missing
        const formattedData = Array.isArray(response.data)
          ? response.data.map((item, index) => ({ ...item, key: item.id || index }))
          : [];

        setData(formattedData);
      } catch (error) {
        console.error("Error fetching ledger:", error);
        message.error("Failed to load finance ledger.");
      } finally {
        setLoading(false);
      }
    };

    fetchLedger();
  }, [ProfileDetails]);

  // ---- Filtering logic ----
  const filteredData = data.filter((d) => {
    // Search text (description or reference)
    const matchesSearch =
      (d.description && d.description.toLowerCase().includes(searchText.toLowerCase())) ||
      (d.reference && d.reference.toLowerCase().includes(searchText.toLowerCase()));

    // Transaction type (debit/credit/all)
    const matchesType =
      transactionType === "All" ||
      (transactionType === "debit" && d.debit) ||
      (transactionType === "credit" && d.credit);

    // Date range filter
    const matchesDate =
      !dateRange.length ||
      (dayjs(d.date).isAfter(dateRange[0].startOf("day")) &&
        dayjs(d.date).isBefore(dateRange[1].endOf("day")));

    // Amount range filter (check debit/credit whichever exists)
    const amount = d.debit || d.credit || 0;
    let matchesAmount = true;
    if (amountRange === "small") matchesAmount = amount <= 500;
    if (amountRange === "medium") matchesAmount = amount > 500 && amount <= 1000;
    if (amountRange === "large") matchesAmount = amount > 1000;

    return matchesSearch && matchesType && matchesDate && matchesAmount;
  });

  // Reset filters
  const handleReset = () => {
    setSearchText("");
    setTransactionType("All");
    setDateRange([]);
    setAmountRange("All");
  };

  return (
    <div className="mt-4">
      {/* Filters */}
      <Card className="">
        <Row gutter={16} className="mb-2">
          <Col xs={24} md={6}>
            <Input
              placeholder="Search transactions"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} md={4}>
            <Select
              value={transactionType}
              onChange={(v) => setTransactionType(v)}
              style={{ width: "100%" }}
            >
              <Option value="All">Transaction Type</Option>
              <Option value="debit">Debit</Option>
              <Option value="credit">Credit</Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <RangePicker
              style={{ width: "100%" }}
              value={dateRange}
              onChange={(val) => setDateRange(val || [])}
            />
          </Col>
          <Col xs={24} md={4}>
            <Select
              value={amountRange}
              onChange={(v) => setAmountRange(v)}
              style={{ width: "100%" }}
            >
              <Option value="All">Amount Range</Option>
              <Option value="small">0 - 500</Option>
              <Option value="medium">500 - 1000</Option>
              <Option value="large">1000+</Option>
            </Select>
          </Col>
          <Col xs={24} md={4}>
            <Button block onClick={handleReset}>
              Reset
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Table */}

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{ pageSize: 5 }}
          bordered
        />
      </Spin>

    </div>
  );
};

export default TransactionHistory;
