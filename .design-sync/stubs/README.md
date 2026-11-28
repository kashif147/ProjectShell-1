# design-sync stubs

Inert stand-ins that `.design-sync/build-lib.mjs` swaps in for app plumbing, in the
design-sync build ONLY (the CRM app itself is untouched). Decided by the owner on
2026-11-28: they keep the published bundle under the 12 MB file cap, keep hardcoded
client keys (Firebase web config, Google Maps, Stripe publishable) out of the artifact,
and stop Firebase/Stripe from running at module load inside every design.

Each stub exports exactly the names the CRM imports (see build-lib.mjs `STUBS`). If a
build fails with `No matching export in ".design-sync/stubs/..."`, the CRM started
importing a new name: add it here as a no-op.
