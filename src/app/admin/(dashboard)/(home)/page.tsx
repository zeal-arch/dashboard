import { redirect } from "next/navigation";

export default function AdminDashboard() {
  // Redirect to the personalized feed as the default landing page
  redirect("/admin/feed");
}
