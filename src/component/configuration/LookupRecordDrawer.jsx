import React, { useMemo } from "react";
import { Row, Col, Checkbox, Table, Space } from "antd";
import { FaEdit } from "react-icons/fa";
import { AiFillDelete } from "react-icons/ai";
import { FaRegCircleQuestion } from "react-icons/fa6";
import MyDrawer from "../common/MyDrawer";
import MyInput from "../common/MyInput";
import MyConfirm from "../common/MyConfirm";
import ParentLookupSelect from "./ParentLookupSelect";
import {
  getLookupDrawerFeatures,
  isWorkLocationLookupType,
} from "../../utils/configurationLookupHelpers";
import { lookupTypeRequiresParent } from "../../utils/lookupHierarchy";

/**
 * Shared Configuration drawer for simple /lookup records.
 * Driven by the active lookup type (+ optional feature flags).
 */
function LookupRecordDrawer({
  open = false,
  lookupType = null,
  formValues = {},
  lookups = [],
  lookupsTypes = [],
  tableData = [],
  tableLoading = false,
  isLoading = false,
  isEdit = false,
  disabled = false,
  errors = {},
  selectionType = "checkbox",
  rowSelection = {},
  features: featuresOverride = null,
  onClose,
  onAdd,
  onUpdate,
  onFieldChange,
  onParentChange,
  onEditRecord,
  onDeleteRecord,
}) {
  const typeLabel = lookupType?.lookuptype || lookupType?.DisplayName || "Lookup";
  const features = useMemo(
    () =>
      featuresOverride ||
      getLookupDrawerFeatures(lookupType, lookupsTypes),
    [featuresOverride, lookupType, lookupsTypes],
  );

  const lookuptypeId =
    lookupType?._id || formValues?.lookuptypeId || null;

  const columns = useMemo(
    () => [
      {
        title: "code",
        dataIndex: "code",
        key: "code",
        sorter: (a, b) =>
          String(a.code || "").localeCompare(String(b.code || "")),
        sortDirections: ["ascend", "descend"],
      },
      {
        title: " Lookup Type ",
        key: "lookuptype",
        render: (_, record) =>
          record?.lookuptypeId?.lookuptype ||
          record?.lookuptypeName ||
          typeLabel,
      },
      {
        title: " Display Name",
        dataIndex: "DisplayName",
        key: "DisplayName",
      },
      {
        title: "Name",
        dataIndex: "lookupname",
        key: "lookupname",
      },
      {
        title: "Active",
        dataIndex: "isactive",
        key: "isactive",
        render: (_, record) => <Checkbox checked={!!record?.isactive} />,
      },
      {
        title: (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FaRegCircleQuestion size={16} style={{ marginRight: "8px" }} />
            Action
          </div>
        ),
        key: "action",
        align: "center",
        render: (_, record) => (
          <Space size="middle">
            <FaEdit
              size={16}
              style={{ marginRight: "10px", cursor: "pointer" }}
              onClick={() => onEditRecord?.(record)}
            />
            <AiFillDelete
              size={16}
              style={{ cursor: "pointer" }}
              onClick={() =>
                MyConfirm({
                  title: "Confirm Deletion",
                  message:
                    "Delete this item? If it is used as a parent by other lookups, deletion will be blocked until those children are reassigned or removed.",
                  onConfirm: async () => {
                    await onDeleteRecord?.(record);
                  },
                })
              }
            />
          </Space>
        ),
      },
    ],
    [onDeleteRecord, onEditRecord, typeLabel],
  );

  const showProcessSalary =
    features.showProcessSalaryDeduction ||
    isWorkLocationLookupType(lookupType, lookupsTypes);

  return (
    <MyDrawer
      title={typeLabel}
      open={open}
      isLoading={isLoading}
      isPagination={true}
      isEdit={isEdit}
      onClose={onClose}
      add={onAdd}
      update={onUpdate}
    >
      <div className="drawer-main-cntainer p-4 me-2 ms-2">
        <Row gutter={24}>
          <Col span={12}>
            <MyInput
              label="Code:"
              name="code"
              value={formValues?.code || ""}
              onChange={(e) => onFieldChange?.("code", e.target.value)}
              placeholder="Enter code"
              disabled={disabled}
              required
              hasError={!!errors?.code}
            />
          </Col>
          <Col span={12}>
            <MyInput
              label={features.nameLabel}
              name="lookupname"
              value={formValues?.lookupname || ""}
              onChange={(e) => onFieldChange?.("lookupname", e.target.value)}
              placeholder={`Enter ${typeLabel.toLowerCase()} name`}
              disabled={disabled}
              required
              hasError={!!errors?.lookupname}
            />
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            <MyInput
              label="Display Name:"
              name="DisplayName"
              value={formValues?.DisplayName || ""}
              onChange={(e) => onFieldChange?.("DisplayName", e.target.value)}
              placeholder="Enter display name"
              disabled={disabled}
              hasError={!!errors?.DisplayName}
            />
          </Col>
          <ParentLookupSelect
            drawerKey="StandardLookup"
            lookuptypeId={lookuptypeId}
            lookups={lookups}
            lookupsTypes={lookupsTypes}
            value={formValues?.Parentlookupid}
            parentLabel={formValues?.Parentlookup}
            parentLookupTypeId={formValues?.ParentlookuptypeId}
            parentLookupTypeName={formValues?.Parentlookuptype}
            disabled={disabled}
            required={lookupTypeRequiresParent(
              lookupsTypes,
              lookuptypeId,
              "StandardLookup",
            )}
            hasError={!!errors?.Parentlookupid}
            onChange={(payload) => onParentChange?.(payload)}
          />
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            <Checkbox
              disabled={disabled}
              onChange={(e) => onFieldChange?.("isactive", e.target.checked)}
              checked={formValues?.isactive !== false}
              style={{ marginTop: "26px" }}
            >
              Active
            </Checkbox>
          </Col>
          {showProcessSalary ? (
            <Col span={12}>
              <Checkbox
                disabled={disabled}
                checked={!!formValues?.processSalaryDeduction}
                onChange={(e) =>
                  onFieldChange?.("processSalaryDeduction", e.target.checked)
                }
                style={{ marginTop: "26px" }}
              >
                Process Salary Deduction
              </Checkbox>
            </Col>
          ) : null}
        </Row>

        <div className="mt-4 config-tbl-container">
          <h6 className="mb-3 text-primary">Existing {typeLabel}</h6>
          <Table
            pagination={false}
            columns={columns}
            dataSource={tableData}
            loading={tableLoading}
            className="drawer-tbl"
            size="small"
            rowKey={(record, index) =>
              record._id || record.id || record.key || index
            }
            rowClassName={(_, index) =>
              index % 2 !== 0 ? "odd-row" : "even-row"
            }
            rowSelection={{
              type: selectionType,
              ...rowSelection,
            }}
            bordered
          />
        </div>
      </div>
    </MyDrawer>
  );
}

export default LookupRecordDrawer;
