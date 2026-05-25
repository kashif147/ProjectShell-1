import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Row,
  Col,
  Button,
  Tabs,
  Table,
  Tag,
  Card,
  Descriptions,
  Alert,
  Input,
  Space,
  message,
  Spin,
  Modal,
  Popconfirm,
} from "antd";
import {
  MdCloudDownload,
  MdCloudUpload,
} from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import directDebitRunsApi from "../../services/directDebitRunsApi";

const { TextArea } = Input;

const STATUS_COLOR = {
  INCLUDED: "blue",
  EXCLUDED: "default",
  FILED: "cyan",
  SUBMITTED: "geekblue",
  PAID: "green",
  UNPAID: "orange",
  REJECTED: "red",
};

const DirectDebitBatchDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const runId = location.state?.runId;
  const [run, setRun] = useState(location.state?.run || null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [pain002Xml, setPain002Xml] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");

  const resolveEndToEndId = (item) =>
    item?.collection?.endToEndId || item?.endToEndId || "—";

  const resolveMessageId = (r) =>
    r?.file?.messageId || r?.pain008?.msgId || "—";

  const resolvePmtInfId = (r) =>
    r?.file?.paymentInformationId || r?.pain008?.pmtInfIds?.[0] || "—";

  const memberColumns = useMemo(
    () => [
      {
        title: "Member",
        dataIndex: ["memberSnapshot", "membershipNumber"],
        key: "member",
      },
      { title: "Name", dataIndex: ["memberSnapshot", "fullName"], key: "name" },
      { title: "UMR", dataIndex: ["mandateSnapshot", "umr"], key: "umr" },
      {
        title: "End-to-end ID",
        key: "e2e",
        render: (_, r) => resolveEndToEndId(r),
      },
      {
        title: "Amount",
        dataIndex: "amountEur",
        key: "amount",
        render: (v) => (v != null ? `€${Number(v).toFixed(2)}` : "—"),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (s) => <Tag color={STATUS_COLOR[s] || "default"}>{s}</Tag>,
      },
    ],
    [],
  );

  const refresh = useCallback(async () => {
    if (!runId) return;
    setLoading(true);
    try {
      const [runRes, itemsRes] = await Promise.all([
        directDebitRunsApi.get(runId),
        directDebitRunsApi.getAllItems(runId),
      ]);
      setRun(runRes.run);
      setItems(itemsRes.items || []);
    } catch (err) {
      message.error(err.message || "Failed to load run");
    } finally {
      setLoading(false);
    }
  }, [runId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const prepareStatus = run?.prepareJob?.status || "idle";
  const isPrepareInFlight =
    prepareStatus === "queued" || prepareStatus === "running";
  const prepareProgress = run?.prepareJob?.progress || {};

  // Poll prepare status (lightweight) while the job is in flight; stop when
  // it finishes or fails. Refresh the full run on terminal transitions so the
  // items tab and totals update.
  useEffect(() => {
    if (!runId || !isPrepareInFlight) return undefined;
    let cancelled = false;
    let lastSeenStatus = prepareStatus;

    const tick = async () => {
      if (cancelled) return;
      try {
        const res = await directDebitRunsApi.getPrepareStatus(runId);
        if (cancelled) return;
        const nextJob = res?.prepareJob || {};
        const nextStatus = nextJob.status || "idle";

        setRun((prev) =>
          prev
            ? {
                ...prev,
                status: res.status || prev.status,
                totals: res.totals || prev.totals,
                prepareJob: nextJob,
              }
            : prev,
        );

        if (nextStatus === "completed" && lastSeenStatus !== "completed") {
          message.success("Prepare complete — you can validate the run");
          await refresh();
        } else if (nextStatus === "failed" && lastSeenStatus !== "failed") {
          message.error(
            nextJob.errorMessage || "Prepare failed — see audit log",
          );
          await refresh();
        }
        lastSeenStatus = nextStatus;
      } catch (err) {
        // Polling errors are silent — the next tick will retry.
        // Stop polling if status endpoint repeatedly 404s.
      }
    };

    const intervalMs = Number(
      process.env.REACT_APP_DD_PREPARE_POLL_MS || 3000,
    );
    const handle = setInterval(tick, intervalMs);
    tick();
    return () => {
      cancelled = true;
      clearInterval(handle);
    };
  }, [runId, isPrepareInFlight, prepareStatus, refresh]);

  const included = useMemo(
    () => items.filter((i) => i.status !== "EXCLUDED"),
    [items],
  );
  const excluded = useMemo(
    () => items.filter((i) => i.status === "EXCLUDED"),
    [items],
  );
  const rejected = useMemo(
    () => items.filter((i) => ["REJECTED", "UNPAID"].includes(i.status)),
    [items],
  );

  const runAction = async (label, fn) => {
    setActionLoading(true);
    try {
      await fn();
      message.success(label);
      await refresh();
    } catch (err) {
      message.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDraft = async () => {
    setActionLoading(true);
    try {
      await directDebitRunsApi.delete(runId);
      message.success("Draft run deleted");
      window.dispatchEvent(new CustomEvent("direct-debit-runs-changed"));
      navigate("/DirectDebit", { state: { search: "Direct Debit" } });
    } catch (err) {
      message.error(err.message || "Failed to delete run");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRun = async () => {
    setActionLoading(true);
    try {
      await directDebitRunsApi.cancel(runId, "Cancelled");
      message.success("Run cancelled");
      window.dispatchEvent(new CustomEvent("direct-debit-runs-changed"));
      navigate("/DirectDebit", { state: { search: "Direct Debit" } });
    } catch (err) {
      message.error(err.message || "Failed to cancel run");
    } finally {
      setActionLoading(false);
    }
  };

  const canDeleteDraft = run?.status === "DRAFT";
  const canCancelRun = ["VALIDATED", "APPROVED", "FILE_GENERATED"].includes(
    run?.status,
  );

  const validationErrors = run?.validationSummary?.errors || [];
  const validationPassed = run?.validationSummary?.isValid === true;
  const includedCount = run?.totals?.includedCount ?? 0;

  const handleValidate = async () => {
    setActionLoading(true);
    try {
      const res = await directDebitRunsApi.validate(runId);
      const updatedRun = res?.run ?? res;
      if (updatedRun) setRun(updatedRun);
      await refresh();
      const errors = updatedRun?.validationSummary?.errors || [];
      if (updatedRun?.validationSummary?.isValid) {
        message.success("Validation passed — run is ready to approve");
      } else {
        message.warning(
          `Validation completed with ${errors.length} issue${errors.length === 1 ? "" : "s"} — see Validation tab`,
        );
        setActiveTab("validation");
      }
    } catch (err) {
      message.error(err.message || "Validation failed");
    } finally {
      setActionLoading(false);
    }
  };

  const excludedColumns = [
    ...memberColumns.slice(0, 2),
    {
      title: "Reason",
      key: "reason",
      render: (_, r) => r.exclusionReason?.message || r.exclusionReason?.code,
    },
  ];

  const tabItems = [
    {
      key: "summary",
      label: "Summary",
      children: (
        <Descriptions bordered column={2} size="small" className="mt-2">
          <Descriptions.Item label="Run No">{run?.runNo}</Descriptions.Item>
          <Descriptions.Item label="Status">{run?.status}</Descriptions.Item>
          <Descriptions.Item label="Period key">{run?.periodKey || "—"}</Descriptions.Item>
          <Descriptions.Item label="Run sequence">{run?.runSequence ?? "—"}</Descriptions.Item>
          <Descriptions.Item label="Type">{run?.runType}</Descriptions.Item>
          <Descriptions.Item label="Collection date">
            {run?.collectionDate ? dayjs(run.collectionDate).format("DD MMM YYYY") : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Period">
            {run?.periodStartDate && run?.periodEndDate
              ? `${dayjs(run.periodStartDate).format("DD MMM YYYY")} – ${dayjs(run.periodEndDate).format("DD MMM YYYY")}`
              : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Included / Excluded">
            {run?.totals?.includedCount ?? 0} / {run?.totals?.excludedCount ?? 0}
          </Descriptions.Item>
          <Descriptions.Item label="Total EUR" span={2}>
            €{Number(run?.totals?.includedAmountEur || 0).toFixed(2)}
          </Descriptions.Item>
          <Descriptions.Item label="Creditor OIN">
            {run?.creditorSnapshot?.oin}
          </Descriptions.Item>
          <Descriptions.Item label="Creditor IBAN">
            {run?.creditorSnapshot?.iban}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: "included",
      label: `Included (${included.length})`,
      children: (
        <Table
          dataSource={included.map((i) => ({ ...i, key: i._id }))}
          columns={memberColumns}
          pagination={{ pageSize: 100 }}
          size="middle"
          bordered
          onRow={(record) => ({
            onClick: () => setSelectedItem(record),
            style: { cursor: "pointer" },
          })}
        />
      ),
    },
    {
      key: "excluded",
      label: `Excluded (${excluded.length})`,
      children: (
        <Table
          dataSource={excluded.map((i) => ({ ...i, key: i._id }))}
          columns={excludedColumns}
          pagination={{ pageSize: 100 }}
          size="middle"
          bordered
        />
      ),
    },
    {
      key: "validation",
      label: `Validation (${validationErrors.length})`,
      children: validationErrors.length ? (
        <Table
          dataSource={validationErrors.map((e, idx) => ({ ...e, key: idx }))}
          columns={[
            { title: "Code", dataIndex: "code", key: "code" },
            { title: "Message", dataIndex: "message", key: "message" },
            { title: "Member", dataIndex: "memberId", key: "memberId" },
          ]}
          pagination={false}
          bordered
        />
      ) : (
        <Alert type="success" message="No validation issues" showIcon />
      ),
    },
    {
      key: "file",
      label: "Generated file",
      children: run?.pain008?.fileName || run?.file?.messageId ? (
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="MsgId">{resolveMessageId(run)}</Descriptions.Item>
          <Descriptions.Item label="PmtInfId">{resolvePmtInfId(run)}</Descriptions.Item>
          <Descriptions.Item label="File">{run.pain008?.fileName || "—"}</Descriptions.Item>
          <Descriptions.Item label="Hash">{run.pain008?.fileHash || "—"}</Descriptions.Item>
          <Descriptions.Item label="Generated">
            {run.pain008?.generatedAt
              ? dayjs(run.pain008.generatedAt).format("DD MMM YYYY HH:mm")
              : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="NbOfTxs / CtrlSum">
            {run.pain008?.nbOfTxs ?? "—"} / €{Number(run.pain008?.ctrlSum || 0).toFixed(2)}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <Alert type="info" message="PAIN.008 not generated yet" />
      ),
    },
    {
      key: "reconciliation",
      label: "Reconciliation",
      children: (
        <div>
          <Descriptions bordered column={1} size="small" className="mb-3">
            <Descriptions.Item label="PmtInfId">{resolvePmtInfId(run)}</Descriptions.Item>
            <Descriptions.Item label="MsgId">{resolveMessageId(run)}</Descriptions.Item>
            <Descriptions.Item label="Unpaid count">
              {run?.totals?.unpaidCount ?? 0} rejected / unpaid
            </Descriptions.Item>
            <Descriptions.Item label="Unpaid EUR">
              €{Number((run?.totals?.unpaidAmountEur || 0) + (run?.totals?.rejectedAmountEur || 0)).toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="Last PAIN.002 import">
              {run?.reconciliation?.lastPain002ImportAt
                ? dayjs(run.reconciliation.lastPain002ImportAt).format("DD MMM YYYY HH:mm")
                : "—"}
            </Descriptions.Item>
          </Descriptions>
          {rejected.length > 0 && (
            <Table
              dataSource={rejected.map((i) => ({ ...i, key: i._id }))}
              columns={[
                ...memberColumns.slice(0, 4),
                {
                  title: "Reason",
                  dataIndex: ["pain002", "reasonCode"],
                  key: "reason",
                },
                { title: "Status", dataIndex: "status", key: "status" },
              ]}
              pagination={false}
              bordered
              size="small"
            />
          )}
          <TextArea
            rows={6}
            placeholder="Paste PAIN.002 XML here"
            value={pain002Xml}
            onChange={(e) => setPain002Xml(e.target.value)}
            className="mt-3"
          />
          <Button
            className="mt-2"
            icon={<MdCloudUpload />}
            loading={actionLoading}
            disabled={!pain002Xml.trim()}
            onClick={() =>
              runAction("PAIN.002 imported", () =>
                directDebitRunsApi.importPain002(runId, { xml: pain002Xml }),
              )
            }
          >
            Import PAIN.002
          </Button>
        </div>
      ),
    },
    {
      key: "audit",
      label: "Audit log",
      children: (
        <Table
          dataSource={(run?.auditTrail || []).map((a, idx) => ({ ...a, key: idx }))}
          columns={[
            {
              title: "When",
              dataIndex: "at",
              render: (d) => dayjs(d).format("DD MMM YYYY HH:mm:ss"),
            },
            { title: "Action", dataIndex: "action" },
            { title: "Actor", dataIndex: "actorId" },
          ]}
          pagination={false}
          bordered
          size="small"
        />
      ),
    },
  ];

  if (!runId) {
    return <Alert type="warning" message="No run selected" showIcon />;
  }

  return (
    <Spin spinning={loading}>
      <div style={{ padding: "24px 35px" }}>
        <Card style={{ marginBottom: 24 }}>
          <Row gutter={16} align="middle">
            <Col flex="auto">
              <h2 style={{ margin: 0 }}>{run?.runNo || "Direct Debit Run"}</h2>
              <Space size={4}>
                <Tag>{run?.status}</Tag>
                {run?.status === "VALIDATED" && !validationPassed && (
                  <Tag color="error">Validation issues</Tag>
                )}
              </Space>
            </Col>
            <Col>
              <Space wrap>
                {canDeleteDraft && (
                  <Popconfirm
                    title="Delete this draft run?"
                    description="This permanently removes the draft. You can create a new run from the list when ready."
                    okText="Delete"
                    okButtonProps={{ danger: true }}
                    onConfirm={handleDeleteDraft}
                  >
                    <Button danger loading={actionLoading}>
                      Delete
                    </Button>
                  </Popconfirm>
                )}
                {canCancelRun && (
                  <Popconfirm
                    title="Cancel this run?"
                    description="The run will be marked cancelled so you can create a new one for the same period."
                    okText="Cancel run"
                    okButtonProps={{ danger: true }}
                    onConfirm={handleCancelRun}
                  >
                    <Button danger loading={actionLoading}>
                      Cancel run
                    </Button>
                  </Popconfirm>
                )}
                <Button
                  loading={actionLoading || isPrepareInFlight}
                  disabled={isPrepareInFlight}
                  title={
                    isPrepareInFlight
                      ? "Prepare is already running in the background"
                      : undefined
                  }
                  onClick={async () => {
                    setActionLoading(true);
                    try {
                      const res = await directDebitRunsApi.prepare(runId);
                      const updatedRun = res?.run ?? res;
                      if (updatedRun) setRun(updatedRun);
                      message.info(
                        "Prepare started — running in the background. You will be notified when complete.",
                      );
                    } catch (err) {
                      message.error(err.message || "Failed to start prepare");
                    } finally {
                      setActionLoading(false);
                    }
                  }}
                >
                  {isPrepareInFlight ? "Preparing…" : "Prepare"}
                </Button>
                <Button
                  loading={actionLoading}
                  disabled={includedCount === 0 || isPrepareInFlight}
                  title={
                    isPrepareInFlight
                      ? "Wait for Prepare to finish"
                      : includedCount === 0
                        ? "Prepare members before validating"
                        : undefined
                  }
                  onClick={handleValidate}
                >
                  Validate
                </Button>
                <Button
                  loading={actionLoading}
                  disabled={!validationPassed || isPrepareInFlight}
                  title={
                    !validationPassed
                      ? "Run must pass validation before approval"
                      : undefined
                  }
                  onClick={() =>
                    runAction("Approved", () => directDebitRunsApi.approve(runId))
                  }
                >
                  Approve
                </Button>
                <Button
                  type="primary"
                  loading={actionLoading}
                  onClick={() =>
                    runAction("PAIN.008 generated", () =>
                      directDebitRunsApi.generatePain008(runId),
                    )
                  }
                >
                  Generate PAIN.008
                </Button>
                <Button
                  loading={actionLoading}
                  onClick={() =>
                    runAction("Marked submitted", () =>
                      directDebitRunsApi.markSubmitted(runId, {}),
                    )
                  }
                >
                  Mark submitted
                </Button>
                {run?.pain008?.fileName && (
                  <Button
                    icon={<MdCloudDownload />}
                    href={directDebitRunsApi.downloadPain008Url(runId)}
                    target="_blank"
                  >
                    Download XML
                  </Button>
                )}
              </Space>
            </Col>
          </Row>
        </Card>
        {isPrepareInFlight && (
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            message={
              prepareStatus === "queued"
                ? "Prepare queued"
                : "Preparing members…"
            }
            description={
              prepareProgress?.total > 0
                ? `${prepareProgress.processed || 0} of ${prepareProgress.total} processed. You can leave this page — a notification will appear when prepare completes.`
                : "Building the eligible members list in the background. You can leave this page — a notification will appear when prepare completes."
            }
          />
        )}
        {run?.prepareJob?.status === "failed" && (
          <Alert
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
            message="Prepare failed"
            description={
              run.prepareJob.errorMessage ||
              "Prepare did not finish. Try again or check the audit log."
            }
          />
        )}
        {run?.status === "VALIDATED" && !validationPassed && (
          <Alert
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
            message="Validation found issues"
            description="Fix the issues in the Validation tab, then run Prepare again if needed and Validate before approving."
            action={
              <Button size="small" onClick={() => setActiveTab("validation")}>
                View issues
              </Button>
            }
          />
        )}
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
        <Modal
          title="Transaction detail"
          open={Boolean(selectedItem)}
          onCancel={() => setSelectedItem(null)}
          footer={null}
          width={560}
        >
          {selectedItem && (
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Member">
                {selectedItem.memberSnapshot?.membershipNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Name">
                {selectedItem.memberSnapshot?.fullName}
              </Descriptions.Item>
              <Descriptions.Item label="EndToEndId">
                {resolveEndToEndId(selectedItem)}
              </Descriptions.Item>
              <Descriptions.Item label="UMR">
                {selectedItem.mandateSnapshot?.umr}
              </Descriptions.Item>
              <Descriptions.Item label="PmtInfId">
                {selectedItem.pain008?.pmtInfId || resolvePmtInfId(run)}
              </Descriptions.Item>
              <Descriptions.Item label="Amount">
                €{Number(selectedItem.amountEur || 0).toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="Status">{selectedItem.status}</Descriptions.Item>
              {selectedItem.pain002?.reasonCode && (
                <Descriptions.Item label="PAIN.002 reason">
                  {selectedItem.pain002.reasonCode}
                </Descriptions.Item>
              )}
            </Descriptions>
          )}
        </Modal>
      </div>
    </Spin>
  );
};

export default DirectDebitBatchDetails;
