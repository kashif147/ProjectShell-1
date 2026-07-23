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
