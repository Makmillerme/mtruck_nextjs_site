# Trailer Snake (2026-10-08)

Lead truck: bicycle model (`yaw = v * tan(steer) / wheelbase`) — no tank-turn.
Trailers: kinematic follow — angle from old rear axle to pulled hitch, then pin hitch. `MAX_HITCH` 1.05 so they track the curve instead of drifting as a stiff pole.
