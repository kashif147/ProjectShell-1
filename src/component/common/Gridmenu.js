import React, { useState, useEffect } from "react";
import { Dropdown, Menu, Input, Row, Col, Checkbox, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useTableColumns } from "../../context/TableColumnsContext ";

function Gridmenu({ title, data }) {
    const { columns, updateColumns } = useTableColumns();
  const [checkboxes, setCheckboxes] = useState({});

  useEffect(() => {
    if (data && columns) {
      const initialCheckboxes = Object.keys(data).reduce((acc, key) => {
        acc[key] = columns.some(column => column.key === key);
        return acc;
      }, {});
      setCheckboxes(initialCheckboxes);
    }
  }, [data, columns]);

  const checkboxChangeFtn = (key, event) => {
    const isChecked = event.target.checked;
    setCheckboxes((prevState) => {
      const updatedState = { 
        ...prevState,
        [key]: isChecked,
      };

      const newColumns = Object.entries(updatedState)
        .filter(([_, value]) => value)
        .map(([key]) => ({
          title: key,
          dataIndex: key,
          key: key,
        }));

      updateColumns(newColumns);

      return updatedState;
    });
  };

  const menu = (
    <Menu>
      <Menu.Item key="1">
        <Input suffix={<SearchOutlined />} />
      </Menu.Item>
      <Row>
        {data &&
          Object.keys(data).map((key) => (
            <Col span={24} key={key}>
              <Checkbox
                style={{ marginBottom: "8px" }}
                onClick={(e) => {
                  e.stopPropagation();
                  checkboxChangeFtn(key, e);
                }}
                checked={checkboxes[key]}
              >
                {key}
              </Checkbox>
            </Col>
          ))}
      </Row>
    </Menu>
  );

  return (
    <Dropdown
      overlay={menu}
      trigger={["click"]}
      placement="bottomLeft"
      overlayStyle={{ width: 200, padding: "0px" }}
    >
      <Button className="transparent-bg">{title}</Button>
    </Dropdown>
  );
}
export default Gridmenu
