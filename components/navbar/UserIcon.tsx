import { LuUser } from "react-icons/lu";
import Image from "next/image";
import { getSession } from "@/utils/session";

async function UserIcon() {
  const session = await getSession();
  const profileImage = session?.user.image;

  if (profileImage) {
    return (
      <Image
        src={profileImage}
        alt="User profile image"
        width={24}
        height={24}
        className="w-6 h-6 rounded-full object-cover"
      />
    );
  }

  return <LuUser className="w-6 h-6 bg-primary rounded-full text-white" />;
}
export default UserIcon;
