import React from 'react';
import { FaRegBell, FaCodeBranch } from 'react-icons/fa';

const MergeAndReview = ({ onBack, primaryMember, secondaryMember }) => {
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



    // Inline styles object
    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 140px)', // Adjusted to account for existing headers/padding
            overflow: 'hidden',
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
            padding: '32px 40px',
            maxWidth: '1280px',
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
            flexWrap: 'wrap'
        },
        column: {
            flex: 1,
            minWidth: '350px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            backgroundColor: '#fff',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
        },
        columnHeader: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        },
        columnTitle: {
            fontSize: '18px',
            fontWeight: '700',
            color: '#111827',
            margin: 0
        },
        columnSubtitle: {
            fontSize: '14px',
            color: '#6b7280',
            margin: 0
        },
        fieldGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
        },
        fieldContainer: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        },
        fieldLabel: {
            fontSize: '14px',
            fontWeight: '500',
            color: '#4b5563',
            margin: 0
        },
        radioCard: {
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '16px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: '#fff'
        },
        radioCardSelected: {
            backgroundColor: 'rgba(19, 91, 236, 0.05)',
            borderColor: '#135bec'
        },
        radioInput: {
            height: '20px',
            width: '20px',
            accentColor: '#135bec',
            cursor: 'pointer'
        },
        radioLabelContainer: {
            flex: 1,
            cursor: 'pointer'
        },
        radioValue: {
            fontWeight: '500',
            color: '#111827',
            margin: 0
        },
        retainText: {
            fontSize: '14px',
            color: '#135bec',
            display: 'block',
            marginTop: '2px'
        },
        sectionHeader: {
            fontSize: '18px',
            fontWeight: '700',
            color: '#111827',
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
        },
        footer: {
            width: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderTop: '1px solid #e5e7eb',
            padding: '16px 40px',
            backdropFilter: 'blur(4px)',
            boxSizing: 'border-box',
            flexShrink: 0
        },
        footerContent: {
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '16px'
        },
        cancelButton: {
            height: '48px',
            padding: '0 24px',
            backgroundColor: '#f3f4f6',
            color: '#111827',
            fontSize: '16px',
            fontWeight: '700',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
        },
        mergeButton: {
            height: '48px',
            padding: '0 24px',
            backgroundColor: '#135bec',
            color: '#fff',
            fontSize: '16px',
            fontWeight: '700',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
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
            {/* Header */}
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <div style={styles.logoContainer}>
                        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" style={{ width: '24px', height: '24px' }}>
                            <g clipPath="url(#clip0_6_535)">
                                <path clipRule="evenodd" d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z" fill="#135bec" fillRule="evenodd"></path>
                            </g>
                            <defs>
                                <clipPath id="clip0_6_535">
                                    <rect fill="white" height="48" width="48"></rect>
                                </clipPath>
                            </defs>
                        </svg>
                    </div>
                    <h2 style={styles.headerTitle}>Membership Management</h2>
                </div>
                <div style={styles.headerRight}>
                    <div style={styles.buttonGroup}>
                        <button style={styles.helpButton}>Help</button>
                        <button style={styles.settingsButton}>Settings</button>
                        <button style={styles.iconButton}>
                            <FaRegBell />
                        </button>
                    </div>
                    <div style={styles.avatar}></div>
                </div>
            </header>

            {/* Main Content */}
            <main style={styles.main}>
                <div style={styles.pageTitleContainer}>
                    <h1 style={styles.pageTitle}>Merge Profiles Side-by-Side</h1>
                    <p style={styles.pageSubtitle}>Review the conflicting information and select the values to keep in the final merged profile.</p>
                </div>

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

            {/* Footer */}
            <footer style={styles.footer}>
                <div style={styles.footerContent}>
                    <button onClick={onBack} style={styles.cancelButton}>
                        Cancel
                    </button>
                    <button style={styles.mergeButton}>
                        <FaCodeBranch />
                        Merge Profiles
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default MergeAndReview;
