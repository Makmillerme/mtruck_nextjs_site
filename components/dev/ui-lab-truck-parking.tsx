"use client";

import { TruckParking } from "@/components/games/truck-parking";

/**
 * MTruck parking mini-game — UI Lab only.
 * Prototype reference: m_truck_parking.html
 */
export default function UiLabTruckParking() {
  return (
    <div className="grid max-w-3xl gap-4">
      <p className="text-sm text-muted-foreground">
        Велика карта з камерою: село → місто → парк → термінал зі шлагбаумом →
        рампа складу. Сині стрілки показують шлях до P. Оберіть контейнеровоз,
        тягач або B-double — причепи згинаються в зчепленні.
      </p>
      <div className="overflow-hidden rounded-sm border border-border bg-background p-3 sm:p-4">
        <TruckParking className="w-full" />
      </div>
    </div>
  );
}
