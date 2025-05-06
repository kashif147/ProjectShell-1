import React from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import TableComponent from "../../component/common/TableComponent";
import { claimsData } from "../../Data";

function ClaimSummary() {
    const navigate = useNavigate();
  
    const location = useLocation();
    // const currentURL = `${window.location.origin}${location.pathname}${location.search}${location.hash}`;  
   
  
    return (
      <div className="">
   
      <TableComponent data={claimsData} screenName="Claims" redirect="/ClaimsDetails"  />
    </div>
    );
  }

export default ClaimSummary
