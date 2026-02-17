import { TutorsTime } from "$lib/tutors-time-service/TutorsTime";

export async function load({ params }: { params: Record<string, string> }) {
  const courseId = (params.courseid ?? "").trim();
  if (!courseId) {
    return { course: null };
  }
  const courseTime = await TutorsTime.loadCourseTime(courseId);
  return { course: courseTime };
}
