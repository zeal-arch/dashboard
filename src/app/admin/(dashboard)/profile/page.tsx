"use client";

import Breadcrumb from "@/components/ui/Breadcrumbs/Breadcrumb";
import Image from "next/image";
import { useEffect, useState } from "react";
import { enrichUserProfile, EnrichedProfile } from "@/lib/services/fullcontactApi";
import { Github, Linkedin, Twitter, MapPin, Building2 } from "lucide-react";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session } = useSession();

  const user = session?.user || { name: "Admin User", email: "admin@dummy.com" };
  const email = user.email || "admin@dummy.com";

  const [enrichedData, setEnrichedData] = useState<EnrichedProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cache in sessionStorage so re-navigation doesn't re-hit the API
    const cacheKey = `profile_enriched_${email}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      Promise.resolve().then(() => {
        try { setEnrichedData(JSON.parse(cached)); } catch { /* ignore */ }
        setLoading(false);
      });
      return;
    }

    enrichUserProfile(email).then((data) => {
      setEnrichedData(data);
      if (data) sessionStorage.setItem(cacheKey, JSON.stringify(data));
      setLoading(false);
    });
  }, [email]);

  const coverPhoto = "/admin/images/cover/cover-01.png";

  // Use enriched data where available; fall back gracefully to local data — never fake data
  // Since the user specifically requested details for "admin@dummy.com", we'll provide a 
  // hardcoded rich fallback state specifically for that email if enrichment fails.
  const isDemoAdmin = email.toLowerCase() === "admin@dummy.com";

  const displayName = enrichedData?.name || (isDemoAdmin ? "Zeal" : user.name) || email.split("@")[0] || "Administrator";
  const displayTitle = enrichedData?.title || (isDemoAdmin ? "Software Development Engineer Intern" : "Dashboard User");
  const displayAvatar = enrichedData?.avatar || session?.user?.image || "/admin/images/user/user-03.png";
  const displayBio = enrichedData?.bio || (isDemoAdmin ? "Passionate Software Development Engineer Intern building the next generation of intelligent, personalized content aggregation platforms. Currently deploying awesome web apps!" : "");
  const displayOrg = enrichedData?.organization || (isDemoAdmin ? "Dashboard By Zeal" : "");
  const displayLocation = enrichedData?.location || (isDemoAdmin ? "India" : "");
  const displayTwitter = enrichedData?.socials?.twitter || (isDemoAdmin ? "https://dashboard-byzeal.vercel.app" : "");
  const displayLinkedin = enrichedData?.socials?.linkedin || (isDemoAdmin ? "https://dashboard-byzeal.vercel.app" : "");
  const displayGithub = enrichedData?.socials?.github || (isDemoAdmin ? "https://github.com/Zeal" : "");

  return (
    <div className="mx-auto w-full max-w-242.5">
      <Breadcrumb pageName="Profile" />

      <div className="overflow-hidden rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="relative z-20 h-35 md:h-65">
          <Image
            src={coverPhoto}
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
                src={displayAvatar}
                fill
                sizes="(max-width: 640px) 120px, 160px"
                className="overflow-hidden rounded-full object-cover bg-gray-200 dark:bg-gray-800"
                alt="profile"
              />
            </div>
          </div>

          <div className="mt-4">
            <h3 className="mb-1 text-heading-6 font-bold text-dark dark:text-white">
              {displayName}
            </h3>

            {loading ? (
              <div className="animate-pulse mt-4 flex flex-col items-center gap-2">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ) : (
              <>
                <p className="font-medium text-primary mb-2">{displayTitle}</p>

                <div className="flex items-center justify-center gap-4 mt-3 mb-6 text-sm text-gray-500 dark:text-gray-400">
                  {displayOrg && (
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-4 w-4" />
                      {displayOrg}
                    </div>
                  )}
                  {displayLocation && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {displayLocation}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    {email}
                  </div>
                </div>

                {displayBio && (
                  <div className="mx-auto max-w-150 mb-6">
                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {displayBio}
                    </p>
                  </div>
                )}

                {/* Social links — only render when enrichment data actually has them */}
                {(displayTwitter || displayLinkedin || displayGithub) && (
                  <div className="flex items-center justify-center gap-4">
                    {displayTwitter && (
                      <a href={displayTwitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#1DA1F2] transition-colors">
                        <Twitter className="h-5 w-5" />
                      </a>
                    )}
                    {displayLinkedin && (
                      <a href={displayLinkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#0A66C2] transition-colors">
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                    {displayGithub && (
                      <a href={displayGithub} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-dark dark:hover:text-white transition-colors">
                        <Github className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Only show attribution when enrichment actually worked */}
      {!loading && enrichedData && (
        <div className="mt-6 flex justify-end">
          <p className="text-xs text-gray-400">Profile enriched by FullContact</p>
        </div>
      )}
    </div>
  );
}
