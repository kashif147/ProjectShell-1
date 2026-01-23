import React, { useState } from 'react';
import { Drawer, Checkbox, Button, Row, Col } from 'antd';
import { CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import '../../styles/MyDrawer.css';
import '../../styles/MergeConfirmation.css';

const MergeConfirmation = ({ open, onClose, onConfirm, primaryMember, secondaryMember }) => {
    const [confirmed, setConfirmed] = useState(false);

    const handleConfirm = () => {
        if (confirmed) {
            onConfirm();
            setConfirmed(false);
        }
    };

    const handleCancel = () => {
        setConfirmed(false);
        onClose();
    };

    return (
        <Drawer
            title={
                <div>
                    <h2 className="merge-drawer-title">
                        Confirm Member Record Merge
                    </h2>
                    <p className="merge-drawer-subtitle">
                        This action is permanent and will be logged for auditing purposes.
                    </p>
                </div>
            }
            open={open}
            onClose={handleCancel}
            width={900}
            styles={{ body: { padding: '24px' } }}
            extra={
                <Button
                    type="primary"
                    className="butn primary-btn"
                    onClick={handleConfirm}
                    disabled={!confirmed}
                >
                    Confirm merge
                </Button>
            }
        >
            <div className="merge-confirmation-content pe-4 ps-4">
                {/* Member Records */}
                <div className="merge-member-records">
                    <Row gutter={24} style={{ width: '100%' }}>
                        <Col span={12}>
                            <div className="merge-member-column">
                                <h3 className="merge-member-title">
                                    Primary Member Record
                                </h3>
                                <div className="merge-member-details">
                                    <div className="merge-detail-row">
                                        <span className="merge-detail-label">Member ID</span>
                                        <span className="merge-detail-value">
                                            {primaryMember?.membershipNo || 'M-185209'}
                                        </span>
                                    </div>
                                    <div className="merge-detail-row">
                                        <span className="merge-detail-label">Status</span>
                                        <span className="merge-detail-value merge-status-active">Active</span>
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col span={12}>
                            <div className="merge-member-column">
                                <h3 className="merge-member-title">
                                    Secondary Member Record
                                </h3>
                                <div className="merge-member-details">
                                    <div className="merge-detail-row">
                                        <span className="merge-detail-label">Member ID</span>
                                        <span className="merge-detail-value">
                                            {secondaryMember?.membershipNo || 'M-198345'}
                                        </span>
                                    </div>
                                    <div className="merge-detail-row">
                                        <span className="merge-detail-label">Status</span>
                                        <span className="merge-detail-value merge-status-inactive">Inactive</span>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>

                {/* Impact Summary */}
                <div className="merge-impact-section">
                    <h3 className="merge-section-title">
                        Impact Summary
                    </h3>
                    <div className="merge-impact-list">
                        {[
                            'All subscriptions from the secondary record will be reassigned to the primary record.',
                            'Financial transactions will remain unchanged.',
                            'Balances will be recalculated.',
                            'Secondary record will be archived and made read-only.'
                        ].map((text, index) => (
                            <div key={index} className="merge-impact-item">
                                <CheckCircleOutlined className="merge-impact-icon" />
                                <span className="merge-impact-text">{text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Warning */}
                <div className="merge-warning-box">
                    <div className="merge-warning-header">
                        <WarningOutlined className="merge-warning-icon" />
                        <h4 className="merge-warning-title">
                            Conflict Detected
                        </h4>
                    </div>
                    <p className="merge-warning-text">
                        Overlapping active subscriptions identified. The overlapping period will be converted to account credit.
                    </p>
                </div>

                {/* Confirmation Checkbox */}
                <div className="merge-confirmation-checkbox">
                    <Checkbox
                        checked={confirmed}
                        onChange={(e) => setConfirmed(e.target.checked)}
                    >
                        <span className="merge-checkbox-label">
                            I confirm that I have reviewed this merge and understand its impact on member and financial data.
                        </span>
                    </Checkbox>
                </div>
            </div>
        </Drawer>
    );
};

export default MergeConfirmation;
