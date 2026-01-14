import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import axios from "axios";




const ReadEmailsAxios = () => {
  const { instance, accounts } = useMsal();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const request = {
      scopes: ["Mail.Read"],
      account: accounts[0],
    };

    instance.acquireTokenSilent(request).then((response) => {
      fetchEmails(response.accessToken);
    }).catch((error) => {
      if (error instanceof InteractionRequiredAuthError) {
        instance.acquireTokenPopup(request).then((response) => {
          fetchEmails(response.accessToken);
        });
      }
    });
  }, [instance, accounts]);

  const fetchEmails = (accessToken) => {
    axios.get("https://graph.microsoft.com/v1.0/me/messages", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .then((response) => {
      setMessages(response.data.value);
    })
    .catch((error) => {
      
    });
  };

  return (
    <div>
      <h1>Email Inbox</h1>
      <ul>
        {messages.length > 0 ? (
          messages.map((message) => (
            <li key={message.id}>
              <p>From: {message.from?.emailAddress?.address}</p>
              <p>Subject: {message.subject}</p>
              <p>{message.bodyPreview}</p>
            </li>
          ))
        ) : (
          <p>No emails found.</p>

        )}
      </ul>
    </div>
  );
};

export default ReadEmailsAxios;
