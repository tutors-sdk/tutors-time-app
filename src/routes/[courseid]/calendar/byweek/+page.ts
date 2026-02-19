import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public";
import { initSupabase, TutorsTime } from "$lib/tutors-time-service";

export async function load({ params }: { params: Record<string, string> }) {

  initSupabase(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
  const courseId = (params.courseid ?? "").trim();
  if (!courseId) {
    return { course: null };
  }
  const courseTime = await TutorsTime.loadCourseTime(courseId);
  return { course: courseTime };
}
