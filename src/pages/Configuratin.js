import { React, useState } from "react";
import { SiActigraph } from "react-icons/si";
import MyDrawer from "../component/common/MyDrawer";
import { Input, Table } from "antd";
import TextArea from "antd/es/input/TextArea";
import { SearchOutlined } from "@ant-design/icons";
import { PiHandshakeDuotone } from "react-icons/pi";
import MyMneu from "../component/common/MyMneu";

function Configuratin() {
  const [genderModal, setgenderModal] = useState(false);
  const [AddgenderModal, setAddgenderModal] = useState(false);
  const [modaltitle, setmodaltitle] = useState(null);
  const column = [
    {
      title: "Lookup",
      dataIndex: "Lookup",
      key: "Lookup",
      width: 60,
    },
    {
      title: "Description",
      dataIndex: "Description",
      key: "Description",
    },
  ];
  const gander = [
    {
      key: "1",
      Lookup: "Male",
      Description: "Male",
    },
    {
      key: "2",
      Lookup: "Female",
      Description: "Female",
    },
    {
      key: "3",
      Lookup: "Other",
      Description: "Other",
    },
  ];
  const genderModalOpen = () => {
    setgenderModal(!genderModal);
  };
  const addGenderModalOpen = () => {
    setAddgenderModal(!AddgenderModal);
  };
  return (
    <div>
      <p className="configuratin-titles">Lookups Configuration</p>
      <div className="lookups-main-continer">
        <div onClick={() => genderModalOpen()} className="lookup-memeber">
          <SiActigraph className="icons" />
          <p className="lookups-title">Gender</p>
        </div>
        <div onClick={() => genderModalOpen()}>
          <PiHandshakeDuotone className="icons" />
          <p className="lookups-title">Partnership</p>
        </div>
      </div>

      <MyDrawer
        open={genderModal}
        onClose={genderModalOpen}
        add={addGenderModalOpen}
      >
        <Input
          placeholder="Search..."
          style={{ marginBottom: "5px" }}
          suffix={<SearchOutlined />}
        />
        <Table
          columns={column}
          dataSource={gander}
          pagination={false}
          rowClassName={(record, index) =>
            index % 2 !== 0 ? "odd-row" : "even-row"
          }
        />
      </MyDrawer>
      <MyDrawer open={AddgenderModal} onClose={addGenderModalOpen}>
        <div className="input-group">
          <p>Lookup</p>
          <Input placeholder="Please Enter Lookups" />
        </div>
        <div className="input-group">
          <p>Description</p>
          <TextArea placeholder="Please Enter Description" />
        </div>
      </MyDrawer>
    </div>
  );
}

export default Configuratin;
