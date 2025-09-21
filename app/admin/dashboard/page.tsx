import React from "react";
import Link from "next/link";
import { Users, Mail, Calendar, Heart, LogOut, RefreshCw } from "lucide-react";
import { requireAdminAuth } from "@/lib/serverAuth";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminDashboard() {
  // Server-side authentication check
  const adminUser = await requireAdminAuth();
  
  return <AdminDashboardClient adminUser={adminUser} />;
}
