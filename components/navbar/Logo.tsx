import { Link } from "@/i18n/navigation";

function Logo() {
  return (
    <Link href="/" className="flex shrink-0 items-center">
      <img
        src="/logo_mtruck.svg?v=gunmetal5"
        alt="M-TRUCK"
        width={223}
        height={88}
        className="h-8 w-auto max-w-[10rem] sm:h-9 sm:max-w-[11.5rem] lg:h-10 lg:max-w-[13rem]"
        decoding="async"
      />
    </Link>
  );
}

export default Logo;
