import type { LayoutLoad } from "./$types";
import { CourseTime } from "$lib/services/CourseTime";

/** Derive a human-readable view type from the current pathname. */
function getViewType(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length < 1) return "";
  if (segments.length === 2 && segments[1] !== "calendar" && segments[1] !== "lab") return "Student Calendar"; // /courseid/studentid
  if (segments.length === 1) return "Course overview"; // /courseid
  if (segments[1] === "calendar") {
    if (segments[2] === "median") {
      if (segments[3] === "byday") return "Calendar median by day";
      if (segments[3] === "byweek") return "Calendar median by week";
    }
    if (segments[2] === "byday") return "Calendar by day";
    if (segments[2] === "byweek") return "Calendar by week";
    if (segments.length >= 2) return "Calendar";
  }
  if (segments[1] === "lab") {
    if (segments[2] === "median") {
      if (segments[3] === "bystep") return "Lab median by step";
      if (segments[3] === "byweek") return "Lab median by week";
    }
    if (segments[2] === "bystep") return "Lab by step";
    if (segments[2] === "bylab") return "Lab by lab";
    if (segments.length >= 2) return "Lab";
  }
  return "";
}

export const load: LayoutLoad = async ({ url }) => {
  const pathname = url.pathname;
  const segments = pathname.split("/").filter(Boolean);
  const courseId = segments[0] ?? "";
  const viewType = getViewType(pathname);

  let courseTitle: string | null = null;
  if (courseId.trim()) {
    try {
      courseTitle = await CourseTime.getCourseTitle(courseId);
    } catch {
      courseTitle = courseId;
    }
  }

  return {
    courseTitle,
    viewType: viewType || null,
    courseId: courseId.trim() || null
  };
};
