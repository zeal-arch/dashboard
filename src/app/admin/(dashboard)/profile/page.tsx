"use client";

import Breadcrumb from "@/components/ui/Breadcrumbs/Breadcrumb";
import Image from "next/image";
import { useEffect, useState } from "react";
import { enrichUserProfile, EnrichedProfile } from "@/lib/services/fullcontactApi";
import { Github, Linkedin, Twitter, MapPin, Building2, FileText, ExternalLink, Code2, Award, Briefcase, GraduationCap, CheckCircle2 } from "lucide-react";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session } = useSession();

  const user = session?.user || { name: "Zeal", email: "zeal@dashboard.dev" };
  const email = user.email || "zeal@dashboard.dev";

  const [enrichedData, setEnrichedData] = useState<EnrichedProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  const displayName = enrichedData?.name || "Zeal";
  const displayTitle = enrichedData?.title || "Software Development Engineer (SDE) Intern - Frontend Development";
  const displayAvatar = enrichedData?.avatar || session?.user?.image || "/admin/images/user/user-03.png";
  const displayBio = enrichedData?.bio || "Software Development Engineer Intern specializing in modern React/Next.js architectures, state management, real-time data streaming, and scalable frontend design systems.";
  const displayOrg = enrichedData?.organization || "PG-AGI Assignment Candidate";
  const displayLocation = enrichedData?.location || "India";
  const displayTwitter = enrichedData?.socials?.twitter || "https://dashboard-byzeal.vercel.app";
  const displayLinkedin = enrichedData?.socials?.linkedin || "https://dashboard-byzeal.vercel.app";
  const displayGithub = enrichedData?.socials?.github || "https://github.com/zeal-arch/dashboard";

  const SKILLS = [
    { name: "Next.js 16 (App Router)", category: "Frontend Framework" },
    { name: "React 19 & TypeScript", category: "Core Technologies" },
    { name: "Redux Toolkit & Persist", category: "State Management" },
    { name: "Tailwind CSS v4", category: "Styling & UI Design" },
    { name: "Framer Motion & Dnd-Kit", category: "Animations & Interactivity" },
    { name: "Playwright E2E Testing", category: "Quality Assurance" },
    { name: "Server-Sent Events (SSE)", category: "Real-Time Streaming" },
    { name: "TF-IDF Cosine Similarity", category: "AI & Personalization" },
    { name: "i18next (75 Languages)", category: "Localization" },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <Breadcrumb pageName="Profile & Resume" />

      {/* Main Profile Header Card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-dark-3 dark:bg-gray-dark">
        <div className="relative z-20 h-40 md:h-60">
          <Image
            src={coverPhoto}
            alt="profile cover"
            className="rounded-t-2xl object-cover object-center"
            fill
            sizes="(max-width: 1200px) 100vw, 1200px"
            priority
          />
        </div>

        <div className="px-6 pb-8 text-center sm:px-8">
          <div className="relative z-30 mx-auto -mt-20 h-36 w-36 rounded-full bg-white/30 p-2 backdrop-blur-md dark:bg-black/30">
            <div className="relative h-full w-full drop-shadow-md">
              <Image
                src={displayAvatar}
                fill
                sizes="144px"
                className="overflow-hidden rounded-full object-cover bg-gray-200 dark:bg-gray-800"
                alt="profile"
              />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white sm:text-3xl">
                {displayName}
              </h1>
              <p className="mt-1 text-sm font-semibold text-primary sm:text-base">
                {displayTitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-primary" />
                {displayOrg}
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" />
                {displayLocation}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                {email}
              </div>
            </div>

            <p className="mx-auto max-w-2xl text-xs leading-relaxed text-gray-600 dark:text-gray-300 sm:text-sm">
              {displayBio}
            </p>

            {/* Social Links & Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href="https://github.com/zeal-arch/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
              >
                <Github className="h-4 w-4" />
                GitHub Repository
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>

              <a
                href="https://dashboard-byzeal.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary/90"
              >
                <FileText className="h-4 w-4" />
                Live Demo App
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Section: Details & Skills */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Candidate Resume Summary */}
        <div className="md:col-span-2 space-y-6">
          {/* Assignment Overview */}
          <div className="rounded-2xl border border-gray-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-dark-3 dark:bg-gray-dark/70">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-white/5">
              <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                <Briefcase className="h-4 w-4 text-primary" />
                Assignment & Project Specifications
              </h2>
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
                SDE Intern Assignment
              </span>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
              <p>
                <strong>Role:</strong> Software Development Engineer (SDE) Intern - Frontend Development
              </p>
              <p>
                <strong>Project:</strong> Personalised Content Aggregation Dashboard
              </p>
              <p>
                Designed and engineered a high-performance, real-time content dashboard aggregating News, Movies, Music, Sports, Gaming, Anime, Food, and Community discussions with dynamic personalization algorithms.
              </p>
            </div>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              <div className="flex items-start gap-2.5 rounded-xl border border-gray-100 bg-gray-50/60 p-3 dark:border-white/5 dark:bg-white/5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">Smart AI Recommendation</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">TF-IDF Cosine Similarity engine</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-gray-100 bg-gray-50/60 p-3 dark:border-white/5 dark:bg-white/5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">Real-Time Event Stream</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Server-Sent Events (SSE) integration</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-gray-100 bg-gray-50/60 p-3 dark:border-white/5 dark:bg-white/5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">Global Localization</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">75 Languages natively supported</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-gray-100 bg-gray-50/60 p-3 dark:border-white/5 dark:bg-white/5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">100% E2E Test Suite</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Comprehensive Playwright tests</p>
                </div>
              </div>
            </div>
          </div>

          {/* Education & Experience */}
          <div className="rounded-2xl border border-gray-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-dark-3 dark:bg-gray-dark/70">
            <div className="mb-4 border-b border-gray-100 pb-3 dark:border-white/5">
              <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                <GraduationCap className="h-4 w-4 text-primary" />
                Education & Candidate Profile
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Bachelor of Technology (B.Tech) in Computer Science</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Focus on Software Engineering, Web Technologies, and Data Structures</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Skills */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-dark-3 dark:bg-gray-dark/70">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-white/5">
              <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                <Code2 className="h-4 w-4 text-primary" />
                Technical Skills
              </h2>
            </div>

            <div className="space-y-2.5">
              {SKILLS.map((skill) => (
                <div key={skill.name} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-2.5 dark:border-white/5 dark:bg-white/5">
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{skill.name}</span>
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                    {skill.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
