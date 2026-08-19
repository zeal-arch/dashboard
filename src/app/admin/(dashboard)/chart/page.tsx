import { Metadata } from "next";
import { ChartPreviewCard } from "@/admin/components/charts/ChartPreviewCard";
import Breadcrumb from "@/components/ui/Breadcrumbs/Breadcrumb";

export const metadata: Metadata = {
  title: "Analytics | Dashboard",
  description: "Content analytics breakdown by type and category.",
};

export default function Page() {
  return (
    <>
      <Breadcrumb pageName="Analytics" />
      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-dark-3 dark:bg-gray-dark">
          <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Content Distribution</h2>
          <ChartPreviewCard />
        </div>
      </div>
    </>
  );
}
