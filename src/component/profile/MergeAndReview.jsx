import React, { useState, useEffect } from 'react';
import { FaRegBell, FaCodeBranch } from 'react-icons/fa';
import { Button } from 'antd';
import '../../styles/MyDrawer.css';
import MergeConfirmation from './MergeConfirmation';

const MergeAndReview = ({ onBack, primaryMember, secondaryMember, onMergeClick }) => {
    // Default data if props are not provided (matching the HTML static content)
    const primary = primaryMember || {
        name: "Johnathan Doe",
        dob: "January 15, 1985",
        email: "johnathan.doe@email.com",
        phone: "(123) 456-7890",
        address: "123 Main St, Anytown, USA 12345",
        workLocation: "Headquarters",
        branch: "North",
        region: "East Coast",
        section: "Technology",
        lastUpdated: "2 days ago"
    };

    const secondary = secondaryMember || {
        name: "Jon Doe",
        dob: "01/15/1985",
        email: "jondoe@email.com",
        phone: "(987) 654-3210",
        address: "456 Oak Ave, Suite 200, Someplace, USA 67890",
        workLocation: "Remote",
        branch: "Central",
        region: "Midwest",
        section: "Engineering",
        lastUpdated: "1 month ago"
    };

    const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);

    const handleMergeClick = () => {
        setIsMergeModalOpen(true);
    };

    const handleMergeConfirm = () => {
        console.log('Merge confirmed!');
        // Add your merge logic here
        setIsMergeModalOpen(false);
        if (onBack) onBack();
    };

    // Expose handleMergeClick to parent via onMergeClick prop
    useEffect(() => {
        if (onMergeClick) {
            onMergeClick(handleMergeClick);
        }
    }, [onMergeClick]);



    // Inline styles object
    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
            backgroundColor: '#f9fafb',
            fontFamily: 'sans-serif',
            color: '#1f2937'
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 40px',
            backgroundColor: '#fff',
            borderBottom: '1px solid #e5e7eb',
            whiteSpace: 'nowrap'
        },
        headerLeft: {
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
        },
        logoContainer: {
            width: '24px',
            height: '24px',
            color: '#135bec'
        },
        headerTitle: {
            fontSize: '18px',
            fontWeight: '700',
            color: '#111827',
            margin: 0
        },
        headerRight: {
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
        },
        buttonGroup: {
            display: 'flex',
            gap: '8px'
        },
        helpButton: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '40px',
            padding: '0 16px',
            backgroundColor: 'rgba(19, 91, 236, 0.1)',
            color: '#135bec',
            fontSize: '14px',
            fontWeight: '700',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
        },
        settingsButton: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '40px',
            padding: '0 16px',
            backgroundColor: '#f3f4f6',
            color: '#111827',
            fontSize: '14px',
            fontWeight: '700',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
        },
        iconButton: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '40px',
            width: '40px',
            backgroundColor: '#f3f4f6',
            color: '#111827',
            fontSize: '18px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
        },
        avatar: {
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCsP3FWPky7kSwvIh9crAB6nPH1hp2LvKlrjFUT7128gTBNRxDZ5UvoLgwhAEd-mJ50DBmFwc4a9EcyK6EcMp6Awtwbq3IEhBra9LCE8gR2MwwySa_CzrZrntXixlRN-9VerqWQZQeAQVPGPvL4lCnRIJhG2W4gsl2pdEqf0nuIxBvArp-q5BfNsUvIbzwbmmYQmbkH-vkqzEYFzX3bCX6KKMBEaeJ-M6ymoj7mIZ_FrHAMAFYVH2conLmSVA0kLw1cw5ydT2SJ1xkB")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        },
        main: {
            flex: 1,
            padding: '24px',
            maxWidth: '100%',
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box',
            overflowY: 'auto'
        },
        pageTitleContainer: {
            marginBottom: '32px'
        },
        pageTitle: {
            fontSize: '36px',
            fontWeight: '900',
            color: '#111827',
            margin: '0 0 12px 0'
        },
        pageSubtitle: {
            fontSize: '16px',
            color: '#6b7280',
            margin: 0
        },
        grid: {
            display: 'flex',
            gap: '32px',
            flexWrap: 'nowrap'
        },
        column: {
            flex: '1 1 calc(50% - 16px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
        },
        columnHeader: {
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
        },
        columnTitle: {
            fontSize: '18px',
            fontWeight: '500',
            color: '#1a1a1a',
            margin: 0
        },
        columnSubtitle: {
            fontSize: '14px',
            fontWeight: '400',
            color: '#666',
            margin: 0,
            marginTop: '4px'
        },
        fieldGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        },
        fieldContainer: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        },
        fieldLabel: {
            fontSize: '14px',
            fontWeight: '500',
            color: '#666',
            margin: 0
        },
        radioCard: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            backgroundColor: '#fff',
            transition: 'all 0.2s ease'
        },
        radioCardSelected: {
            backgroundColor: 'rgba(19, 91, 236, 0.05)',
            borderColor: '#135bec'
        },
        radioInput: {
            height: '18px',
            width: '18px',
            accentColor: '#135bec',
            cursor: 'pointer',
            flexShrink: 0
        },
        radioLabelContainer: {
            flex: 1,
            cursor: 'pointer'
        },
        radioValue: {
            fontWeight: '400',
            fontSize: '14px',
            color: '#1a1a1a',
            margin: 0,
            lineHeight: '1.5'
        },
        retainText: {
            fontSize: '12px',
            color: '#666',
            display: 'block',
            marginTop: '2px',
            lineHeight: '1.4'
        },
        sectionHeader: {
            fontSize: '18px',
            fontWeight: '500',
            color: '#1a1a1a',
            paddingBottom: '12px',
            borderBottom: '1px solid #e5e7eb',
            marginBottom: '16px',
            marginTop: '0'
        },
        subsRow: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        statusActive: {
            color: '#16a34a',
            fontWeight: '600'
        },
        statusExpired: {
            color: '#ea580c',
            fontWeight: '600'
        }
    };

    const renderRadioField = (label, name, value, isPrimary) => (
        <div style={styles.fieldContainer}>
            <p style={styles.fieldLabel}>{label}</p>
            <div style={{ ...styles.radioCard, ...(isPrimary ? styles.radioCardSelected : {}) }}>
                <input
                    style={styles.radioInput}
                    id={`${name}_${isPrimary ? 'primary' : 'secondary'}`}
                    name={`${name}_option`}
                    type="radio"
                    defaultChecked={isPrimary}
                />
                <label style={styles.radioLabelContainer} htmlFor={`${name}_${isPrimary ? 'primary' : 'secondary'}`}>
                    <p style={styles.radioValue}>{value}</p>
                    <span style={styles.retainText}>{isPrimary ? 'Retain value' : 'Replace primary value'}</span>
                </label>
            </div>
        </div>
    );

    return (
        <div style={styles.container}>
            {/* Main Content */}
            <main style={styles.main}>
                {/* <div style={styles.pageTitleContainer}>
                    <h1 style={styles.pageTitle}>Merge Profiles Side-by-Side</h1>
                    <p style={styles.pageSubtitle}>Review the conflicting information and select the values to keep in the final merged profile.</p>
                </div> */}

                <div style={styles.grid}>
                    {/* Column 1: Primary Candidate */}
                    <div style={styles.column}>
                        <div style={styles.columnHeader}>
                            <h3 style={styles.columnTitle}>Primary candidate (recommended)</h3>
                            <p style={styles.columnSubtitle}>{primary.name}, last updated {primary.lastUpdated}</p>
                        </div>

                        <div style={styles.fieldGroup}>
                            {renderRadioField('Full Name', 'name', primary.name, true)}
                            {renderRadioField('Date of Birth', 'dob', primary.dob, true)}
                            {renderRadioField('Email', 'email', primary.email, true)}
                            {renderRadioField('Phone', 'phone', primary.phone, true)}
                            {renderRadioField('Address', 'address', primary.address, false)}
                            {renderRadioField('Work Location', 'work_location', primary.workLocation, false)}
                            {renderRadioField('Branch', 'branch', primary.branch, true)}
                            {renderRadioField('Region', 'region', primary.region, true)}
                            {renderRadioField('Primary Section', 'section', primary.section, false)}
                        </div>

                        <div>
                            <h3 style={styles.sectionHeader}>Subscriptions</h3>
                            <div style={styles.subsRow}>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 500, color: '#111827' }}>Premium Membership</p>
                                    <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Status: <span style={styles.statusActive}>Active</span></p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ margin: 0, fontWeight: 500, color: '#111827' }}>$0.00</p>
                                    <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Balance</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Secondary Candidate */}
                    <div style={styles.column}>
                        <div style={styles.columnHeader}>
                            <h3 style={styles.columnTitle}>Secondary candidate</h3>
                            <p style={styles.columnSubtitle}>{secondary.name}, last updated {secondary.lastUpdated}</p>
                        </div>

                        <div style={styles.fieldGroup}>
                            {renderRadioField('Full Name', 'name', secondary.name, false)}
                            {renderRadioField('Date of Birth', 'dob', secondary.dob, false)}
                            {renderRadioField('Email', 'email', secondary.email, false)}
                            {renderRadioField('Phone', 'phone', secondary.phone, false)}
                            {renderRadioField('Address', 'address', secondary.address, true)}
                            {/* Note: In the original HTML, different fields were pre-selected. I'm mirroring that logic roughly here. */}
                            {renderRadioField('Work Location', 'work_location', secondary.workLocation, true)}
                            {renderRadioField('Branch', 'branch', secondary.branch, false)}
                            {renderRadioField('Region', 'region', secondary.region, false)}
                            {renderRadioField('Primary Section', 'section', secondary.section, true)}
                        </div>

                        <div>
                            <h3 style={styles.sectionHeader}>Subscriptions</h3>
                            <div style={styles.subsRow}>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 500, color: '#111827' }}>Standard Membership</p>
                                    <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Status: <span style={styles.statusExpired}>Expired</span></p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ margin: 0, fontWeight: 500, color: '#111827' }}>$25.00</p>
                                    <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Balance</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <MergeConfirmation
                open={isMergeModalOpen}
                onClose={() => setIsMergeModalOpen(false)}
                onConfirm={handleMergeConfirm}
                primaryMember={primary}
                secondaryMember={secondary}
            />
        </div>
    );
};

export default MergeAndReview;
