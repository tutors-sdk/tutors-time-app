# Milestone 3: Filtering Functionality

## Overview

This document contains the detailed task breakdown for Milestone 3 of the Tutors Time application. **Note: This is a read-only application for visualizing calendar data - no data modification capabilities are required.**

**Milestone Goal**: Fetch calendar data for a specific courseid (obtained via dialog) and filter the table by studentid and date.

## Tasks

### Features

#### FEAT-001: Course ID Selection Dialog
- **Status**: [ ] Not Started / [ ] In Progress / [ ] Completed
- **Priority**: High
- **Assignee**: [Name]
- **Description**: Implement a dialog that prompts the user to enter a courseid before loading calendar data. The application should only fetch and display calendar entries for the specified courseid. E2E tests should use the course ID `setu-hdip-comp-sci-2025-full-stack-1` for testing purposes.
- **Acceptance Criteria**:
  - [ ] Dialog component implemented using Skeleton.dev Dialog/Modal component
  - [ ] Dialog appears on page load before data is fetched
  - [ ] User can enter a courseid in the dialog (e.g., `setu-hdip-comp-sci-2025-full-stack-1`)
  - [ ] Dialog validates that courseid is provided (required field)
  - [ ] On submit, calendar data is fetched filtered by the entered courseid
  - [ ] Dialog closes after successful courseid submission
  - [ ] Error handling if courseid is invalid or no data found
  - [ ] User can change courseid (reopen dialog or change courseid)
  - [ ] Dialog is centered and middle-aligned on the screen
- **Test Data**: E2E tests should use `setu-hdip-comp-sci-2025-full-stack-1` as the test course ID
- **Dependencies**: FEAT-001 (from Milestone 2), API-001 (from Milestone 2)
- **Estimated Effort**: [Hours/Days]

#### FEAT-002: Student ID Filter
- **Status**: [ ] Not Started / [ ] In Progress / [ ] Completed
- **Priority**: High
- **Assignee**: [Name]
- **Description**: Implement filter by studentid using Skeleton.dev Listbox/Combobox component. Filter operates on data already filtered by courseid.
- **Acceptance Criteria**:
  - [ ] Student filter component implemented using Skeleton.dev
  - [ ] Filter dropdown populates with distinct studentids from the courseid-filtered data
  - [ ] Selecting a studentid filters the table
  - [ ] "All students" option available
  - [ ] Table updates reactively when filter changes
- **Dependencies**: FEAT-001 (Course ID Selection Dialog), FEAT-001 (from Milestone 2), API-001 (from Milestone 2)
- **Estimated Effort**: [Hours/Days]

#### FEAT-003: Course ID Change
- **Status**: [ ] Not Started / [ ] In Progress / [ ] Completed
- **Priority**: Medium
- **Assignee**: [Name]
- **Description**: Allow user to change the selected courseid and reload data for a different course
- **Acceptance Criteria**:
  - [ ] Button or control to change courseid
  - [ ] Clicking change courseid reopens the dialog
  - [ ] User can enter a new courseid
  - [ ] Calendar data is refetched for the new courseid
  - [ ] Table updates with new course data
  - [ ] Current courseid is displayed in the UI
- **Dependencies**: FEAT-001 (Course ID Selection Dialog)
- **Estimated Effort**: [Hours/Days]

#### FEAT-004: Date Filter
- **Status**: [ ] Not Started / [ ] In Progress / [ ] Completed
- **Priority**: High
- **Assignee**: [Name]
- **Description**: Implement filter by date (date range) using Skeleton.dev Date Picker component. Filter operates on data already filtered by courseid.
- **Acceptance Criteria**:
  - [ ] Date filter component implemented using Skeleton.dev Date Picker
  - [ ] Date range selection works (start date and end date)
  - [ ] Filtering by date range filters the table
  - [ ] Table updates reactively when date range changes
  - [ ] Invalid date ranges handled gracefully
- **Dependencies**: FEAT-001 (Course ID Selection Dialog), FEAT-001 (from Milestone 2), API-001 (from Milestone 2)
- **Estimated Effort**: [Hours/Days]

#### FEAT-005: Combined Filtering
- **Status**: [ ] Not Started / [ ] In Progress / [ ] Completed
- **Priority**: High
- **Assignee**: [Name]
- **Description**: Ensure all filters work together (courseid + studentid + date). Note: courseid is set via dialog, studentid and date are filterable.
- **Acceptance Criteria**:
  - [ ] Courseid is set via dialog before data loads
  - [ ] Studentid and date filters work independently
  - [ ] Studentid and date filters work in combination
  - [ ] Table updates correctly when any filter changes
  - [ ] Courseid persists until user changes it
  - [ ] Clearing filters resets to show all data for the selected courseid
- **Dependencies**: FEAT-001 (Course ID Selection Dialog), FEAT-002, FEAT-004
- **Estimated Effort**: [Hours/Days]

### Testing

#### TEST-003: E2E Tests for Filtering
- **Status**: [ ] Not Started / [ ] In Progress / [ ] Completed
- **Priority**: High
- **Assignee**: [Name]
- **Description**: Create Playwright e2e tests for filtering functionality
- **Acceptance Criteria**:
  - [ ] Test: Course ID dialog appears on page load
  - [ ] Test: User can enter courseid `setu-hdip-comp-sci-2025-full-stack-1` in dialog
  - [ ] Test: Calendar data loads only for specified courseid `setu-hdip-comp-sci-2025-full-stack-1`
  - [ ] Test: All table rows display the correct courseid `setu-hdip-comp-sci-2025-full-stack-1`
  - [ ] Test: Student filter filters table correctly
  - [ ] Test: Date filter filters table correctly
  - [ ] Test: Combined filters (studentid + date) work together
  - [ ] Test: User can change courseid and reload data
  - [ ] Test: Clearing filters resets table to show all data for courseid
  - [ ] Test: "No entries" message appears when filters match no data
- **Test Data**: All E2E tests should use the course ID `setu-hdip-comp-sci-2025-full-stack-1` when entering data in the course ID selection dialog
- **Dependencies**: FEAT-005, TEST-002 (from Milestone 2)
- **Estimated Effort**: [Hours/Days]

## Task Summary

### By Status
- **Not Started**: [Count]
- **In Progress**: [Count]
- **Completed**: [Count]

### By Priority
- **High**: [Count]
- **Medium**: [Count]
- **Low**: [Count]

### Estimated Total Effort
- **Total**: [Hours/Days]

## Success Criteria

- [ ] Course ID dialog prompts user for courseid on page load
- [ ] Calendar data is fetched only for the specified courseid
- [ ] Studentid and date filters are functional
- [ ] Filters work independently
- [ ] Filters work in combination
- [ ] Table updates correctly when filters change
- [ ] User can change courseid and reload data
- [ ] E2E tests verify courseid dialog and filtering works correctly
