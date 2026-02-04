# Milestone 10: Weekly Aggregation – Calendar Grids Show Weekly Summaries

## Overview

This milestone reworks the calendar grids (`CalendarGrid` and `CourseSummaryGrid`) to display **weekly summary data** instead of daily data. Each 7-day period is aggregated, and columns represent weeks identified by their **Monday date**.

Key changes:

- **Weekly Aggregation**: Group calendar entries by week (Monday–Sunday), summing `timeactive` for each week.
- **Week Identification**: Use the **Monday date** (YYYY-MM-DD format) as the week identifier and column header.
- **Column Headers**: Display Monday's date in compressed format (e.g., "3/2" for Monday 3 Feb) as the column header.
- **Visual Grids**: Both `CalendarGrid` (Visual View) and `CourseSummaryGrid` (Summary View) use weekly columns.
- **Table View**: `CalendarTable` remains unchanged (still shows daily entries).

> **Note:** This document specifies behaviour only. **Do not implement code for this milestone yet.**

## Requirements

### Week Calculation

- **Week Definition**: A week runs from Monday (inclusive) to Sunday (inclusive).
- **Monday Calculation**: For any given date, find the Monday of that week:
  - If the date is a Monday, use that date.
  - Otherwise, find the most recent Monday (go back 0–6 days).
- **Week Identifier**: Use the Monday date in `YYYY-MM-DD` format as the unique identifier for each week.
- **Date Parsing**: Parse `CalendarEntry.id` (which is `YYYY-MM-DD` format) to determine which week it belongs to.

### Data Aggregation

- **Grouping**: Group `CalendarEntry[]` entries by week (using Monday date as key).
- **Aggregation**: For each week:
  - Sum `timeactive` across all entries in that week.
  - For `CalendarGrid`: Aggregate per student per week (sum all entries for `studentid` + week).
  - For `CourseSummaryGrid`: Aggregate per course per week (sum all entries for `courseid` + week).
- **Week Ordering**: Sort weeks chronologically (earliest Monday first).

### CalendarGrid (Visual View) Changes

- **Row Structure**: Each row represents a student:
  - Column 1: `studentid` (pinned left, as before).
  - Column 2: `totalSeconds` (total across all weeks, as before).
  - Columns 3..N: One column per week, showing aggregated `timeactive` for that student in that week.
- **Week Columns**: Each week column:
  - Field name: Monday date (`YYYY-MM-DD`).
  - Header: Monday date in compressed format (e.g., "3/2").
  - Cell value: Sum of `timeactive` for that student in that week (formatted as "1h 30" or "45").
  - Styling: Same as current daily columns (vertical header, color coding, center alignment).

### CourseSummaryGrid (Summary View) Changes

- **Row Structure**: Single row representing the course:
  - Column 1: `courseid` (pinned left, as before).
  - Column 2: `totalSeconds` (total across all weeks, as before).
  - Columns 3..N: One column per week, showing aggregated `timeactive` for all students in that week.
- **Week Columns**: Each week column:
  - Field name: Monday date (`YYYY-MM-DD`).
  - Header: Monday date in compressed format (e.g., "3/2").
  - Cell value: Sum of `timeactive` for all students in that week (formatted as "1h 30" or "45").
  - Styling: Same as current daily columns (vertical header, color coding, center alignment).

### Utility Functions

- **New Function**: `getDistinctSortedWeeks(entries: CalendarEntry[]): string[]`
  - Returns array of Monday dates (YYYY-MM-DD) for all weeks present in the data, sorted chronologically.
- **New Function**: `getMondayForDate(dateString: string): string`
  - Takes a date string (YYYY-MM-DD) and returns the Monday date (YYYY-MM-DD) for that week.
- **New Function**: `buildPerWeekTimeColumns<T>(weeks: string[]): ColDef<T>[]`
  - Similar to `buildPerDateTimeColumns`, but for weekly columns.
  - Uses Monday date as field name, compressed Monday date as header.
- **Update Existing Functions**:
  - `CalendarGrid`: Replace `getDistinctSortedDates` with `getDistinctSortedWeeks`.
  - `CalendarGrid`: Update pivoting logic to aggregate by week instead of date.
  - `CourseSummaryGrid`: Replace `getDistinctSortedDates` with `getDistinctSortedWeeks`.
  - `CourseSummaryGrid`: Update summary logic to aggregate by week instead of date.

