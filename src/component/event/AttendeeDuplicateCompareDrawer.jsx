import React, { useEffect, useMemo, useState } from 'react';
import { Button, Checkbox, Drawer, Spin, Tag, Typography, message } from 'antd';
import { MergeCellsOutlined } from '@ant-design/icons';
import axios from 'axios';
import '../applications/DuplicateProfileMergeModal.css';

const { Text } = Typography;

// Field defs shared between CreateAttendeeDrawer's formData shape and the
// candidate Profile document's own shape - each entry knows how to read both
// sides so the compare table can be built generically.
const FIELD_DEFS = [
  { key: 'firstName', label: 'First name', fromProfile: (p) => p?.personalInfo?.forename },
  { key: 'surname', label: 'Surname', fromProfile: (p) => p?.personalInfo?.surname },
  { key: 'email', label: 'Email', fromProfile: (p) => p?.contactInfo?.personalEmail },
  { key: 'phone', label: 'Phone', fromProfile: (p) => p?.contactInfo?.mobileNumber },
  { key: 'workPlace', label: 'Work location', fromProfile: (p) => p?.professionalDetails?.workLocation },
  { key: 'grade', label: 'Grade', fromProfile: (p) => p?.professionalDetails?.grade },
  { key: 'nmbiNumber', label: 'NMBI No.', fromProfile: (p) => p?.professionalDetails?.nmbiNumber },
  { key: 'addressLine1', label: 'Address Line 1', fromProfile: (p) => p?.contactInfo?.buildingOrHouse },
  { key: 'addressLine2', label: 'Address Line 2', fromProfile: (p) => p?.contactInfo?.streetOrRoad },
  { key: 'townCity', label: 'Town/City', fromProfile: (p) => p?.contactInfo?.areaOrTown },
  { key: 'countyState', label: 'County/State', fromProfile: (p) => p?.contactInfo?.countyCityOrPostCode },
  { key: 'eircode', label: 'Eircode/Postcode', fromProfile: (p) => p?.contactInfo?.eircode },
  { key: 'country', label: 'Country', fromProfile: (p) => p?.contactInfo?.country },
];

function typedValueFor(key, formData) {
  if (key === 'workPlace') {
    return String(formData.workPlace || '').trim().toLowerCase() === 'other'
      ? formData.otherWorkPlace
      : formData.workPlace;
  }
  if (key === 'grade') {
    return String(formData.grade || '').trim().toLowerCase() === 'other'
      ? formData.otherGrade
      : formData.grade;
  }
  return formData[key];
}

/**
 * Resolves a duplicate match found while registering a brand-new attendee
 * (checkAttendeeDuplicates) against the typed-but-not-yet-saved registration
 * form - not a merge of two persisted profiles (there's only one here; the
 * "other side" is still just form state), so this is a lightweight per-field
 * compare-and-choose rather than a call into the real profile-merge endpoint.
 * Styled after DuplicateProfileMergeDrawer's compare table for visual/UX
 * consistency with the rest of the platform's duplicate-review workflow.
 */
const AttendeeDuplicateCompareDrawer = ({
  open,
  onClose,
  candidateProfileId,
  candidateSummary,
  formData,
  onUseSelected,
  onRegisterAsNew,
}) => {
  const baseURL = process.env.REACT_APP_PROFILE_SERVICE_URL;
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [choices, setChoices] = useState({});

  useEffect(() => {
    if (!open || !candidateProfileId) return;
    let cancelled = false;
    setLoading(true);
    const token = localStorage.getItem('token');
    axios
      .get(`${baseURL}/profile/${candidateProfileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        if (cancelled) return;
        const data = response.data?.data || response.data;
        setProfile(data);
        const initialChoices = {};
        FIELD_DEFS.forEach(({ key, fromProfile }) => {
          const existingValue = fromProfile(data);
          initialChoices[key] = existingValue ? 'existing' : 'typed';
        });
        setChoices(initialChoices);
      })
      .catch((error) => {
        if (cancelled) return;
        message.error(
          error.response?.data?.error?.message ||
            error.response?.data?.message ||
            'Failed to load the existing profile for comparison',
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, candidateProfileId, baseURL]);

  const rows = useMemo(
    () =>
      FIELD_DEFS.map((field) => ({
        ...field,
        typedValue: typedValueFor(field.key, formData || {}),
        existingValue: field.fromProfile(profile),
      })),
    [formData, profile],
  );

  const handleChoiceChange = (key, source) => {
    setChoices((prev) => ({ ...prev, [key]: source }));
  };

  const handleUseSelected = () => {
    const resolved = {};
    rows.forEach((row) => {
      const chosen = choices[row.key] === 'existing' ? row.existingValue : row.typedValue;
      if (row.key === 'workPlace') {
        resolved.workPlace = chosen || '';
        resolved.otherWorkPlace = '';
      } else if (row.key === 'grade') {
        resolved.grade = chosen || '';
        resolved.otherGrade = '';
      } else {
        resolved[row.key] = chosen || '';
      }
    });
    onUseSelected?.(resolved, profile);
  };

  return (
    <Drawer
      className="duplicate-profile-merge-drawer"
      title="Compare with existing profile"
      open={open}
      onClose={onClose}
      width="min(96vw, 1000px)"
      zIndex={1100}
      destroyOnClose
      extra={
        <Button
          type="primary"
          className="butn primary-btn duplicate-merge-confirm-btn"
          icon={<MergeCellsOutlined />}
          disabled={loading || !profile}
          onClick={handleUseSelected}
        >
          Use Selected Details
        </Button>
      }
    >
      <Spin spinning={loading}>
        <Text type="secondary" className="duplicate-merge-intro">
          Tick the value to keep for each field, then Use Selected Details to populate the
          registration form and continue against this existing profile - no new profile will be
          created.
        </Text>

        {candidateSummary && (
          <div style={{ marginBottom: 12 }}>
            <Tag color="blue">
              {[candidateSummary.name, candidateSummary.membershipNumber].filter(Boolean).join(' · ')}
            </Tag>
          </div>
        )}

        <div className="duplicate-merge-compare-panel">
          <div className="duplicate-merge-compare-header">
            <div className="duplicate-merge-header-spacer" />
            <div className="duplicate-merge-header-app">As entered on this form</div>
            <div className="duplicate-merge-header-member">Existing profile</div>
          </div>

          <div className="duplicate-merge-compare-body">
            <div className="duplicate-merge-section">
              {rows.map((row) => (
                <div key={row.key} className="duplicate-merge-compare-row">
                  <div className="duplicate-merge-col-field">
                    <span className="duplicate-merge-field-name">{row.label}</span>
                  </div>
                  <div className="duplicate-merge-col-app">
                    <label className="duplicate-merge-value-option">
                      <Checkbox
                        checked={choices[row.key] === 'typed'}
                        onChange={() => handleChoiceChange(row.key, 'typed')}
                      />
                      <span className="duplicate-merge-value-text">{row.typedValue || '—'}</span>
                    </label>
                  </div>
                  <div className="duplicate-merge-col-member">
                    <label className="duplicate-merge-value-option">
                      <Checkbox
                        checked={choices[row.key] === 'existing'}
                        onChange={() => handleChoiceChange(row.key, 'existing')}
                      />
                      <span className="duplicate-merge-value-text">{row.existingValue || '—'}</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Button
          style={{ marginTop: 16 }}
          danger
          type="text"
          onClick={() => onRegisterAsNew?.()}
        >
          None of these - register as new attendee
        </Button>
      </Spin>
    </Drawer>
  );
};

export default AttendeeDuplicateCompareDrawer;
