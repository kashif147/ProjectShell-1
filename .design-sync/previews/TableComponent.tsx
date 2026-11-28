import { TableComponent } from 'projectshell-crm';

const members = [
  {
    key: '1', _id: 'm1',
    personalDetails: { membershipNo: 'GRA-104233', fullName: 'Siobhán Murphy', mobileNo: '087 000 0101' },
    membershipCategory: 'General', subscriptionStatus: 'Active',
    user: { userEmail: 's.murphy@example.ie' },
    professionalDetails: { workLocation: 'Pearse Street', branch: 'Dublin South Central', region: 'DMR', grade: 'Sergeant' },
    startDate: '2014-09-01', endDate: '2026-12-31',
  },
  {
    key: '2', _id: 'm2',
    personalDetails: { membershipNo: 'GRA-104871', fullName: 'Ciarán O’Brien', mobileNo: '087 000 0102' },
    membershipCategory: 'Probationer', subscriptionStatus: 'Active',
    user: { userEmail: 'c.obrien@example.ie' },
    professionalDetails: { workLocation: 'Anglesea Street', branch: 'Cork City', region: 'Southern', grade: 'Garda' },
    startDate: '2025-03-10', endDate: '2026-12-31',
  },
  {
    key: '3', _id: 'm3',
    personalDetails: { membershipNo: 'GRA-099412', fullName: 'Aoife Kelly', mobileNo: '087 000 0103' },
    membershipCategory: 'Retired Associate', subscriptionStatus: 'Lapsed',
    user: { userEmail: 'aoife.kelly@example.ie' },
    professionalDetails: { workLocation: 'Mill Street', branch: 'Galway', region: 'Western', grade: 'Garda' },
    startDate: '1998-06-15', endDate: '2025-12-31',
  },
  {
    key: '4', _id: 'm4',
    personalDetails: { membershipNo: 'GRA-101560', fullName: 'Declan Byrne', mobileNo: '087 000 0104' },
    membershipCategory: 'General', subscriptionStatus: 'Active',
    user: { userEmail: 'd.byrne@example.ie' },
    professionalDetails: { workLocation: 'Henry Street', branch: 'Limerick', region: 'Southern', grade: 'Sergeant' },
    startDate: '2009-11-02', endDate: '2026-12-31',
  },
];

export const MembersGrid = () => <TableComponent screenName="Members" data={members} />;

export const Loading = () => <TableComponent screenName="Members" data={[]} isGrideLoading />;

export const Empty = () => <TableComponent screenName="Members" data={[]} />;
