import React, { useState, useEffect, useMemo } from "react";
import { Input, Select, DatePicker, Button, Card, Row, Col, Spin, Empty } from "antd";
import dayjs from "dayjs";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import SubTableComp from "../common/SubTableComp";
// import axios from "axios";
import { useTableColumns } from "../../context/TableColumnsContext ";

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
  const { ProfileDetails } = useTableColumns();
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

      // Extract data safely
      const rawData = response.data?.data?.items || [];

      // Normalize memberId for comparison
      const targetId = String(memberId).trim().toLowerCase();

      // Show only data that has entries for the specific memberId
      const filteredRawData = rawData.filter((item) =>
        item.entries?.some((e) => String(e.memberId).trim().toLowerCase() === targetId)
      );

      // Sort chronologically for correct running balance calculation
      const sortedData = [...filteredRawData].sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());

      let cumulativeBalance = 0;
      const ledgerData = sortedData.map((item, index) => {
        // Find the entry that specifically matches this memberId
        const memberEntry = item.entries?.find((e) => String(e.memberId).trim().toLowerCase() === targetId);

        const debit = memberEntry?.dc === "D" ? memberEntry.amount : 0;
        const credit = memberEntry?.dc === "C" ? memberEntry.amount : 0;

        cumulativeBalance += (credit - debit);

        return {
          ...item,
          key: item._id || `ledger-${index}`,
          description: item.memo || "-",
          reference: item.docNo || "-",
          debit: debit,
          credit: credit,
          balance: cumulativeBalance,
        };
      });

      // Show newest first in the table
      setData([...ledgerData].reverse());
    } catch (error) {
      console.error("Error fetching ledger data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(() => [
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
  ], []);

  // ---- Filtering logic ----
  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    const searchLower = searchText.trim().toLowerCase();

    return data.filter((d) => {
      // Search text (description or reference)
      const matchesSearch = !searchLower ||
        (d.description?.toLowerCase().includes(searchLower)) ||
        (d.reference?.toLowerCase().includes(searchLower));

      // Transaction type (debit/credit/all)
      const matchesType =
        transactionType === "All" ||
        (transactionType === "debit" && d.debit) ||
        (transactionType === "credit" && d.credit);

      // Date range filter
      const matchesDate =
        !dateRange || !dateRange.length ||
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
  }, [data, searchText, transactionType, dateRange, amountRange]);

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
        {loading ? (
          <div style={{ padding: "50px", textAlign: "center" }}>
            <Spin size="large" />
          </div>
        ) : (
          <SubTableComp
            columns={columns}
            dataSource={filteredData}
          />
        )}
      </Card>
    </div>
  );
};

export default TransactionHistory;
