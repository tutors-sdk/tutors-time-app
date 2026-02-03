# Release Plan

## Overview

This document outlines the release plan for the Tutors Time application, focusing on three incremental development milestones.

## Milestones

### Milestone 1: Basic Application Shell
- **Target Date**: [Date]
- **Status**: [Planned/In Progress/Completed]
- **Description**: Basic application shell, including Skeleton.dev setup + simple e2e test infrastructure. No database connection yet.
- **Tasks**: See [tasks-v1.md](./tasks-v1.md)

### Milestone 2: Database Connection and Display
- **Target Date**: [Date]
- **Status**: [Planned/In Progress/Completed]
- **Description**: Ability to connect to Supabase and read the calendar database table. Display the database in a simple Skeleton.dev table.
- **Tasks**: See [tasks-v2.md](./tasks-v2.md)

### Milestone 3: Filtering Functionality
- **Target Date**: [Date]
- **Status**: [Planned/In Progress/Completed]
- **Description**: Be able to filter the table by studentid, courseid and date.
- **Tasks**: See [tasks-v3.md](./tasks-v3.md)

## Milestone Details

### Milestone 1: Basic Application Shell
- [ ] SvelteKit project initialized
- [ ] Skeleton.dev framework installed and configured
- [ ] Basic application structure and routing set up
- [ ] Playwright e2e test infrastructure configured
- [ ] Simple e2e test setup (test that app loads)
- [ ] Basic UI shell with Skeleton.dev components
- [ ] No database connection yet

### Milestone 2: Database Connection and Display
- [ ] Supabase client configured and connected
- [ ] Ability to read from calendar database table
- [ ] Display calendar data in a simple Skeleton.dev table
- [ ] Table shows all columns: id (date), studentid, courseid, timeactive, pageloads
- [ ] Basic error handling for database connection
- [ ] Loading states implemented
- [ ] E2E tests for database connection and table display

### Milestone 3: Filtering Functionality
- [ ] Filter by studentid implemented
- [ ] Filter by courseid implemented
- [ ] Filter by date (date range) implemented
- [ ] Filters work independently and in combination
- [ ] Table updates reactively when filters change
- [ ] Filter UI components using Skeleton.dev (Listbox/Combobox for studentid/courseid, Date Picker for date)
- [ ] E2E tests for filtering functionality

## Dependencies

### External Dependencies
- **Supabase**: Backend-as-a-Service platform (PostgreSQL, REST API)
- **SvelteKit**: Frontend framework ([Svelte Documentation](https://svelte.dev/docs/llms))
- **Skeleton.dev**: UI framework built on Tailwind CSS ([Skeleton Documentation](https://www.skeleton.dev/docs/svelte/resources/llms))
- **Tailwind CSS**: CSS framework (via Skeleton.dev)
- **Playwright**: End-to-end testing framework
- **Hosting Platform**: Vercel, Netlify, Cloudflare Pages, or similar for static site deployment

### Internal Dependencies
- **Milestone 2** → **Milestone 1**: Database connection requires basic application shell
- **Milestone 3** → **Milestone 2**: Filtering requires database connection and table display
- **Data Service** → **Supabase Client**: Data service depends on Supabase client initialization
- **Filters** → **Data Service**: Filters affect data queries
- **Skeleton.dev Components** → **All UI Components**: All UI elements use Skeleton.dev components for consistent styling

## Success Criteria

### Milestone 1: Basic Application Shell
- [ ] SvelteKit application runs locally
- [ ] Skeleton.dev components render correctly
- [ ] Basic e2e test infrastructure working
- [ ] At least one e2e test passing (app loads)

### Milestone 2: Database Connection and Display
- [ ] Successfully connects to Supabase
- [ ] Calendar table data displays in Skeleton.dev table
- [ ] All table columns visible and formatted correctly
- [ ] E2E tests verify table displays data
- [ ] Error handling works for connection failures

### Milestone 3: Filtering Functionality
- [ ] All three filters (studentid, courseid, date) functional
- [ ] Filters work independently
- [ ] Filters work in combination
- [ ] Table updates correctly when filters change
- [ ] E2E tests verify filtering works correctly

## Rollback Plan

### Milestone Rollback Procedure
1. Revert code changes to previous milestone state
2. Verify application still functions correctly
3. Monitor for any issues

### Note: Read-Only Application
- No data migration needed - application only reads from existing calendar table
- Rollback is straightforward code reversion
