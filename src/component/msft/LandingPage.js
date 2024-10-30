
import ComposeEmailButton from "./email/ComposeEmailButton";
import ComposeOutlookEmailButton from "./email/ComposeOutlookEmailButton";
import UserData from "./user/UserData";
import ReadEmails from "./email/ReadEmails";
import OpenWordButton from "./word/OpenWordButton";
import CreateWordDocument from "./word/CreateWordDocument";
// import UpdateWordDocument from "./word/UpdateWordDocument";
import ListFiles from "./onedrive/ListFiles";
import OpenOutlookButton from "./email/OpenOutlookButton";
import OpenPrePopulatedDocument from "./word/OpenPrePopulatedDocument";



const LandingPage = () => (
    <div style={{zIndex:1, position: 'relative', padding: '20px' /* Ensure these elements sit above the watermark */}}> 
        <h1>Home Page</h1>
        <p>Welcome to the home page!</p>

        <UserData />
        <ComposeEmailButton/>

        <ComposeOutlookEmailButton/>

<div>
    {/* <ReadEmailsButton/> */}
</div>
<>

    <ReadEmails/>

    <OpenOutlookButton/>

    <OpenWordButton/>

    <CreateWordDocument/>

    <OpenPrePopulatedDocument/>

    <ListFiles/>

    </>
    </div>
);

export default LandingPage 