"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import EmptyList from "@/components/global/EmptyList";
import { CatalogMenuSelect } from "@/components/admin/catalog/catalog-fields";
import { SubmitButton } from "@/components/form/Buttons";
import { ConfirmDeleteIcon } from "@/components/form/ConfirmDelete";
import SheetFormActions from "@/components/admin/sheet-form-actions";
import FormContainer from "@/components/form/FormContainer";
import FormInput from "@/components/form/FormInput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  tableActionsClassName,
} from "@/components/ui/table";
import {
  archiveAdminUserAction,
  createAdminUserAction,
  updateAdminUserAction,
} from "@/utils/actions";
import type { actionFunction } from "@/utils/types";
import { formatDate } from "@/utils/format";
import AdminListToolbar from "@/components/admin/admin-list-toolbar";
import { canMutateUserArchive } from "@/utils/user-roles";
import { LuArchive, LuPen, LuShoppingBag } from "react-icons/lu";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  userCode: string;
  role: "USER" | "ADMIN" | "MANAGER";
  createdAt: string;
  productCount: number;
  orderCount: number;
  archivedAt?: string | null;
};

function ArchiveUser({ userId }: { userId: string }) {
  const archiveUser = archiveAdminUserAction.bind(null, {
    userId,
  }) as unknown as actionFunction;
  return <ConfirmDeleteIcon action={archiveUser} mode="archive" />;
}

