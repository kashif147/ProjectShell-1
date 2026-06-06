import React, { useEffect, useState, useCallback, useMemo } from "react";
import { FaFilePdf } from "react-icons/fa";
import { Spin, message, Button, Tooltip, Tag } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import MyTable from "../common/MyTable";
import {
  listProfilePaymentForms,
  downloadPaymentFormPdf,
} from "../../api/paymentFormApi";
import PaymentFormDetailDrawer from "../paymentForms/PaymentFormDetailDrawer";
import {
  parseFilenameFromContentDisposition,
  triggerBlobDownload,
} from "../../utils/paymentFormDownload";
import dayjs from "dayjs";

function buildColumns(onDownloadPdf, downloadingId) {
  return [
    {
      title: "Document Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Form type",
      dataIndex: "formType",
      key: "formType",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Authorised",
      dataIndex: "isAuthorized",
      key: "isAuthorized",
      width: 120,
      render: (value, row) => {
        if (!value) return "No";
        if (row?.authorisationMode === "on_file")
          return <Tag color="geekblue">On file</Tag>;
        return <Tag color="green">Yes</Tag>;
      },
    },
    {
      title: "Date",
      dataIndex: "dateUploaded",
      key: "dateUploaded",
    },
    {
      title: "PDF",
      key: "pdf",
      width: 120,
      render: (_, record) => {
        if (!record._id) return "—";
        return (
          <div
            style={{ display: "flex", alignItems: "center", gap: 8 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Tooltip title="Download prefilled PDF (official form layout)">
              <Button
                type="link"
                size="small"
                icon={<DownloadOutlined />}
                loading={downloadingId === record._id}
                onClick={() => onDownloadPdf(record)}
                style={{ padding: 0 }}
              >
                PDF
              </Button>
            </Tooltip>
            {record.fileUrl ? (
              <Tooltip title="Open uploaded scan / signed copy">
                <a
                  href={record.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open uploaded document"
                >
                  <FaFilePdf style={{ color: "#d9534f", fontSize: "20px" }} />
                </a>
              </Tooltip>
            ) : null}
          </div>
        );
      },
    },
  ];
}

function toMemberSnapshot(profile) {
  if (!profile?._id) return null;
  return {
    _id: profile._id,
    membershipNumber: profile.membershipNumber,
    personalInfo: profile.personalInfo,
  };
}

export default function DoucmentsById({
  profileId,
  profile,
  registerActions,
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createMode, setCreateMode] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const initialProfile = useMemo(() => toMemberSnapshot(profile), [profile]);

  const load = useCallback(async () => {
    if (!profileId) return;
    setLoading(true);
    try {
      const items = await listProfilePaymentForms(profileId);
      setRows(
        items.map((item) => ({
          key: item._id,
          _id: item._id,
          name: `${item.formTypeLabel || item.formType} – ${item.membershipNumber}`,
          formType: item.formTypeLabel || item.formType,
          status: item.status,
          isAuthorized: Boolean(item.isAuthorized),
          authorisationMode: item.authorisationMode || null,
          dateUploaded: item.updatedAt
            ? dayjs(item.updatedAt).format("YYYY-MM-DD HH:mm")
            : "—",
          fileUrl:
            item.downloadUrls?.signedPdf ||
            item.downloadUrls?.paperUpload ||
            item.downloadUrls?.generatedPdf ||
            null,
        })),
      );
    } catch {
      message.error("Could not load payment forms");
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDownloadPdf = useCallback(async (record) => {
    if (!record?._id) return;
    setDownloadingId(record._id);
    try {
      const { blob, filename: disposition } = await downloadPaymentFormPdf(
        record._id,
      );
      const parsed = parseFilenameFromContentDisposition(disposition);
      triggerBlobDownload(blob, parsed || "payment-form.pdf");
    } catch (err) {
      message.error(
        err?.response?.data?.error?.message ||
          "Could not download payment form PDF",
      );
    } finally {
      setDownloadingId(null);
    }
  }, []);

  const columns = useMemo(
    () => buildColumns(handleDownloadPdf, downloadingId),
    [handleDownloadPdf, downloadingId],
  );

  const openCreate = useCallback(() => {
    setCreateMode(true);
    setDetailId(null);
    setDetailOpen(true);
  }, []);

  useEffect(() => {
    if (!registerActions) return undefined;
    registerActions({ openCreatePaymentForm: openCreate });
    return () => registerActions(null);
  }, [registerActions, openCreate]);

  const closeDrawer = () => {
    setDetailOpen(false);
    setDetailId(null);
    setCreateMode(false);
  };

  if (!profileId) {
    return (
      <p className="text-muted">Open a member profile to view documents.</p>
    );
  }

  if (loading) {
    return <Spin />;
  }

  return (
    <>
      <MyTable
        dataSource={rows}
        columns={columns}
        selection={false}
        tablePadding={{ paddingLeft: "0", paddingRight: "0" }}
        onRowClick={(record) => {
          if (record._id) {
            setCreateMode(false);
            setDetailId(record._id);
            setDetailOpen(true);
          }
        }}
      />
      <PaymentFormDetailDrawer
        open={detailOpen}
        formId={createMode ? null : detailId}
        createMode={createMode}
        initialProfileId={createMode ? profileId : null}
        initialProfile={createMode ? initialProfile : null}
        lockMemberSelection={createMode}
        onClose={closeDrawer}
        onPersisted={(created) => {
          setCreateMode(false);
          setDetailId(created?._id || null);
          load();
        }}
        onUpdated={load}
      />
    </>
  );
}
