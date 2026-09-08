export const DEFAULT_ADMIN_AVATAR = "/avatar_mtruck.svg";

function uniqueEmails(values: Array<string | undefined>) {
  return [...new Set(values.map((value) => value?.trim()).filter(Boolean))] as string[];
}

export function getAdminEmails() {
  return uniqueEmails([
    process.env.ADMIN_EMAIL,
    process.env.ADMIN_TEST_EMAIL,
  ]);
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  return getAdminEmails().includes(email);
}

export function getAdminBootstrap() {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD?.trim();
  const name = process.env.ADMIN_NAME?.trim() || "Admin";

  if (!email || !password) {
    throw new Error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD in .env to bootstrap the admin user."
    );
  }

  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters.");
  }

  return {
    email,
    password,
    name,
    image: DEFAULT_ADMIN_AVATAR,
  };
}
