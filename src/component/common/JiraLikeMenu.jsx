import React, { useEffect, useState } from "react";
import {
  Menu,
  Dropdown,
  Button,
  Select,
  Divider,
  Checkbox,
  Row,
  Col,
} from "antd";
import { DownOutlined } from "@ant-design/icons";
import MySelect from "./MySelect";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { emphasize } from "@mui/material";
import { useLocation } from "react-router-dom";

const JiraLikeMenu = ({ title, data, isSimple = false }) => {
  
  const {
    state,
    updateState,
    updateLookupValue,
    searchFilters,
    filterGridDataFtn,
    updateCompByTitleColumn,
    handleCompChang,
  } = useTableColumns();
  console.log(searchFilters, "state");
  const menuState = state[title] || {
    selectedOption: "!=",
    checkboxes: data || {},
  };
  console.log(menuState, "menuState");
  const Location = useLocation()
  const [trueKeys, setTrueKeys] = useState([]);
  const [trueKeys1, setTrueKeys1] = useState([]);

  const handleSelectChange = (value) => {
    updateState(title, {
      ...menuState,
      selectedOption: value,
    });
  };

  const checkboxChangeFtn = (key, event) => {
    const updatedCheckboxes = {
      ...menuState.checkboxes,
      [key]: event.target.checked,
    };

    const newTrueKeys = Object.entries(updatedCheckboxes)
      .filter(([_, value]) => value)
      .map(([key]) => key);
    setTrueKeys(newTrueKeys);
    updateState(title, {
      ...menuState,
      checkboxes: updatedCheckboxes,
    });
  };
  const getTrueLookups = (filters) => {
    return filters
      .filter(
        (filter) =>
          filter.lookups &&
          Object.values(filter.lookups).some((value) => value === true)
      )
      .map((filter) => ({ [filter.titleColumn]: true }));
  };
  const screenName= Location?.state?.search
  const getTrueLookupsArrayByTitle = (titleColumn) => {
    const item = searchFilters[screenName]?.find((item) => item.titleColumn === titleColumn);

    if (item && item.lookups) {
      return {
        [titleColumn]: Object.entries(item.lookups)
          .filter(([key, value]) => value === true)
          .map(([key]) => key),
      };
    }
    return {
      [titleColumn]: [],
    };
  };
  const trueLookupsArrayByTitle = getTrueLookupsArrayByTitle(title);
  console.log(trueLookupsArrayByTitle, "trueLookupsArrayByTitle");
  const graterEqualDD = [
    { key: "!=", label: "!= (not equal)" },
    { key: "=", label: "= (equal)" },
  ];
  const [firstTrueLookups1, setFirstTrueLookups1] = useState(null);
  const handleOnChange = (selectedValue) => {
    filterGridDataFtn(title, firstTrueLookups1, selectedValue);
    handleCompChang(firstTrueLookups1, selectedValue);
  };
  const menu = (
    <Menu>
      <Menu.Item key="1">
        {searchFilters[screenName]?.map((item) => {
          return isSimple === false && item?.titleColumn === title ? (
            <>
              <MySelect
                isMenu={true}
                options={graterEqualDD}
                value={item?.comp}
                onChange={(e) => {
                  // filterGridDataFtn(title, firstTrueLookups1, e)
                  updateCompByTitleColumn(title, e)
                }}
              />
              <Divider />
            </>
          ) : null;
        })}
        <Row>
          {searchFilters[screenName]?.find((filter) => filter.titleColumn === title)
            ?.lookups &&
            Object.keys(
              searchFilters[screenName].find((filter) => filter.titleColumn === title)
                .lookups
            ).map((key) => (
              <Col span={24} key={key}>
                <Checkbox
                  key={key}
                  checked={
                    searchFilters[screenName].find((filter) => filter.titleColumn === title)
                      .lookups[key]
                  }
                  onChange={(e) => {
                    e.stopPropagation();
                    updateLookupValue(title, key, e.target.checked);
                    if (e.target.checked == true) {
                      filterGridDataFtn(
                        title,
                        key,
                        searchFilters[screenName]?.find(
                          (filter) => filter.titleColumn === title
                        )?.comp
                      );
                    }
                    if (e.target.checked == false) {
                      filterGridDataFtn("", "");
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {key}
                </Checkbox>
              </Col>
            ))}
        </Row>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="searchfilter- margin">
      <Dropdown
        overlay={menu}
        trigger={["click"]}
        placement="bottomLeft"
        overlayStyle={{ width: 300, padding: "0px" }}
      >
        {isSimple == false ? (
          <Button
            className={`${
              searchFilters[screenName]?.some(
                (item) => item.titleColumn === title && item.isCheck
              )
                ? "active"
                : ""
            }`}
          >
            {title} {trueKeys?.length === 0 && <DownOutlined />}
          </Button>
        ) : (
          <Button>{title}</Button>
        )}
      </Dropdown>

      {searchFilters[screenName]
  ?.filter((item) => item.titleColumn === title) // Filter items where titleColumn matches the title
  .map((item) => {
    // Check if any of the lookups have a true value
    const hasTrueLookup = Object.values(item?.lookups || {}).some(value => value === true);

    return hasTrueLookup ? (
      <MySelect
        key={item.titleColumn}
        className="active"
        options={graterEqualDD}
        value={item?.comp}
        onChange={(e) => {
          updateCompByTitleColumn(item.titleColumn, e)
        }}
      />
    ) : null;
  })}
      {searchFilters[screenName]?.map((item) => {
  const hasTrueLookup = Object.keys(item.lookups).some(
    (key) => item.lookups[key] === true
  );
  if (item?.titleColumn === title && hasTrueLookup) {
    return (
      <Dropdown
        overlay={menu}
        trigger={["click"]}
        placement="bottomRight"
        overlayStyle={{ width: 300, padding: "0px" }}
        key={item.titleColumn} // Always use a key in lists
      >
        <Button className="">
          <span className="ml-4 active">
            {/* Display the first true lookup or fallback to "No Selection" */}
            {Object.keys(item.lookups).find(
              (key) => item.lookups[key] === true
            ) || "No Selection"}{" "}
          </span>
          <DownOutlined className="ml-4 active" />
        </Button>
      </Dropdown>
    );
  }

  return null; // Return null if the conditions aren't fulfilled
})}

    </div>
  );
};

export default JiraLikeMenu;
