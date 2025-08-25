import React, { useState } from "react";
import { Table, Input, Select, DatePicker, Button, Card, Row, Col } from "antd";
import dayjs from "dayjs";

const { Option } = Select;
const { RangePicker } = DatePicker;

const TransactionHistory = () => {
  const [searchText, setSearchText] = useState("");
  const [transactionType, setTransactionType] = useState("All");
  const [dateRange, setDateRange] = useState([]);
  const [amountRange, setAmountRange] = useState("All");

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      sorter: (a, b) => dayjs(a.date, "D/M/YYYY") - dayjs(b.date, "D/M/YYYY"),
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

  const data = [
    { key: 1, date: "15/1/2024", description: "Application Fee", reference: "APP-001", debit: 250, credit: null, balance: -250 },
    { key: 2, date: "20/1/2024", description: "Payment Received - Registration", reference: "PAY-001", debit: null, credit: 500, balance: 250 },
    { key: 3, date: "1/2/2024", description: "Annual Membership Fee", reference: "ANN-001", debit: 1200, credit: null, balance: -950 },
    { key: 4, date: "15/2/2024", description: "Late Payment Penalty", reference: "PEN-001", debit: 50, credit: null, balance: -1000 },
    { key: 5, date: "20/2/2024", description: "Payment Received - Outstanding Balance", reference: "PAY-002", debit: null, credit: 1000, balance: 0 },
  ];

  // ---- Filtering logic ----
  const filteredData = data.filter((d) => {
    // Search text (description or reference)
    const matchesSearch =
      d.description.toLowerCase().includes(searchText.toLowerCase()) ||
      d.reference.toLowerCase().includes(searchText.toLowerCase());

    // Transaction type (debit/credit/all)
    const matchesType =
      transactionType === "All" ||
      (transactionType === "debit" && d.debit) ||
      (transactionType === "credit" && d.credit);

    // Date range filter
    const matchesDate =
      !dateRange.length ||
      (dayjs(d.date, "D/M/YYYY").isAfter(dateRange[0].startOf("day")) &&
        dayjs(d.date, "D/M/YYYY").isBefore(dateRange[1].endOf("day")));

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
      {/* Top Cards */}
      {/* <Row gutter={16} className="">
        <Col xs={24} md={8}>
          <Card bordered className="shadow-sm">
            <h6>Total Debits</h6>
            <h4 style={{ color: "red" }}>€1,500.00</h4>
            <small>Total charges</small>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered className="shadow-sm">
            <h6>Total Credits</h6>
            <h4 style={{ color: "green" }}>€1,500.00</h4>
            <small>Total payments</small>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered className="shadow-sm">
            <h6>Outstanding Balance</h6>
            <h4 style={{ color: "blue" }}>€0.00</h4>
            <small>Paid in full</small>
          </Card>
        </Col>
      </Row> */}

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
  
        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{ pageSize: 5 }}
          bordered
        />

    </div>
  );
};

export default TransactionHistory;
