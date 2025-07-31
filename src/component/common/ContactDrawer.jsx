// ContactDrawer.jsx
import React, { useState, useEffect } from "react";
import { Drawer, Button, Space, Table } from "antd";
import { useDispatch, useSelector } from "react-redux";
import getContacts from "../../features/ContactSlice";
import getContactTypes from "../../features/ContactTypeSlice";
import { insertDataFtn, deleteFtn, baseURL } from "../../utils/Utilities";
import CustomSelect from "./CustomSelect";
import MyInput from "./MyInput";
import MyConfirm from "../common/MyConfirm";
import { FaEdit } from "react-icons/fa";
import { AiFillDelete } from "react-icons/ai";
import { useTableColumns } from "../../context/TableColumnsContext ";

function ContactDrawer({ open, onClose }) {
    const dispatch = useDispatch();
    const { selectLokups, lookupsForSelect } = useTableColumns();
    const { contactsLoading } = useSelector((state) => state.contactType);

    const initialData = {
        Forename: "",
        Surname: "",
        ContactPhone: "",
        ContactEmail: "",
        ContactAddress: {
            BuildingOrHouse: "",
            StreetOrRoad: "",
            AreaOrTown: "",
            CityCountyOrPostCode: "",
            Eircode: "",
        },
        ContactTypeID: "",
    };

    const [data, setData] = useState({ Solicitors: [] });
    const [form, setForm] = useState({ ...initialData });
    const [errors, setErrors] = useState({});
    const [isUpdate, setIsUpdate] = useState(false);
    const [updateId, setUpdateId] = useState(null);

    useEffect(() => {
        if (open) {
            dispatch(getContactTypes());
            dispatch(getContacts());
        }
    }, [open]);

    const onInputChange = (field, value) => {
        if (field.includes(".")) {
            const [parent, child] = field.split(".");
            setForm((prev) => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value,
                },
            }));
        } else {
            setForm((prev) => ({ ...prev, [field]: value }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!form.Forename) newErrors.Forename = "Required";
        if (!form.Surname) newErrors.Surname = "Required";
        if (!form.ContactEmail) newErrors.ContactEmail = "Required";
        if (!form.ContactPhone) newErrors.ContactPhone = "Required";
        if (!form.ContactAddress.BuildingOrHouse)
            newErrors.BuildingOrHouse = "Required";
        if (!form.ContactAddress.AreaOrTown) newErrors.AreaOrTown = "Required";
        if (!form.ContactTypeID) newErrors.ContactTypeID = "Required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        await insertDataFtn(
            "/contact",
            form,
            "Data inserted successfully",
            "Failed to insert data",
            () => {
                setForm({ ...initialData });
                setErrors({});
                setIsUpdate(false);
                dispatch(getContacts());
            }
        );
    };

    const handleEdit = (record) => {
        setForm(record);
        setIsUpdate(true);
        setUpdateId(record._id);
    };

    const handleDelete = (record) => {
        MyConfirm({
            title: "Confirm Deletion",
            message: "Do You Want To Delete This Item?",
            onConfirm: async () => {
                await deleteFtn(`${baseURL}/contact`, record._id);
                dispatch(getContacts());
            },
        });
    };

    const columns = [
        { title: "Surname", dataIndex: "Surname" },
        { title: "Forename", dataIndex: "Forename" },
        { title: "Phone", dataIndex: "ContactPhone" },
        { title: "Email", dataIndex: "ContactEmail" },
        { title: "Building", dataIndex: ["ContactAddress", "BuildingOrHouse"] },
        { title: "Street", dataIndex: ["ContactAddress", "StreetOrRoad"] },
        { title: "Area", dataIndex: ["ContactAddress", "AreaOrTown"] },
        { title: "Postcode", dataIndex: ["ContactAddress", "CityCountyOrPostCode"] },
        { title: "Eircode", dataIndex: ["ContactAddress", "Eircode"] },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Space>
                    <FaEdit onClick={() => handleEdit(record)} />
                    <AiFillDelete onClick={() => handleDelete(record)} />
                </Space>
            ),
        },
    ];

    return (
        <Drawer
            open={open}
            onClose={onClose}
            width={1040}
            title="Contacts"
            extra={
                <Space>
                    <Button className="butn secoundry-btn" onClick={onClose}>
                        Close
                    </Button>
                    <Button className="butn primary-btn" onClick={handleSubmit}>
                        {isUpdate ? "Save" : "Add"}
                    </Button>
                </Space>
            }
        >
            <div className="drawer-main-cntainer">
                <div className="mb-4 pb-4">
                    <CustomSelect
                        label="Contact Type:"
                        placeholder="Select Contact type"
                        options={selectLokups?.contactTypes}
                        value={form.ContactTypeID}
                        onChange={(e) => onInputChange("ContactTypeID", e)}
                        required
                        hasError={!!errors.ContactTypeID}
                        errorMessage={errors.ContactTypeID}
                        style={{ width: "25%" }}
                    />

                    <MyInput
                        label="Forename:"
                        value={form.Forename}
                        onChange={(e) => onInputChange("Forename", e.target.value)}
                        required
                        hasError={!!errors.Forename}
                        errorMessage={errors.Forename}
                        style={{ width: "25%" }}
                    />

                    <MyInput
                        label="Surname:"
                        value={form.Surname}
                        onChange={(e) => onInputChange("Surname", e.target.value)}
                        required
                        hasError={!!errors.Surname}
                        errorMessage={errors.Surname}
                        style={{ width: "25%" }}
                    />

                    <MyInput
                        label="Email:"
                        type="email"
                        value={form.ContactEmail}
                        onChange={(e) => onInputChange("ContactEmail", e.target.value)}
                        required
                        hasError={!!errors.ContactEmail}
                        errorMessage={errors.ContactEmail}
                        style={{ width: "25%" }}
                    />

                    <MyInput
                        label="Mobile:"
                        value={form.ContactPhone}
                        onChange={(e) => onInputChange("ContactPhone", e.target.value)}
                        required
                        hasError={!!errors.ContactPhone}
                        errorMessage={errors.ContactPhone}
                        style={{ width: "25%" }}
                    />

                    <MyInput
                        label="Building or House:"
                        value={form.ContactAddress.BuildingOrHouse}
                        onChange={(e) => onInputChange("ContactAddress.BuildingOrHouse", e.target.value)}
                        required
                        hasError={!!errors.BuildingOrHouse}
                        errorMessage={errors.BuildingOrHouse}
                        style={{ width: "25%" }}
                    />

                    <MyInput
                        label="Street or Road:"
                        value={form.ContactAddress.StreetOrRoad}
                        onChange={(e) => onInputChange("ContactAddress.StreetOrRoad", e.target.value)}
                        style={{ width: "25%" }}
                    />

                    <MyInput
                        label="Area or Town:"
                        value={form.ContactAddress.AreaOrTown}
                        onChange={(e) => onInputChange("ContactAddress.AreaOrTown", e.target.value)}
                        required
                        hasError={!!errors.AreaOrTown}
                        errorMessage={errors.AreaOrTown}
                        style={{ width: "25%" }}
                    />

                    <MyInput
                        label="City/Postcode:"
                        value={form.ContactAddress.CityCountyOrPostCode}
                        onChange={(e) => onInputChange("ContactAddress.CityCountyOrPostCode", e.target.value)}
                        style={{ width: "25%" }}
                    />

                    <MyInput
                        label="Eircode:"
                        value={form.ContactAddress.Eircode}
                        onChange={(e) => onInputChange("ContactAddress.Eircode", e.target.value)}
                        style={{ width: "25%" }}
                    />
                </div>

                <div className="mt-4 config-tbl-container">
                    <Table
                        pagination={false}
                        columns={columns}
                        dataSource={data?.Solicitors}
                        loading={contactsLoading}
                        rowClassName={(_, index) => (index % 2 !== 0 ? "odd-row" : "even-row")}
                        bordered
                    />
                </div>
            </div>
        </Drawer>
    );
}

export default ContactDrawer;
