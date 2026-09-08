"use client";

import { Link } from "@/i18n/navigation";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { authClient } from "@/lib/auth-client";
import { useTranslations } from "next-intl";

const testAccounts = {
  "guest-user": {
    name: "Test User",
    email: "test@user.com",
    password: "12345678",
  },
  "guest-admin": {
    name: "Test Admin",
    email: "test@admin.com",
    password: "12345678",
  },
};

interface SignInFormProps {
  isGuest?: boolean | "admin";
  redirectUrl?: string;
}

function getGuestDefaults(isGuest: boolean | "admin") {
  if (isGuest === "admin") {
    return { role: "guest-admin", ...testAccounts["guest-admin"] };
  }
  if (isGuest) {
    return { role: "guest-user", ...testAccounts["guest-user"] };
  }
  return { role: "", email: "", password: "" };
}

export default function SignInForm({
  isGuest = false,
  redirectUrl = "/products",
}: SignInFormProps) {
  const t = useTranslations("Auth");
  const { toast } = useToast();
  const router = useRouter();
  const defaults = getGuestDefaults(isGuest);
  const [selectedRole, setSelectedRole] = useState(defaults.role);
  const [email, setEmail] = useState(defaults.email);
  const [password, setPassword] = useState(defaults.password);
  const [isLoading, setIsLoading] = useState(false);
  const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH === "true";

  const handleRoleSelect = (value: string) => {
    if (value === "clear") {
      setSelectedRole("");
      setEmail("");
      setPassword("");
    } else {
      setSelectedRole(value);
      const account = testAccounts[value as keyof typeof testAccounts];
      if (account) {
        setEmail(account.email);
        setPassword(account.password);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    if (!googleEnabled) {
      toast({
        variant: "destructive",
        title: t("googleNotConfigured"),
      });
      return;
    }
    await authClient.signIn.social({
      provider: "google",
      callbackURL: redirectUrl,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
        callbackURL: redirectUrl,
      });
      if (error) {
        toast({
          variant: "destructive",
          title: error.message || t("invalidCredentials"),
        });
        return;
      }
      router.push(redirectUrl);
      router.refresh();
    } catch {
      toast({
        variant: "destructive",
        title: t("invalidCredentials"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-muted p-8 rounded-lg">
        <div className="space-y-2 mb-6">
          <h1 className="text-2xl font-bold">{t("welcomeBack")}</h1>
          <p className="text-muted-foreground">{t("signInSubtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="guest-select">{t("testAccount")}</Label>
            <Select
              key={`select-${selectedRole || "empty"}`}
              value={selectedRole || undefined}
              onValueChange={handleRoleSelect}
            >
              <SelectTrigger id="guest-select">
                <SelectValue placeholder={t("selectTestAccount")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="guest-user">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{t("testUser")}</span>
                    <span className="text-xs text-muted-foreground">
                      test@user.com
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="guest-admin">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{t("guestAdmin")}</span>
                    <span className="text-xs text-muted-foreground">
                      test@admin.com
                    </span>
                  </div>
                </SelectItem>
                {selectedRole && (
                  <SelectItem
                    value="clear"
                    className="opacity-60 focus:opacity-100"
                  >
                    {t("clearSelection")}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t("password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t("signingIn") : t("signIn")}
          </Button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-muted px-2 text-muted-foreground">{t("or")}</span>
          </div>
        </div>

        <div className="space-y-4 mb-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {t("continueGoogle")}
          </Button>
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {t("noAccount")}{" "}
          <Link
            href="/sign-up"
            className="text-primary font-medium hover:underline"
          >
            {t("signUp")}
          </Link>
        </p>
      </div>
    </div>
  );
}
