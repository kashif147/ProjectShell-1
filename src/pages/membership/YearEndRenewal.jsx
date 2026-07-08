import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Form,
  Input,
  List,
  Row,
  Select,
  Space,
  Statistic,
  Steps,
  Tag,
  Typography,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  CloudSyncOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { getSubscriptionServiceBaseUrl } from "../../config/serviceUrls";

const { Text, Title } = Typography;

const ACTIONS = [
  {
    key: "ARCHIVE",
    title: "To Archive",
    description: "Suspended members moving to archived",
  },
  {
    key: "SUSPEND",
    title: "To Suspend",
    description: "Cancelled and resigned members moving to suspended",
  },
  {
    key: "RENEW",
    title: "To Renew",
    description: "Active members moving into the new subscription year",
  },
];

const TERMINAL_STATUSES = new Set(["COMPLETED", "FAILED"]);

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getApiBase() {
  const base = getSubscriptionServiceBaseUrl();
  return base ? `${base}/renewalBatches` : "";
}

function unwrapData(response) {
  return response?.data?.data || response?.data || null;
}

function currentFiscalYear() {
  const today = new Date();
  return today.getFullYear();
}

function defaultFiscalYear() {
  return currentFiscalYear() - 1;
}

function apiErrorMessage(error, fallback) {
  return error?.response?.data?.data || error?.response?.data?.message || fallback;
}

function statusColor(status) {
  if (status === "COMPLETED") return "green";
  if (status === "FAILED") return "red";
  if (status === "INPROGRESS" || status === "QUEUED") return "blue";
  if (status === "READY") return "gold";
  return "default";
}

function stepIndex(status) {
  if (status === "READY") return 1;
  if (status === "QUEUED" || status === "INPROGRESS") return 2;
  if (status === "COMPLETED") return 3;
  if (status === "FAILED") return 2;
  return 0;
}

function MetricCard({ title, value }) {
  return (
    <Card size="small">
      <Statistic title={title} value={Number(value || 0)} />
    </Card>
  );
}

function MemberActionList({ title, description, memberIds }) {
  return (
    <Card size="small" title={title}>
      <Text type="secondary">{description}</Text>
      <div style={{ marginTop: 12 }}>
        {memberIds?.length ? (
          <List
            size="small"
            bordered
            dataSource={memberIds.slice(0, 100)}
            renderItem={(memberId) => <List.Item>{memberId}</List.Item>}
            footer={
              memberIds.length > 100
                ? `${memberIds.length - 100} more members`
                : null
            }
          />
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No members" />
        )}
      </div>
    </Card>
  );
}

