import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TableComponent from '../../component/common/TableComponent'
import { getAllApplications } from '../../features/ApplicationSlice';
import MultiFilterDropdown from '../../component/common/MultiFilterDropdown';
import { Spin } from 'antd';


function MembershipApplication() {
  const dispatch = useDispatch();
  const { applications, applicationsLoading } = useSelector((state) => state.applications);


    const handleAuthRedirect = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      debugger

    if (!code) return; // No code means user hasn't logged in yet

    const codeVerifier = sessionStorage.getItem("pkce_code_verifier");
    if (!codeVerifier) {
      console.error("Missing PKCE code_verifier from sessionStorage");
      return;
    }

    try {
      // Send code + code_verifier to your backend

      const response = await fetch(
        "https://userserviceshell-aqf6f0b8fqgmagch.canadacentral-01.azurewebsites.net/auth/azure-crm",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: code, // backend expects this
            codeVerifier: codeVerifier,
          }),
        }
      );
      const data = await response.json();
      console.log("Token response from backend:", data);

      // Save tokens to localStorage if presents
      if (data) {
        debugger
        let token = data.accessToken.replace(/^Bearer\s/, '');
        localStorage.setItem("token", token);
        // navigate("/Summary")
      }
      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
      }
      // Optional: store expiration time
      if (data.expires_in) {
        const expiryTime = Date.now() + data.expires_in * 1000;
        localStorage.setItem("token_expiry", expiryTime.toString());
      }

      // Clean up URL so code isn’t visible
      window.history.replaceState({}, document.title, "/");

    } catch (err) {
      console.error("Token exchange failed:", err);
    }
  };

  // Run on page load
  useEffect(() => {
    handleAuthRedirect();
  }, []);
  useEffect(() => {
    dispatch(getAllApplications(['submitted','draft']));
  }, [dispatch]);
  console.log(applications, "ptdc")

  return (
    <div className='' style={{ width: '95vw' }}>

      <TableComponent data={applications} screenName="Applications" isGrideLoading={applicationsLoading} />
      <div style={{ display: "flex", gap: 12 }}>

        {/* <MultiFilterDropdown
        label="Division"
        options={["North", "South", "East", "West"]}
        selectedValues={divisionFilter}
        onChange={setDivisionFilter}
      /> */}
      </div>
    </div>
  )
}

export default MembershipApplication