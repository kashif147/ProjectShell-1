import React from "react";
import { Row, Col, Checkbox } from "antd";
import MyInput from "../common/MyInput";
import CustomSelect from "../common/CustomSelect";
import MyDatePicker1 from "../common/MyDatePicker1";
import {
  CRITERIA_LETTER_STATUSES,
  SOLICITORS,
  LEGISLATIONS,
  toOptions,
} from "./issueOptions";

/**
 * FTP (Fitness to Practice) discriminator field set -
 * backend/issue-service/models/issue.ftp.model.js. Same controlled `values`/`onChange(field,
 * value)` contract as the other 3 field-set components - see ComplaintFields.jsx's header
 * comment.
 */
function FtpFields({ values = {}, onChange, disabled = false }) {
  return (
    <div className="form-section issue-type-fields-section">
      <h3 className="section-title">Fitness to Practice Details</h3>

      <Row gutter={16}>
        <Col span={12}>
          <MyInput
            label="ARAG Reference No"
            name="aragReferenceNo"
            value={values.aragReferenceNo || ""}
            onChange={(e) => onChange("aragReferenceNo", e.target.value)}
            disabled={disabled}
          />
        </Col>
        <Col span={12}>
          <CustomSelect
            label="Criteria Letter Status"
            name="criteriaLetterStatus"
            value={values.criteriaLetterStatus || "PENDING"}
            onChange={(e) => onChange("criteriaLetterStatus", e.target.value)}
            options={toOptions(CRITERIA_LETTER_STATUSES)}
            disabled={disabled}
          />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <div className="my-input-wrapper">
            <label className="my-input-label">External Solicitor Involved</label>
            <div style={{ marginTop: 6 }}>
              <Checkbox
                checked={!!values.externalSolicitorInvolved}
                onChange={(e) =>
                  onChange("externalSolicitorInvolved", e.target.checked)
                }
                disabled={disabled}
              >
                Yes
              </Checkbox>
            </div>
          </div>
        </Col>
        {values.externalSolicitorInvolved && (
          <>
            <Col span={8}>
              <CustomSelect
                label="Solicitor"
                name="solicitor"
                value={values.solicitor || ""}
                onChange={(e) => onChange("solicitor", e.target.value)}
                options={toOptions(SOLICITORS)}
                placeholder="Select solicitor"
                disabled={disabled}
              />
            </Col>
            {values.solicitor === "OTHER" && (
              <Col span={8}>
                <MyInput
                  label="Solicitor (Other)"
                  name="solicitorOther"
                  value={values.solicitorOther || ""}
                  onChange={(e) => onChange("solicitorOther", e.target.value)}
                  disabled={disabled}
                />
              </Col>
            )}
          </>
        )}
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <div className="my-input-wrapper">
            <label className="my-input-label">Membership Verified</label>
            <div style={{ marginTop: 6 }}>
              <Checkbox
                checked={!!values.membershipVerified}
                onChange={(e) =>
                  onChange("membershipVerified", e.target.checked)
                }
                disabled={disabled}
              >
                Yes
              </Checkbox>
            </div>
          </div>
        </Col>
        <Col span={8}>
          <MyDatePicker1
            label="Date Initial Papers Received"
            name="dateInitialPapersReceived"
            value={values.dateInitialPapersReceived}
            onChange={(d) => onChange("dateInitialPapersReceived", d)}
            disabled={disabled}
          />
        </Col>
        <Col span={8}>
          <MyInput
            label="Insurer Reference"
            name="insurerReference"
            value={values.insurerReference || ""}
            onChange={(e) => onChange("insurerReference", e.target.value)}
            disabled={disabled}
          />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <CustomSelect
            label="Legislation"
            name="legislation"
            value={values.legislation || ""}
            onChange={(e) => onChange("legislation", e.target.value)}
            options={toOptions(LEGISLATIONS)}
            placeholder="Select legislation"
            disabled={disabled}
          />
        </Col>
        <Col span={12}>
          <MyInput
            label="NMBI Reference"
            name="nmbiReference"
            value={values.nmbiReference || ""}
            onChange={(e) => onChange("nmbiReference", e.target.value)}
            disabled={disabled}
          />
        </Col>
      </Row>
    </div>
  );
}

export default FtpFields;
