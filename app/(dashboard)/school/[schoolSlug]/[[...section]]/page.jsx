import { notFound } from "next/navigation";
import DashboardPage from "@/app/(dashboard)/dashboard/page";
import ClassesPage from "@/app/(dashboard)/classes/page";
import MaterialsPage from "@/app/(dashboard)/materials/page";
import AssignmentsPage from "@/app/(dashboard)/assignments/page";
import GradesPage from "@/app/(dashboard)/grades/page";
import AttendancePage from "@/app/(dashboard)/attendance/page";
import CalendarPage from "@/app/(dashboard)/calendar/page";
import ProfilePage from "@/app/(dashboard)/profile/page";
import AccountSettingsPage from "@/app/(dashboard)/account-settings/page";
import { schoolFromSlug } from "@/lib/school";

const pages = {
  dashboard: DashboardPage,
  classes: ClassesPage,
  materials: MaterialsPage,
  assignments: AssignmentsPage,
  grades: GradesPage,
  attendance: AttendancePage,
  calendar: CalendarPage,
  profile: ProfilePage,
  "account-settings": AccountSettingsPage,
};

export default async function SchoolPage({ params }) {
  const { schoolSlug, section } = await params;
  if (!schoolFromSlug(schoolSlug)) notFound();

  const key = section?.[0] || "dashboard";
  const Page = pages[key];
  if (!Page || section?.length > 1) notFound();

  return <Page />;
}
