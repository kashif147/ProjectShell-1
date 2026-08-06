import React from 'react';
import { Calendar, MapPin, Video, Laptop2, Users2, GraduationCap, Award } from 'lucide-react';

/**
 * Default / fallback image for Events & Courses.
 *
 * Use this wherever an event card would normally show event.imageUrl,
 * but swap in this component when that field is empty:
 *
 *   {event.imageUrl
 *     ? <img src={event.imageUrl} alt={event.title} />
 *     : <EventFallbackImage
 *         title={event.title}
 *         date={event.startDate}
 *         format={event.format}        // 'in-person' | 'webinar' | 'hybrid' | 'course' | 'conference'
 *         location={event.location}
 *         cpdPoints={event.cpdPoints}
 *       />}
 *
 * The card is a fixed 16:9 box (set width via a parent container) so it
 * drops into an existing image slot without layout changes.
 */

const FORMAT_CONFIG = {
  'in-person': { label: 'In-Person', Icon: MapPin, accent: '#FF6B57' },
  webinar: { label: 'Webinar', Icon: Video, accent: '#F2A93B' },
  hybrid: { label: 'Hybrid', Icon: Laptop2, accent: '#FF9457' },
  course: { label: 'Self-Paced Course', Icon: GraduationCap, accent: '#F2A93B' },
  conference: { label: 'Conference', Icon: Users2, accent: '#FF6B57' },
};

function formatDate(date) {
  if (!date) return 'Date to be confirmed';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d)) return String(date);
  return new Intl.DateTimeFormat('en-IE', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
}

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function ticketCode(date, format) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const y = d && !isNaN(d) ? d.getFullYear().toString().slice(-2) : '00';
  const prefix = (format || 'EVT').slice(0, 3).toUpperCase();
  const n = (hashCode(`${date}-${format}`) % 900) + 100;
  return `${prefix}-${y}${n}`;
}

