import { Client } from '@microsoft/microsoft-graph-client';
import { loginRequest } from '../msft/msalConfig';
import { InteractionRequiredAuthError } from '@azure/msal-browser';

export const getGraphClient = (instance, accounts) => {
  const getAccessToken = async () => {
    const request = {
      ...loginRequest,
      account: accounts[0],
    };
    try {
      const response = await instance.acquireTokenSilent(request);
      return response.accessToken;
    } catch (e) {
      if (e instanceof InteractionRequiredAuthError) {
        instance.acquireTokenRedirect(request);
      }
    }
  };

  return Client.init({
    authProvider: async (done) => {
      const token = await getAccessToken();
      if (token) {
        done(null, token);
      } else {
        done('Failed to get token', null);
      }
    },
  });
};
