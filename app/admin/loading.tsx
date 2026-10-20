import React from "react";
import { AdminDashboardSkeleton } from "@/app/component/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <AdminDashboardSkeleton />
    </div>
  );
}