export function EventFallbackImage({
  title = 'Untitled Event',
  date = null,
  format = 'course',
  location = '',
  cpdPoints = null,
}) {
  const cfg = FORMAT_CONFIG[format] || FORMAT_CONFIG.course;
  const { Icon, accent, label } = cfg;
  const code = ticketCode(date, format);
  const showLocation = format === 'in-person' || format === 'hybrid';

  return (
    <div
      className="efi-card"
      role="img"
      aria-label={`${label} event: ${title}, ${formatDate(date)}`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');

        .efi-card {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          background: linear-gradient(135deg, #0E3A3C 0%, #0A1F2E 100%);
          box-shadow: 0 4px 18px rgba(10, 31, 46, 0.35);
          font-family: 'Inter', system-ui, sans-serif;
          container-type: inline-size;
          container-name: efi;
        }
        .efi-texture {
          position: absolute;
          inset: 0;
          opacity: 0.06;
          background-image: radial-gradient(circle, #ffffff 1px, transparent 1px);
          background-size: 14px 14px;
          pointer-events: none;
        }
        .efi-glow {
          position: absolute;
          top: -40px;
          right: -20px;
          width: 180px;
          height: 180px;
          border-radius: 50%;
          filter: blur(55px);
          opacity: 0.3;
          pointer-events: none;
        }
        .efi-main {
          position: relative;
          z-index: 1;
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 16px 18px;
          gap: 10px;
        }
        .efi-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          width: fit-content;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 4px 9px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
        }
        .efi-title {
          margin: 0;
          font-family: 'Space Grotesk', 'Inter', sans-serif;
          font-weight: 700;
          font-size: 18px;
          line-height: 1.25;
          color: #F7F3EA;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @supports (container-type: inline-size) {
          .efi-title {
            font-size: clamp(13px, 5.2cqi, 21px);
          }
        }
        .efi-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px 14px;
        }
        .efi-meta-item {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12.5px;
          color: rgba(255, 255, 255, 0.78);
          white-space: nowrap;
        }
        .efi-cpd {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11.5px;
          font-weight: 500;
          padding: 3px 8px;
          border-radius: 999px;
          border: 1px solid;
        }
        .efi-perforation {
          position: relative;
          z-index: 1;
          width: 0;
          border-left: 2px dashed rgba(255, 255, 255, 0.22);
          margin: 10px 0;
        }
        .efi-stub {
          position: relative;
          z-index: 1;
          width: 84px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 12px 6px;
          background: rgba(0, 0, 0, 0.15);
        }
        .efi-stub-badge {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .efi-stub-label {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.65);
          text-align: center;
        }
        .efi-stub-code {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9.5px;
          letter-spacing: 0.06em;
          color: rgba(255, 255, 255, 0.45);
          writing-mode: vertical-rl;
          transform: rotate(180deg);
        }

        /* Card itself is getting narrow (e.g. a mobile column, or a dense
           multi-up grid) — tighten padding and shrink the stub. */
        @container efi (max-width: 360px) {
          .efi-main { padding: 12px 14px; gap: 8px; }
          .efi-eyebrow { font-size: 10px; padding: 3px 8px; }
          .efi-meta-item { font-size: 11.5px; }
          .efi-stub { width: 64px; gap: 8px; padding: 10px 4px; }
          .efi-stub-badge { width: 28px; height: 28px; }
        }

        /* Very narrow — e.g. a compact list row on a phone. Drop the
           ticket-stub text so the icon badge remains but doesn't crowd
           out the title and date, which stay the priority content. */
        @container efi (max-width: 220px) {
          .efi-main { padding: 10px 12px; }
          .efi-title { -webkit-line-clamp: 2; }
          .efi-meta { gap: 6px 10px; }
          .efi-stub { width: 40px; padding: 8px 2px; }
          .efi-stub-label, .efi-stub-code { display: none; }
        }

        /* Card is short as well as narrow (e.g. 16:9 at a very small
           width) — drop to a single meta row and smaller badge. */
        @container efi (max-height: 90px) {
          .efi-main { padding: 8px 12px; gap: 4px; }
          .efi-eyebrow { display: none; }
          .efi-title { -webkit-line-clamp: 1; font-size: 13px; }
        }
      `}</style>

      <div className="efi-texture" />
      <div className="efi-glow" style={{ background: accent }} />

      <div className="efi-main">
        <span className="efi-eyebrow" style={{ color: accent }}>
          <Icon size={13} strokeWidth={2.4} />
          {label}
        </span>

        <h3 className="efi-title">{title}</h3>

        <div className="efi-meta">
          <span className="efi-meta-item">
            <Calendar size={13} strokeWidth={2.2} />
            {formatDate(date)}
          </span>
          {showLocation && (
            <span className="efi-meta-item">
              <MapPin size={13} strokeWidth={2.2} />
              {location || 'Location TBC'}
            </span>
          )}
          {cpdPoints != null && (
            <span className="efi-cpd" style={{ borderColor: accent, color: accent }}>
              <Award size={12} strokeWidth={2.4} />
              {cpdPoints} CPD
            </span>
          )}
        </div>
      </div>

      <div className="efi-perforation" />

      <div className="efi-stub">
        <div className="efi-stub-badge" style={{ background: accent }}>
          <Icon size={17} strokeWidth={2} color="#0A1F2E" />
        </div>
        <div className="efi-stub-label">{label.toUpperCase()}</div>
        <div className="efi-stub-code">{code}</div>
      </div>
    </div>
  );
}

export default function EventFallbackImagePreview() {
  const samples = [
    { title: 'Advanced Wound Care in Community Practice', date: '2026-09-14', format: 'in-person', location: 'RCSI, Dublin', cpdPoints: 6 },
    { title: 'Medication Safety: Annual Update Webinar', date: '2026-08-21', format: 'webinar', cpdPoints: 3 },
    { title: 'Clinical Supervision Skills for Preceptors', date: '2026-10-02', format: 'hybrid', location: 'Cork & Online', cpdPoints: 4 },
    { title: 'Infection Prevention & Control Fundamentals', date: '2026-11-05', format: 'course' },
    { title: 'Annual Members Conference 2026', date: '2026-09-30', format: 'conference', location: 'Convention Centre Dublin', cpdPoints: 8 },
    { title: 'Untitled draft event with no details yet', date: null, format: 'course' },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 20,
        padding: 20,
        background: '#F5F1E8',
      }}
    >
      {samples.map((s, i) => (
        <EventFallbackImage key={i} {...s} />
      ))}
    </div>
  );
}
