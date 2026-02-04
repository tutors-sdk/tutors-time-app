# Milestone 6: Summary View – Course Summary Grid (AG Grid Community)

## Overview

This document describes the specification for a new course **Summary View** using a separate AG Grid Community grid component named `CourseSummaryGrid.svelte`. This grid will present **one summary row per course**, aggregating the same fields shown in the `CalendarGrid` (Milestone 5), but collapsed into a single row of totals for the selected course.

**Milestone Goal**: Add a new **Summary View** tab that displays a `CourseSummaryGrid` with a single row showing totals (over all students and dates) for the currently selected course, including per‑date totals with the **same column headers as `CalendarGrid`**, colour coded using the same minute-based colour scale.

## Requirements

### Grid placement
- A new **Summary View** tab should be added alongside the existing **Table View** and **Visual View** tabs.
- When a course is selected (via the existing Course ID dialog), the Summary View tab uses the same `calendarData` as input.

### Grid layout (CourseSummaryGrid)
- **Rows**:
  - Exactly **one row per course** (the currently selected course).
  - Row values are **totals across all students and dates** for that course.
- **Columns** (mirroring `CalendarGrid` where applicable):
  - Column 1: Course ID (string), pinned left.
  - Column 2: **Total Minutes** – total time active over all students and dates for this course (integer minutes, no suffix).
  - Columns 3..N: **Per‑date total minutes**:
    - One column per distinct date (same order and compressed header format as `CalendarGrid`).
    - Cell value = total time active (seconds) summed across all students for that date in this course, formatted to nearest minute for display.

### Colour coding
- The **Total Minutes** column should be colour coded using the **same scale as `CalendarGrid`**:
  - 0 minutes → white.
  - ≈1 minute → light green.
  - 1–30 minutes → progressively deeper green, saturating at deep green by 30+ minutes.
- Optional (future): Apply the same colour scale to any other time-based summary columns.

### Sizing and styling
- Grid should:
  - Reuse the **`ag-theme-quartz`** theme.
  - Use a compact font similar to `CalendarGrid` for headers and cells.
  - Fit comfortably within the Summary View tab content area (it does **not** need to fill the full viewport height as aggressively as `CalendarGrid` since it is a single-row summary).

### Technology and data
- AG Grid Community edition only (no enterprise).
- Register `AllCommunityModule` before use.
- Component `CourseSummaryGrid.svelte` should:
  - Accept `data: CalendarEntry[]`, `loading: boolean`, `error: string | null`.
  - Compute totals from the provided `data` (already filtered to the selected course by the page).

### States
- Loading: show a loading message when `loading` and no data.
- Error: show an error message when `error` is set.
- Empty: show an empty summary state when `data.length === 0` for the current course.

## Data transformation (Summary)

Given `CalendarEntry[]` filtered for the selected `courseid`:

- **Total Minutes**:
  - Sum `timeactive` over all entries in the course.
  - Convert total seconds to integer minutes (rounded) for display and for colour scaling.
- **Per‑date totals**:
  - For each distinct date present in `calendarData` (same set/order as `CalendarGrid`), sum `timeactive` over all entries for that date within the current course.
  - Use these per‑date totals (seconds) as the raw values for the corresponding date columns in `CourseSummaryGrid`.

The resulting single summary row might conceptually look like:

| Course ID | Total Minutes | 2025-01-01 | 2025-01-02 | … |
|----------|---------------|-----------|-----------|---|
| ...      | 1234          | 50        | 75        | … |

## Component

- New component: `CourseSummaryGrid.svelte` in `src/lib/ui/`.
- Props:
  - `data: CalendarEntry[]`
  - `loading: boolean`
  - `error: string | null`
- Behaviour:
  - When `loading && data.length === 0`, show a loading state.
  - When `error`, show an error card.
  - When `!loading && data.length === 0`, show a “No summary available for this course” message.
  - Otherwise, render the single-row summary grid as specified above.

## Success criteria

- [ ] A **Summary View** tab is defined in the specification alongside existing tabs.
- [ ] A new `CourseSummaryGrid` component is fully specified (props, layout, colour scaling).
- [ ] Summary row correctly aggregates **Total Minutes** and **per‑date total minutes** for the current course from `calendarData`.
- [ ] Date columns in `CourseSummaryGrid` share the same header labels (compressed date format) and ordering as `CalendarGrid`.
- [ ] Colour scale for Total Minutes and per‑date totals matches the `CalendarGrid` scale (0 → white, 1 → light green, 1–30 → deep green).
- [ ] Pinned Course ID column ensures the course label remains visible when horizontally scrolling.