function UserFormFields({
  user,
  includePassword = false,
  canManageRoles = false,
}: {
  user?: AdminUserRow;
  includePassword?: boolean;
  canManageRoles?: boolean;
}) {
  const t = useTranslations("Admin");
  return (
    <div className="grid gap-4">
      <FormInput
        type="text"
        name="name"
        label={t("userName")}
        defaultValue={user?.name ?? ""}
      />
      <FormInput
        type="email"
        name="email"
        label={t("email")}
        defaultValue={user?.email ?? ""}
      />
      <FormInput
        type="tel"
        name="phone"
        label={t("phone")}
        defaultValue={user?.phone ?? ""}
        required={false}
      />
      {canManageRoles ? (
        <CatalogMenuSelect
          name="role"
          label={t("role")}
          defaultValue={user?.role ?? "USER"}
          options={[
            { value: "USER", label: t("roleUser") },
            { value: "MANAGER", label: t("roleManager") },
            { value: "ADMIN", label: t("roleAdmin") },
          ]}
        />
      ) : null}
      {includePassword ? (
        <FormInput
          type="password"
          name="password"
          label={t("userPassword")}
          defaultValue=""
        />
      ) : null}
      {user?.userCode ? (
        <div className="grid gap-2">
          <p className="text-sm font-medium">{t("userCode")}</p>
          <p className="rounded-sm border bg-muted/40 px-3 py-2 text-sm tabular-nums">
            {user.userCode}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default function AdminUsersView({
  items,
  locale,
  createOpen,
  editId,
  editFallback,
  currentUserId,
  canManageRoles = false,
  canDelete = false,
}: {
  items: AdminUserRow[];
  locale: string;
  createOpen: boolean;
  editId?: string;
  editFallback?: AdminUserRow;
  currentUserId: string;
  canManageRoles?: boolean;
  canDelete?: boolean;
}) {
  const t = useTranslations("Admin");
  const [search, setSearch] = useState("");
  const [sheetCreateOpen, setSheetCreateOpen] = useState(createOpen);
  const [sheetEditId, setSheetEditId] = useState<string | undefined>(editId);

  function syncUsersSheetUrl(next: { create?: boolean; edit?: string }) {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.delete("create");
    url.searchParams.delete("edit");
    if (next.create) url.searchParams.set("create", "1");
    if (next.edit) url.searchParams.set("edit", next.edit);
    window.history.replaceState(null, "", url.toString());
  }

  function canEditUser(user: AdminUserRow) {
    return canManageRoles || user.role === "USER";
  }

  function canArchiveUser(user: AdminUserRow) {
    return canDelete && canMutateUserArchive(user, currentUserId);
  }

  const editUser = useMemo(() => {
    const found =
      items.find((item) => item.id === sheetEditId) ??
      (editFallback && editFallback.id === sheetEditId ? editFallback : null);
    if (!found || !canEditUser(found)) return null;
    return found;
  }, [items, sheetEditId, editFallback, canManageRoles]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const hay = `${item.name} ${item.email} ${item.phone ?? ""} ${item.userCode}`
        .toLowerCase();
      return hay.includes(q);
    });
  }, [items, search]);

  function setCreateOpen(open: boolean) {
    setSheetCreateOpen(open);
    if (open) {
      setSheetEditId(undefined);
      syncUsersSheetUrl({ create: true });
      return;
    }
    syncUsersSheetUrl({});
  }

  function setEditOpen(open: boolean, userId?: string) {
    if (open && userId) {
      setSheetCreateOpen(false);
      setSheetEditId(userId);
      syncUsersSheetUrl({ edit: userId });
      return;
    }
    setSheetEditId(undefined);
    syncUsersSheetUrl({});
  }

  const archiveUser =
    editUser != null
      ? (archiveAdminUserAction.bind(null, {
          userId: editUser.id,
        }) as unknown as actionFunction)
      : undefined;

  return (
    <section className="grid w-full min-w-0 grid-cols-1 gap-6">
      <AdminListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("searchUsersPlaceholder")}
        createLabel={t("createUser")}
        onCreate={() => setCreateOpen(true)}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {t("totalUsers", { count: filtered.length })}
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/archive?tab=users">
            <LuArchive className="size-4" />
            {t("archive")}
          </Link>
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyList />
      ) : (
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("userCode")}</TableHead>
                  <TableHead>{t("userName")}</TableHead>
                  <TableHead>{t("email")}</TableHead>
                  <TableHead>{t("phone")}</TableHead>
                  <TableHead>{t("role")}</TableHead>
                  <TableHead>{t("date")}</TableHead>
                  <TableHead className={tableActionsClassName}>
                    {t("actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="tabular-nums">{item.userCode}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>{item.phone || "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.role === "USER" ? "secondary" : "default"
                        }
                      >
                        {item.role === "ADMIN"
                          ? t("roleAdmin")
                          : item.role === "MANAGER"
                            ? t("roleManager")
                            : t("roleUser")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(new Date(item.createdAt), locale)}
                    </TableCell>
                    <TableCell className={tableActionsClassName}>
                      <div className="inline-flex items-center justify-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer text-muted-foreground"
                          asChild
                        >
                          <Link
                            href={`/admin/sales?create=1&userId=${item.id}`}
                            aria-label={t("createOrderForUser")}
                          >
                            <LuShoppingBag />
                          </Link>
                        </Button>
                        {canEditUser(item) ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer text-muted-foreground"
                            onClick={() => setEditOpen(true, item.id)}
                            aria-label={t("editUser")}
                          >
                            <LuPen />
                          </Button>
                        ) : null}
                        {canArchiveUser(item) && !item.archivedAt ? (
                          <ArchiveUser userId={item.id} />
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Sheet open={sheetCreateOpen} onOpenChange={setCreateOpen}>
        <SheetContent>
          <div className="grid gap-6">
            <SheetHeader>
              <SheetTitle>{t("createUserSheetTitle")}</SheetTitle>
              <SheetDescription>{t("createUserSheetLede")}</SheetDescription>
            </SheetHeader>
            <FormContainer action={createAdminUserAction}>
              <div className="grid gap-6">
                <UserFormFields
                  includePassword
                  canManageRoles={canManageRoles}
                />
                <SubmitButton text={t("submitCreateUser")} className="w-fit" />
              </div>
            </FormContainer>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet
        open={Boolean(editUser)}
        onOpenChange={(open) => setEditOpen(open, editUser?.id)}
      >
        <SheetContent>
          <div className="grid gap-6">
            <SheetHeader>
              <SheetTitle>{t("editUserSheetTitle")}</SheetTitle>
              <SheetDescription>{t("editUserSheetLede")}</SheetDescription>
            </SheetHeader>
            {editUser ? (
              <>
                <FormContainer action={updateAdminUserAction}>
                  <input type="hidden" name="id" value={editUser.id} />
                  <div className="grid gap-6">
                    <UserFormFields
                      user={editUser}
                      canManageRoles={canManageRoles}
                    />
                    <SheetFormActions
                      saveLabel={t("submitUpdate")}
                      deleteFormId={
                        canArchiveUser(editUser) && !editUser.archivedAt
                          ? "archive-user-form"
                          : undefined
                      }
                    />
                  </div>
                </FormContainer>
                {canArchiveUser(editUser) && archiveUser && !editUser.archivedAt ? (
                  <FormContainer
                    id="archive-user-form"
                    className="hidden"
                    action={archiveUser}
                  >
                    <input type="hidden" name="userId" value={editUser.id} />
                  </FormContainer>
                ) : null}
              </>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
}
