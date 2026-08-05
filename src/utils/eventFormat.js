// Single-day (or no sessions yet): the event's own isVirtual flag decides.
// Multi-day: derived from each day's isVirtual - all online, all in-person,
// or a mix (Hybrid).
export function computeEventFormat(event) {
    const sessions = event?.sessions || [];
    if (sessions.length > 1) {
        const onlineCount = sessions.filter((s) => !!s.isVirtual).length;
        if (onlineCount === 0) return 'In-Person';
        if (onlineCount === sessions.length) return 'Online';
        return 'Hybrid';
    }
    return event?.isVirtual ? 'Online' : 'In-Person';
}

// Maps a computeEventFormat() result (+ the event's Event Type lookup label,
// when available) onto EventFallbackImage's format prop
// ('in-person' | 'webinar' | 'hybrid' | 'course' | 'conference') - that
// component's key set is more specific than the In-Person/Online/Hybrid this
// service tracks, so an Event Type label match (e.g. "Webinar", "Conference",
// "Course") takes priority over the coarser online/in-person signal.
export function resolveFallbackImageFormat(computedFormat, eventTypeLabel) {
    const label = (eventTypeLabel || '').toLowerCase();
    if (label.includes('webinar')) return 'webinar';
    if (label.includes('conference')) return 'conference';
    if (label.includes('course')) return 'course';
    if (computedFormat === 'Hybrid') return 'hybrid';
    if (computedFormat === 'Online') return 'webinar';
    return 'in-person';
}
