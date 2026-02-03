# Milestone 5: Visual View – Course Usage Grid (AG Grid Community)

## Overview

This document describes the implementation of the Visual tab as a course usage view using AG Grid Community edition. The grid displays course usage data with student IDs in the first column and time active per date in subsequent columns, using a compressed date format in column headings to minimize column width. The grid uses the full viewport width and height.

**Milestone Goal**: Display course usage data on the Visual tab using AG Grid Community. First column lists each student ID; every other column is a date with time active value only. Compressed date format in column headings. Grid fills the full viewport width and height.

## Requirements

### Grid layout
- **First column**: Student ID (one row per student).
- **Other columns**: One column per date; cell value = time active only (formatted e.g. "1h 30m", "45m 12s").
- **Column headers**: Compressed date format to minimize column width (e.g. "d/M" or "3 Feb" – short and narrow).
- **No other fields**: Course ID, page loads, etc. are not shown in this grid.

### Sizing
- Grid must use **full viewport width and height** (or the full Visual tab content area so it effectively fills the viewport).
- Grid container and AG Grid theme wrapper should be 100% width and 100% height of their parent; parent chain should provide viewport-sized area.

### Technology
- AG Grid Community edition only (no enterprise).
- Register `AllCommunityModule` before use (AG Grid v31+).
- Use existing calendar data source (same `data`, `loading`, `error` as Table tab).

### States
- Loading: show loading message when `loading` and no data.
- Error: show error message when `error` is set.
- Empty: show empty state when `data.length === 0`.

## Data transformation

- **Rows**: One row per distinct `studentid` (sorted).
- **Columns**: Column 1 = `studentid` (header "Student" or "Student ID"). Columns 2..N = one per distinct date (sorted), header = compressed date, value = time active (seconds) for that student on that date. If multiple entries exist for same student+date, sum `timeactive`.
- **Compressed date format**: Short form for headers, e.g. `day/month` as "d/M" or "3 Feb" – aim to keep header text short to minimize column width.

## Component

- Implementation lives in the Visual tab content. This can be inside `VisualViewPlaceholder.svelte` (replacing the placeholder content with the grid) or a dedicated component such as `CalendarGrid.svelte` used by the page for the Visual tab.
- Same props as current Visual tab: `data: CalendarEntry[]`, `loading: boolean`, `error: string | null`.

## Success criteria

- [ ] Visual tab shows an AG Grid with course usage data.
- [ ] First column is Student ID; other columns are dates with time active only.
- [ ] Date column headers use a compressed format (narrow columns).
- [ ] Grid is full viewport width and height (or fills the Visual tab area).
- [ ] Loading, error, and empty states are handled.
- [ ] No duplicate data fetching; uses same data as Table tab.
