"use client";

import { useState } from "react";
import { CatalogMenuSelect } from "@/components/admin/catalog/catalog-fields";
import SearchableEntityPicker from "@/components/admin/searchable-entity-picker";
import CascadeSelect from "@/components/form/cascade-select";
import { SheetDateField } from "@/components/form/sheet-date-field";

/**
 * Sheet field canon: one combobox chrome for every sheet dropdown
 * (admin + cabinet). Native select is not used in sheets.
 */
export function UiLabSheetFieldsCanon() {
  const [client, setClient] = useState("");
  const [folder, setFolder] = useState<string | null>(null);
  const [dateSingle, setDateSingle] = useState<string | undefined>();
  const [dateFrom, setDateFrom] = useState<string | undefined>();
  const [dateTo, setDateTo] = useState<string | undefined>();

  return (
    <div className="grid max-w-lg gap-6 rounded-sm border border-dashed p-4">
      <p className="text-sm text-muted-foreground">
        Канон поля в Sheet:{" "}
        <code className="text-xs">Button outline</code> +{" "}
        <code className="text-xs">h-11</code> +{" "}
        <code className="text-xs">role=combobox</code> +{" "}
        <code className="text-xs">LuChevronsUpDown</code> /{" "}
        <code className="text-xs">LuCalendar</code>. Компоненти:{" "}
        <code className="text-xs">SearchableEntityPicker</code>,{" "}
        <code className="text-xs">CatalogMenuSelect</code>,{" "}
        <code className="text-xs">SheetDateField</code>, cascade{" "}
        <code className="text-xs">variant=&quot;tree&quot;</code> у Sheet. Toolbar
        dropdowns лишаються <code className="text-xs">h-9</code>. Не
        використовувати native <code className="text-xs">type=&quot;date&quot;</code>. Календарні дати — <code className="text-xs">SheetDateField</code> (<code className="text-xs">Calendar</code> бере мову з <code className="text-xs">useLocale</code>: uk/en/de); числові діапазони (рік / пробіг) у каталозі — ручний from/to + slider (<code className="text-xs">RangeFacet</code>).
      </p>
      <CatalogMenuSelect
        name="lab-status"
        label="Короткий список без пошуку (статус / валюта)"
        defaultValue="PUBLISHED"
        searchable={false}
        allowClear={false}
        options={[
          { value: "DRAFT", label: "Чернетка" },
          { value: "PUBLISHED", label: "Опубліковано" },
          { value: "SOLD", label: "Продано" },
        ]}
      />
      <p className="text-xs text-muted-foreground">
        Пошук у combobox зʼявляється лише якщо опцій ≥{" "}
        <code className="text-[11px]">SHEET_COMBOBOX_SEARCH_MIN</code> (10).
        Короткі enum — явно <code className="text-[11px]">searchable=false</code>.
      </p>
      <SearchableEntityPicker
        name="lab-client"
        label="Пошук (клієнт / авто)"
        placeholder="Оберіть клієнта"
        searchPlaceholder="Пошук…"
        emptyLabel="Нічого не знайдено"
        options={[
          {
            value: "1",
            label: "17773 · MTruck Admin · admin@example.com",
            keywords: ["admin"],
          },
          {
            value: "2",
            label: "10001 · Іван · ivan@example.com",
            keywords: ["ivan"],
          },
          {
            value: "3",
            label: "10002 · Олена · olena@example.com",
            keywords: ["olena"],
          },
          {
            value: "4",
            label: "10003 · Петро · petro@example.com",
            keywords: ["petro"],
          },
          {
            value: "5",
            label: "10004 · Марія · maria@example.com",
            keywords: ["maria"],
          },
          {
            value: "6",
            label: "10005 · Андрій · andriy@example.com",
            keywords: ["andriy"],
          },
          {
            value: "7",
            label: "10006 · Наталія · natalia@example.com",
            keywords: ["natalia"],
          },
          {
            value: "8",
            label: "10007 · Сергій · sergiy@example.com",
            keywords: ["sergiy"],
          },
          {
            value: "9",
            label: "10008 · Юлія · yulia@example.com",
            keywords: ["yulia"],
          },
          {
            value: "10",
            label: "10009 · Дмитро · dmytro@example.com",
            keywords: ["dmytro"],
          },
          {
            value: "11",
            label: "10010 · Катерина · kate@example.com",
            keywords: ["kate"],
          },
        ]}
        value={client}
        onValueChange={setClient}
        allowClear
        clearLabel="Без клієнта"
      />
      <SheetDateField
        label="Дата (одна)"
        placeholder="Оберіть дату"
        value={dateSingle}
        onValueChange={setDateSingle}
        clearLabel="Скинути дату"
      />
      <div className="grid gap-2">
        <p className="text-sm font-medium">Період (Від / До)</p>
        <div className="grid grid-cols-2 gap-2">
          <SheetDateField
            label="Від"
            hideLabel
            placeholder="Від"
            value={dateFrom}
            onValueChange={setDateFrom}
            clearLabel="Скинути"
          />
          <SheetDateField
            label="До"
            hideLabel
            placeholder="До"
            value={dateTo}
            onValueChange={setDateTo}
            clearLabel="Скинути"
          />
        </div>
      </div>
      <div className="grid gap-2">
        <p className="text-sm font-medium">Папка (tree у Sheet)</p>
        <CascadeSelect
          items={[
            {
              id: "commercial",
              label: "Комерційна техніка",
              children: [
                { id: "tractors", label: "Сідельні тягачі" },
                { id: "vans", label: "Буси" },
              ],
            },
          ]}
          value={folder}
          onValueChange={setFolder}
          placeholder="Оберіть папку"
          variant="tree"
          allowEmpty
          emptyOptionLabel="Без папки"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Demo: client={" "}
        <span className="font-medium text-foreground">{client || "—"}</span>
        {" · "}date={" "}
        <span className="font-medium text-foreground">
          {dateSingle ?? "—"}
        </span>
        {" · "}period={" "}
        <span className="font-medium text-foreground">
          {dateFrom ?? "—"}…{dateTo ?? "—"}
        </span>
        {" · "}folder={" "}
        <span className="font-medium text-foreground">{folder ?? "—"}</span>
      </p>
    </div>
  );
}
