import React, { useState } from "react";
import { Row, Col, Divider, Card, Checkbox, Radio } from "antd";
import MyInput from "../common/MyInput";
import MyDatePicker from "../common/MyDatePicker";
import CustomSelect from "../common/CustomSelect";


const MembershipForm = () => {
    // Internal form state
    const [formData, setFormData] = useState({
        title: "",
        surname: "",
        forename: "",
        gender: "",
        dateOfBirth: null,
        countryPrimaryQualification: "",
        addressLine1: "",
        townCity: "",
        studyLocation: "",
        graduationDate: null,
        workLocation: "",
        branch: "",
        region: "",
        grade: "",
        retiredDate: null,
        pensionNumber: "",
        membershipNumber: "",
        membershipStatus: "",
        membershipCategory: "",
        joiningDate: null,
        expiryDate: null,
        paymentType: "",
        payrollNumber: "",
        consent: false,
        mobileNumber: "",
        personalEmail: "",
        nursingProgramme: "Yes",
        nmbiNumber: "",
        nursingSpecialization: [],
        memberOfOtherUnion: "No",
        otherUnionName: "",
        otherUnionScheme: "Yes",
        joinINMOIncomeProtection: false,
        joinRewards: false,
        allowPartnerContact: false,
        agreeDataProtection: false,
    });

    // Lookup data internally (can later fetch from API)
    const lookupData = {
        titles: ["Mr", "Mrs", "Miss", "Dr"],
        genders: ["Male", "Female", "Other"],
        countries: ["Pakistan", "USA", "UK", "Other"],
        studyLocations: ["Local", "Abroad"],
        workLocations: ["HQ", "Branch1", "Branch2"],
        branches: ["Branch A", "Branch B", "Branch C"],
        regions: ["North", "South", "East", "West"],
        grades: ["Grade 1", "Grade 2", "Grade 3"],
        membershipStatus: ["Active", "Inactive", "Suspended"],
        membershipCategory: ["Regular", "Premium", "VIP"],
        paymentTypes: ["Cash", "Cheque", "Bank Transfer"],
    };

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    return (
        <div className="mt-2 pe-4">
            <Row gutter={32}>
                {/* Personal Information */}
                <Col span={8}>
                    <Card>
                        <h3>Personal Information</h3>

                        <CustomSelect
                            label="Title"
                            placeholder="Select title"
                            options={lookupData.titles}
                            value={formData.title}
                            onChange={(val) => handleChange("title", val)}
                        />
                        <MyInput
                            label="Surname"
                            value={formData.surname}
                            onChange={(e) => handleChange("surname", e.target.value)}
                        />
                        <MyInput
                            label="Forename"
                            value={formData.forename}
                            onChange={(e) => handleChange("forename", e.target.value)}
                        />
                        <CustomSelect
                            label="Gender"
                            options={lookupData.genders}
                            value={formData.gender}
                            onChange={(val) => handleChange("gender", val)}
                        />
                        <MyDatePicker
                            label="Date of Birth"
                            value={formData.dateOfBirth}
                            onChange={(date) => handleChange("dateOfBirth", date)}
                        />
                        <CustomSelect
                            label="Country of Primary Qualification"
                            options={lookupData.countries}
                            value={formData.countryPrimaryQualification}
                            onChange={(val) => handleChange("countryPrimaryQualification", val)}
                        />
                        <MyInput
                            label="Address Line 1"
                            value={formData.addressLine1}
                            onChange={(e) => handleChange("addressLine1", e.target.value)}
                        />
                        <MyInput
                            label="Town/City"
                            value={formData.townCity}
                            onChange={(e) => handleChange("townCity", e.target.value)}
                        />
                        <Checkbox
                            checked={formData.consent}
                            onChange={(e) => handleChange("consent", e.target.checked)}
                        >
                            Consent to receive communication from INMO
                        </Checkbox>

                        <MyInput
                            label="Mobile Number"
                            value={formData.mobileNumber}
                            onChange={(e) => handleChange("mobileNumber", e.target.value)}
                        />
                        <MyInput
                            label="Personal Email"
                            value={formData.personalEmail}
                            onChange={(e) => handleChange("personalEmail", e.target.value)}
                        />
                    </Card>
                </Col>

                {/* Professional Details */}
                <Col span={8}>
                    <Card>
                        <h3>Professional Details</h3>

                        <CustomSelect
                            label="Study Location"
                            options={lookupData.studyLocations}
                            value={formData.studyLocation}
                            onChange={(val) => handleChange("studyLocation", val)}
                        />
                        <MyDatePicker
                            label="Graduation Date"
                            value={formData.graduationDate}
                            onChange={(date) => handleChange("graduationDate", date)}
                        />
                        <CustomSelect
                            label="Work Location"
                            options={lookupData.workLocations}
                            value={formData.workLocation}
                            onChange={(val) => handleChange("workLocation", val)}
                        />
                        <CustomSelect
                            label="Branch"
                            options={lookupData.branches}
                            value={formData.branch}
                            onChange={(val) => handleChange("branch", val)}
                        />
                        <CustomSelect
                            label="Region"
                            options={lookupData.regions}
                            value={formData.region}
                            onChange={(val) => handleChange("region", val)}
                        />
                        <CustomSelect
                            label="Grade"
                            options={lookupData.grades}
                            value={formData.grade}
                            onChange={(val) => handleChange("grade", val)}
                        />
                        <MyDatePicker
                            label="Retired Date"
                            value={formData.retiredDate}
                            onChange={(date) => handleChange("retiredDate", date)}
                        />
                        <MyInput
                            label="Pension Number"
                            value={formData.pensionNumber}
                            onChange={(e) => handleChange("pensionNumber", e.target.value)}
                        />

                        <label className="my-input-label">Nursing Adaptation Programme</label><br></br>
                        <Radio.Group
                            className="mb-2"
                            value={formData.nursingProgramme}
                            onChange={(e) =>
                                handleChange("nursingProgramme", e.target.value)
                            }
                        >
                            <Radio value="Yes">Yes</Radio>
                            <Radio value="No">No</Radio>
                        </Radio.Group>

                        <MyInput
                            label="NMBI No / An Bord Altranais Number"
                            value={formData.nmbiNumber}
                            onChange={(e) => handleChange("nmbiNumber", e.target.value)}
                        />

                        <label className="my-input-label">Nursing Specialization</label><br></br>
                        {[
                            "General Nurse",
                            "Public Health Nurse",
                            "Mental Health Nurse",
                            "Midwife",
                            "Sick Children's Nurse",
                            "Registered Nurse for Intellectual Disability",
                        ].map((spec) => (
                            <Checkbox
                                key={spec}
                                checked={formData.nursingSpecialization.includes(spec)}
                            // onChange={() => toggleSpecialization(spec)}
                            >
                                {spec}
                            </Checkbox>
                        ))}
                    </Card>
                </Col>

                {/* Subscription Details */}
                <Col span={8} className="">
                    <Card>
                        <h3>Subscription Details</h3>

                        <MyInput
                            label="Membership Number"
                            value={formData.membershipNumber}
                            onChange={(e) => handleChange("membershipNumber", e.target.value)}
                        />
                        <CustomSelect
                            label="Membership Status"
                            options={lookupData.membershipStatus}
                            value={formData.membershipStatus}
                            onChange={(val) => handleChange("membershipStatus", val)}
                        />
                        <CustomSelect
                            label="Membership Category"
                            options={lookupData.membershipCategory}
                            value={formData.membershipCategory}
                            onChange={(val) => handleChange("membershipCategory", val)}
                        />
                        <MyDatePicker
                            label="Joining Date"
                            value={formData.joiningDate}
                            onChange={(date) => handleChange("joiningDate", date)}
                        />
                        <MyDatePicker
                            label="Expiry Date"
                            value={formData.expiryDate}
                            onChange={(date) => handleChange("expiryDate", date)}
                        />
                        <CustomSelect
                            label="Payment Type"
                            options={lookupData.paymentTypes}
                            value={formData.paymentType}
                            onChange={(val) => handleChange("paymentType", val)}
                        />
                        <MyInput
                            label="Payroll Number"
                            value={formData.payrollNumber}
                            onChange={(e) => handleChange("payrollNumber", e.target.value)}
                        />
                        <p className="my-input-label">Are you a member of another Trade Union? *</p>
                        <Radio.Group
                        className="mb-2"
                            value={formData.memberOfOtherUnion}
                            onChange={(e) => handleChange("memberOfOtherUnion", e.target.value)}
                        >
                            <Radio value="Yes">Yes</Radio>
                            <Radio value="No">No</Radio>
                        </Radio.Group>

                        <MyInput
                            label="If yes, which Union? *"
                            value={formData.otherUnionName}
                            onChange={(e) => handleChange("otherUnionName", e.target.value)}
                        />

                        <p className="my-input-label ">
                            Are you or were you a member of another Irish trade Union salary or
                            Income Protection Scheme?
                        </p>
                        <Radio.Group
                        className="mb-4"
                            value={formData.otherUnionScheme}
                            onChange={(e) => handleChange("otherUnionScheme", e.target.value)}
                        >
                            <Radio value="Yes">Yes</Radio>
                            <Radio value="No">No</Radio>
                        </Radio.Group>

                        <h3 className="my-input-label mt-2">Additional Services</h3>
                        <Checkbox
                        className="mb-2"
                            checked={formData.joinINMOIncomeProtection}
                            onChange={(e) =>
                                handleChange("joinINMOIncomeProtection", e.target.checked)
                            }
                        >
                            Tick here to join INMO Income Protection Scheme
                        </Checkbox>
                        <Checkbox
                            checked={formData.joinRewards}
                            onChange={(e) => handleChange("joinRewards", e.target.checked)}
                            className="mb-2"
                        >
                            Tick here to join Rewards for INMO members
                        </Checkbox>
                        <Checkbox
                            checked={formData.allowPartnerContact}
                            onChange={(e) =>
                                handleChange("allowPartnerContact", e.target.checked)
                            }
                        >
                            Tick here to allow our partners to contact you about Value added
                            Services by Email and SMS
                        </Checkbox>
                        <Checkbox
                            checked={formData.agreeDataProtection}
                            onChange={(e) =>
                                handleChange("agreeDataProtection", e.target.checked)
                            }
                        >
                            I have read and agree to the INMO Data Protection Statement, the
                            INMO Privacy Statement and the INMO Conditions of Membership *
                        </Checkbox>
                    </Card>
                </Col>

            </Row>
        </div>
    );
};

export default MembershipForm;
