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

const ScheduleManagementDrawer = ({
    open,
    onClose,
    scheduleData,
    onDayChange,
    onSessionTimeChange,
    onSave,
    onAddDay,
    onRemoveDay,
    onAddSessionToDay,
    onRemoveSession,
    allowAddDay = false,
}) => {
    const headerActions = (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {allowAddDay && (
                <Button
                    icon={<PlusOutlined />}
                    onClick={onAddDay}
                    style={{ borderRadius: '6px' }}
                    title="Add New Day"
                />
            )}
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
            rootClassName="hide-scroll-webkit"
        >
            <div className="schedule-management-container hide-scroll-webkit">
                {scheduleData.map((day) => (
                    <div key={day.id} className="day-card">
                        <div className="day-card-header">
                            <h4 className="day-title">{day.day}</h4>
                            <div className="status-toggle-container">
                                <span className={`status-label ${!day.isOnline ? 'active' : 'inactive'}`}>
                                    In-person
                                </span>
                                <Switch
                                    size="small"
                                    checked={day.isOnline}
                                    onChange={(checked) => onDayChange(day.id, 'isOnline', checked)}
                                />
                                <span className={`status-label ${day.isOnline ? 'active' : 'inactive'}`}>
                                    Online
                                </span>
                                {scheduleData.length > 1 && (
                                    <DeleteOutlined
                                        className="delete-icon"
                                        onClick={() => onRemoveDay(day.id)}
                                        style={{ marginLeft: '8px', cursor: 'pointer', color: '#bfbfbf' }}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="card-row">
                            <MyDatePicker1
                                label="Date"
                                value={day.date}
                                onChange={(date) => onDayChange(day.id, 'date', date)}
                                format="DD/MM/YYYY"
                                isMarginBtm={false}
                            />
                        </div>

                        {(day.sessions || []).map((session, sessionIndex) => (
                            <Row gutter={16} key={session.id} className="card-row session-row">
                                <Col span={10}>
                                    <div>
                                        <label className="time-picker-label">Start Time</label>
                                        <TimePicker
                                            value={session.startTime}
                                            onChange={(time) => onSessionTimeChange(day.id, session.id, 'startTime', time)}
                                            format="HH:mm"
                                            minuteStep={15}
                                            style={{ width: '100%' }}
                                            placeholder="00:00"
                                        />
                                    </div>
                                </Col>
                                <Col span={10}>
                                    <div>
                                        <label className="time-picker-label">End Time</label>
                                        <TimePicker
                                            value={session.endTime}
                                            onChange={(time) => onSessionTimeChange(day.id, session.id, 'endTime', time)}
                                            format="HH:mm"
                                            minuteStep={15}
                                            style={{ width: '100%' }}
                                            placeholder="00:00"
                                        />
                                    </div>
                                </Col>
                                <Col span={4} style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '4px' }}>
                                    {(day.sessions?.length ?? 0) > 1 && (
                                        <DeleteOutlined
                                            className="delete-icon"
                                            onClick={() => onRemoveSession(day.id, session.id)}
                                            style={{ cursor: 'pointer', color: '#bfbfbf', fontSize: '16px' }}
                                            title="Remove session"
                                        />
                                    )}
                                </Col>
                            </Row>
                        ))}

                        <div className="card-row">
                            <Button
                                type="dashed"
                                icon={<PlusOutlined />}
                                onClick={() => onAddSessionToDay(day.id)}
                                style={{ width: '100%' }}
                            >
                                Add session (same day)
                            </Button>
                        </div>

                        {day.isOnline ? (
                            <div className="location-input-container">
                                <label className="location-label">Meeting Link</label>
                                <Input
                                    prefix={<LinkOutlined style={{ color: '#bfbfbf' }} />}
                                    value={day.zoomLink}
                                    onChange={(e) => onDayChange(day.id, 'zoomLink', e.target.value)}
                                    placeholder="Enter Zoom, Teams or Google Meet link"
                                />
                            </div>
                        ) : (
                            <div className="location-input-container">
                                <label className="location-label">Location</label>
                                <Input
                                    prefix={<EnvironmentOutlined style={{ color: '#bfbfbf' }} />}
                                    value={day.location}
                                    onChange={(e) => onDayChange(day.id, 'location', e.target.value)}
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
