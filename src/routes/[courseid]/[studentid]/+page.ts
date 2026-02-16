import { CourseTimeService } from "$lib/services/CourseTimeService";

export async function load({ params }: { params: Record<string, string> }) {
  const courseId = (params.courseid ?? "").trim();
  const studentId = (params.studentid ?? "").trim();
  if (!courseId || !studentId) {
    return { course: null };
  }
  const courseTime = await CourseTimeService.loadCourseCalendar(courseId);

    const studentCalendar = await CourseTimeService.loadStudentCalendar(
      courseId,
      studentId,
      null,
      null
    );

  return { course: courseTime, studentCalendar: studentCalendar };
}
