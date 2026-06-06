import { useEffect, useState, useCallback } from "react";
import {
  Drawer,
  Form,
  Input,
  Select,
  DatePicker,
  Switch,
  Button,
  Space,
  Typography,
  Divider,
  message,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { communicationServicePath } from "../../utils/communicationServiceUrl";
import "../../styles/CampaignDrawer.css";
import { useNavigate } from "react-router-dom";

const { TextArea } = Input;
const { Text } = Typography;

function commRoot() {
  return communicationServicePath("");
}

function authHeaders() {
  const token = localStorage.getItem("token");
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

export default function CampaignDrawer({
  open,
  onClose,
  selectedProfileIds = [],
  previewProfileId = null,
}) {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const sendImmediately = Form.useWatch("sendImmediately", form);
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadTemplates = useCallback(async () => {
    if (!commRoot()) return;
    setLoadingTemplates(true);
    try {
      const res = await axios.get(communicationServicePath("templates"), {
        params: { tempolateType: "Email" },
        headers: authHeaders(),
      });
      const list = res.data?.data?.templates || res.data?.templates || [];
      setTemplates(Array.isArray(list) ? list : []);
    } catch (e) {
      message.error(e.response?.data?.message || "Failed to load email templates");
    } finally {
      setLoadingTemplates(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadTemplates();
      form.resetFields();
      form.setFieldsValue({
        sendImmediately: true,
        scheduledAt: null,
      });
      setPreviewHtml("");
    }
  }, [open, loadTemplates, form]);

  const sampleProfileId =
    previewProfileId ||
    (selectedProfileIds.length ? selectedProfileIds[0] : null);

  const handlePreview = async () => {
    const emailTemplateId = form.getFieldValue("emailTemplateId");
    if (!emailTemplateId || !sampleProfileId) {
      message.warning("Select a template and at least one profile row");
      return;
    }
    try {
      const res = await axios.post(
        communicationServicePath("campaigns/draft/preview"),
        { emailTemplateId, profileId: sampleProfileId },
        { headers: authHeaders() }
      );
      const d = res.data?.data || res.data;
      setPreviewHtml(d?.html || "");
      message.success("Preview loaded");
    } catch (e) {
      message.error(e.response?.data?.message || "Preview failed");
    }
  };

  const handleTestEmail = async () => {
    const emailTemplateId = form.getFieldValue("emailTemplateId");
    const toEmail = form.getFieldValue("testEmail");
    if (!emailTemplateId || !toEmail || !sampleProfileId) {
      message.warning("Template, test address, and a sample profile are required");
      return;
    }
    try {
      await axios.post(
        communicationServicePath("campaigns/draft/test-email"),
        { emailTemplateId, profileId: sampleProfileId, toEmail },
        { headers: authHeaders() }
      );
      message.success("Test email sent");
    } catch (e) {
      message.error(e.response?.data?.message || "Send test failed");
    }
  };

  const handleSubmit = async () => {
    if (!commRoot()) {
      message.error(
        "Communication service URL missing: set REACT_APP_COMMUNICATION_SERVICE_URL or REACT_APP_CUMM"
      );
      return;
    }
    if (!selectedProfileIds.length) {
      message.warning("Select at least one profile");
      return;
    }
    try {
      const v = await form.validateFields();
      setSubmitting(true);
      const scheduledAt =
        !v.sendImmediately && v.scheduledAt
          ? (dayjs.isDayjs(v.scheduledAt) ? v.scheduledAt : dayjs(v.scheduledAt)).toISOString()
          : null;
      const body = {
        name: v.name,
        description: v.description || "",
        audienceProfileIds: selectedProfileIds,
        emailTemplateId: v.emailTemplateId,
        sendImmediately: !!v.sendImmediately,
        scheduledAt,
        fromEmail: v.fromEmail || undefined,
      };
      const res = await axios.post(communicationServicePath("campaigns"), body, {
        headers: authHeaders(),
      });
      if (res.status === 201 || res.data?.status === "success") {
        const campaignId =
          res.data?.data?.campaign?._id || res.data?.campaign?._id || null;
        message.success("Campaign created");
        onClose?.(true);
        if (campaignId) {
          navigate(
            `/EmailCampaignDetail?campaignId=${encodeURIComponent(campaignId)}`
          );
        }
      }
    } catch (e) {
      if (e?.errorFields) return;
      message.error(e.response?.data?.message || "Create campaign failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer
      title="Email campaign"
      placement="right"
      width={480}
      open={open}
      onClose={() => onClose?.(false)}
      destroyOnClose={false}
      className="campaign-drawer"
      rootClassName="campaign-drawer-root"
      extra={
        <Space>
          <Button className="butn secoundry-btn" onClick={() => onClose?.(false)}>
            Close
          </Button>
          <Button
            className="butn primary-btn"
            loading={submitting}
            onClick={handleSubmit}
          >
            Create campaign
          </Button>
        </Space>
      }
    >
      <div className="drawer-main-cntainer campaign-drawer-body">
        <Text type="secondary">
          Audience: {selectedProfileIds.length} profile(s). Bulk email uses SES;
          members must have email consent and a contact email. Include
          {"{{unsubscribeUrl}}"} in templates for compliance.
        </Text>
        <Divider />
        <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Campaign name"
          rules={[{ required: true, message: "Required" }]}
        >
          <Input maxLength={200} />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <TextArea rows={2} maxLength={5000} />
        </Form.Item>
        <Form.Item
          name="emailTemplateId"
          label="Email template"
          rules={[{ required: true, message: "Required" }]}
        >
          <Select
            showSearch
            optionFilterProp="label"
            loading={loadingTemplates}
            placeholder="Select HTML email template"
            options={templates.map((t) => ({
              value: t._id,
              label: t.name,
            }))}
          />
        </Form.Item>
        <Form.Item name="fromEmail" label="From address (optional)">
          <Input placeholder="Leave empty for default SES identity" />
        </Form.Item>
        <Form.Item name="sendImmediately" label="Send immediately" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item
          name="scheduledAt"
          label="Or schedule send"
          dependencies={["sendImmediately"]}
        >
          <DatePicker
            showTime
            style={{ width: "100%" }}
            disabled={!!sendImmediately}
            format="YYYY-MM-DD HH:mm"
          />
        </Form.Item>
        <Divider orientation="left">Preview & test</Divider>
        <Form.Item name="testEmail" label="Send test email to">
          <Input type="email" placeholder="you@example.com" />
        </Form.Item>
        <Space wrap>
          <Button onClick={handlePreview} disabled={!sampleProfileId}>
            Preview with sample profile
          </Button>
          <Button onClick={handleTestEmail} disabled={!sampleProfileId}>
            Send test email
          </Button>
        </Space>
        {previewHtml ? (
          <div className="campaign-preview-frame">
            <iframe
              title="preview"
              sandbox="allow-same-origin"
              srcDoc={previewHtml}
              style={{ width: "100%", height: 200, border: "none" }}
            />
          </div>
        ) : null}
        </Form>
      </div>
    </Drawer>
  );
}
