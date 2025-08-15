// import React from 'react';
// import { useMsal } from '@azure/msal-react';
// import { InteractionStatus } from '@azure/msal-browser';

// const Login = () => {
//     const { instance, inProgress } = useMsal(); // Get the MSAL instance and interaction status

//     const handleLogin = () => {
//         if (inProgress !== InteractionStatus.None) {
//             // If interaction is in progress, prevent new interaction
//             console.log("Interaction is in progress, please wait...");
//             return;
//         }

//         instance.loginPopup({
//             scopes: ["openid", "profile", "User.Read"], // Scopes you need
//         }).then((response) => {
//             console.log("Login response: ", response);
//         }).catch(e => {
//             console.error("Error during login:", e);
//         });
//     };

//     const handleLogout = () => {
//         instance.logoutPopup().catch(e => {
//             console.error("Error during logout:", e);
//         });
//     };
//     return (
//         <div>
//             <button 
//                 onClick={handleLogin} 
//                 disabled={inProgress !== InteractionStatus.None} // Disable button if login is in progress
//             >
//                 {inProgress === InteractionStatus.None ? "Login with Microsoft" : "Logging in..."}
//             </button>
//             <button onClick={handleLogout}>Logout</button>
//         </div>
//     );
// };

// export default Login;
