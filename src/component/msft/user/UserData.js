import React, { useEffect, useState } from 'react';
import { Client } from '@microsoft/microsoft-graph-client';
import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';

const UserData = () => {
    const { instance, accounts } = useMsal(); // MSAL instance and user accounts
    const [userData, setUserData] = useState(null);

    // Function to acquire an access token silently
    const getAccessToken = async () => {
        const request = {
            scopes: ['User.Read'],
            account: accounts[0],
        };

        try {
            const response = await instance.acquireTokenSilent(request);
            return response.accessToken;
        } catch (error) {
            if (error instanceof InteractionRequiredAuthError) {
                const response = await instance.acquireTokenPopup(request);
                return response.accessToken;
            } else {
                
            }
        }
    };

    // Function to fetch user data from Microsoft Graph
    const getUserData = async () => {
        try {
            const accessToken = await getAccessToken();

            const client = Client.init({
                authProvider: (done) => {
                    done(null, accessToken); // Pass access token to the Graph client
                },
            });

            // Fetch the user profile data from Microsoft Graph
            const user = await client.api('/me').get();
            setUserData(user); // Set the user data to state
        } catch (error) {
            
        }
    };

    // Fetch user data when component mounts
    useEffect(() => {
        if (accounts.length > 0) {
            getUserData(); // Call the function to fetch data
        }
    }, [accounts]);

    return (
        <div>
            <h2>User Profile</h2>
            {userData ? (
                <div>
                    <p><strong>Name:</strong> {userData.displayName}</p>
                    <p><strong>Email:</strong> {userData.mail || userData.userPrincipalName}</p>
                    <p><strong>Job Title:</strong> {userData.jobTitle || 'N/A'}</p>
                </div>
            ) : (
                <p>Loading user data...</p>
            )}
        </div>
    );
};

export default UserData;
