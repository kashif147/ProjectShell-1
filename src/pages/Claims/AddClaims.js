
import React from 'react';
import { Row, Col, Input, DatePicker, Button, Checkbox } from 'antd';

const { TextArea } = Input;
function AddClaims() {
    const handleCancel = () => {
        console.log("Cancelled");
      };
    
      const handleSubmit = () => {
        console.log("Submitted");
      };
    
      return (
        <>
          <Row gutter={10}>
            {/* Claim Date */}
            <Col span={6}>
              <label>Claim Date</label>
              <DatePicker style={{ width: '100%' }} />
            </Col>
    
            {/* Claim Type */}
            <Col span={6}>
              <label>Claim Type</label>
              <Input placeholder="Enter claim type" />
            </Col>
    
            {/* Start Date */}
            <Col span={6}>
              <label>Start Date</label>
              <DatePicker style={{ width: '100%' }} />
            </Col>
    
            {/* End Date */}
            <Col span={6}>
              <label>End Date</label>
              <DatePicker style={{ width: '100%' }} />
            </Col>
    
            {/* Number of Days */}
            <Col span={6}>
              <label>Number of Days</label>
              <Input type="number" placeholder="Enter number of days" />
            </Col>
    
            {/* Pay Amount */}
            <Col span={6}>
              <label>Pay Amount</label>
              <Input type="number" placeholder="Enter pay amount" />
            </Col>
    
            {/* Cheque No */}
            <Col span={6}>
              <label>Cheque No</label>
              <Input placeholder="Enter cheque number" />
            </Col>
    
            {/* Description */}
            <Col span={6}>
              <label>Description</label>
              <TextArea rows={2} placeholder="Enter description" />
            </Col>
    
            {/* Checkbox Example */}
            <Col span={6}>
              <Checkbox>Is Approved</Checkbox>
            </Col>
          </Row>
    

          <Row justify="end" style={{ marginTop: "20px" }}>
            <Col>
              <Button style={{ marginRight: "10px" }} onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="primary" onClick={handleSubmit}>
                Submit
              </Button>
            </Col>
          </Row>
        </>
      );
    };

export default AddClaims
