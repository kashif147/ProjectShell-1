import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import {
  Form,
  Select,
  DatePicker,
  Row,
  Col,
  Card,
  Typography,
  Divider,
  Descriptions,
  Spin,
  Alert,
  message,
} from "antd";
import dayjs from "dayjs";
import "../../styles/CreateBatchPayment.css";
import { formatIbanDisplay } from "../../utils/iban";
import {
  fetchTenantOrganisationProfile,
  getCreditorSnapshotMissingFields,
  mapOrganisationProfileToCreditorSnapshot,
} from "../../services/tenantBrandingService";

const { Option } = Select;
const { Title, Text } = Typography;

const defaultInitialValues = () => ({
  runType: "MONTHLY",
  collectionDate: dayjs().add(14, "day"),
  periodRange: [dayjs().startOf("month"), dayjs().endOf("month")],
});

const CreateDirectDebitRunForm = forwardRef(function CreateDirectDebitRunForm(
  _props,
  ref,
) {
  const [form] = Form.useForm();
  const [creditorSnapshot, setCreditorSnapshot] = useState(null);
  const [creditorLoading, setCreditorLoading] = useState(true);
  const [creditorError, setCreditorError] = useState(null);

  const loadCreditorDetails = useCallback(async () => {
    setCreditorLoading(true);
    setCreditorError(null);
    try {
      const orgProfile = await fetchTenantOrganisationProfile();
      if (!orgProfile) {
        setCreditorSnapshot(null);
        setCreditorError("Could not load organisation profile for this tenant.");
        return;
      }
      setCreditorSnapshot(mapOrganisationProfileToCreditorSnapshot(orgProfile));
    } catch (err) {
      setCreditorSnapshot(null);
      setCreditorError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load organisation profile.",
      );
    } finally {
      setCreditorLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCreditorDetails();
  }, [loadCreditorDetails]);

  const missingCreditorFields = getCreditorSnapshotMissingFields(
    creditorSnapshot || {},
  );

  useImperativeHandle(ref, () => ({
    async submit() {
      if (creditorLoading) {
        message.warning("Organisation profile is still loading.");
        throw new Error("Creditor details loading");
      }
      if (creditorError || !creditorSnapshot) {
        message.error(
          creditorError ||
            "Organisation profile creditor details are not available.",
        );
        throw new Error("Creditor details unavailable");
      }
      if (missingCreditorFields.length > 0) {
        message.error(
          `Complete creditor details in Organisation Profile: ${missingCreditorFields.join(", ")}`,
        );
        throw new Error("Creditor details incomplete");
      }

      const values = await form.validateFields();
      return {
        runType: values.runType,
        periodStartDate: values.periodRange[0].startOf("day").toISOString(),
        periodEndDate: values.periodRange[1].endOf("day").toISOString(),
        collectionDate: values.collectionDate.startOf("day").toISOString(),
        submissionDueDate: values.submissionDueDate
          ? values.submissionDueDate.startOf("day").toISOString()
          : undefined,
        creditorSnapshot: {
          name: creditorSnapshot.name,
          oin: creditorSnapshot.oin,
          iban: creditorSnapshot.iban,
          bic: creditorSnapshot.bic || "AIBKIE2DXXX",
        },
      };
    },
    reset() {
      form.resetFields();
      form.setFieldsValue(defaultInitialValues());
    },
    setFromRun(run) {
      if (!run) return;
      form.setFieldsValue({
        runType: run.runType || "MONTHLY",
        periodRange: [
          dayjs(run.periodStartDate),
          dayjs(run.periodEndDate),
        ],
        collectionDate: dayjs(run.collectionDate),
        submissionDueDate: run.submissionDueDate
          ? dayjs(run.submissionDueDate)
          : undefined,
      });
    },
  }));

  return (
    <div className="create-batch-container drwer-bg-clr">
      <Card className="batch-card" styles={{ body: { padding: "20px 24px" } }}>
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          initialValues={defaultInitialValues()}
        >
          <Title level={4} className="section-title">
            Run details
          </Title>
          <Row gutter={[16, 0]}>
            <Col span={24}>
              <Form.Item
                name="runType"
                label="Run type"
                rules={[{ required: true }]}
              >
                <Select className="custom-input">
                  <Option value="MONTHLY">Monthly</Option>
                  <Option value="BI_WEEKLY">Bi-weekly</Option>
                  <Option value="ANNUAL">Annual</Option>
                  <Option value="AD_HOC">Ad hoc</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="periodRange"
                label="Collection period"
                rules={[
                  { required: true, message: "Select period start and end" },
                ]}
              >
                <DatePicker.RangePicker
                  className="custom-input"
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="collectionDate"
                label="Collection date (ReqdColltnDt)"
                rules={[{ required: true }]}
              >
                <DatePicker
                  className="custom-input"
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="submissionDueDate" label="Submission due date">
                <DatePicker
                  className="custom-input"
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: "8px 0 24px" }} />

          <Title level={4} className="section-title">
            Creditor details
          </Title>
          <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
            From tenant organisation profile (read only)
          </Text>

          {creditorLoading ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <Spin tip="Loading organisation profile…" />
            </div>
          ) : creditorError ? (
            <Alert type="error" showIcon message={creditorError} />
          ) : (
            <>
              {missingCreditorFields.length > 0 && (
                <Alert
                  type="warning"
                  showIcon
                  style={{ marginBottom: 16 }}
                  message="Organisation profile is missing required creditor fields"
                  description={
                    <>
                      <ul style={{ margin: "8px 0 0", paddingLeft: 20 }}>
                        {missingCreditorFields.map((field) => (
                          <li key={field}>{field}</li>
                        ))}
                      </ul>
                      <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
                        Update these in Tenant settings → Organisation Profile before
                        creating a DD run.
                      </Text>
                    </>
                  }
                />
              )}
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Creditor name">
                  {creditorSnapshot?.name || "—"}
                </Descriptions.Item>
                {creditorSnapshot?.bankName ? (
                  <Descriptions.Item label="Bank name">
                    {creditorSnapshot.bankName}
                  </Descriptions.Item>
                ) : null}
                <Descriptions.Item label="OIN / Creditor identifier">
                  {creditorSnapshot?.oin || "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Creditor IBAN">
                  {creditorSnapshot?.iban
                    ? formatIbanDisplay(creditorSnapshot.iban)
                    : "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Creditor BIC">
                  {creditorSnapshot?.bic || "—"}
                </Descriptions.Item>
              </Descriptions>
            </>
          )}
        </Form>
      </Card>
    </div>
  );
});

CreateDirectDebitRunForm.displayName = "CreateDirectDebitRunForm";

export default CreateDirectDebitRunForm;
