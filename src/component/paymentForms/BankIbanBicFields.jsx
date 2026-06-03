import React, { useEffect } from "react";
import { Col, Form, Input, Row } from "antd";
import {
  BIC_INPUT_PROPS,
  bicFormItemProps,
  buildIbanFormRules,
  getBankFieldStatuses,
  IBAN_INPUT_PROPS,
  ibanFormItemProps,
  normalizeIban,
} from "../../utils/iban";

export default function BankIbanBicFields({
  form,
  ibanName,
  bicName,
  ibanLabel = "IBAN",
  bicLabel = "BIC",
  ibanCol = 14,
  bicCol = 10,
  organisationIban,
}) {
  const iban = Form.useWatch(ibanName, form);
  const bic = Form.useWatch(bicName, form);
  const { ibanStatus, bicStatus } = getBankFieldStatuses(
    iban,
    bic,
    { organisationIban }
  );

  const orgIbanNorm = normalizeIban(organisationIban);

  useEffect(() => {
    if (!orgIbanNorm || !iban) return;
    form.validateFields([ibanName]).catch(() => {});
  }, [orgIbanNorm, ibanName, form, iban]);

  return (
    <Row gutter={16}>
      <Col span={ibanCol}>
        <Form.Item
          name={ibanName}
          label={ibanLabel}
          required
          validateStatus={ibanStatus}
          hasFeedback={Boolean(ibanStatus)}
          {...ibanFormItemProps({ required: true, organisationIban: orgIbanNorm })}
          rules={buildIbanFormRules({ required: true, organisationIban: orgIbanNorm })}
        >
          <Input {...IBAN_INPUT_PROPS} />
        </Form.Item>
      </Col>
      <Col span={bicCol}>
        <Form.Item
          name={bicName}
          label={bicLabel}
          validateStatus={bicStatus}
          hasFeedback={Boolean(bicStatus)}
          {...bicFormItemProps({ required: false })}
        >
          <Input {...BIC_INPUT_PROPS} />
        </Form.Item>
      </Col>
    </Row>
  );
}
