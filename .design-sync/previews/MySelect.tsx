import { MySelect } from 'projectshell-crm';

const membershipCategories = [
  { value: 'general', label: 'General' },
  { value: 'retired', label: 'Retired Associate' },
  { value: 'student', label: 'Student' },
  { value: 'probationer', label: 'Probationer' },
];

export const WithPlaceholder = () => (
  <div style={{ width: 280 }}>
    <MySelect placeholder="Select membership category" options={membershipCategories} isSimple />
  </div>
);

export const WithValue = () => (
  <div style={{ width: 280 }}>
    <MySelect options={membershipCategories} defaultValue="General" isSimple />
  </div>
);

export const FixedWidth = () => (
  <MySelect placeholder="Region" width={200} options={[{ value: 'dmr', label: 'Dublin Metropolitan' }, { value: 'south', label: 'Southern' }]} />
);

export const Disabled = () => (
  <div style={{ width: 280 }}>
    <MySelect options={membershipCategories} defaultValue="Student" isSimple disabled />
  </div>
);
