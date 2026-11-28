import { ContactDrawer } from 'projectshell-crm';

// Officers come from user-service (fetchCatalogRoles / fetchUsersByRoleId); with no backend
// the list is empty and nothing is selected, so the drawer shows its Unassign state.

export const IroAssignment = () => (
  <ContactDrawer open onClose={() => {}} title="IRO Assignment" type="workLocation" onAssign={() => {}} />
);

export const BranchManager = () => (
  <ContactDrawer open onClose={() => {}} title="Branch Manager Assignment" type="Branch" onAssign={() => {}} />
);

export const RegionOfficer = () => (
  <ContactDrawer open onClose={() => {}} title="Region Officer Assignment" type="Region" onAssign={() => {}} />
);
