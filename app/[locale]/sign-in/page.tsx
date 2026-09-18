import SignInForm from "@/components/auth/SignInForm";

interface SignInPageProps {
  searchParams?: Promise<{ redirect_url?: string }>;
}

export default async function SignInPage(props: SignInPageProps) {
  const searchParams = await props.searchParams;
  const redirectUrl = searchParams?.redirect_url || "/products";

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <SignInForm redirectUrl={redirectUrl} />
    </div>
  );
}
