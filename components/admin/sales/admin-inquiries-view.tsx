"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import FormContainer from "@/components/form/FormContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  tableLinkClassName,
} from "@/components/ui/table";
import { formatDate } from "@/utils/format";
import {
  markCallbackInquiriesReadAction,
  updateCallbackInquiryStatusAction,
} from "@/utils/actions";
import { LuSearch } from "react-icons/lu";

export type AdminInquiryRow = {
  id: string;
  phone: string;
  note: string | null;
  productId: string | null;
  productName: string | null;
  productCode: string | null;
  status: "NEW" | "IN_PROGRESS" | "CLOSED";
  readAt: string | null;
  createdAt: string;
};

const STATUS_KEYS = ["NEW", "IN_PROGRESS", "CLOSED"] as const;

function InquiryStatusForm({
  id,
  status,
}: {
  id: string;
  status: AdminInquiryRow["status"];
}) {
  const t = useTranslations("Admin");
  const [value, setValue] = useState(status);
  const formId = `inquiry-status-${id}`;

  return (
    <FormContainer
      id={formId}
      action={updateCallbackInquiryStatusAction}
      className="flex items-center gap-2"
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={value} />
      <Select
        value={value}
        onValueChange={(next) => {
          setValue(next as AdminInquiryRow["status"]);
          queueMicrotask(() => {
            const form = document.getElementById(formId) as HTMLFormElement | null;
            form?.requestSubmit();
          });
        }}
      >
        <SelectTrigger className="h-9 w-[10rem]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_KEYS.map((key) => (
            <SelectItem key={key} value={key}>
              {t(`inquiryStatus.${key}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormContainer>
  );
}

export default function AdminInquiriesView({
  items,
  locale,
}: {
  items: AdminInquiryRow[];
  locale: string;
}) {
  const t = useTranslations("Admin");
  const [search, setSearch] = useState("");

  useEffect(() => {
    void markCallbackInquiriesReadAction();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const hay = [
        item.phone,
        item.note,
        item.productName,
        item.productCode,
        item.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [items, search]);

  return (
    <section className="grid w-full min-w-0 grid-cols-1 gap-6">
      <div className="relative min-w-0 max-w-md">
        <LuSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={search}
          placeholder={t("searchInquiriesPlaceholder")}
          className="h-9 pl-9"
          onChange={(event) => setSearch(event.target.value)}
          aria-label={t("searchInquiriesPlaceholder")}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        {t("totalInquiries", { count: filtered.length })}
      </p>
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("inquiriesEmpty")}</p>
      ) : (
        <div className="overflow-x-auto rounded-sm border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("inquiryPhone")}</TableHead>
                <TableHead>{t("inquiryNote")}</TableHead>
                <TableHead>{t("vehicle")}</TableHead>
                <TableHead>{t("inquiryStatusLabel")}</TableHead>
                <TableHead>{t("createdAt")}</TableHead>
                <TableHead className="w-[1%]">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => {
                const vehicleLabel =
                  item.productName || item.productCode || t("inquiryNoProduct");
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">
                      <a href={`tel:${item.phone}`} className={tableLinkClassName}>
                        {item.phone}
                      </a>
                      {!item.readAt ? (
                        <Badge className="ml-2" variant="default">
                          {t("inquiryUnread")}
                        </Badge>
                      ) : null}
                    </TableCell>
                    <TableCell className="max-w-[16rem]">
                      {item.note ? (
                        <p className="line-clamp-3 whitespace-pre-wrap text-sm text-foreground">
                          {item.note}
                        </p>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.productId ? (
                        <Link
                          href={`/products/${item.productId}`}
                          className={tableLinkClassName}
                        >
                          {vehicleLabel}
                          {item.productCode ? (
                            <span className="ml-1 font-mono text-xs text-muted-foreground">
                              {item.productCode}
                            </span>
                          ) : null}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">{vehicleLabel}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <InquiryStatusForm id={item.id} status={item.status} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(new Date(item.createdAt), locale)}
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="outline" size="sm">
                        <a href={`tel:${item.phone}`}>{t("inquiryCall")}</a>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
