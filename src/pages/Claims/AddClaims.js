
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
        <div style={{marginTop:"20px"}}>
        {/* Row divided into two columns */}
        <Row gutter={24} style={{}}>
          {/* Left section */}
          <Col span={12}>
            <div className="form-section">
              <label className="form-label">Claim Date</label>
              <DatePicker className="form-input" />
  
              <label className="form-label">Claim Type</label>
              <Input className="form-input" placeholder="Enter claim type" />
  
              <label className="form-label">Start Date</label>
              <DatePicker className="form-input" />
  
              <label className="form-label">End Date</label>
              <DatePicker className="form-input" />
            </div>
          </Col>
  
          {/* Right section */}
          <Col span={12}>
            <div className="form-section">
              <label className="form-label">Number of Days</label>
              <Input className="form-input" type="number" placeholder="Enter number of days" />
  
              <label className="form-label">Pay Amount</label>
              <Input className="form-input" type="number" placeholder="Enter pay amount" />
  
              <label className="form-label">Cheque No</label>
              <Input className="form-input" placeholder="Enter cheque number" />
  
              <label className="form-label">Description</label>
              <TextArea className="form-input" rows={2} placeholder="Enter description" />
            </div>
          </Col>
        </Row>
  
        {/* Checkbox */}
        <Row style={{ marginBottom: "20px" }}>
          <Col span={24}>
            <Checkbox className="form-checkbox">Is Approved</Checkbox>
          </Col>
        </Row>
  
        {/* Cancel and Submit Buttons */}
        <Row justify="end">
          <Col>
            <Button className="form-button" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="primary" className="form-button" onClick={handleSubmit}>
              Submit
            </Button>
          </Col>
        </Row>
      </div>
    );
  };

export default AddClaims
