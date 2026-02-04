# Milestone 8: Multi‑Course Views – Multiple Course IDs with Per‑Course Tabs

## Overview

This milestone introduces support for selecting **multiple course IDs** in the initial dialog and displaying a full set of views for **each selected course**:

- For every course ID, create three tabs:
  - **Table** – same behaviour as the current Table View.
  - **Visual** – same behaviour as the current Visual (CalendarGrid) View.
  - **Summary** – same behaviour as the current Summary (CourseSummaryGrid) View.

Tab titles are course‑specific, using this naming convention:

- `COURSE_ID (t)` – Table view for that course.
- `COURSE_ID (v)` – Visual view for that course.
- `COURSE_ID (s)` – Summary view for that course.

> **Note:** This document specifies behaviour only. **Do not implement code for this milestone yet.**

## Requirements

### Course selection

- Extend the existing **Course ID dialog** to allow entering **more than one course ID**:
  - UI may be:
    - A multi‑line text area (one course ID per line), or
    - A list with add/remove inputs, or
    - Another clear multi‑course UX, as long as:
      - Multiple course IDs can be specified before loading data.
      - Existing single‑course workflows remain intuitive.
- The dialog should:
  - Validate that at least one course ID is provided.
  - Trim whitespace around each course ID.
  - Deduplicate identical course IDs (optional but recommended).

### Data loading

- For each distinct course ID entered:
  - Load its calendar data (as currently done for a single course).
  - Associate the resulting `CalendarEntry[]` (plus `loading` / `error` state) with that course.
- Ensure:
  - There is **no change** to the Supabase/`getCalendarData` contract (still course‑per‑call).
  - Errors for one course do not block others (each course can show its own error state).

### Tabs and layout

- Replace the single three‑tab set (Table / Visual / Summary) with **per‑course tab triplets**:
  - For each course ID `C`, create:
    - `C (t)` → renders the existing `CalendarTable` instance for `C`.
    - `C (v)` → renders the existing `CalendarGrid` instance for `C`.
    - `C (s)` → renders the existing `CourseSummaryGrid` instance for `C`.
- Behaviour:
  - Tab labels must show the **full course ID** followed by:
    - `(t)` for table,
    - `(v)` for visual,
    - `(s)` for summary.
  - Tabs should clearly group by course visually (ordering by course ID or entry order is acceptable, but should be consistent).

### Component wiring

- Reuse existing components:
  - `CalendarTable.svelte`
  - `CalendarGrid.svelte`
  - `CourseSummaryGrid.svelte`
- For each course ID, pass the **course‑specific `calendarData`**, `loading`, and `error` into the components exactly as today’s single‑course implementation does.
- Do **not** change internal behaviour of the grid components in this milestone; only how they are instantiated and labelled.

### UX considerations

- Initial selection:
  - If only one course is specified, UX should be equivalent to current behaviour: three tabs for that course.
  - If multiple courses are specified, tabs should make it easy to distinguish:
    - Consider ordering tabs as: `C1 (t)`, `C1 (v)`, `C1 (s)`, `C2 (t)`, `C2 (v)`, `C2 (s)`, …
- Empty/error states:
  - If a given course has no data, its three tabs should still exist, each showing the appropriate “no data” state in its view.
  - If loading fails for one course, only that course’s views should show an error.

## Success criteria

- [ ] Course ID dialog allows specifying **multiple** course IDs in a single interaction.
- [ ] For each course ID entered, three tabs are created:
  - [ ] `COURSE_ID (t)` – Table View (CalendarTable) for that course.
  - [ ] `COURSE_ID (v)` – Visual View (CalendarGrid) for that course.
  - [ ] `COURSE_ID (s)` – Summary View (CourseSummaryGrid) for that course.
- [ ] All existing behaviour for a **single** course is preserved when only one course ID is provided.
- [ ] Tab labels use the exact format `COURSE_ID (t)`, `COURSE_ID (v)`, `COURSE_ID (s)`.
- [ ] Data loading and error handling are per‑course; failures for one course do not prevent others from loading.
- [ ] No changes are made to the grid components’ internal logic; only instantiation/wiring and tab labels are updated.
- [ ] This task remains **specification only**; implementation is deferred to a later milestone.

