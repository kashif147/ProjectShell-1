import React, { useState } from "react";
import { useMsal } from "@azure/msal-react";



const ReadEmails = () => {
  const { instance, accounts } = useMsal();
  const [emails, setEmails] = useState([]);
  const [error, setError] = useState("");

  const handleReadEmails = async () => {
    try {
      const response = await instance.acquireTokenSilent({
        account: accounts[0],
        scopes: ["Mail.Read"], // Ensure you have Mail.Read permission
      });

      const accessToken = response.accessToken;

      const emailData = await fetch("https://graph.microsoft.com/v1.0/me/messages", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!emailData.ok) {
        // If the response isn't successful, log the error
        throw new Error(`Error fetching emails: ${emailData.statusText}`);
      }

      const data = await emailData.json();
      setEmails(data.value || []);
    } catch (error) {
      console.error("Error fetching emails:", error);
      setError(error.message); // Display error message
    }
  };

  return (
    <div>
      <button onClick={handleReadEmails}>Read Emails</button>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {emails && emails.length > 0 ? (
        <ul>
          {emails.map((email) => (
            <li key={email.id}>
              <strong>From:</strong> {email?.from?.emailAddress?.name} <br />
              <strong>Subject:</strong> {email.subject} <br />
              <strong>Received:</strong> {new Date(email.receivedDateTime).toLocaleString()} <br />
              <p>{email.bodyPreview}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No emails to display</p>
      )}
    </div>
  );
};

export default ReadEmails;