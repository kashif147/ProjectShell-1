import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Dropdown, Menu, Input, Row, Col, Checkbox, Button, Divider, message } from "antd";
import { SearchOutlined, SaveOutlined } from "@ant-design/icons";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { useDispatch, useSelector } from "react-redux";
import { getGridTemplates, updateGridTemplate } from "../../features/templete/templetefiltrsclumnapi";
import { getApplicationsWithFilter } from "../../features/applicationwithfilterslice";
import { getAllApplications } from "../../features/ApplicationSlice";
import { useFilters } from "../../context/FilterContext";
import { transformFiltersForApi, transformFiltersFromApi } from "../../utils/filterUtils";
import MyAlert from "./MyAlert";

function Gridmenu({ title, screenName, setColumnsDragbe, columnsForFilter, setColumnsForFilter }) {
  const dispatch = useDispatch();
  const location = useLocation(); // Add location to check route
  const { columns, updateColumns, handleCheckboxFilterChange, updateSelectedTemplate } = useTableColumns();
  const { filtersState, applyTemplateFilters } = useFilters();
  const { currentTemplateId } = useSelector((state) => state.applicationWithFilter);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateTemplate = async () => {
    if (!currentTemplateId) {
      message.warning("No active template selected to update.");
      return;
    }

    setIsUpdating(true);
    try {
      // 1. Get current visible columns dataIndexes
      const visibleColumnIndexes = columnsForFilter
        .filter(col => col.isGride)
        .map(col => Array.isArray(col.dataIndex) ? col.dataIndex.join(".") : col.dataIndex);

      // 2. Get current filters in API format
      const currentApiFilters = transformFiltersForApi(filtersState, columns[screenName] || []);

      const payload = {
        columns: visibleColumnIndexes,
        filters: currentApiFilters
      };

      const response = await dispatch(updateGridTemplate({ id: currentTemplateId, payload })).unwrap();

      // SUCCESS BLOCK: Only run if unwrap() succeeds
      MyAlert("success", "Success", "Template updated successfully");

      // 1. Re-fetch all templates from the server to get the processed "Global Truth"
      const refreshedTemplates = await dispatch(getGridTemplates()).unwrap();

      // 2. Find the current template in the refreshed results
      const allTemplates = [
        ...(refreshedTemplates.userTemplates || []),
        ...(refreshedTemplates.systemDefault ? [refreshedTemplates.systemDefault] : [])
      ];
      const primarySourceTemplate = allTemplates.find(t => t._id === currentTemplateId);

      if (primarySourceTemplate) {
        // 3. Apply filters from the official primary source
        const transformedFilters = transformFiltersFromApi(primarySourceTemplate.filters, columns[screenName] || []);
        applyTemplateFilters(transformedFilters);

        // 4. Update the selected template in context
        updateSelectedTemplate(screenName.toLowerCase(), primarySourceTemplate);
      } else {
        console.warn("⚠️ Could not find updated template in refreshed list, falling back to payload sync.");
        const transformedFilters = transformFiltersFromApi(payload.filters, columns[screenName] || []);
        applyTemplateFilters(transformedFilters);
      }

      if (location.pathname.toLowerCase() === "/applications") {
        dispatch(getApplicationsWithFilter({
          templateId: currentTemplateId || "",
          page: 1,
          limit: 10
        }));
      } else {
        dispatch(getAllApplications());
      }
    } catch (error) {
      console.error("Error updating template:", error);
      MyAlert("error", "Error", error?.message || "Failed to update template");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChange = (title, checked, screen, width, e) => {
    const filtered_columns = columnsForFilter.map(col => {
      if (col.title === title) {
        return { ...col, isGride: checked };
      }
      return col;
    });
    setColumnsForFilter(filtered_columns);
    const newData = filtered_columns.filter(col => col.isGride);
    setColumnsDragbe(newData);

    // Update global context
    handleCheckboxFilterChange(title, checked, screen, width);
  }
  const [checkBoxData, setcheckBoxData] = useState();
  useEffect(() => {
    setcheckBoxData(columns?.[screenName]);
  }, [columns]);

  const widthMapping = {
    RegNo: 100,
    Name: 120,
    Rank: 140,
    Duty: 100,
    Station: 120,
    Distric: 120,
    Division: 120,
    Address: 220,
  };

  const getColumnWidth = (key) => widthMapping[key] || 120;

  const searchInFilters = (query) => {
    const normalizedQuery = query.trim().toLowerCase();
    const filteredResults = columnsForFilter?.map((item) => {
      return {
        ...item,
        isVisible: item.title.toLowerCase().includes(normalizedQuery),
      }
    });
    setColumnsForFilter(filteredResults);
  };

  const menu = (
    <Menu>
      <Menu.Item key="search" disabled style={{ cursor: 'default', padding: '8px' }}>
        <Input
          suffix={<SearchOutlined />}
          placeholder="Search columns..."
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => searchInFilters(e.target.value)}
        />
      </Menu.Item>
      <Divider style={{ margin: "4px 0" }} />
      <div style={{ maxHeight: "250px", overflowY: "auto", overflowX: "hidden", padding: '4px 12px' }}>
        <Row>
          {columnsForFilter?.map((col) =>
            col.isVisible !== false && (
              <Col span={24} key={col.key || col.title || col.dataIndex}>
                <Checkbox
                  style={{
                    marginBottom: "8px",
                    width: '100%',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#444'
                  }}
                  onChange={(e) => {
                    handleChange(
                      col?.title,
                      e.target.checked,
                      screenName,
                      col?.width,
                      e
                    );
                  }}
                  onMouseDown={(e) => e.stopPropagation()} // Stop menu closure on click
                  checked={col.isGride}
                >
                  {col?.title}
                </Checkbox>
              </Col>
            ))}
        </Row>
      </div>
      <Divider style={{ margin: "4px 0" }} />
      <div style={{ padding: '12px' }}>
        <Button
          className="butn primary-btn"
          icon={<SaveOutlined />}
          loading={isUpdating}
          onClick={(e) => {
            e.stopPropagation();
            handleUpdateTemplate();
          }}
          disabled={!currentTemplateId}
          style={{ width: '100%', height: '36px' }}
        >
          Update Template
        </Button>
      </div>
    </Menu>
  );
  return (
    <Dropdown
      overlay={menu}
      trigger={["click"]}
      placement="bottomRight"
      overlayStyle={{
        width: 220,
        padding: "0px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    >
      <Button className="transparent-bg">{title}</Button>
    </Dropdown>
  );
}
export default Gridmenu;
