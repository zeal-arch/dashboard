import { Metadata } from "next";
import Link from "next/link";
import {
  UserIcon,
  ArrowRightIcon,
  StudentGraduatingIcon,
  Clock,
  LayoutDashboard,
  PieChart,
  BooksIcon,
} from "@/admin/assets/icons";
import Breadcrumb from "@/components/ui/Breadcrumbs/Breadcrumb";
import { ChartPreviewCard } from "@/admin/components/charts/ChartPreviewCard";

export const metadata: Metadata = {
  title: "Dashboard | Admin",
};

const quickLinks = [
  {
    title: "Student Info",
    description: "View and manage student inquiry submissions",
    href: "/admin/student-info",
    icon: StudentGraduatingIcon,
  },
  {
    title: "View Profile",
    description: "Update your account settings and preferences",
    href: "/admin/profile",
    icon: UserIcon,
  },
  {
    title: "Login History",
    description: "Review admin login activity and security logs",
    href: "/admin/login-history",
    icon: Clock,
  },
  {
    title: "Blogs",
    description: "Review Blog posts",
    href: "/admin/blogs",
    icon: BooksIcon,
  },
];

export default function AdminDashboard() {
  return (
    <>
      <Breadcrumb pageName="Dashboard" />

      <div className="space-y-6">
        {/* Welcome banner */}
        <div className="relative overflow-hidden rounded-xl bg-linear-to-br from-primary/90 to-primary px-6 py-8 text-white shadow-lg">
          {/* Background decoration */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-10 right-24 h-28 w-28 rounded-full bg-white/5" />

          <div className="relative flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Welcome to Admin Dashboard</h2>
              <p className="mt-1 text-sm text-white/75">
                Manage your profile, monitor student inquiries, and review security logs.
              </p>
            </div>
          </div>
        </div>

        {/* Main section */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-dark-4 dark:text-dark-6">
            Quick Actions
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-md dark:border-dark-3 dark:bg-gray-dark dark:hover:border-dark-4`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-sm`}
                  >
                    <link.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base font-semibold text-gray-900 group-hover:text-primary dark:text-white">
                      {link.title}
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-dark-4 dark:text-dark-6">
                      {link.description}
                    </p>
                  </div>
                  <ArrowRightIcon className=" shrink-0 text-dark-5 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100 group-hover:text-primary" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Analytics Preview ──────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 " >
              Analytics Preview
            </h3>
            <Link
              href="/admin/chart"
              className="group flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-primary transition-all hover:bg-primary/10 "
            >
              <PieChart className="h-3.5 w-3.5" />
              View Full Analytics
              <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <ChartPreviewCard />
        </div>
      </div>
    </>
  );
}
