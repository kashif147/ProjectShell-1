# DEV gateway configuration (captured, not deployed)

These files mirror the **currently-running DEV gateway** exactly as mounted on the DEV VM at
`/home/deploy-dev/gateway/`, captured byte-for-byte on 2026-09-27:

| File here | Source on the DEV VM |
|---|---|
| `nginx.conf` | `/home/deploy-dev/gateway/nginx.conf` |
| `sites-enabled/default.conf` | `/home/deploy-dev/gateway/sites-enabled/default.conf` |
| `lua/verify_jwt.lua` | `/home/deploy-dev/gateway/lua/verify_jwt.lua` |

## Provenance and scope

- **DEV `:8443` is the INMO demo baseline.** These files reflect what that gateway runs today.
- **No runtime deployment occurs from adding these files.** They are a source-of-truth capture only; nothing on the VM was changed, and no container was restarted or recreated.
- **`frontend/ProjectShell-1/default.conf` remains untouched.** That is a separate, UAT/prod-flavoured `default.conf` and is not the DEV file captured here.
- **UAT `:443` remains untouched.**
