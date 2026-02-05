# Milestone 14: Introduce `TutorsStore` Wrapper for Calendar Data and Course Titles

## Overview

This milestone is a **refactoring task**. It introduces a new `TutorsStore` wrapper object responsible for:

- Fetching **calendar data** in the exact format currently expected by the grids (no behavioural change for existing views).
- Providing a convenient way to obtain a **course title** given a `courseid` (using the `tutors-connect-courses` data already wired into the system).

The goal is to centralize data access and derived data (names, titles) behind a single abstraction so that pages and components do not need to know about individual Supabase tables or join logic.

> **Note:** This task is **refactoring only**. It should not change user-visible behaviour beyond making data access cleaner and more testable.

## Requirements

### 1. `TutorsStore` abstraction

- Implement a new module, e.g. `src/lib/services/TutorsStore.ts` (or similar), exporting a `TutorsStore` object (or class/factory) that:
  - Wraps the existing calendar and course title lookup logic.
  - Provides a **clear, strongly-typed API** for consumers (routes/components).

#### Proposed API (subject to refinement during implementation)

- **Type**:
  ```ts
  type TutorsStore = {
    /**
     * Load calendar data for one or more courses and date range,
     * returning the same shape used by the grids today.
     */
    loadCalendar(
      courseIds: string[],
      startDate: string | null,
      endDate: string | null
    ): Promise<CourseCalendar[]>;

    /**
     * Return a display title for a given course ID.
     * If no title is known, fall back to the raw ID.
     */
    getCourseTitle(courseId: string): Promise<string>;
  };
  ```

- **Behaviour**:
  - `loadCalendar` should internally call existing logic (currently in `calendar.ts`) to:
    - Fetch `CalendarEntry[]` per course.
    - Apply date range filtering.
    - Enrich entries with **student full names** (from `tutors-connect-users`).
    - Enrich `CourseCalendar` with **course titles** (from `tutors-connect-courses`).
  - `getCourseTitle(courseId)` should:
    - Use the same source of truth (e.g. `tutors-connect-courses`) as `loadCourseViews`.
    - Optionally reuse any cached title data that `loadCourseViews` has already fetched.

### 2. Preserve existing grid data format

- Ensure the data returned by `TutorsStore.loadCalendar` matches the **current** `CourseCalendar` shape as expected by:
  - `CalendarGrid.svelte`
  - `CourseSummaryGrid.svelte`
  - Any other consumers (e.g. table view).
- The grids should **not** require refactoring beyond swapping their data source from direct `loadCalendarDataForCourses` calls to `TutorsStore.loadCourseViews`.
- No changes to column definitions, aggregation logic, or visual behaviour are allowed as part of this milestone.

### 3. Internal refactoring of `calendar.ts`

- `calendar.ts` should be refactored so that:
  - Low-level functions (e.g. raw `getCalendarData`, course title and user name lookups) remain focused on **data access**.
  - Higher-level orchestration (combining calendar entries, titles, and names into `CourseCalendar[]`) is moved into `TutorsStore`.
- Keep the exported surface of `calendar.ts` minimal:
  - Prefer **internal** helpers for raw Supabase queries.
  - `TutorsStore` should depend on these helpers, not duplicate logic.

### 4. Route / component integration

- **File(s)**: primarily `src/routes/+page.svelte`.
- Replace direct usage of `loadCalendarDataForCourses` (and any ad-hoc title/name lookups) with calls to:
  - `TutorsStore.loadCalendar(...)`.
  - `TutorsStore.getCourseTitle(courseId)` where a single-title lookup is needed.
- Ensure:
  - The page’s state (`courses`, `selectedCourseId`, etc.) is still populated with the same values.
  - Course listbox (`CourseList.svelte`) continues to display the **course title**, not the raw `courseid`.

### 5. Caching and error handling (optional but recommended)

- Consider an **in-memory cache** inside `TutorsStore` for:
  - Course titles by `courseId`.
  - User full names by `github_id` (if not already cached elsewhere).
- On Supabase errors, `TutorsStore` should:
  - Propagate meaningful error messages back to the caller.
  - Fall back gracefully to existing behaviour (e.g. show raw `studentid` or `courseid` when lookups fail).

## Non-Goals

- No change to:
  - Database schema.
  - Grid layouts, column definitions, or styling.
  - Existing tests beyond what is needed to point them to `TutorsStore`.

## Success Criteria

- [ ] A new `TutorsStore` (module/class/factory) exists under `src/lib/services/` (or similar) with:
  - [ ] `loadCalendar(courseIds, startDate, endDate): Promise<CourseCalendar[]>`
  - [ ] `getCourseTitle(courseId): Promise<string>`
- [ ] `CourseCalendar[]` returned by `TutorsStore.loadCalendar` is **identical in shape and semantics** to the current data used by:
  - [ ] `CalendarGrid.svelte`
  - [ ] `CourseSummaryGrid.svelte`
  - [ ] Table view components.
- [ ] `src/routes/+page.svelte` and related components no longer call low-level calendar functions directly; they depend on `TutorsStore` instead.
- [ ] Error handling and fallbacks ensure that, on Supabase failures, the UI continues to function (showing IDs instead of names/titles as a fallback).
- [ ] No visual regressions in the calendar table, visual grid, or summary grid views.
- [ ] TypeScript and linter checks pass without new errors.

