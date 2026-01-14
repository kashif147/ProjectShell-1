import { useEffect, useState } from 'react';
import { Button, Drawer, Input, Modal, Table, Tabs } from 'antd';
import { BsFiletypeXls } from "react-icons/bs";
// import '../../../styles/TrigerReminderDrawer.css';
import '../../styles/TrigerReminderDrawer.css'
import MySelect from '../common/MySelect';
import MyMenu from '../common/MyMenu';
import CustomSelect from '../common/CustomSelect';
import { set } from 'react-hook-form';
import { useTableColumns } from '../../context/TableColumnsContext ';
import { formatDateOnly } from '../../utils/Utilities';
const { TabPane } = Tabs;

function CornMarketDrawer({ isOpen, onClose }) {
  const filename = "corn-market.csv";
const { ProfileDetails } = useTableColumns();
  console.log(ProfileDetails,'ProfileDetailsx')
  const convertToCSV = (data) => {
    const header = Object.keys(data[0]).join(",") + "\n";
    const rows = data.map(row => Object.values(row).join(",")).join("\n");
    return header + rows;
  };

  const downloadCSV = () => {
    const csvData = convertToCSV(data);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    { title: 'Membership No', dataIndex: 'gardaRegNo', key: 'gardaRegNo', render: text => <div style={{ whiteSpace: 'nowrap,' }}>{text}</div> },
    { title: 'Full Name', dataIndex: 'fullname', key: 'fullname', render: text => <div style={{ whiteSpace: 'nowrap' }}>{text}</div> },
    { title: 'Forename', dataIndex: 'forename', key: 'forename', render: text => <div style={{ whiteSpace: 'nowrap' }}>{text}</div> },
    { title: 'Surname', dataIndex: 'surname', key: 'surname', render: text => <div style={{ whiteSpace: 'nowrap' }}>{text}</div> },
    { title: 'Date of Birth', dataIndex: 'dateOfBirth', key: 'dateOfBirth', render: (text) => (
      <div style={{ whiteSpace: 'nowrap' }}>{formatDateOnly(text)}</div>
    )},
    { title: 'Mobile', dataIndex: 'mobile', key: 'mobile', render: text => <div style={{ whiteSpace: 'nowrap' }}>{text}</div> },
    { title: 'Home/Work Tel', dataIndex: 'HomeOrWorkTel', key: 'HomeOrWorkTel', render: text => <div style={{ whiteSpace: 'nowrap' }}>{text}</div> },
    { title: 'Email', dataIndex: 'email', key: 'email', render: text => <div style={{ whiteSpace: 'nowrap' }}>{text}</div> },
    { title: 'Preferred Email', dataIndex: 'preferredEmail', key: 'preferredEmail', render: text => <div style={{ whiteSpace: 'nowrap' }}>{text}</div> },
    { title: 'Address Line 1', dataIndex: 'AdressLine1', key: 'AdressLine1', render: text => <div style={{ whiteSpace: 'nowrap' }}>{text}</div> },
    { title: 'Address Line 2', dataIndex: 'AdressLine2', key: 'AdressLine2', render: text => <div style={{ whiteSpace: 'nowrap' }}>{text}</div> },
    { title: 'Address Line 3', dataIndex: 'AdressLine3', key: 'AdressLine3', render: text => <div style={{ whiteSpace: 'nowrap' }}>{text}</div> },
    { title: 'Address Line 4', dataIndex: 'AdressLine4', key: 'AdressLine4', render: text => <div style={{ whiteSpace: 'nowrap' }}>{text}</div> },
    { title: 'Area/Town', dataIndex: 'areaOrTown', key: 'areaOrTown', render: text => <div style={{ whiteSpace: 'nowrap' }}>{text}</div> },
    { title: 'Eir Code', dataIndex: 'eirCode', key: 'eirCode', render: text => <div style={{ whiteSpace: 'nowrap' }}>{text}</div> },
    { title: 'Country', dataIndex: 'Country', key: 'Country', render: text => <div style={{ whiteSpace: 'nowrap' }}>{text}</div> },
    { title: 'Preferred Address', dataIndex: 'preferredAddress', key: 'preferredAddress', render: text => <div style={{ whiteSpace: 'nowrap' }}>{text}</div> },
    { title: 'Grade', dataIndex: 'Grade', key: 'Grade', render: text => <div style={{ whiteSpace: 'nowrap' }}>{text}</div> },
    { title: 'Other Grade', dataIndex: 'otherGrade', key: 'otherGrade', render: text => <div style={{ whiteSpace: 'nowrap' }}>{text}</div> },
    { title: 'Membership Category', dataIndex: 'MembershipCategory', key: 'MembershipCategory', render: text => <div style={{ whiteSpace: 'nowrap' }}>{text}</div> },
    { title: 'Work Location', dataIndex: 'WorkLocation', key: 'WorkLocation', render: text => <div style={{ whiteSpace: 'nowrap' }}>{text}</div> },
    { title: 'Other Work Location', dataIndex: 'OtherWorkLocation', key: 'OtherWorkLocation', render: text => <div style={{ whiteSpace: 'nowrap' }}>{text}</div> },
    { title: 'Branch', dataIndex: 'branch', key: 'branch', render: text => <div style={{ whiteSpace: 'nowrap' }}>{text}</div> },
    { title: 'Region', dataIndex: 'region', key: 'region', render: text => <div style={{ whiteSpace: 'nowrap' }}>{text}</div> },
    { title: 'Division', dataIndex: 'Division', key: 'Division', render: text => <div style={{ whiteSpace: 'nowrap' }}>{text}</div> },
    { title: 'District', dataIndex: 'District', key: 'District', render: text => <div style={{ whiteSpace: 'nowrap' }}>{text}</div> },
    { title: 'Duty', dataIndex: 'duty', key: 'duty', render: text => <div style={{ whiteSpace: 'nowrap' }}>{text}</div> },
    { title: 'Rank', dataIndex: 'rank', key: 'rank', render: text => <div style={{ whiteSpace: 'nowrap' }}>{text}</div> },
    { title: 'Graduation Date', dataIndex: 'graduationDate', key: 'graduationDate', render: text => <div style={{ whiteSpace: 'nowrap' }}>{text}</div> },
    { title: 'Station Phone', dataIndex: 'stationPh', key: 'stationPh', render: text => <div style={{ whiteSpace: 'nowrap' }}>{text}</div> },
    { title: 'Date Joined', dataIndex: 'dateJoined', key: 'dateJoined', render: text => <div style={{ whiteSpace: 'nowrap' }}>{text}</div> },
    { title: 'Date Retired', dataIndex: 'dateRetired', key: 'dateRetired', render: text => <div style={{ whiteSpace: 'nowrap' }}>{text}</div> },
    { title: 'Is Pensioner', dataIndex: 'isPensioner', key: 'isPensioner', render: text => <div style={{ whiteSpace: 'nowrap' }}>{text}</div> },
    { title: 'Pension No', dataIndex: 'pensionNo', key: 'pensionNo', render: text => <div style={{ whiteSpace: 'nowrap' }}>{text}</div> },
    { title: 'Is Deceased', dataIndex: 'isDeceased', key: 'isDeceased', render: text => <div style={{ whiteSpace: 'nowrap' }}>{text}</div> },
    { title: 'Date of Death', dataIndex: 'dateOfDeath', key: 'dateOfDeath', render: text => <div style={{ whiteSpace: 'nowrap' }}>{text}</div> },
    { title: 'Associate Member', dataIndex: 'isAssociateMember', key: 'isAssociateMember', render: text => <div style={{ whiteSpace: 'nowrap' }}>{text}</div> },
    { title: 'Notes', dataIndex: 'notes', key: 'notes', render: text => <div style={{ whiteSpace: 'nowrap' }}>{text}</div> },
  ];


  // const memberdata =;
  const [memberLookups, setmemberLookups] = useState()
  const [memberdata, setmemberdata] = useState([
    {
      key: '1',
      gardaRegNo: 'GR12345',
      fullname: 'John Michael Doe',
      forename: 'John',
      surname: 'Doe',
      dateOfBirth: '1980-05-12',
      mobile: '0891234567',
      HomeOrWorkTel: '012345678',
      email: 'john.doe@example.com',
      preferredEmail: 'john.work@example.com',
      AdressLine1: '123 Main St',
      AdressLine2: 'Apt 4B',
      AdressLine3: 'North City',
      AdressLine4: 'County Dublin',
      areaOrTown: 'Dublin',
      eirCode: 'D01XY23',
      Country: 'Ireland',
      preferredAddress: 'Home',
      Grade: 'Sergeant',
      otherGrade: '',
      MembershipCategory: 'Full',
      WorkLocation: 'HQ',
      OtherWorkLocation: '',
      branch: 'Central',
      region: 'Leinster',
      Division: 'Dublin North',
      District: 'North City',
      duty: 'Patrol',
      rank: 'Sergeant',
      graduationDate: '2003-06-15',
      stationPh: '014567890',
      dateJoined: '2000-01-10',
      dateRetired: null,
      isPensioner: false,
      pensionNo: '',
      isDeceased: false,
      dateOfDeath: null,
      isAssociateMember: false,
      notes: 'None',
    },
    {
      key: '2',
      gardaRegNo: 'GR67890',
      fullname: 'Mary Anne Smith',
      forename: 'Mary',
      surname: 'Smith',
      dateOfBirth: '1972-11-03',
      mobile: '0877654321',
      HomeOrWorkTel: '016789012',
      email: 'mary.smith@example.com',
      preferredEmail: 'mary.office@example.com',
      AdressLine1: '456 Elm Street',
      AdressLine2: '',
      AdressLine3: 'South Town',
      AdressLine4: '',
      areaOrTown: 'Cork',
      eirCode: 'T12ABC3',
      Country: 'Ireland',
      preferredAddress: 'Work',
      Grade: 'Inspector',
      otherGrade: '',
      MembershipCategory: 'Retired',
      WorkLocation: '',
      OtherWorkLocation: '',
      branch: 'South',
      region: 'Munster',
      Division: 'Cork East',
      District: 'South Central',
      duty: 'Admin',
      rank: 'Inspector',
      graduationDate: '1995-09-01',
      stationPh: '021345678',
      dateJoined: '1992-03-20',
      dateRetired: '2022-11-03',
      isPensioner: true,
      pensionNo: 'PENS456789',
      isDeceased: false,
      dateOfDeath: null,
      isAssociateMember: true,
      notes: 'Former branch rep',
    },
    {
      key: '3',
      gardaRegNo: 'GR11223',
      fullname: 'Patrick O\'Connor',
      forename: 'Patrick',
      surname: 'O\'Connor',
      dateOfBirth: '1985-08-25',
      mobile: '0856677889',
      HomeOrWorkTel: '018765432',
      email: 'patrick.oconnor@example.com',
      preferredEmail: 'patrick.hq@example.com',
      AdressLine1: '78 River Road',
      AdressLine2: '',
      AdressLine3: 'Galway',
      AdressLine4: '',
      areaOrTown: 'Galway',
      eirCode: 'H91XYZ9',
      Country: 'Ireland',
      preferredAddress: 'Home',
      Grade: 'Garda',
      otherGrade: '',
      MembershipCategory: 'Full',
      WorkLocation: 'West Station',
      OtherWorkLocation: '',
      branch: 'West',
      region: 'Connacht',
      Division: 'Galway',
      District: 'Galway Central',
      duty: 'Detective',
      rank: 'Garda',
      graduationDate: '2007-07-10',
      stationPh: '091234567',
      dateJoined: '2005-04-15',
      dateRetired: null,
      isPensioner: false,
      pensionNo: '',
      isDeceased: false,
      dateOfDeath: null,
      isAssociateMember: false,
      notes: '',
    },
    {
      key: '4',
      gardaRegNo: 'GR33445',
      fullname: 'Siobhan Kelly',
      forename: 'Siobhan',
      surname: 'Kelly',
      dateOfBirth: '1990-03-14',
      mobile: '0839876543',
      HomeOrWorkTel: '015678901',
      email: 'siobhan.kelly@example.com',
      preferredEmail: 'siobhan.personal@example.com',
      AdressLine1: '12 Lakeview',
      AdressLine2: '',
      AdressLine3: 'Limerick',
      AdressLine4: '',
      areaOrTown: 'Limerick',
      eirCode: 'V94BCD7',
      Country: 'Ireland',
      preferredAddress: 'Home',
      Grade: 'Sergeant',
      otherGrade: '',
      MembershipCategory: 'Full',
      WorkLocation: 'East HQ',
      OtherWorkLocation: '',
      branch: 'East',
      region: 'Munster',
      Division: 'Limerick',
      District: 'East Side',
      duty: 'Desk',
      rank: 'Sergeant',
      graduationDate: '2011-09-20',
      stationPh: '061234567',
      dateJoined: '2010-02-01',
      dateRetired: null,
      isPensioner: false,
      pensionNo: '',
      isDeceased: false,
      dateOfDeath: null,
      isAssociateMember: false,
      notes: 'None',
    },
    {
      key: '5',
      gardaRegNo: 'GR55667',
      fullname: 'Liam Murphy',
      forename: 'Liam',
      surname: 'Murphy',
      dateOfBirth: '1975-12-11',
      mobile: '0861239876',
      HomeOrWorkTel: '012398765',
      email: 'liam.murphy@example.com',
      preferredEmail: 'liam.retired@example.com',
      AdressLine1: '91 Forest Park',
      AdressLine2: '',
      AdressLine3: 'Athlone',
      AdressLine4: '',
      areaOrTown: 'Westmeath',
      eirCode: 'N37XY12',
      Country: 'Ireland',
      preferredAddress: 'Home',
      Grade: 'Inspector',
      otherGrade: '',
      MembershipCategory: 'Retired',
      WorkLocation: '',
      OtherWorkLocation: '',
      branch: 'Midlands',
      region: 'Leinster',
      Division: 'Longford',
      District: 'Athlone',
      duty: 'Retired',
      rank: 'Inspector',
      graduationDate: '1997-06-18',
      stationPh: '090123456',
      dateJoined: '1995-01-05',
      dateRetired: '2020-12-01',
      isPensioner: true,
      pensionNo: 'PENS789123',
      isDeceased: false,
      dateOfDeath: null,
      isAssociateMember: true,
      notes: 'Lifetime member',
    },
    // Add 5 more similar objects (keys 6 to 10) if needed.
  ])
  const [selectedFullname, setSelectedFullname] = useState()
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  useEffect(() => {
    let arr = []
    memberdata?.map((i, key) => {
      arr.push({ key: i?.key, label: i?.fullname })
    })
    setmemberLookups(arr)
  }, [memberdata])

  const [data, setData] = useState([
    {
      key: '1',
      gardaRegNo: 'GR12345',
      fullname: 'John Michael Doe',
      forename: 'John',
      surname: 'Doe',
      dateOfBirth: '1980-05-12',

      mobile: '0891234567',
      HomeOrWorkTel: '012345678',
      email: 'john.doe@example.com',
      preferredEmail: 'john.work@example.com',

      AdressLine1: '123 Main St',
      AdressLine2: 'Apt 4B',
      AdressLine3: 'North City',
      AdressLine4: 'County Dublin',
      areaOrTown: 'Dublin',
      eirCode: 'D01XY23',
      Country: 'Ireland',
      preferredAddress: 'Home',

      Grade: 'Sergeant',
      otherGrade: '',
      MembershipCategory: 'Full',
      WorkLocation: 'HQ',
      OtherWorkLocation: '',
      branch: 'Central',
      region: 'Leinster',
      Division: 'Dublin North',
      District: 'North City',
      duty: 'Patrol',
      rank: 'Sergeant',
      graduationDate: '2003-06-15',
      stationPh: '014567890',

      dateJoined: '2000-01-10',
      dateRetired: null,
      isPensioner: false,
      pensionNo: '',

      isDeceased: false,
      dateOfDeath: null,
      isAssociateMember: false,
      notes: 'None',
    },
    {
      key: '2',
      gardaRegNo: 'GR67890',
      fullname: 'Mary Anne Smith',
      forename: 'Mary',
      surname: 'Smith',
      dateOfBirth: '1972-11-03',

      mobile: '0877654321',
      HomeOrWorkTel: '016789012',
      email: 'mary.smith@example.com',
      preferredEmail: 'mary.office@example.com',

      AdressLine1: '456 Elm Street',
      AdressLine2: '',
      AdressLine3: 'South Town',
      AdressLine4: '',
      areaOrTown: 'Cork',
      eirCode: 'T12ABC3',
      Country: 'Ireland',
      preferredAddress: 'Work',

      Grade: 'Inspector',
      otherGrade: '',
      MembershipCategory: 'Retired',
      WorkLocation: '',
      OtherWorkLocation: '',
      branch: 'South',
      region: 'Munster',
      Division: 'Cork East',
      District: 'South Central',
      duty: 'Admin',
      rank: 'Inspector',
      graduationDate: '1995-09-01',
      stationPh: '021345678',
      dateJoined: '1992-03-20',
      dateRetired: '2022-11-03',
      isPensioner: true,
      pensionNo: 'PENS456789',
      isDeceased: false,
      dateOfDeath: null,
      isAssociateMember: true,
      notes: 'Former branch rep',
    },
  ])
  // console.log(data.find(d => d.fullname.includes("John Michael Doe")), "tsy");

  const summaryColumns = [
    { dataIndex: "batchName", title: "Batch Name", ellipsis: true, width: 150 },
    { dataIndex: "batchDate", title: "Batch Date", ellipsis: true, width: 150 },
    { dataIndex: "status", title: "Batch Status", ellipsis: true, width: 150 },
    { dataIndex: "createdAt", title: "Created At", ellipsis: true, width: 150 },
    { dataIndex: "createdBy", title: "Created By", ellipsis: true, width: 150 },
    { dataIndex: "count", title: "Count", ellipsis: true, width: 100 },
  ];

  const summaryData = [
    {
      key: "1",
      batchName: "Corn Market Batch A",
      batchDate: "2025-07-01",
      status: "Draft",
      createdAt: "2025-06-30",
      createdBy: "Admin",
      count: 12,
    },
  ];
  const handleSubmit = () => {
    const fullname = selectedFullname?.toLowerCase().trim();

    const selectedMember = memberdata.find(
      (item) => item?.fullname?.toLowerCase().trim() === fullname
    );

    if (selectedMember) {
      setData((prev) => [...prev, selectedMember]);

      setmemberdata((prev) =>
        prev.filter(
          (item) => item?.fullname?.toLowerCase().trim() !== fullname
        )
      );

      setSelectedFullname(""); // optional: clear input
    } else {
      console.warn("No matching member found.");
    }
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExModalOpen, setIsExModalOpen] = useState(false);
  const [activeKey, setActiveKey] = useState(1);
  const [memberModalSelectVal, setmemberModalSelectVal] = useState()
  console.log(memberModalSelectVal, "mem")
  return (
    <Drawer
      title="Corn Market"
      placement="right"
      width={1500}
      onClose={onClose}
      open={isOpen}
      extra={
        <>
          <Button onClick={onClose} className="butn secoundry-btn me-2">Close</Button>
          <Button className="butn primary-btn">Process Batch</Button>
        </>
      }
    >
      <div className='reminder-gride'>
        {/* Top Fields */}
        <div className="d-flex gap-2 mb-3">
          <div style={{ width: '50%' }}>
            <label className='custom-label'>Batch Name</label>
            <Input disabled value="Corn Market Batch A" />
          </div>
          <div style={{ width: '50%' }}>
            <label className='custom-label'>Batch Date</label>
            <Input disabled value="2025-07-01" />
          </div>
        </div>

        <div className="d-flex gap-2 mb-3">
          <div style={{ width: '50%' }}>
            <label className='custom-label'>Batch Status</label>
            <Input disabled value="Draft" />
          </div>
          <div style={{ width: '50%' }}>
            <label className='custom-label'>Total Count</label>
            <Input disabled value={data?.length} />
          </div>
        </div>

        <Tabs
          defaultActiveKey={String(activeKey)}
          activeKey={String(activeKey)}
          onChange={(key) => setActiveKey(Number(key))}
          tabBarExtraContent={
            activeKey > 1 && (
              <>
                <Button className="butn secoundry-btn me-2 mb-2" onClick={() => setIsModalOpen(true)}>
                  + Add Entry
                </Button>
                <Button className="butn secoundry-btn me-2 mb-2" onClick={() => setIsExModalOpen(true)}>
                  Exclude Entry
                </Button>
                <MyMenu
                  items={[
                    {
                      key: 'export_csv',
                      label: 'Export as CSV',
                      icon: <BsFiletypeXls style={{ fontSize: "12px", marginRight: "10px", color: "#45669d" }} />,
                      onClick: () => downloadCSV(),
                    }
                  ]}
                />
              </>
            )
          }
        >
          <TabPane tab="Summary" key="1">
            <div className="mt-4">
              <Table columns={summaryColumns} dataSource={summaryData} pagination={false} />
            </div>
          </TabPane>
          <TabPane tab="Corn Market" key="2">
            <div className="mt-4">
              <Table bordered rowSelection={{
                type: 'checkbox',
                selectedRowKeys,
                onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys),
              }} columns={columns} dataSource={data} />
            </div>
          </TabPane>
        </Tabs>
      </div>
      <Modal
        className="right-modal"
        open={isModalOpen}
        title="Add Entry"
        onOk={() => handleSubmit()}
        onCancel={() => setIsModalOpen(false)}
      >
        {/* <MySelect isSimple /> */}
        <CustomSelect label='Members' name='Members' required options={memberLookups}
        onChange={(e) => setSelectedFullname(e.target.value)}
          value={selectedFullname}
         // value={memberModalSelectVal}
        />
      </Modal>
      <Modal
        title="Confirm Exclusion"
        open={isExModalOpen}
        onOk={() => {
  // Get excluded rows
  const excludedRows = data.filter((item) => selectedRowKeys.includes(item.key));

  // Remove from table
  setData((prevData) =>
    prevData.filter((item) => !selectedRowKeys.includes(item.key))
  );

  // Add back to memberdata (if not already there)
  setmemberdata((prev) => {
    const existingKeys = new Set(prev.map((i) => i.key));
    const newEntries = excludedRows.filter((i) => !existingKeys.has(i.key));
    return [...prev, ...newEntries];
  });

  // Cleanup
  setSelectedRowKeys([]);
  setIsModalOpen(false);
}}

        onCancel={() => setIsExModalOpen(false)}
        okText="Yes"
        cancelText="Cancel"
      >
        <p>Are you sure you want to exclude a memeber from batch?</p>
      </Modal>
    </Drawer>
  );
}

export default CornMarketDrawer;
