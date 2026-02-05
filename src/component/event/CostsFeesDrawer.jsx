import React from 'react';
import {
    Button,
    Row,
    Col,
    Empty
} from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import MyDrawer from '../common/MyDrawer';
import MyInput from '../common/MyInput';
import '../../styles/CostsFeesDrawer.css';

const CostsFeesDrawer = ({ open, onClose, costsData, onCostChange, onAddCost, onRemoveCost, onSave }) => {
    const totalEstimatedCost = costsData.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

    const headerActions = (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Button
                icon={<PlusOutlined />}
                onClick={onAddCost}
                style={{ borderRadius: '6px' }}
                title="Add New Cost"
            />
            <Button
                type="primary"
                onClick={onSave}
                style={{ width: '100px', backgroundColor: '#215E97', borderColor: '#215E97' }}
            >
                Done
            </Button>
        </div>
    );

    return (
        <MyDrawer
            title="Costs & Fees"
            open={open}
            onClose={onClose}
            width={600}
            extra={headerActions}
            rootClassName="hide-scroll-webkit"
        >
            <div className="costs-fees-container">
                <div className="costs-list hide-scroll-webkit">
                    {costsData.length === 0 ? (
                        <div className="empty-costs-state">
                            <Empty
                                description={<span className="empty-text">Please add cost</span>}
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        </div>
                    ) : (
                        costsData.map((item) => (
                            <div key={item.id} className="cost-card">
                                <Row gutter={16} align="top">
                                    <Col span={14}>
                                        <MyInput
                                            label="Item name"
                                            name={`cost-name-${item.id}`}
                                            value={item.name}
                                            onChange={(e) => onCostChange(item.id, 'name', e.target.value)}
                                            placeholder="e.g. Marketing"
                                        />
                                    </Col>
                                    <Col span={8}>
                                        <MyInput
                                            label="Amount"
                                            name={`cost-amount-${item.id}`}
                                            value={item.amount}
                                            onChange={(e) => onCostChange(item.id, 'amount', e.target.value)}
                                            placeholder="0.00"
                                            prefix="€"
                                        />
                                    </Col>
                                    <Col span={2} className="delete-icon-col">
                                        <DeleteOutlined
                                            className="cost-delete-icon"
                                            onClick={() => onRemoveCost(item.id)}
                                            style={{ color: '#ff4d4f' }}
                                        />
                                    </Col>
                                </Row>
                            </div>
                        ))
                    )}
                </div>

                {costsData.length > 0 && (
                    <div className="costs-footer">
                        <Row gutter={16} align="middle">
                            <Col span={14}>
                                <span className="total-label">Total cost</span>
                            </Col>
                            <Col span={8} className="amount-col">
                                <span className="total-amount">€{totalEstimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </Col>
                            <Col span={2}></Col>
                        </Row>
                    </div>
                )}
            </div>
        </MyDrawer>
    );
};

export default CostsFeesDrawer;
