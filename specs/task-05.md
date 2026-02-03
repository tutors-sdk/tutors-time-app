# Milestone 5: Tabbed View Implementation

## Overview

This document contains the detailed task breakdown for Milestone 5 of the Tutors Time application. This milestone focuses on introducing a tabbed interface to organize different views of calendar data.

**Milestone Goal**: Implement a tabbed interface in the main page view with two tabs: Tab 1 displays the existing calendar table, and Tab 2 provides a placeholder for a future visual view.

## Tasks

### Features

#### FEAT-006: Tabbed Interface Implementation
- **Status**: [ ] Not Started / [ ] In Progress / [ ] Completed
- **Priority**: High
- **Assignee**: [Name]
- **Description**: Implement a tabbed interface using Skeleton.dev Tabs component in `+page.svelte`. The interface should have two tabs: one for the table view and one as a placeholder for a future visual view.
- **Acceptance Criteria**:
  - [ ] Skeleton.dev Tabs component imported and integrated into `+page.svelte`
  - [ ] Two tabs implemented:
    - [ ] Tab 1: "Table View" - displays the existing `CalendarTable` component
    - [ ] Tab 2: "Visual View" - displays a placeholder component/message
  - [ ] Tab state management using Svelte 5 runes (`$state()`)
  - [ ] Active tab persists during user interactions (filtering, etc.)
  - [ ] Tab switching works smoothly without data reloading
  - [ ] CalendarTable component remains functional within Tab 1
  - [ ] Tab 2 placeholder displays appropriate message (e.g., "Visual view coming soon")
  - [ ] Tabs are properly styled using Skeleton.dev theme
  - [ ] Responsive design maintained (tabs work on mobile and desktop)
  - [ ] Component uses Svelte 5 runes (`$props()`, `$state()`)
  - [ ] All existing functionality preserved
  - [ ] No visual or functional regressions
- **Dependencies**: REFACT-002 (from Milestone 4)
- **Estimated Effort**: [Hours/Days]

#### FEAT-007: Visual View Placeholder Component
- **Status**: [ ] Not Started / [ ] In Progress / [ ] Completed
- **Priority**: Medium
- **Assignee**: [Name]
- **Description**: Create a placeholder component for the future visual view that will be displayed in Tab 2.
- **Acceptance Criteria**:
  - [ ] New component file created at `src/lib/ui/VisualViewPlaceholder.svelte` (or similar)
  - [ ] Component displays a placeholder message indicating the visual view is coming soon
  - [ ] Component accepts props for:
    - [ ] `data` (CalendarEntry[]) - calendar data (for future use)
    - [ ] `loading` (boolean) - loading state
    - [ ] `error` (string | null) - error message to display
  - [ ] Component styled consistently with the rest of the application
  - [ ] Component uses Svelte 5 runes (`$props()`)
  - [ ] Component is properly typed with TypeScript
  - [ ] Placeholder message is clear and informative
  - [ ] Component can be easily replaced with actual visual view implementation later
- **Dependencies**: FEAT-006
- **Estimated Effort**: [Hours/Days]

### Testing

#### TEST-005: E2E Tests for Tabbed Interface
- **Status**: [ ] Not Started / [ ] In Progress / [ ] Completed
- **Priority**: Medium
- **Assignee**: [Name]
- **Description**: Create Playwright e2e tests for the tabbed interface functionality.
- **Acceptance Criteria**:
  - [ ] Test: Tabs are visible when calendar data is loaded
  - [ ] Test: Tab 1 ("Table View") is active by default
  - [ ] Test: CalendarTable is visible in Tab 1
  - [ ] Test: User can switch to Tab 2 ("Visual View")
  - [ ] Test: Placeholder component is visible in Tab 2
  - [ ] Test: Switching between tabs works correctly
  - [ ] Test: CalendarTable functionality (filtering, etc.) works within Tab 1
  - [ ] Test: Tab state persists when filtering data
  - [ ] Test: Tabs are accessible and keyboard navigable
- **Dependencies**: FEAT-006, FEAT-007, TEST-003 (from Milestone 3)
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

- [ ] Tabbed interface implemented using Skeleton.dev Tabs component
- [ ] Two tabs present: "Table View" and "Visual View"
- [ ] Tab 1 displays CalendarTable component with all existing functionality
- [ ] Tab 2 displays placeholder component with appropriate message
- [ ] Tab switching works smoothly
- [ ] All existing functionality preserved
- [ ] Responsive design maintained
- [ ] E2E tests verify tab functionality
- [ ] Code follows Svelte 5 conventions
- [ ] Components are properly typed with TypeScript
- [ ] No visual or functional regressions

## Component Structure

After implementation, the component structure should be:

```
src/
├── lib/
│   ├── ui/
│   │   ├── CourseIdDialog.svelte         # Course ID selection dialog component
│   │   ├── CalendarTable.svelte          # Calendar data table component with filters
│   │   └── VisualViewPlaceholder.svelte # Placeholder for future visual view
│   ├── services/
│   │   └── calendar.ts                  # Calendar data service
│   ├── supabase.ts                      # Supabase client
│   └── types.ts                         # TypeScript types
└── routes/
    └── +page.svelte                     # Main page with tabbed interface
```

## Implementation Notes

### Skeleton.dev Tabs Component

The Skeleton.dev Tabs component should be used following their documentation. Typical usage pattern:

```svelte
<Tabs>
  <Tabs.List>
    <Tabs.Trigger value="table">Table View</Tabs.Trigger>
    <Tabs.Trigger value="visual">Visual View</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="table">
    <!-- CalendarTable component -->
  </Tabs.Content>
  <Tabs.Content value="visual">
    <!-- VisualViewPlaceholder component -->
  </Tabs.Content>
</Tabs>
```

### Tab State Management

- Use Svelte 5 `$state()` to manage the active tab
- Default to Tab 1 ("Table View")
- Tab state should not interfere with CalendarTable's internal state
- Consider using URL hash or query parameter for tab persistence (optional)

### Placeholder Component

The placeholder component should:
- Display a clear message that the visual view is coming soon
- Accept the same props as CalendarTable (data, loading, error) for future compatibility
- Be styled consistently with the rest of the application
- Be easy to replace with the actual visual view implementation

## Future Considerations

- Tab 2 will eventually be replaced with an actual visual view component (e.g., charts, graphs, calendar timeline)
- Consider adding more tabs in the future for additional views
- Tab state persistence across page refreshes (optional enhancement)
- Keyboard navigation and accessibility features
