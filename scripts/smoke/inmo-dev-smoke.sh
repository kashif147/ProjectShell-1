#!/usr/bin/env bash
#
# inmo-dev-smoke.sh — INMO DEV smoke-test gate for ProjectShell.
#
# Non-destructive liveness + security-regression checks against the DEV gateway.
# Read-only: no writes, no email/push/payment, no business-data mutation.
# Never prints the JWT, Authorization headers, secrets, or member/personal data.
#
# Usage:
#   scripts/smoke/inmo-dev-smoke.sh [--base URL] [--token-file PATH]
#                                   [--tenant-id ID] [--require-auth] [-h]
#
# Token inputs, in priority order: --token-file, $SMOKE_JWT_FILE, $SMOKE_JWT.
# See scripts/smoke/README.md for full documentation.

set -o pipefail

# ---------------------------------------------------------------------------
# Defaults
# ---------------------------------------------------------------------------
BASE="https://projectshell-vm.northeurope.cloudapp.azure.com:8443"
TENANT_ID="68cbf7806080b4621d469d34"   # INMO DEV tenant (Tenant._id)
TOKEN_FILE=""
REQUIRE_AUTH=0
CURL_MAX_TIME=20

usage() {
  cat <<'USAGE'
inmo-dev-smoke.sh — INMO DEV smoke-test gate

Options:
  --base URL          Gateway base URL (default: DEV :8443)
  --token-file PATH   File containing a low-privilege DEV ProjectShell JWT
  --tenant-id ID      INMO tenant id for tenant-scoped probes (default: INMO DEV)
  --require-auth      Fail (exit 2) if no usable JWT is available
  -h, --help          Show this help

Token is also read from $SMOKE_JWT_FILE then $SMOKE_JWT if --token-file is absent.
Exit: 0 all eligible required checks passed; 1 a required check failed;
      2 --require-auth set but no usable JWT.
USAGE
}

while [ $# -gt 0 ]; do
  case "$1" in
    --base)       BASE="$2"; shift 2 ;;
    --token-file) TOKEN_FILE="$2"; shift 2 ;;
    --tenant-id)  TENANT_ID="$2"; shift 2 ;;
    --require-auth) REQUIRE_AUTH=1; shift ;;
    -h|--help)    usage; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; usage >&2; exit 64 ;;
  esac
done

# ---------------------------------------------------------------------------
# Token acquisition (never printed). Priority: --token-file, SMOKE_JWT_FILE, SMOKE_JWT
# ---------------------------------------------------------------------------
TOKEN=""
_token_source=""
_read_token_file() {
  # $1 = path; sets TOKEN; returns 0 on success
  [ -n "$1" ] || return 1
  [ -r "$1" ] || { echo "token file not readable: $1" >&2; return 1; }
  TOKEN="$(tr -d ' \r\n' < "$1")"
  return 0
}

if [ -n "$TOKEN_FILE" ]; then
  _read_token_file "$TOKEN_FILE" && _token_source="--token-file"
elif [ -n "${SMOKE_JWT_FILE:-}" ]; then
  _read_token_file "$SMOKE_JWT_FILE" && _token_source="SMOKE_JWT_FILE"
elif [ -n "${SMOKE_JWT:-}" ]; then
  TOKEN="$(printf '%s' "$SMOKE_JWT" | tr -d ' \r\n')"; _token_source="SMOKE_JWT"
fi

# Strip an optional leading "Bearer "
case "$TOKEN" in
  Bearer\ *) TOKEN="${TOKEN#Bearer }" ;;
  bearer\ *) TOKEN="${TOKEN#bearer }" ;;
esac

# Validate it *looks* like a JWT (three base64url segments) without decoding/printing.
HAVE_TOKEN=0
if [ -n "$TOKEN" ]; then
  if printf '%s' "$TOKEN" | grep -qE '^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$'; then
    HAVE_TOKEN=1
  else
    echo "WARN: supplied token does not look like a JWT; ignoring it." >&2
    TOKEN=""
  fi
fi

if [ "$REQUIRE_AUTH" -eq 1 ] && [ "$HAVE_TOKEN" -ne 1 ]; then
  echo "FATAL: --require-auth set but no usable JWT was supplied." >&2
  echo "Passed: 0"; echo "Failed: 0"; echo "Skipped: 0"; echo "Warnings: 0"
  exit 2
fi

# ---------------------------------------------------------------------------
# Counters and helpers
# ---------------------------------------------------------------------------
PASS=0; FAIL=0; SKIP=0; WARN=0

sanitize() {
  # Redact emails and JWT-like strings from any echoed body fragment.
  sed -E 's/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+/<email>/g; s/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/<jwt>/g'
}

# do_req METHOD PATH [auth:0|1] [extra curl args...]
# echoes the HTTP status code; writes the (small) body to $BODY_FILE
BODY_FILE=""
do_req() {
  local method="$1" path="$2" auth="$3"; shift 3
  BODY_FILE="$(mktemp)"
  local hdrs=()
  if [ "$auth" = "1" ] && [ "$HAVE_TOKEN" -eq 1 ]; then
    hdrs+=(-H "Authorization: Bearer $TOKEN")
  fi
  curl -s -o "$BODY_FILE" -m "$CURL_MAX_TIME" -X "$method" \
       -H "Content-Type: application/json" "${hdrs[@]}" "$@" \
       -w "%{http_code}" "$BASE$path"
}

body_sig() {
  tr -d '\n' < "$BODY_FILE" 2>/dev/null | sanitize | cut -c1-70
}
cleanup_body() { [ -n "$BODY_FILE" ] && rm -f "$BODY_FILE"; BODY_FILE=""; }

