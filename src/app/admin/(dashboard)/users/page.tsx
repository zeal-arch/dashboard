import Breadcrumb from "@/components/ui/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trending | Dashboard",
};

export default function TrendingPage() {
  return (
    <>
      <Breadcrumb pageName="Trending" />
      <div className="flex h-60 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-gray-dark">
        <p className="text-gray-400 dark:text-gray-500">
          Trending content will load here — coming soon!
        </p>
      </div>
    </>
  );
}
