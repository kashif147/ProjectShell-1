import React, { useState, useEffect, useMemo } from "react";
import { Input, Select, DatePicker, Button, Card, Row, Col, Spin, Empty } from "antd";
import dayjs from "dayjs";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import MyTable from "../common/MyTable";
import { centsToEuro } from "../../utils/Utilities";
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
        item.entries?.some((e) =>
          String(e.memberId).trim().toLowerCase() === targetId
        )
      );

      // Sort chronologically for correct running balance calculation
      const sortedData = [...filteredRawData].sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());

      let cumulativeBalance = 0;
      const ledgerData = sortedData.map((item, index) => {
        // Collect ALL entries for this specific member in this transaction
        const memberEntries = item.entries?.filter((e) =>
          String(e.memberId).trim().toLowerCase() === targetId
        ) || [];

        // Aggregate amounts (handles split entries in a single transaction)
        let totalDebit = 0;
        let totalCredit = 0;

        memberEntries.forEach(e => {
          const amt = Number(e.amount) || 0;
          if (e.dc === "D") totalDebit += amt;
          if (e.dc === "C") totalCredit += amt;
        });

        cumulativeBalance += (totalCredit - totalDebit);

        return {
          ...item,
          key: item._id || `ledger-${index}-${item.date}-${cumulativeBalance}`,
          description: (item.memo || item.description || "-").trim(),
          reference: (item.docNo || item.reference || "-").trim(),
          debit: totalDebit,
          credit: totalCredit,
          balance: cumulativeBalance,
        };
      }).filter(item => {
        // Strict Filter: Only show rows with a valid date AND a non-zero financial impact
        const hasDate = item.date && dayjs(item.date).isValid();
        const hasAmount = Math.abs(item.debit) > 0.001 || Math.abs(item.credit) > 0.001;
        return hasDate && hasAmount;
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
      width: 120, // Set explicit widths
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      render: (text) => text ? dayjs(text).format("DD/MM/YYYY") : "-",
    },
    { title: "Description", dataIndex: "description", key: "description", width: 150 },
    { title: "Reference", dataIndex: "reference", key: "reference", width: 200 },
    {
      title: "Debit",
      dataIndex: "debit",
      key: "debit",
      width: 50,
      align: 'right',
      render: (value) => value ? <span style={{ color: "red" }}>€{centsToEuro(value).toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> : "",
    },
    {
      title: "Credit",
      dataIndex: "credit",
      key: "credit",
      width: 50,
      align: 'right',
      render: (value) => value ? <span style={{ color: "green" }}>€{centsToEuro(value).toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> : "",
    },
    {
      title: "Running Balance",
      dataIndex: "balance",
      key: "balance",
      width: 50,
      align: 'right',
      render: (value) => (
        <span style={{ color: value < 0 ? "red" : "green" }}>
          €{Math.abs(centsToEuro(value || 0)).toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
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
      {/* <Card bodyStyle={{ padding: 0 }}> */}
      <MyTable
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        selection={false}
        tablePadding={{ paddingLeft: "0", paddingRight: "0" }}
      />
      {/* </Card> */}
    </div>
  );
};

export default TransactionHistory;
