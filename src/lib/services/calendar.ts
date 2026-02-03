import { getSupabase } from '../supabase';
import type { CalendarEntry } from '../types';

export async function getCalendarData(courseid?: string): Promise<CalendarEntry[]> {
  const supabase = getSupabase();
  let query = supabase
    .from('calendar')
    .select('*')
    .order('id', { ascending: true });

  if (courseid) {
    query = query.eq('courseid', courseid);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch calendar data: ${error.message}`);
  }

  return data || [];
}
