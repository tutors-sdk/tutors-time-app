# Milestone 9: Date Range Filtering – Dialog-Level Date Selection and Table View Simplification

## Overview

This milestone introduces **date range selection** at the course loading dialog level, filters all calendar data to the selected range across all views, and simplifies the Table View by removing redundant columns and filters.

Key changes:

- **Course ID Dialog**: Add optional start date and end date fields.
- **Data Filtering**: Filter `CalendarEntry[]` data to entries within the selected date range before passing to views.
- **Table View Simplification**: Remove Student ID column and remove all filter controls (Student ID dropdown, Start Date, End Date inputs) from `CalendarTable`.

> **Note:** This document specifies behaviour only. **Do not implement code for this milestone yet.**

## Requirements

### Course ID Dialog Enhancement

- Add **two optional date input fields** to `CourseIdDialog.svelte`:
  - **Start Date** (`<input type="date">`)
  - **End Date** (`<input type="date">`)
- Both fields should be:
  - Optional (user can leave them empty to load all dates).
  - Validated: if both are provided, `startDate <= endDate`.
  - Included in the `submit` event payload:
    ```typescript
    type Events = {
      submit: { 
        courseIds: string[];
        startDate: string | null;  // YYYY-MM-DD format or null
        endDate: string | null;     // YYYY-MM-DD format or null
      };
      // ... other events
    };
    ```

### Data Loading and Filtering

- Update `loadCalendarDataForCourses` in `+page.svelte` to:
  - Accept `startDate` and `endDate` parameters (from dialog submit event).
  - After fetching calendar data for each course, **filter** the `CalendarEntry[]` array:
    - Include entries where `entry.id >= startDate` (if `startDate` is provided).
    - Include entries where `entry.id <= endDate` (if `endDate` is provided).
    - If both dates are provided, entries must satisfy both conditions.
    - If neither date is provided, include all entries (no filtering).
  - Store the **filtered** `CalendarEntry[]` in each course's state (not the raw fetched data).
- Ensure:
  - Date filtering happens **once** at load time, not repeatedly in each view component.
  - All views (Table, Visual, Summary) receive the same filtered dataset.
  - Date comparison uses string comparison (since `entry.id` is `YYYY-MM-DD` format).

### Table View Simplification

- **Remove filter controls** from `CalendarTable.svelte`:
  - Remove the entire filter section (Student ID dropdown, Start Date input, End Date input, Clear button).
  - Remove filter-related state variables: `selectedStudentId`, `startDate`, `endDate`.
  - Remove `distinctStudentIds` derived state (no longer needed).
  - Remove `filteredData` derived state; use `data` prop directly.
  - Remove `clearFilters` function.
- **Remove Student ID column** from the table:
  - Remove `<th>Student ID</th>` from the table header.
  - Remove `<td>{entry.studentid}</td>` from table rows.
- **Keep existing columns**:
  - Date (`entry.id`)
  - Course ID (`entry.courseid`)
  - Time Active (`entry.timeactive`)
  - Page Loads (`entry.pageloads`)
- **Update table display logic**:
  - Remove the "Showing X of Y calendar entries" message (or update it to just show total count, since filtering is now at dialog level).
  - Display all entries from the `data` prop (which is already filtered by date range).

### Visual and Summary Views

- **No changes** to `CalendarGrid.svelte` or `CourseSummaryGrid.svelte`:
  - These components continue to receive filtered `CalendarEntry[]` data via props.
  - They automatically display only the date-filtered data without any code changes.

### UX Considerations

- **Date range defaults**:
  - When the dialog opens, both date fields should be empty (no default range).
  - Users can optionally set a range to narrow the data, or leave empty to see all dates.
- **Validation feedback**:
  - If `startDate > endDate`, show an error message in the dialog and prevent submission.
- **Empty state handling**:
  - If date filtering results in zero entries for a course, all three views should show their appropriate "no data" messages.
  - The date range filter should not cause errors; it should simply return an empty array if no entries match.

## Success Criteria

- [ ] Course ID dialog includes optional Start Date and End Date input fields.
- [ ] Dialog validates that `startDate <= endDate` when both dates are provided.
- [ ] Dialog `submit` event includes `startDate` and `endDate` in the payload (as `string | null`).
- [ ] `loadCalendarDataForCourses` filters calendar data by date range before storing in course state.
- [ ] Date filtering works correctly:
  - [ ] Only `startDate` provided: includes entries `>= startDate`.
  - [ ] Only `endDate` provided: includes entries `<= endDate`.
  - [ ] Both provided: includes entries where `startDate <= entry.id <= endDate`.
  - [ ] Neither provided: includes all entries (no filtering).
- [ ] All views (Table, Visual, Summary) display only date-filtered data.
- [ ] `CalendarTable` component:
  - [ ] Removes Student ID column from table.
  - [ ] Removes all filter controls (Student ID dropdown, Start Date, End Date inputs, Clear button).
  - [ ] Removes filter-related state and logic.
  - [ ] Displays all entries from the `data` prop directly (no client-side filtering).
- [ ] `CalendarGrid` and `CourseSummaryGrid` continue to work correctly with filtered data (no code changes needed).
- [ ] This task remains **specification only**; implementation is deferred to a later milestone.
