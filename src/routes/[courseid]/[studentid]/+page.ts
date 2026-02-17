import { TutorsTime } from "$lib/tutors-time-service/TutorsTime";

export async function load({ params }: { params: Record<string, string> }) {
  const courseId = (params.courseid ?? "").trim();
  const studentId = (params.studentid ?? "").trim();
  if (!courseId || !studentId) {
    return { course: null };
  }
  const courseTime = await TutorsTime.loadCourseTime(courseId);

    const studentCalendar = await TutorsTime.loadStudentTime(
      courseId,
      studentId,
      null,
      null
    );

  return { course: courseTime, studentCalendar: studentCalendar };
}
