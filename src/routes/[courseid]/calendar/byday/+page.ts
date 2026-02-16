import { CourseTimeService } from "$lib/services/CourseTimeService";

export async function load({ params }: { params: Record<string, string> }) {
  const courseId = (params.courseid ?? "").trim();
  if (!courseId) {
    return { course: null };
  }
  const courseTime = await CourseTimeService.loadCourse(courseId);
  return { course: courseTime.courseData };
}
