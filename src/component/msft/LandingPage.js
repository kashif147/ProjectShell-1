
import ComposeEmailButton from "./email/ComposeEmailButton";
import UserData from "./user/UserData";
import ReadEmails from "./email/ReadEmails";
import OpenPrePopulatedDocument from "./word/OpenPrePopulatedDocument";
import FileExplorer from "./onedrive/FileExplorer";
import PlaceholderReplacer from "./word/PlaceholderReplacer";


const LandingPage = () => (
    <div style={{zIndex:1, position: 'relative', padding: '20px' /* Ensure these elements sit above the watermark */}}> 
        <h1>Home Page</h1>
        <p>Welcome to the home page!</p>
        
        <><h1>Placeholder Replacement Test</h1>
        <PlaceholderReplacer /></>

        <UserData />
        <ComposeEmailButton/>

<div>
</div>
<>

    <ReadEmails/>

    <OpenPrePopulatedDocument/>

    <FileExplorer/>
    </>
    </div>
);

export default LandingPage 