# report_line RESULT ID LABEL DETAIL
report_line() {
  printf '%-4s %-4s %s -> %s\n' "$1" "$2" "$3" "$4"
}

# expect_exact ID LABEL METHOD PATH AUTH EXPECTED  — required check, exact status
expect_exact() {
  local id="$1" label="$2" method="$3" path="$4" auth="$5" expected="$6"; shift 6
  if [ "$auth" = "1" ] && [ "$HAVE_TOKEN" -ne 1 ]; then
    SKIP=$((SKIP+1)); report_line SKIP "$id" "$label" "no JWT supplied"; return
  fi
  local code; code="$(do_req "$method" "$path" "$auth" "$@")"
  if [ "$code" = "$expected" ]; then
    PASS=$((PASS+1)); report_line PASS "$id" "$label" "$code"
  else
    FAIL=$((FAIL+1)); report_line FAIL "$id" "$label" "got $code, expected $expected [$(body_sig)]"
  fi
  cleanup_body
}

# expect_read ID LABEL PATH  — required-when-token read: 2xx PASS, 400/403 WARN, else FAIL
expect_read() {
  local id="$1" label="$2" path="$3"; shift 3
  if [ "$HAVE_TOKEN" -ne 1 ]; then
    SKIP=$((SKIP+1)); report_line SKIP "$id" "$label" "no JWT supplied"; return
  fi
  local code; code="$(do_req GET "$path" 1 "$@")"
  case "$code" in
    2??) PASS=$((PASS+1)); report_line PASS "$id" "$label" "$code" ;;
    400) WARN=$((WARN+1)); report_line WARN "$id" "$label" "$code (missing param? see README)" ;;
    403) WARN=$((WARN+1)); report_line WARN "$id" "$label" "$code (low-priv role may lack read permission)" ;;
    *)   FAIL=$((FAIL+1)); report_line FAIL "$id" "$label" "got $code [$(body_sig)]" ;;
  esac
  cleanup_body
}

# expect_optional ID LABEL METHOD PATH AUTH  — never FAILs: 2xx PASS else WARN
expect_optional() {
  local id="$1" label="$2" method="$3" path="$4" auth="$5"; shift 5
  if [ "$auth" = "1" ] && [ "$HAVE_TOKEN" -ne 1 ]; then
    SKIP=$((SKIP+1)); report_line SKIP "$id" "$label" "no JWT supplied"; return
  fi
  local code; code="$(do_req "$method" "$path" "$auth" "$@")"
  case "$code" in
    2??) PASS=$((PASS+1)); report_line PASS "$id" "$label" "$code" ;;
    *)   WARN=$((WARN+1)); report_line WARN "$id" "$label" "$code (optional)" ;;
  esac
  cleanup_body
}

echo "INMO DEV smoke gate — base: $BASE"
if [ "$HAVE_TOKEN" -eq 1 ]; then echo "auth: JWT supplied via $_token_source (authenticated tier will run)";
else echo "auth: no JWT (authenticated tier will SKIP)"; fi
echo "-----------------------------------------------------------------"

# ---------------------------------------------------------------------------
# Unauthenticated required checks
# ---------------------------------------------------------------------------
expect_exact U1  "GET /health"                         GET  "/health"                         0 200
expect_exact U2  "GET /user-service/pkce/generate"     GET  "/user-service/pkce/generate"     0 200
expect_exact U3  "GET /audit-service/health"           GET  "/audit-service/health"           0 200
expect_exact S12 "POST general-crm/register blocked"   POST "/user-service/auth/general-crm/register" 0 404 -d '{}'
expect_exact S13 "POST general-crm/login blocked"      POST "/user-service/auth/general-crm/login"    0 404 -d '{}'

# ---------------------------------------------------------------------------
# Authenticated read checks (SKIP without a token)
# ---------------------------------------------------------------------------
expect_read A3 "user-service roles read"        "/user-service/api/roles"
expect_read A4 "profile-service profile read"   "/profile-service/api/profile"
expect_read A5 "subscription-service read"      "/subscription-service/api/v1/subscriptions"
expect_read A6 "events-service events read"     "/events-service/api/events"
expect_read A7 "issue-service issues read"      "/issue-service/api/issues"
expect_read A8 "reporting-service dashboard"    "/reporting-service/api/dashboard/overview"
expect_read A9 "audit-service audit-logs read"  "/audit-service/api/audit-logs"

# ---------------------------------------------------------------------------
# Security regression checks (require a token to exercise the backend)
# ---------------------------------------------------------------------------
INT_EP="/profile-service/api/profile/internal/by-email?tenantId=${TENANT_ID}&email=nonexistent@example.invalid"
expect_exact S14 "external x-internal-request denied" GET "$INT_EP" 1 403 -H "x-internal-request: true"
expect_exact S15 "spoofed x-jwt-verified no bypass"   GET "$INT_EP" 1 403 -H "x-jwt-verified: true"

# ---------------------------------------------------------------------------
# Optional / informational checks (never FAIL the gate)
# ---------------------------------------------------------------------------
expect_optional A10 "notification read"          GET  "/notification-service/api/notifications" 1
expect_optional A11 "auth/refresh reachable"     POST "/user-service/auth/refresh" 0 -d '{}'

# ---------------------------------------------------------------------------
# Summary + exit code
# ---------------------------------------------------------------------------
echo "-----------------------------------------------------------------"
echo "Passed: $PASS"
echo "Failed: $FAIL"
echo "Skipped: $SKIP"
echo "Warnings: $WARN"

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
if [ "$REQUIRE_AUTH" -eq 1 ] && [ "$HAVE_TOKEN" -ne 1 ]; then
  exit 2
fi
exit 0
