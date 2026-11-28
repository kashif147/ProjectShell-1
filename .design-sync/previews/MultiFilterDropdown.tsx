import { useEffect, useRef } from 'react';
import { MultiFilterDropdown } from 'projectshell-crm';

const categories = ['General', 'Probationer', 'Retired Associate', 'Student', 'Honorary'];
const regions = ['Dublin Metropolitan', 'Southern', 'Eastern', 'North Western'];

const Row = ({ children }) => <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{children}</div>;

export const ToolbarFilters = () => (
  <Row>
    <MultiFilterDropdown label="Membership Category" options={categories} selectedValues={[]} onApply={() => {}} />
    <MultiFilterDropdown label="Region" options={regions} selectedValues={['Southern']} onApply={() => {}} />
    <MultiFilterDropdown label="Membership Status" options={['Active', 'Lapsed', 'Resigned', 'Deceased']} selectedValues={['Active', 'Lapsed']} onApply={() => {}} />
  </Row>
);

// Clicks the real trigger after mount so the component's own filter panel is shown.
export const Open = () => {
  const ref = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => ref.current?.querySelector('.filter-button1')?.click(), 50);
    return () => clearTimeout(t);
  }, []);
  return (
    <div ref={ref} style={{ height: 320 }}>
      <MultiFilterDropdown label="Membership Category" options={categories} selectedValues={['General', 'Probationer']} onApply={() => {}} />
    </div>
  );
};

export const NotEqualOperator = () => (
  <Row>
    <MultiFilterDropdown label="Payment Type" options={['Payroll Deduction', 'Direct Debit', 'Card']} selectedValues={['Card']} operator="!=" onApply={() => {}} />
  </Row>
);

export const LoadingAndEmpty = () => (
  <Row>
    <MultiFilterDropdown label="Branch" options={['Loading...']} selectedValues={[]} onApply={() => {}} />
    <MultiFilterDropdown label="Work Location" options={['']} selectedValues={[]} onApply={() => {}} />
    <MultiFilterDropdown label="Batch" options={['⚠️ No batches found for this period']} selectedValues={[]} onApply={() => {}} />
  </Row>
);
