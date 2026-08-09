#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
for f in "$ROOT/.env" "$ROOT/apps/web/.env"; do
  bak="$f.pre-tunnel-backup"
  if [[ -f "$bak" ]]; then
    cp "$bak" "$f"
    echo "Restored $f from backup"
  else
    # fallback: force localhost
    python3 - <<PY
from pathlib import Path
p = Path("$f")
if not p.exists():
  raise SystemExit(0)
lines=[]
for line in p.read_text().splitlines():
  if line.startswith("NEXT_PUBLIC_APP_URL="):
    lines.append("NEXT_PUBLIC_APP_URL=http://localhost:3000")
  else:
    lines.append(line)
p.write_text("\n".join(lines)+"\n")
print(f"Reset NEXT_PUBLIC_APP_URL on {p}")
PY
  fi
done

# Restore Retell webhooks to production app URL if set, else localhost note
PROD_URL="${RETELL_REVERT_WEBHOOK_BASE:-https://agentdesk-ai-mu.vercel.app}"
WEBHOOK_URL="${PROD_URL}/api/webhooks/retell"
export RETELL_API_KEY="$(python3 - <<PY
from pathlib import Path
for line in Path("$ROOT/apps/web/.env").read_text().splitlines():
    if line.startswith("RETELL_API_KEY="):
        print(line.split("=",1)[1].strip().strip('"'))
        break
PY
)"
for AGENT_ID in agent_1d98048dbdb0b0c284f844fb05 agent_d28615ad3491d42675fcdc7dfa; do
  curl -sS -X PATCH "https://api.retellai.com/update-agent/${AGENT_ID}" \
    -H "Authorization: Bearer ${RETELL_API_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"webhook_url\":\"${WEBHOOK_URL}\",\"webhook_events\":[\"call_started\",\"call_ended\",\"call_analyzed\"]}" >/dev/null
  echo "Restored Retell webhook for $AGENT_ID -> $WEBHOOK_URL"
done
echo "Done. Restart local Next.js if it is running. Stop cloudflared tunnel process separately."