function YearEndRenewal() {
  const [form] = Form.useForm();
  const [batch, setBatch] = useState(null);
  const [yearOptions, setYearOptions] = useState([]);
  const [yearMeta, setYearMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [yearsLoading, setYearsLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [streamEvent, setStreamEvent] = useState(null);
  const streamAbortRef = useRef(null);
  const pollRef = useRef(null);

  const apiBase = useMemo(() => getApiBase(), []);
  const fiscalYear = Form.useWatch("fiscalYear", form);

  const selectedYearOption = useMemo(
    () =>
      yearOptions.find(
        (option) => Number(option.fiscalYear) === Number(fiscalYear)
      ) || null,
    [yearOptions, fiscalYear]
  );

  const loadYearOptions = async () => {
    if (!apiBase) return null;
    setYearsLoading(true);
    try {
      const response = await axios.get(`${apiBase}/year-options`, {
        headers: authHeaders(),
      });
      const data = unwrapData(response) || {};
      const options = Array.isArray(data.years) ? data.years : [];
      setYearOptions(options);
      return data;
    } catch (error) {
      message.error(apiErrorMessage(error, "Could not load fiscal years"));
      return null;
    } finally {
      setYearsLoading(false);
    }
  };

  const loadBatch = async (batchId) => {
    if (!apiBase || !batchId) return null;
    const response = await axios.get(`${apiBase}/${batchId}`, {
      headers: authHeaders(),
    });
    const data = unwrapData(response);
    setBatch(data);
    return data;
  };

  const loadBatchForYear = async (year) => {
    if (!apiBase || !year) return null;
    setLoading(true);
    try {
      const response = await axios.get(`${apiBase}/by-year/${year}`, {
        headers: authHeaders(),
      });
      const data = unwrapData(response);
      setBatch(data || null);
      setStreamEvent(null);
      return data;
    } catch (error) {
      message.error(apiErrorMessage(error, "Could not load renewal year"));
      setBatch(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (batchId) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const data = await loadBatch(batchId);
        if (TERMINAL_STATUSES.has(data?.status)) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      } catch {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }, 3000);
  };

  const startStream = async (batchId) => {
    if (!apiBase || !batchId) return;
    if (streamAbortRef.current) streamAbortRef.current.abort();
    const controller = new AbortController();
    streamAbortRef.current = controller;

    try {
      const response = await fetch(`${apiBase}/${batchId}/events`, {
        headers: authHeaders(),
        signal: controller.signal,
      });
      if (!response.ok || !response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";
        for (const part of parts) {
          const dataLine = part
            .split("\n")
            .find((line) => line.startsWith("data:"));
          if (!dataLine) continue;
          const parsed = JSON.parse(dataLine.replace(/^data:\s*/, ""));
          setStreamEvent(parsed);
          if (parsed.status) {
            setBatch((prev) => ({
              ...(prev || {}),
              status: parsed.status,
              metrics: parsed.metrics || prev?.metrics,
              error: parsed.error || prev?.error,
            }));
          }
          if (TERMINAL_STATUSES.has(parsed.status)) {
            controller.abort();
            return;
          }
        }
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        setStreamEvent({ type: "stream_error", error: error.message });
      }
    }
  };

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (streamAbortRef.current) streamAbortRef.current.abort();
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    (async () => {
      const data = await loadYearOptions();
      if (ignore) return;
      const options = Array.isArray(data?.years) ? data.years : [];
      const defaultYear = Number(data?.defaultFiscalYear || defaultFiscalYear());
      const selected =
        options.find((option) => Number(option.fiscalYear) === defaultYear) ||
        options[0] ||
        null;
      if (selected) {
        form.setFieldsValue({
          fiscalYear: selected.fiscalYear,
          name: `Year-end renewal ${selected.fiscalYear}`,
        });
      }
    })();
    return () => {
      ignore = true;
    };
  }, [apiBase, form]);

  useEffect(() => {
    if (!fiscalYear) return;
    setYearMeta(selectedYearOption);
    form.setFieldsValue({ name: `Year-end renewal ${fiscalYear}` });
    loadBatchForYear(fiscalYear);
  }, [fiscalYear, selectedYearOption, form]);

  const createBatch = async (values) => {
    if (!apiBase) {
      message.error("Subscription service URL is not configured");
      return;
    }
    if (!selectedYearOption?.canCreatePreview) {
      message.error("This fiscal year is read-only or already has an active batch");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        apiBase,
        {
          name: values.name,
          fiscalYear: values.fiscalYear,
        },
        { headers: authHeaders() },
      );
      const data = unwrapData(response);
      setBatch(data);
      startPolling(data?._id);
      await loadYearOptions();
      message.success("Renewal preview started");
    } catch (error) {
      message.error(apiErrorMessage(error, "Could not create batch"));
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    if (!batch?._id && !fiscalYear) return;
    setLoading(true);
    try {
      if (batch?._id) {
        await loadBatch(batch._id);
      } else {
        await loadBatchForYear(fiscalYear);
      }
      const data = await loadYearOptions();
      const nextMeta = data?.years?.find(
        (option) => Number(option.fiscalYear) === Number(fiscalYear)
      );
      setYearMeta(nextMeta || null);
    } catch (error) {
      message.error(apiErrorMessage(error, "Could not refresh batch"));
    } finally {
      setLoading(false);
    }
  };

  const executeBatch = async () => {
    if (!apiBase || !batch?._id) return;
    if (!yearMeta?.canExecute) {
      message.error("This fiscal year is read-only or not ready to execute");
      return;
    }
    setExecuting(true);
    try {
      const response = await axios.post(
        `${apiBase}/${batch._id}/execute`,
        {},
        { headers: authHeaders() },
      );
      const data = unwrapData(response);
      setBatch(data);
      startPolling(batch._id);
      startStream(batch._id);
      await loadYearOptions();
      message.success("Renewal execution queued");
    } catch (error) {
      message.error(apiErrorMessage(error, "Could not execute batch"));
    } finally {
      setExecuting(false);
    }
  };

  const metrics = batch?.metrics || {};
  const membersByAction = batch?.memberIdsByAction || {};
  const status = batch?.status || "DRAFT";
  const selectedFiscalYear = Number(fiscalYear || batch?.fiscalYear || 0);
  const selectedNextYear = selectedFiscalYear ? selectedFiscalYear + 1 : "";
  const isReadOnlyYear = Boolean(yearMeta?.isReadOnly);
  const canCreatePreview = Boolean(yearMeta?.canCreatePreview);
  const canExecute = status === "READY" && Boolean(yearMeta?.canExecute);

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>
            Year-End Renewal
          </Title>
          <Text type="secondary">
            Prepare the year-end transition, review preview counts, then execute
            the renewal batch.
          </Text>
        </div>

        <Card>
          <Form
            form={form}
            layout="inline"
            initialValues={{
              fiscalYear: defaultFiscalYear(),
              name: `Year-end renewal ${defaultFiscalYear()}`,
            }}
            onFinish={createBatch}
          >
            <Form.Item
              label="Fiscal year"
              name="fiscalYear"
              rules={[{ required: true, message: "Fiscal year is required" }]}
            >
              <Select
                loading={yearsLoading}
                style={{ width: 180 }}
                options={yearOptions.map((option) => ({
                  value: option.fiscalYear,
                  label:
                    option.status && option.status !== "NOT_STARTED"
                      ? `${option.fiscalYear} (${option.status})`
                      : String(option.fiscalYear),
                }))}
                placeholder="Select year"
              />
            </Form.Item>
            <Form.Item
              label="Batch name"
              name="name"
              rules={[{ required: true, message: "Batch name is required" }]}
            >
              <Input style={{ width: 280 }} />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading || yearsLoading}
                  disabled={!canCreatePreview}
                  icon={<EyeOutlined />}
                >
                  Create Preview
                </Button>
                <Button
                  onClick={refresh}
                  disabled={!batch?._id && !fiscalYear}
                  loading={loading}
                  icon={<ReloadOutlined />}
                >
                  Refresh
                </Button>
                <Button
                  type="primary"
                  danger
                  disabled={!canExecute || isReadOnlyYear}
                  loading={executing}
                  onClick={executeBatch}
                  icon={<PlayCircleOutlined />}
                >
                  Execute
                </Button>
              </Space>
            </Form.Item>
          </Form>
          {isReadOnlyYear ? (
            <Alert
              style={{ marginTop: 16 }}
              type="info"
              showIcon
              message={`Fiscal year ${fiscalYear} has already completed year-end renewal. This view is read-only.`}
            />
          ) : null}
          {!isReadOnlyYear && fiscalYear && !canCreatePreview && !canExecute ? (
            <Alert
              style={{ marginTop: 16 }}
              type="warning"
              showIcon
              message="This fiscal year already has a renewal batch in progress or waiting for preview. Refresh to see the latest status."
            />
          ) : null}
        </Card>

        {batch ? (
          <>
            <Card>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} md={16}>
                  <Steps
                    current={stepIndex(status)}
                    status={status === "FAILED" ? "error" : "process"}
                    items={[
                      { title: "Created" },
                      { title: "Preview Ready" },
                      { title: "Executing" },
                      { title: "Completed" },
                    ]}
                  />
                </Col>
                <Col xs={24} md={8}>
                  <Descriptions size="small" column={1}>
                    <Descriptions.Item label="Status">
                      <Tag color={statusColor(status)}>{status}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Renewal year">
                      {batch.fiscalYear} to {Number(batch.fiscalYear || 0) + 1}
                    </Descriptions.Item>
                    <Descriptions.Item label="Members">
                      {Number(batch.memberCount || 0)}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
              {batch.error ? (
                <Alert
                  style={{ marginTop: 16 }}
                  type="error"
                  showIcon
                  message={batch.error}
                />
              ) : null}
              {streamEvent ? (
                <Alert
                  style={{ marginTop: 16 }}
                  type="info"
                  showIcon
                  icon={
                    status === "COMPLETED" ? (
                      <CheckCircleOutlined />
                    ) : (
                      <CloudSyncOutlined />
                    )
                  }
                  message={`Latest event: ${streamEvent.step || streamEvent.type || status}`}
                />
              ) : null}
            </Card>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={6}>
                <MetricCard title="Archived before" value={metrics.beforeArchived} />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <MetricCard title="Suspended before" value={metrics.beforeSuspended} />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <MetricCard title="Cancelled before" value={metrics.beforeCancelled} />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <MetricCard title="Resigned before" value={metrics.beforeResigned} />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <MetricCard title="To archive" value={metrics.toArchive} />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <MetricCard title="To suspend" value={metrics.toSuspend} />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <MetricCard title="To renew" value={metrics.toRenew} />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <MetricCard title="New active after" value={metrics.newActiveAfter} />
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              {ACTIONS.map((action) => (
                <Col xs={24} lg={8} key={action.key}>
                  <MemberActionList
                    title={action.title}
                    description={action.description}
                    memberIds={membersByAction[action.key] || []}
                  />
                </Col>
              ))}
            </Row>
          </>
        ) : (
          <Card>
            <Empty
              description={
                selectedFiscalYear
                  ? `No year-end preview exists for ${selectedFiscalYear} to ${selectedNextYear}`
                  : "Select a fiscal year"
              }
            />
          </Card>
        )}
      </Space>
    </div>
  );
}

export default YearEndRenewal;
