// P5 STUDENT policy - CRM view of a registration's student pricing claim. Mirrors events-service
// services/studentEligibility.service.js studentVerificationState() so the drawer shows the same state the
// server enforces (the server stays authoritative: Approve is refused with 409 while a claim is pending).

const STUDENT_TIER_KEYS = ['STUDENT', 'GROUP_STUDENT'];
export const STUDENT_VERIFICATION_NOTE_MAX = 500;

export function isStudentPriced(registration) {
    if (!registration) return false;
    if (['student', 'group_student'].includes(registration.priceCategory)) return true;
    return (registration.priceBreakdown || []).some((line) => STUDENT_TIER_KEYS.includes(line?.tierKey));
}

/** 'not_required' | 'pending' | 'verified' | 'rejected' (same rules as the server). */
export function studentVerificationState(registration) {
    if (!isStudentPriced(registration)) return 'not_required';
    const eligibility = registration.studentEligibility;
    if (!eligibility) return registration.registeredVia === 'crm' ? 'verified' : 'pending';
    const status = eligibility.verification?.status;
    return status === 'verified' || status === 'rejected' ? status : 'pending';
}

/** What the drawer shows for the claim, or null when the registration has no student claim to show. */
export function studentClaimView(registration) {
    const state = studentVerificationState(registration);
    if (state === 'not_required') return null;
    const eligibility = registration.studentEligibility || null;
    const source = eligibility?.source || (registration.registeredVia === 'crm' ? 'crm_assigned' : 'declared_claim');
    // Only a member-declared claim (or a pre-policy portal row) is decided here; membership-verified and
    // CRM-assigned student pricing needs no decision.
    if (source !== 'declared_claim') return null;
    return {
        state,
        institution: eligibility?.institution || null,
        note: eligibility?.verification?.note || null,
        decidable: state === 'pending' && registration.approvalStatus === 'pending_review',
    };
}

const MESSAGES = {
    STUDENT_VERIFICATION_PENDING: 'Verify or reject the student pricing claim before approving this registration.',
    STUDENT_CLAIM_REJECTED: 'The student pricing claim was rejected, so this registration cannot be approved.',
    STUDENT_VERIFICATION_ALREADY_DECIDED: 'This student pricing claim has already been decided. Reopen the registration to see the current state.',
    STUDENT_VERIFICATION_NOT_REQUIRED: 'This registration has no student pricing claim to decide.',
    STUDENT_VERIFICATION_FAILED: 'The payment could not be released, so the claim was not rejected. Please try again.',
};

/** User-facing message for an axios error from approve / student-verification calls. */
export function studentVerificationErrorMessage(err, fallback) {
    const code = err?.response?.data?.error?.code || err?.response?.data?.code;
    if (code && MESSAGES[code]) return MESSAGES[code];
    return err?.response?.data?.error?.message || err?.message || fallback;
}
