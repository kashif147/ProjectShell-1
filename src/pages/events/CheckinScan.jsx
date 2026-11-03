import React, { useRef, useState } from "react";
import { Alert, Button, Card, Input, Space, Typography } from "antd";
import { scanCheckinPass } from "../../services/eventsApi";

// P5 organiser check-in. The attendee shows their check-in pass (QR) from the portal; a USB/
// Bluetooth QR scanner (keyboard wedge) or a pasted value lands in the field below and is submitted
// to POST /registrations/checkin/scan. Only this authenticated organiser action (CRM + events:write)
// records attendance - the pass alone never does.

const MESSAGES = {
  CHECKIN_PASS_INVALID: "This pass is invalid or has expired.",
  CHECKIN_TENANT_MISMATCH: "This pass belongs to another organisation.",
  ATTENDANCE_NOT_OPEN: "Check-in for this session is not open yet.",
  ATTENDANCE_CLOSED: "Check-in for this session has closed - record a correction with a reason instead.",
  ATTENDANCE_WINDOW_UNAVAILABLE: "This event has no timezone set - set it on the event before checking people in.",
  SESSION_TIMING_INCOMPLETE: "This session has no complete date/start/end time - complete the schedule first.",
  REGISTRATION_NOT_ELIGIBLE: "This registration is not confirmed and approved.",
  SESSION_NOT_SELECTED: "This attendee did not book this session.",
};

/** A scanned value may be the bare pass or a link ending in it. */
export function extractPass(raw) {
  const v = String(raw || "").trim();
  if (!v) return "";
  const last = v.split(/[/?#]/).filter(Boolean).pop() || "";
  return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(last) ? last : v;
}

export default function CheckinScan() {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  const submit = async () => {
    const token = extractPass(value);
    if (!token || busy) return;
    setBusy(true);
    try {
      const data = await scanCheckinPass(token);
      const name = [data?.attendee?.firstName, data?.attendee?.lastName].filter(Boolean).join(" ") || "Attendee";
      setResult({
        type: data?.alreadyCheckedIn ? "info" : "success",
        text: data?.alreadyCheckedIn
          ? `${name} was already checked in.`
          : `${name} checked in${data?.session?.label ? ` - ${data.session.label}` : ""}.`,
      });
    } catch (err) {
      const code = err?.response?.data?.error?.code;
      setResult({ type: "error", text: MESSAGES[code] || err?.response?.data?.error?.message || "Check-in failed." });
    } finally {
      setBusy(false);
      setValue("");
      inputRef.current?.focus();
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 640 }}>
      <Card title="Event check-in">
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <Typography.Text type="secondary">
            Scan the attendee&apos;s check-in pass. Confirm the name shown matches the person in front of you.
          </Typography.Text>
          <Input
            ref={inputRef}
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onPressEnter={submit}
            placeholder="Scan or paste the check-in pass"
            aria-label="Check-in pass"
            disabled={busy}
          />
          <Button type="primary" onClick={submit} loading={busy} disabled={!value.trim()}>
            Check in
          </Button>
          {result ? <Alert type={result.type} message={result.text} showIcon /> : null}
        </Space>
      </Card>
    </div>
  );
}