### calendarUtils.ts Updates

- Add `getMondayForDate(dateString: string): string`:
  ```typescript
  // Example: getMondayForDate("2025-02-05") → "2025-02-03" (if 5 Feb is a Wednesday)
  // Example: getMondayForDate("2025-02-03") → "2025-02-03" (if 3 Feb is a Monday)
  ```
- Add `getDistinctSortedWeeks(entries: CalendarEntry[]): string[]`:
  - Extract all dates from entries.
  - Convert each date to its Monday date.
  - Return unique Monday dates, sorted chronologically.
- Add `buildPerWeekTimeColumns<T>(weeks: string[]): ColDef<T>[]`:
  - Similar structure to `buildPerDateTimeColumns`.
  - Uses `formatDateShort` for header (Monday date).
  - Uses `formatTimeNearestMinute` for cell values.
  - Uses `cellColorForMinutes` for cell backgrounds.
  - Same width/styling as daily columns.

### CalendarGrid Data Transformation

- **Current Logic**: Groups by `studentid` + `id` (date), sums `timeactive`.
- **New Logic**: 
  - For each entry, determine its week (Monday date).
  - Group by `studentid` + week (Monday date), sum `timeactive`.
  - Create pivoted rows with week columns instead of date columns.

### CourseSummaryGrid Data Transformation

- **Current Logic**: Groups by `id` (date), sums `timeactive` per date.
- **New Logic**:
  - For each entry, determine its week (Monday date).
  - Group by week (Monday date), sum `timeactive` per week.
  - Create summary row with week columns instead of date columns.

### Table View (CalendarTable)

- **No Changes**: `CalendarTable` continues to display daily entries as before.
- Weekly aggregation applies **only** to the grid views (Visual and Summary).

## Success Criteria

- [ ] `calendarUtils.ts` includes `getMondayForDate(dateString: string): string` function.
- [ ] `calendarUtils.ts` includes `getDistinctSortedWeeks(entries: CalendarEntry[]): string[]` function.
- [ ] `calendarUtils.ts` includes `buildPerWeekTimeColumns<T>(weeks: string[]): ColDef<T>[]` function.
- [ ] `CalendarGrid` aggregates data by week (Monday–Sunday) instead of by day.
- [ ] `CalendarGrid` displays one column per week, identified by Monday date.
- [ ] `CalendarGrid` column headers show Monday date in compressed format (e.g., "3/2").
- [ ] `CalendarGrid` cell values show weekly totals per student (sum of `timeactive` for that week).
- [ ] `CourseSummaryGrid` aggregates data by week (Monday–Sunday) instead of by day.
- [ ] `CourseSummaryGrid` displays one column per week, identified by Monday date.
- [ ] `CourseSummaryGrid` column headers show Monday date in compressed format (e.g., "3/2").
- [ ] `CourseSummaryGrid` cell values show weekly totals per course (sum of `timeactive` for all students in that week).
- [ ] Week columns use the same styling as current daily columns (vertical headers, color coding, formatting).
- [ ] Weeks are sorted chronologically (earliest Monday first).
- [ ] `CalendarTable` remains unchanged (still shows daily entries).
- [ ] This task remains **specification only**; implementation is deferred to a later milestone.

## Implementation Notes

### Week Calculation Algorithm

```typescript
function getMondayForDate(dateString: string): string {
  // Parse dateString (YYYY-MM-DD)
  const date = new Date(dateString + 'T12:00:00');
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday (0) to 6 days back
  const monday = new Date(date);
  monday.setDate(date.getDate() - daysToMonday);
  // Format back to YYYY-MM-DD
  return monday.toISOString().split('T')[0];
}
```

### Data Aggregation Example

**Input** (CalendarEntry[]):
- 2025-02-03 (Monday), student A, 3600s
- 2025-02-04 (Tuesday), student A, 1800s
- 2025-02-05 (Wednesday), student A, 2400s
- 2025-02-10 (Monday), student A, 3000s

**Output** (PivotedRow for CalendarGrid):
- Week "2025-02-03": 3600 + 1800 + 2400 = 7800s (shown as "130")
- Week "2025-02-10": 3000s (shown as "50")

### Column Header Format

- Monday date: "2025-02-03"
- Compressed format: "3/2" (day 3, month 2)
- Displayed in vertical header with same styling as current daily columns
