// P5 STUDENT policy - CRM claim view mirrors events-service studentVerificationState(); Approve is
// blocked while a claim is pending; the decision call and 409 messages; drawer wiring.
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import {
    isStudentPriced,
    studentClaimView,
    studentVerificationErrorMessage,
    studentVerificationState,
} from './studentVerification';
import { decideStudentVerification } from '../../services/eventsApi';

jest.mock('axios');
jest.mock('../../config/serviceUrls', () => ({ getEventsServiceBaseUrl: () => 'https://events.test/api' }));

const reg = (overrides = {}) => ({
    _id: 'r1',
    priceCategory: 'student',
    priceBreakdown: [{ tierKey: 'STUDENT', quantity: 1 }],
    registeredVia: 'portal',
    approvalStatus: 'pending_review',
    studentEligibility: { source: 'declared_claim', institution: 'Example University', verification: { status: 'pending' } },
    ...overrides,
});

describe('studentVerificationState mirrors the server', () => {
    test.each([
        ['not student priced', reg({ priceCategory: 'standard', priceBreakdown: [{ tierKey: 'NON_MEMBER' }] }), 'not_required'],
        ['declared pending', reg(), 'pending'],
        ['declared verified', reg({ studentEligibility: { source: 'declared_claim', verification: { status: 'verified' } } }), 'verified'],
        ['declared rejected', reg({ studentEligibility: { source: 'declared_claim', verification: { status: 'rejected' } } }), 'rejected'],
        ['pre-policy portal row (no record)', reg({ studentEligibility: null }), 'pending'],
        ['pre-policy CRM row (staff decision)', reg({ studentEligibility: null, registeredVia: 'crm' }), 'verified'],
        ['group student line', reg({ priceCategory: 'x', priceBreakdown: [{ tierKey: 'GROUP_STUDENT' }] }), 'pending'],
    ])('%s -> %s', (_label, registration, expected) => {
        expect(studentVerificationState(registration)).toBe(expected);
    });

    test('isStudentPriced', () => {
        expect(isStudentPriced(null)).toBe(false);
        expect(isStudentPriced({ priceCategory: 'group_student' })).toBe(true);
    });
});

describe('studentClaimView', () => {
    test('pending declared claim in pending_review is decidable and blocks approval', () => {
        expect(studentClaimView(reg())).toEqual({ state: 'pending', institution: 'Example University', note: null, decidable: true });
    });
    test('pending claim on a registration that is no longer pending_review is not decidable', () => {
        expect(studentClaimView(reg({ approvalStatus: 'rejected' })).decidable).toBe(false);
    });
    test('membership-verified and CRM-assigned pricing need no decision (no claim row)', () => {
        expect(studentClaimView(reg({ studentEligibility: { source: 'verified_membership', verification: { status: 'verified' } } }))).toBeNull();
        expect(studentClaimView(reg({ studentEligibility: { source: 'crm_assigned', verification: { status: 'verified' } } }))).toBeNull();
        expect(studentClaimView(reg({ studentEligibility: null, registeredVia: 'crm' }))).toBeNull();
    });
    test('pre-policy portal student row is shown as a pending claim with no institution', () => {
        expect(studentClaimView(reg({ studentEligibility: null }))).toEqual({ state: 'pending', institution: null, note: null, decidable: true });
    });
    test('non-student registration -> null', () => {
        expect(studentClaimView(reg({ priceCategory: 'standard', priceBreakdown: [] }))).toBeNull();
    });
});

describe('error messages', () => {
    const e = (code) => ({ response: { data: { error: { code, message: 'server text' } } } });
    test.each([
        'STUDENT_VERIFICATION_PENDING',
        'STUDENT_CLAIM_REJECTED',
        'STUDENT_VERIFICATION_ALREADY_DECIDED',
        'STUDENT_VERIFICATION_NOT_REQUIRED',
        'STUDENT_VERIFICATION_FAILED',
    ])('%s has a specific message', (code) => {
        const msg = studentVerificationErrorMessage(e(code), 'fallback');
        expect(msg).not.toBe('server text');
        expect(msg).not.toBe('fallback');
    });
    test('unknown code -> server message; nothing -> fallback', () => {
        expect(studentVerificationErrorMessage(e('OTHER'), 'fallback')).toBe('server text');
        expect(studentVerificationErrorMessage({}, 'fallback')).toBe('fallback');
    });
});

describe('decideStudentVerification', () => {
    beforeEach(() => {
        axios.put.mockResolvedValue({ data: { success: true, data: { _id: 'r1', approvalStatus: 'pending_review' } } });
    });
    test('PUT /registrations/:id/student-verification with decision and optional note', async () => {
        const out = await decideStudentVerification('r1', { decision: 'verify', note: 'Card seen' });
        expect(axios.put).toHaveBeenCalledWith(
            'https://events.test/api/registrations/r1/student-verification',
            { decision: 'verify', note: 'Card seen' },
            expect.objectContaining({ headers: expect.any(Object) }),
        );
        expect(out).toEqual({ _id: 'r1', approvalStatus: 'pending_review' });
    });
    test('no note -> body carries only the decision', async () => {
        await decideStudentVerification('r1', { decision: 'reject' });
        expect(axios.put.mock.calls.at(-1)[1]).toEqual({ decision: 'reject' });
    });
});

describe('CreateAttendeeDrawer wiring', () => {
    const src = fs.readFileSync(path.join(__dirname, 'CreateAttendeeDrawer.jsx'), 'utf8');
    test('Approve is disabled while the student claim is unresolved', () => {
        expect(src).toMatch(/disabled=\{approveBlockedByReview \|\| approveBlockedByPayment \|\| approveBlockedByStudentClaim\}/);
        expect(src).toMatch(/approveBlockedByStudentClaim = Boolean\(studentClaim && studentClaim\.state !== 'verified'\)/);
    });
    test('Verify / Reject call decideStudentVerification; approve errors use the 409 messages', () => {
        expect(src).toMatch(/decideStudentVerification\(registration\._id, \{ decision, note: note \|\| undefined \}\)/);
        expect(src).toMatch(/handleStudentDecision\('verify'\)/);
        expect(src).toMatch(/handleStudentDecision\('reject'\)/);
        expect(src).toMatch(/studentVerificationErrorMessage\(err, 'Failed to approve registration'\)/);
    });
});
