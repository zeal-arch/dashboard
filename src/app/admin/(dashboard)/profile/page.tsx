import Breadcrumb from "@/components/ui/Breadcrumbs/Breadcrumb";
import Image from "next/image";

const MOCK_USER = {
  name: "Demo User",
  email: "demo@dashboard.com",
  role: "Administrator",
  profilePhoto: "/admin/images/user/user-03.png",
  coverPhoto: "/admin/images/cover/cover-01.png",
};

export default function ProfilePage() {
  return (
    <div className="mx-auto w-full max-w-[970px]">
      <Breadcrumb pageName="Profile" />

      <div className="overflow-hidden rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="relative z-20 h-35 md:h-65">
          <Image
            src={MOCK_USER.coverPhoto}
            alt="profile cover"
            className="rounded-tl-[10px] rounded-tr-[10px] object-cover object-center"
            fill
            sizes="(max-width: 970px) 100vw, 970px"
            priority
          />
        </div>
        <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
          <div className="relative z-30 mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-44 sm:p-3">
            <div className="relative drop-shadow-2 h-full w-full">
              <Image
                src={MOCK_USER.profilePhoto}
                fill
                sizes="(max-width: 640px) 120px, 160px"
                className="overflow-hidden rounded-full object-cover"
                alt="profile"
              />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="mb-1 text-heading-6 font-bold text-dark dark:text-white">
              {MOCK_USER.name}
            </h3>
            <p className="font-medium text-gray-600 dark:text-gray-400">{MOCK_USER.email}</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">{MOCK_USER.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
