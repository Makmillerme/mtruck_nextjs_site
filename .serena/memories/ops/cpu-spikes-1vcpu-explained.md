# CPU spikes explanation 2026-08-20

VPS has **1 vCPU**. Panel graph spikes to 100% on any short burst (SSH, docker, node MCP start, panel agent poll, Next request) then drops — normal needle pattern. Measured avg idle ~97%, load ~0.3–0.7. Not sustained Postgres load. Current 4% is healthy.
