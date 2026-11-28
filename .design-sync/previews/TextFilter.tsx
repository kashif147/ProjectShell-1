import { TextFilter } from 'projectshell-crm';

export const Unfiltered = () => <TextFilter label="Surname" selectedValues={[]} operator="contains" onApply={() => {}} />;

export const Active = () => (
  <TextFilter label="Work Location" selectedValues={['Pearse Street']} operator="starts_with" onApply={() => {}} />
);

export const InFilterRow = () => (
  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
    <TextFilter label="Membership No" selectedValues={[]} onApply={() => {}} />
    <TextFilter label="Full Name" selectedValues={['Murphy']} operator="contains" onApply={() => {}} />
    <TextFilter label="Station" selectedValues={[]} onApply={() => {}} />
  </div>
);
