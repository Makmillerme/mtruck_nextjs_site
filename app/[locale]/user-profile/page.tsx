import { Link } from "@/i18n/navigation";
import { LuArrowLeft } from "react-icons/lu";
import { getAuthUser } from "@/utils/session";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTranslations } from "next-intl/server";

export default async function UserProfilePage() {
  const user = await getAuthUser();
  const t = await getTranslations("Account");

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <LuArrowLeft className="h-4 w-4" />
          {t("backToStore")}
        </Link>
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>{t("title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
