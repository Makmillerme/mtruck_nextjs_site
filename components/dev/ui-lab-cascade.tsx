"use client";

import { useState } from "react";
import CascadeSelect, {
  type CascadeItem,
} from "@/components/form/cascade-select";

const DEMO_TREE: CascadeItem[] = [
  {
    id: "commercial",
    label: "Комерційна техніка",
    children: [
      {
        id: "tractors",
        label: "Сідельні тягачі",
        children: [
          { id: "tractors-4x2", label: "4×2" },
          { id: "tractors-6x2", label: "6×2" },
          { id: "tractors-6x4", label: "6×4" },
        ],
      },
      {
        id: "containers",
        label: "Контейнеровози",
        children: [
          { id: "containers-20", label: "20′" },
          { id: "containers-40", label: "40′" },
        ],
      },
      { id: "vans", label: "Малотоннажні буси" },
    ],
  },
  {
    id: "parts",
    label: "Запчастини",
    children: [
      { id: "parts-engine", label: "Двигун" },
      { id: "parts-chassis", label: "Ходова" },
    ],
  },
];

export default function UiLabCascade() {
  const [value, setValue] = useState<string | null>("containers-40");

  return (
    <div className="grid max-w-xl gap-3">
      <CascadeSelect
        items={DEMO_TREE}
        value={value}
        onValueChange={setValue}
        placeholder="Оберіть папку"
        allowEmpty
        emptyOptionLabel="Без папки"
      />
      <p className="text-xs text-muted-foreground">
        Обрано: <span className="font-medium text-foreground">{value ?? "—"}</span>
      </p>
    </div>
  );
}
