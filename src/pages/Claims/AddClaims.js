
import React from 'react';
import { Row, Col, Input, DatePicker, Button, Checkbox } from 'antd';

const { TextArea } = Input;
function AddClaims() {
    const handleCancel = () => {
      };
    
      const handleSubmit = () => {
      };
    
      return (
        <div style={{marginTop:"20px"}}>
        {/* Row divided into two columns */}
       
  
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
