import React, { useState, useEffect } from "react";
import { Table, Input, Select, DatePicker, Button, Card, Row, Col, Spin, Empty } from "antd";
import dayjs from "dayjs";
import { useLocation } from "react-router-dom";
import axios from "axios";

import { useSelector } from "react-redux";

const { Option } = Select;
const { RangePicker } = DatePicker;

const TransactionHistory = () => {
  const location = useLocation();
  const { profileDetails } = useSelector((state) => state.profileDetails || {});

  // Try to get memberId from location state first, then fallback to Redux profileDetails
  const memberId = location.state?.memberId || profileDetails?.membershipNumber || profileDetails?.regNo;

  console.log("FinanceByID - location.state:", location.state);
  console.log("FinanceByID - profileDetails:", profileDetails);
  console.log("FinanceByID - decided memberId:", memberId);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [transactionType, setTransactionType] = useState("All");
  const [dateRange, setDateRange] = useState([]);
  const [amountRange, setAmountRange] = useState("All");

  useEffect(() => {
    if (memberId) {
      fetchLedgerData();
    }
  }, [memberId]);

  const fetchLedgerData = async () => {
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

      // Extract data safely, checking multiple common patterns
      let ledgerData = [];
      if (Array.isArray(response.data)) {
        ledgerData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        ledgerData = response.data.data;
      } else if (response.data?.results && Array.isArray(response.data.results)) {
        ledgerData = response.data.results;
      }

      setData(ledgerData);
    } catch (error) {
      console.error("Error fetching ledger data:", error);
      setData([]); // Ensure data is reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      render: (text) => text ? dayjs(text).format("DD/MM/YYYY") : "-",
    },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Reference", dataIndex: "reference", key: "reference" },
    {
      title: "Debit",
      dataIndex: "debit",
      key: "debit",
      render: (value) => value ? <span style={{ color: "red" }}>€{value.toLocaleString()}</span> : "-",
    },
    {
      title: "Credit",
      dataIndex: "credit",
      key: "credit",
      render: (value) => value ? <span style={{ color: "green" }}>€{value.toLocaleString()}</span> : "-",
    },
    {
      title: "Running Balance",
      dataIndex: "balance",
      key: "balance",
      render: (value) => (
        <span style={{ color: value < 0 ? "red" : "green" }}>€{value?.toLocaleString() || 0}</span>
      ),
    },
  ];

  // ---- Filtering logic ----
  const filteredData = Array.isArray(data) ? data.filter((d) => {
    // Search text (description or reference)
    const matchesSearch =
      (d.description?.toLowerCase().includes(searchText.toLowerCase()) || false) ||
      (d.reference?.toLowerCase().includes(searchText.toLowerCase()) || false);

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
  }) : [];

  // Reset filters
  const handleReset = () => {
    setSearchText("");
    setTransactionType("All");
    setDateRange([]);
    setAmountRange("All");
  };

  if (!memberId) {
    return <div className="mt-4"><Empty description="No Member ID provided" /></div>;
  }

  return (
    <div className="mt-4">
      {/* Filters */}
      <Card className="mb-3">
        <Row gutter={16} align="middle">
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
      <Card bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          bordered
          loading={loading}
          locale={{ emptyText: <Empty description="No transactions found" /> }}
        />
      </Card>
    </div>
  );
};

export default TransactionHistory;
