import React, { useState } from "react";
import MyInput from "../../../component/common/MyInput";
import {
    MdAccountBalance,
    MdStore,
    MdLock,
    MdCreditCard,
    MdOutlineInfo,
    MdVerifiedUser,
    MdSearch,
    MdPerson,
} from "react-icons/md";
import MemberSearch from "../../../component/profile/MemberSearch";

const DirectDebitForm = ({ initialData, onSubmit }) => {
    const [selectedMember, setSelectedMember] = useState(null);
    const [formData, setFormData] = useState(initialData || {
        bankName: "",
        branchAddress: "123 Financial District, London, EC1A 1BB, United Kingdom",
        authorized: false,
        accountName: "",
        accountNumber: "",
        bic: "",
        iban: "",
        personalAddress: "",
        phone: "",
        email: "",
    });

    const handleMemberSelect = (memberData) => {
        setSelectedMember(memberData);
        // Pre-fill form data from selected member
        setFormData(prev => ({
            ...prev,
            accountName: `${memberData.personalInfo?.forename || ''} ${memberData.personalInfo?.surname || ''}`.trim().toUpperCase(),
            email: memberData.contactInfo?.personalEmail || "",
            phone: memberData.contactInfo?.mobileNumber || "",
            personalAddress: memberData.contactInfo?.fullAddress || "",
        }));
    };

    const handleClearMember = () => {
        setSelectedMember(null);
        setFormData(prev => ({
            ...prev,
            accountName: "",
            email: "",
            phone: "",
            personalAddress: "",
        }));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const styles = {
        formContainer: {
            padding: "32px",
            fontFamily: "'Inter', system-ui, sans-serif",
            color: "#1f2937",
            maxWidth: "1024px",
            // margin: "0 auto",
        },
        section: {
            marginBottom: "32px",
        },
        headerRow: {
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px",
            paddingBottom: "16px",
            borderBottom: "1px solid #e5e7eb",
        },
        headerIcon: (color, bg) => ({
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: bg,
            color: color,
        }),
        headerTitle: {
            fontSize: "20px",
            fontWeight: "600",
            margin: 0,
            color: "#111827",
        },
        card: {
            backgroundColor: "#ffffff",
            padding: "32px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)", // shadow-sm
        },
        fieldGrid: {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
        },
        full: {
            gridColumn: "span 2",
        },
        label: {
            display: "block",
            fontSize: "14px",
            fontWeight: "500",
            color: "#374151",
            marginBottom: "4px",
        },
        select: {
            width: "100%",
            padding: "0.625rem 0.75rem",
            borderRadius: "0.5rem",
            border: "1px solid #d1d5db",
            fontSize: "14px",
            color: "#111827",
            backgroundColor: "#fff",
            outline: "none",
            height: "42px",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        },
        // Auhtorization Box Style (Blue Box)
        authBox: {
            backgroundColor: "#eff6ff", // bg-blue-50
            border: "1px solid #dbeafe", // border-blue-100
            borderRadius: "0.5rem",
            padding: "16px",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
        },
        checkbox: {
            width: "16px",
            height: "16px",
            borderRadius: "4px",
            border: "1px solid #d1d5db",
            cursor: "pointer",
            marginTop: "3px",
            accentColor: "#3b82f6", // primary
        },
        authContent: {
            display: "flex",
            flexDirection: "column",
        },
        authHeading: {
            fontSize: "14px",
            fontWeight: "500",
            color: "#111827", // gray-900
            marginBottom: "2px",
        },
        authDesc: {
            fontSize: "14px",
            color: "#6b7280", // gray-500
            margin: 0,
        },
        // Read-only/Summary Box
        readOnlyBox: {
            width: "100%",
            borderRadius: "0.5rem",
            border: "1px solid transparent",
            backgroundColor: "#f3f4f6", // bg-gray-100
            color: "#111827",
            padding: "0.5rem 0.75rem",
            fontSize: "14px",
        },
        readOnlyMono: {
            fontFamily: "monospace",
            letterSpacing: "0.05em",
        },
        // Total Amount Display
        totalAmountContainer: {
            marginTop: "8px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
        },
        totalAmountText: {
            fontSize: "30px", // text-3xl
            fontWeight: "700",
            color: "#111827",
            letterSpacing: "-0.025em",
        },
        totalBadge: {
            backgroundColor: "#dcfce7", // bg-green-100
            color: "#166534", // text-green-800
            fontSize: "12px",
            fontWeight: "500",
            padding: "2px 10px",
            borderRadius: "9999px",
        },
        divider: {
            height: "1px",
            backgroundColor: "#e5e7eb",
            margin: "24px 0",
            gridColumn: "span 2",
        }
    };

    return (
        <div style={styles.formContainer}>
            {/* Member Selection Section - Kept as requested */}
            <div style={styles.section}>
                <div style={styles.card}>
                    <label style={styles.label}>Search and select a member</label>
                    <MemberSearch
                        fullWidth={true}
                        onSelectBehavior="callback"
                        onSelectCallback={handleMemberSelect}
                        onClear={handleClearMember}
                    />
                </div>
            </div>

            {/* Section: Your Account */}
            <div style={styles.section}>
                <div style={styles.card}>
                    <div style={styles.headerRow}>
                        <div style={styles.headerIcon("#2563eb", "#dbeafe")}>
                            <MdAccountBalance size={22} />
                        </div>
                        <h2 style={styles.headerTitle}>Your Account Details</h2>
                    </div>

                    <div style={styles.fieldGrid}>
                        <div style={styles.full}>
                            <label style={styles.label}>
                                Bank Name <span style={{ color: "#ef4444" }}>*</span>
                            </label>
                            <div style={{ position: "relative" }}>
                                <select
                                    name="bankName"
                                    value={formData.bankName}
                                    onChange={handleChange}
                                    style={styles.select}
                                >
                                    <option value="">Select your bank (System Lookup)</option>
                                    <option value="hsbc">HSBC Holdings</option>
                                    <option value="barclays">Barclays</option>
                                    <option value="lloyds">Lloyds Banking Group</option>
                                    <option value="natwest">NatWest Group</option>
                                </select>
                            </div>
                            <p style={{ marginTop: "4px", fontSize: "12px", color: "#6b7280" }}>
                                Branch address will be populated automatically based on selection.
                            </p>
                        </div>

                        <div style={styles.full}>
                            <label style={styles.label}>
                                Branch Address <span style={{ color: "#ef4444" }}>*</span>
                            </label>
                            <textarea
                                value={formData.branchAddress}
                                readOnly
                                rows={2}
                                style={{
                                    ...styles.select,
                                    height: "auto",
                                    backgroundColor: "#f9fafb", // bg-gray-50
                                    resize: "none",
                                    color: "#6b7280",
                                }}
                            />
                        </div>

                        {/* Authorization Box */}
                        <div style={{ ...styles.full, ...styles.authBox }}>
                            <input
                                type="checkbox"
                                name="authorized"
                                checked={formData.authorized}
                                onChange={handleChange}
                                style={styles.checkbox}
                                required
                            />
                            <div style={styles.authContent}>
                                <label style={styles.authHeading}>
                                    Authorization Declaration <span style={{ color: "#ef4444" }}>*</span>
                                </label>
                                <p style={styles.authDesc}>
                                    By signing up to this form, I have authorised a recurring debit to my bank account.
                                </p>
                            </div>
                        </div>

                        <div>
                            <MyInput
                                label="Account Holder Name"
                                name="accountName"
                                value={formData.accountName}
                                onChange={handleChange}
                                required
                                placeholder="e.g. John Doe"
                            />
                        </div>

                        <div>
                            <MyInput
                                label="Account Number"
                                name="accountNumber"
                                value={formData.accountNumber}
                                onChange={handleChange}
                                required
                                placeholder="e.g. 12345678"
                            />
                        </div>

                        <div>
                            <MyInput
                                label="BIC (Swift Code)"
                                name="bic"
                                value={formData.bic}
                                onChange={handleChange}
                                placeholder="ABCDGB22"
                                style={{ textTransform: "uppercase" }}
                            />
                        </div>

                        <div>
                            <MyInput
                                label="IBAN"
                                name="iban"
                                value={formData.iban}
                                onChange={handleChange}
                                required
                                placeholder="GB29 ABCD 1234 5678 9012 34"
                                extra={<MdCreditCard size={18} color="#9ca3af" />}
                                style={{ letterSpacing: "0.05em", textTransform: "uppercase" }}
                            />
                        </div>

                        <div style={styles.divider}></div>

                        {/* Personal Details */}
                        <div style={styles.full}>
                            <MyInput
                                label="Personal Address"
                                name="personalAddress"
                                value={formData.personalAddress}
                                onChange={handleChange}
                                required
                                placeholder="Street, City, Postal Code"
                            />
                            <p style={{ marginTop: "4px", fontSize: "12px", color: "#6b7280" }}>
                                Pre-populated from member file.
                            </p>
                        </div>

                        <div>
                            <MyInput
                                label="Personal Telephone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                placeholder="+44 7700 900077"
                            />
                        </div>
                        <div>
                            <MyInput
                                label="Personal Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="member@example.com"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Section: Beneficiary */}
            <div style={styles.section}>
                <div style={{ ...styles.card, position: "relative", overflow: "hidden" }}>
                    {/* Decorative circle in top right (optional, matching HTML idea) */}
                    <div style={{
                        position: "absolute",
                        top: "-16px",
                        right: "-16px",
                        width: "96px",
                        height: "96px",
                        backgroundColor: "#f9fafb",
                        borderRadius: "50%",
                        zIndex: 0
                    }}></div>

                    <div style={{ ...styles.headerRow, position: "relative", zIndex: 1 }}>
                        <div style={styles.headerIcon("#9333ea", "rgba(147, 51, 234, 0.1)")}>
                            <MdStore size={22} />
                        </div>
                        <h2 style={styles.headerTitle}>Beneficiary (Receiver) Details</h2>
                    </div>

                    <div style={{ ...styles.fieldGrid, position: "relative", zIndex: 1 }}>
                        <div>
                            <label style={styles.label}>Account Name <span style={{ color: "#ef4444" }}>*</span></label>
                            <div style={styles.readOnlyBox}>Global Services Ltd.</div>
                        </div>
                        <div>
                            <label style={styles.label}>IBAN <span style={{ color: "#ef4444" }}>*</span></label>
                            <div style={{ ...styles.readOnlyBox, ...styles.readOnlyMono }}>GB12 CPBK 9876 5432 1098 76</div>
                        </div>
                        <div style={styles.full}>
                            <label style={styles.label}>Receiver Message (Reference)</label>
                            <div style={styles.readOnlyBox}>REF: MEM-2023-8849-X</div>
                        </div>

                        {/* Total Amount Section matching HTML */}
                        <div style={{ ...styles.full, marginTop: "8px" }}>
                            <label style={styles.label}>Total Amount</label>
                            <div style={styles.totalAmountContainer}>
                                <span style={styles.totalAmountText}>€45.00</span>
                                <span style={styles.totalBadge}>Monthly Recurring</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <p style={{
                textAlign: "center",
                fontSize: "12px",
                color: "#6b7280",
                marginTop: "24px"
            }}>
                Your data is securely processed in accordance with SEPA regulations.
            </p>
        </div >
    );
};

export default DirectDebitForm;
