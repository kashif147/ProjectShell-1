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

    // The submit logic will be triggered by the parent drawer's "Add" button 
    // if we expose a submit method, or by the parent handling the data.
    // For now, we keep the form state managed here.

    const styles = {
        formContainer: {
            padding: "10px 15px",
            fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
            color: "#1f2937",
        },
        section: {
            marginBottom: "32px",
        },
        headerRow: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
        },
        headerTitleContainer: {
            display: "flex",
            alignItems: "center",
            gap: "12px",
        },
        headerIcon: (color, bg) => ({
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: bg,
            color: color,
            boxShadow: `0 4px 12px ${bg}`,
        }),
        headerTitle: {
            fontSize: "18px",
            fontWeight: "700",
            margin: 0,
            color: "#111827",
            letterSpacing: "-0.02em",
        },
        badge: {
            fontSize: "11px",
            fontWeight: "700",
            padding: "4px 10px",
            borderRadius: "20px",
            backgroundColor: "#f3f4f6",
            color: "#4b5563",
            textTransform: "uppercase",
        },
        card: {
            backgroundColor: "#ffffff",
            padding: "24px",
            borderRadius: "20px",
            border: "1px solid #f1f5f9",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.04), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
        },
        fieldGrid: {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
        },
        full: {
            gridColumn: "span 2",
        },
        label: {
            display: "block",
            fontSize: "13px",
            fontWeight: "600",
            color: "#64748b",
            marginBottom: "6px",
            display: "flex",
            justifyContent: "space-between",
        },
        select: {
            width: "100%",
            padding: "12px 14px",
            borderRadius: "10px",
            border: "1.5px solid #e2e8f0",
            fontSize: "14px",
            color: "#1e293b",
            backgroundColor: "#fff",
            transition: "all 0.3s ease",
            outline: "none",
            appearance: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 14px center",
            backgroundSize: "16px",
        },
        infoNote: {
            display: "flex",
            gap: "10px",
            padding: "12px 16px",
            backgroundColor: "#f8fafc",
            borderRadius: "12px",
            marginTop: "12px",
            border: "1px dashed #cbd5e1",
        },
        infoNoteText: {
            fontSize: "12px",
            color: "#475569",
            margin: 0,
            lineHeight: "1.5",
        },
        authSection: {
            backgroundColor: "#f0fdf4",
            border: "1px solid #dcfce7",
            borderRadius: "16px",
            padding: "20px",
            marginTop: "0px",
            display: "flex",
            gap: "16px",
        },
        checkbox: {
            width: "20px",
            height: "20px",
            borderRadius: "6px",
            border: "2px solid #22c55e",
            cursor: "pointer",
            accentColor: "#22c55e",
            marginTop: "2px",
        },
        authHeading: {
            fontSize: "14px",
            fontWeight: "700",
            color: "#166534",
            marginBottom: "4px",
            display: "block",
        },
        authDesc: {
            fontSize: "12px",
            color: "#15803d",
            opacity: 0.9,
            margin: 0,
        },
        summaryGrid: {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
        },
        summaryField: {
            display: "flex",
            flexDirection: "column",
            gap: "4px",
        },
        summaryLabel: {
            fontSize: "11px",
            fontWeight: "700",
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "0.025em",
        },
        summaryBox: {
            padding: "12px 16px",
            backgroundColor: "#f8fafc",
            borderRadius: "12px",
            border: "1px solid #f1f5f9",
            fontSize: "14px",
            fontWeight: "600",
            color: "#334155",
        },
        paymentCard: {
            marginTop: "24px",
            padding: "24px",
            borderRadius: "20px",
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            color: "#f8fafc",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        },
        amountDisplay: {
            fontSize: "36px",
            fontWeight: "800",
            color: "#fff",
            letterSpacing: "-0.03em",
        },
        subLabel: {
            fontSize: "12px",
            color: "#94a3b8",
            fontWeight: "500",
        },
        lockIcon: {
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "12px",
            fontWeight: "700",
            color: "#22c55e",
            textTransform: "uppercase",
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            padding: "6px 12px",
            borderRadius: "20px",
        }
    };

    return (
        <div style={styles.formContainer}>
            {/* Member Selection Section */}
            <div style={styles.section}>
                <div style={styles.headerRow}>
                    {/* <div style={styles.headerTitleContainer}>

                        <h2 style={styles.headerTitle}>Member Lookup</h2>
                    </div> */}
                </div>
                <div style={styles.card}>
                    <label style={styles.label}>Search and select a member to initiate mandate</label>
                    <MemberSearch
                        fullWidth={true}
                        onSelectBehavior="callback"
                        onSelectCallback={handleMemberSelect}
                        onClear={handleClearMember}
                    />
                    {/* {selectedMember && (
                        <div style={{
                            marginTop: "16px",
                            padding: "16px",
                            backgroundColor: "#f0f9ff",
                            borderRadius: "12px",
                            border: "1px solid #bae6fd",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px"
                        }}>
                            <div style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                backgroundColor: "#3b82f6",
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyCenter: "center",
                                display: "flex",
                                justifyContent: "center"
                            }}>
                                <MdPerson size={24} style={{ marginTop: "8px" }} />
                            </div>
                            <div>
                                <div style={{ fontSize: "14px", fontWeight: "700", color: "#0369a1" }}>
                                    {selectedMember.personalInfo?.forename} {selectedMember.personalInfo?.surname}
                                </div>
                                <div style={{ fontSize: "12px", color: "#0ea5e9" }}>
                                    Membership No: {selectedMember.membershipNumber}
                                </div>
                            </div>
                        </div>
                    )} */}
                </div>
            </div>

            {/* Section: Your Account */}
            <div style={styles.section}>
                <div style={styles.headerRow}>
                    <div style={styles.headerTitleContainer}>
                        <div style={styles.headerIcon("#3b82f6", "rgba(59, 130, 246, 0.1)")}>
                            <MdAccountBalance size={24} />
                        </div>
                        <h2 style={styles.headerTitle}>Account Verification</h2>
                    </div>
                    <span style={styles.badge}>Step 01/02</span>
                </div>

                <div style={styles.card}>
                    <div style={styles.fieldGrid}>
                        <div style={styles.full}>
                            <label style={styles.label}>
                                <span>Bank</span>
                                <span style={{ color: "#ef4444" }}>* Required</span>
                            </label>
                            <select
                                name="bankName"
                                value={formData.bankName}
                                onChange={handleChange}
                                style={styles.select}
                            >
                                <option value="">Search banks in system...</option>
                                <option value="hsbc">HSBC Bank PLC</option>
                                <option value="barclays">Barclays Bank UK</option>
                                <option value="lloyds">Lloyds Banking Group</option>
                            </select>
                            {/* <div style={styles.infoNote}>
                                <MdOutlineInfo size={18} style={{ color: "#3b82f6", flexShrink: 0 }} />
                                <p style={styles.infoNoteText}>
                                    Your branch address will be automatically resolved from the central banking directory upon selection.
                                </p>
                            </div> */}
                        </div>

                        <div style={styles.full}>
                            <MyInput
                                label="Registered Branch Address"
                                name="branchAddress"
                                type="textarea"
                                value={formData.branchAddress}
                                onChange={handleChange}
                                disabled
                                rows={2}
                            />
                        </div>

                        <div style={styles.full}>
                            <div style={styles.authSection}>
                                <input
                                    type="checkbox"
                                    name="authorized"
                                    checked={formData.authorized}
                                    onChange={handleChange}
                                    style={styles.checkbox}
                                    required
                                />
                                <div>
                                    <span style={styles.authHeading}>Authorization Declaration</span>
                                    <p style={styles.authDesc}>
                                        By signing up to this form, I have authorised a recurring debit to my bank account.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <MyInput
                                label="Account Holder Name"
                                name="accountName"
                                value={formData.accountName}
                                onChange={handleChange}
                                required
                                placeholder="e.g. ALEX MORGAN"
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
                                placeholder="BKCHGB2L"
                            />
                        </div>

                        <div style={styles.full}>
                            <MyInput
                                label="IBAN (International Bank Account Number)"
                                name="iban"
                                value={formData.iban}
                                onChange={handleChange}
                                required
                                placeholder="GB29 1234 5678..."
                                extra={<MdCreditCard size={20} color="#94a3b8" />}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Section: Beneficiary */}
            <div style={styles.section}>
                <div style={styles.headerRow}>
                    <div style={styles.headerTitleContainer}>
                        <div style={styles.headerIcon("#8b5cf6", "rgba(139, 92, 246, 0.1)")}>
                            <MdStore size={24} />
                        </div>
                        <h2 style={styles.headerTitle}>Beneficiary Details</h2>
                    </div>
                    <span style={styles.badge}>Step 02/02</span>
                </div>

                <div style={styles.card}>
                    <div style={styles.summaryGrid}>
                        <div style={styles.summaryField}>
                            <span style={styles.summaryLabel}>Entity Name</span>
                            <div style={styles.summaryBox}>Global Services Collective Limited</div>
                        </div>
                        <div style={styles.summaryField}>
                            <span style={styles.summaryLabel}>Creditor Identifier</span>
                            <div style={styles.summaryBox}>IE00ZZZ998877</div>
                        </div>
                        <div style={styles.full}>
                            <div style={styles.summaryField}>
                                <span style={styles.summaryLabel}>SEPA Reference</span>
                                <div style={{ ...styles.summaryBox, fontPadding: '12px', background: '#f1f5f9' }}>
                                    MEM-PAY-AUTH-2023-SECURE
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={styles.paymentCard}>
                        <div>
                            <div style={styles.subLabel}>Recurring Monthly Charge</div>
                            <div style={styles.amountDisplay}>€45.00</div>
                        </div>
                        <div style={styles.lockIcon}>
                            <MdVerifiedUser size={16} />
                            Secure SEPA
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer text (optional enhancements) */}
            <p style={{
                textAlign: "center",
                fontSize: "12px",
                color: "#94a3b8",
                marginTop: "20px",
                fontWeight: "500"
            }}>
                All authorizations are processed through an encrypted layer.
                Your mandate is stored according to SEPA compliance standards.
            </p>
        </div>
    );
};

export default DirectDebitForm;
