import { useEffect, useRef } from 'react';
import { MyMenu, Button, FileExcelOutlined, FilePdfOutlined, PrinterOutlined } from 'projectshell-crm';

const iconStyle = { fontSize: 12, color: 'var(--app-brand-primary)' };
const exportItems = [
  { key: 'export_csv', label: 'Export as CSV', icon: <FileExcelOutlined style={iconStyle} />, onClick: () => {} },
  { key: 'export_pdf', label: 'Export as PDF', icon: <FilePdfOutlined style={iconStyle} />, onClick: () => {} },
  { key: 'print', label: 'Print batch', icon: <PrinterOutlined style={iconStyle} />, onClick: () => {} },
];

export const InToolbar = () => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <Button className="butn secoundry-btn me-2">+ Add Entry</Button>
    <Button className="butn secoundry-btn me-2">Exclude Entry</Button>
    <MyMenu items={exportItems} />
  </div>
);

// Clicks the real ellipsis trigger after mount so the component's own menu is shown.
export const Open = () => {
  const ref = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => ref.current?.querySelector('.anticon-ellipsis')?.dispatchEvent(new MouseEvent('click', { bubbles: true })), 50);
    return () => clearTimeout(t);
  }, []);
  return (
    <div ref={ref} style={{ height: 200 }}>
      <MyMenu items={exportItems} />
    </div>
  );
};

export const Disabled = () => <MyMenu items={exportItems} disabled />;
