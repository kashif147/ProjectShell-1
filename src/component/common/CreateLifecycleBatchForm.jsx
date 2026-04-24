import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
} from "react";
import axios from "axios";
import { Form, Input, DatePicker, Row, Col, Card, Tag, message } from "antd";
import dayjs from "dayjs";
import { useNotifications } from "../../context/NotificationContext";
import {
  notifyBatchGenerating,
  watchBatchUntilPopulated,
} from "../../utils/lifecycleBatchNotifications";
import { getAccountServiceBaseUrl } from "../../config/serviceUrls";

/**
 * BatchDetail.type must match the account-service Mongoose enum exactly.
 * `REMINDER` / `CANCELLATION` are rejected by the API; common values are
 * plural title case (like list filters: batchType=Deductions) or lowercase
 * (like POST deduction). Defaults use plural title case; override via env
 * if your schema differs, e.g. REACT_APP_BATCH_DETAIL_TYPE_REMINDER=reminder
 */
const API_TYPE = {
  reminder:
    (process.env.REACT_APP_BATCH_DETAIL_TYPE_REMINDER || "").trim() ||
    "REMINDER",
  cancellation:
    (process.env.REACT_APP_BATCH_DETAIL_TYPE_CANCELLATION || "").trim() ||
    "CANCELLATION",
};

function buildFormData({ variant, batchName, batchDateDayjs }) {
  const formData = new FormData();
  const batchDate = batchDateDayjs.format("YYYY-MM-DD");
  const refPrefix = variant === "reminder" ? "REM" : "CAN";
  const referenceNumber = `${refPrefix}-${Date.now()}`;

  formData.append("type", API_TYPE[variant] || API_TYPE.reminder);
  formData.append("date", batchDate);
  formData.append("batchDate", batchDate);
  formData.append("paymentDate", batchDate);
  formData.append("workLocation", "All");
  formData.append("referenceNumber", referenceNumber);
  formData.append("description", batchName.trim());
  formData.append("comments", "");
  return { formData, referenceNumber };
}

const CreateLifecycleBatchForm = forwardRef(function CreateLifecycleBatchForm(
  { variant },
  ref,
) {
  const [form] = Form.useForm();
  const { setNotifications, setBadge } = useNotifications();
  const notificationCtx = useMemo(
    () => ({ setNotifications, setBadge }),
    [setNotifications, setBadge],
  );

  useEffect(() => {
    form.setFieldsValue({
      batchName: "",
      batchDate: dayjs(),
    });
  }, [variant, form]);

  const resetForm = useCallback(() => {
    form.setFieldsValue({ batchName: "", batchDate: dayjs() });
  }, [form]);

  const handleSubmit = useCallback(async () => {
    try {
      await form.validateFields(["batchName"]);
    } catch {
      message.error("Please enter a batch name.");
      return null;
    }

    const batchName = form.getFieldValue("batchName");
    const dateVal = form.getFieldValue("batchDate") || dayjs();
    const { formData, referenceNumber } = buildFormData({
      variant,
      batchName,
      batchDateDayjs: dateVal,
    });

    const token = localStorage.getItem("token");
    const url = getAccountServiceBaseUrl();
    if (!token || !url) {
      message.error("Missing API configuration or session.");
      return null;
    }

    try {
      const response = await axios.post(`${url}/batch-details`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status !== 200 && response.status !== 201) {
        message.error("Failed to create batch.");
        return null;
      }

      const batchId =
        response?.data?.data?._id ??
        response?.data?.data?.id ??
        response?.data?._id;
      const desc = response?.data?.data?.description ?? batchName.trim();
      const refNo = response?.data?.data?.referenceNumber ?? referenceNumber;

      message.success("Batch created successfully.");

      notifyBatchGenerating(notificationCtx, variant, {
        batchDetailId: batchId,
        description: desc,
        referenceNumber: refNo,
      });

      watchBatchUntilPopulated({
        batchDetailId: batchId,
        variant,
        description: desc,
        referenceNumber: refNo,
        notificationCtx,
      });

      return {
        _id: batchId,
        id: batchId,
        description: desc,
        referenceNumber: refNo,
      };
    } catch (error) {
      console.error("Lifecycle batch create error:", error);
      message.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create batch.",
      );
      return null;
    }
  }, [form, variant, notificationCtx]);

  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
    reset: resetForm,
  }));

  return (
    <div style={{ padding: "8px 0" }}>
      <Card bordered={false} style={{ maxWidth: 640 }}>
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          initialValues={{ batchDate: dayjs(), batchName: "" }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Batch Name"
                name="batchName"
                rules={[{ required: true, message: "Enter batch name" }]}
              >
                <Input
                  placeholder="e.g. March renewal reminders"
                  maxLength={200}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Batch Date" name="batchDate">
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Batch Status">
                <div>
                  <Tag color="default">Pending</Tag>
                </div>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
});

export default CreateLifecycleBatchForm;
