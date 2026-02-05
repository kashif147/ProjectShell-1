import React from 'react';
import {
    Button,
    Row,
    Col,
    Switch,
    TimePicker,
    Input
} from 'antd';
import { EnvironmentOutlined, PlusOutlined, DeleteOutlined, LinkOutlined } from '@ant-design/icons';
import MyDrawer from '../common/MyDrawer';
import MyDatePicker1 from '../common/MyDatePicker1';
import '../../styles/ScheduleManagementDrawer.css';

const ScheduleManagementDrawer = ({ open, onClose, scheduleData, onSessionChange, onSave, onAddDay, onRemoveDay }) => {
    const headerActions = (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Button
                icon={<PlusOutlined />}
                onClick={onAddDay}
                style={{ borderRadius: '6px' }}
                title="Add New Day"
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
            title="Schedule Management"
            open={open}
            onClose={onClose}
            width={600}
            extra={headerActions}
        >
            <div className="schedule-management-container">
                {scheduleData.map((session, index) => (
                    <div key={session.id} className="day-card">
                        <div className="day-card-header">
                            <h4 className="day-title">{session.day}</h4>
                            <div className="status-toggle-container">
                                <span className={`status-label ${!session.isOnline ? 'active' : 'inactive'}`}>
                                    In-person
                                </span>
                                <Switch
                                    size="small"
                                    checked={session.isOnline}
                                    onChange={(checked) => onSessionChange(session.id, 'isOnline', checked)}
                                />
                                <span className={`status-label ${session.isOnline ? 'active' : 'inactive'}`}>
                                    Online
                                </span>
                                <DeleteOutlined
                                    className="delete-icon"
                                    onClick={() => onRemoveDay(session.id)}
                                    style={{ marginLeft: '8px', cursor: 'pointer', color: '#bfbfbf' }}
                                />
                            </div>
                        </div>

                        <div className="card-row">
                            <MyDatePicker1
                                label="Date"
                                value={session.date}
                                onChange={(date) => onSessionChange(session.id, 'date', date)}
                                format="DD/MM/YYYY"
                                isMarginBtm={false}
                            />
                        </div>

                        <Row gutter={16} className="card-row">
                            <Col span={12}>
                                <div>
                                    <label className="time-picker-label">Start Time</label>
                                    <TimePicker
                                        value={session.startTime}
                                        onChange={(time) => onSessionChange(session.id, 'startTime', time)}
                                        format="HH:mm"
                                        style={{ width: '100%' }}
                                        placeholder="00:00"
                                    />
                                </div>
                            </Col>
                            <Col span={12}>
                                <div>
                                    <label className="time-picker-label">End Time</label>
                                    <TimePicker
                                        value={session.endTime}
                                        onChange={(time) => onSessionChange(session.id, 'endTime', time)}
                                        format="HH:mm"
                                        style={{ width: '100%' }}
                                        placeholder="00:00"
                                    />
                                </div>
                            </Col>
                        </Row>

                        {session.isOnline ? (
                            <div className="location-input-container">
                                <label className="location-label">Meeting Link</label>
                                <Input
                                    prefix={<LinkOutlined style={{ color: '#bfbfbf' }} />}
                                    value={session.zoomLink}
                                    onChange={(e) => onSessionChange(session.id, 'zoomLink', e.target.value)}
                                    placeholder="Enter Zoom, Teams or Google Meet link"
                                />
                            </div>
                        ) : (
                            <div className="location-input-container">
                                <label className="location-label">Location</label>
                                <Input
                                    prefix={<EnvironmentOutlined style={{ color: '#bfbfbf' }} />}
                                    value={session.location}
                                    onChange={(e) => onSessionChange(session.id, 'location', e.target.value)}
                                    placeholder="Enter physical address or venue"
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </MyDrawer>
    );
};

export default ScheduleManagementDrawer;
