import { MyDeatails } from 'projectshell-crm';

// MyDeatails takes no props: it reads the profile, lookups, partner and children from the CRM's
// context and Redux store. Signed out with an empty store, it shows the blank profile form.
export const EmptyProfileForm = () => (
  <div style={{ width: 1200 }}>
    <MyDeatails />
  </div>
);
