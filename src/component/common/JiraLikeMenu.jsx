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

const JiraLikeMenu = ({ title, data, isSimple = false }) => {
  const {
    state,
    updateState,
    updateLookupValue,
    searchFilters,
    filterGridDataFtn,
    handleCompChang,
  } = useTableColumns();
  console.log(searchFilters, "state");
  const menuState = state[title] || {
    selectedOption: "!=",
    checkboxes: data || {},
  };
  console.log(menuState, "menuState");
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
  const getTrueLookupsArrayByTitle = (titleColumn) => {
    const item = searchFilters.find((item) => item.titleColumn === titleColumn);

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
  // Declare globally
  const [firstTrueLookups1, setFirstTrueLookups1] = useState(null);

  // useEffect(() => {
  //   // Declare variable to hold the result
  //   let foundLookup = null;

  //   searchFilters?.forEach((item) => {
  //     if (item?.titleColumn === title && item?.isCheck) {
  //       // Find the first true value in lookups
  //       const firstTrue = Object.keys(item.lookups).find(
  //         (key) => item.lookups[key] === true
  //       );

  //       if (firstTrue) {
  //         foundLookup = firstTrue;
  //       }
  //     }
  //   });

  //   // Update the state once after the loop
  //   setFirstTrueLookups1(foundLookup);
  // }, [searchFilters]);
  const handleOnChange = (selectedValue) => {
    // Now the onChange can pass both firstTrueLookups1 and the selected value
    filterGridDataFtn(title, firstTrueLookups1, selectedValue);
    handleCompChang(firstTrueLookups1, selectedValue);
  };
  const menu = (
    <Menu>
      <Menu.Item key="1">
        {searchFilters?.map((item) => {
          return isSimple === false && item?.titleColumn === title ? (
            <>
              <MySelect
                isMenu={true}
                options={graterEqualDD}
                value={item?.comp}
                onChange={(e) => {
                  filterGridDataFtn(title, firstTrueLookups1, e)
                 
                }}
              />
              <Divider />
            </>
          ) : null;
        })}
        <Row>
          {/* {data &&
            Object.keys(data).map((key) => (
              <Col span={24} key={key}>
                <Checkbox
                  style={{ marginBottom: "8px" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    checkboxChangeFtn(key, e);
                  }}
                  checked={menuState.checkboxes[key]}
                >
                  {key}
                </Checkbox> */}
          {searchFilters?.find((filter) => filter.titleColumn === title)
            ?.lookups &&
            Object.keys(
              searchFilters.find((filter) => filter.titleColumn === title)
                .lookups
            ).map((key) => (
              <Col span={24} key={key}>
                <Checkbox
                  key={key}
                  checked={
                    searchFilters.find((filter) => filter.titleColumn === title)
                      .lookups[key]
                  }
                  onChange={(e) => {
                    e.stopPropagation();
                    updateLookupValue(title, key, e.target.checked);
                    if (e.target.checked == true) {
                      filterGridDataFtn(
                        title,
                        key,
                        searchFilters.find(
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
              searchFilters.some(
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

      {searchFilters
        ?.filter((item) => item.titleColumn === title) // Filter items where titleColumn matches title
        .map((item) =>
          item?.isCheck ? (
            <MySelect
              key={item.titleColumn}
              className="active"
              options={graterEqualDD}
              value={item?.comp}
              onChange={(e) =>{
                handleCompChang(item?.titleColumn, e)
                filterGridDataFtn(item?.titleColumn,firstTrueLookups1,e)
              }
              }
            />
          ) : null
        )}

      {searchFilters?.map((item) => {
        if (item?.titleColumn === title && item?.isCheck) {
          // Find the first true value in lookups
          const firstTrueLookup = Object.keys(item.lookups).find(
            (key) => item.lookups[key] === true
          );

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
                  {firstTrueLookup ? firstTrueLookup : "No Selection"}{" "}
                  {/* Display first true lookup or fallback */}
                </span>
                <DownOutlined className="ml-4 active" />
              </Button>
            </Dropdown>
          );
        }

        return null; // Return null if the condition isn't fulfilled
      })}
    </div>
  );
};

export default JiraLikeMenu;
