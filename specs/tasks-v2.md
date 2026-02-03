# Milestone 2: Database Connection and Display

## Overview

This document contains the detailed task breakdown for Milestone 2 of the Tutors Time application. **Note: This is a read-only application for visualizing calendar data - no data modification capabilities are required.**

**Milestone Goal**: Ability to connect to Supabase and read the calendar database table. Display the database in a simple Skeleton.dev table.

## Tasks

### Database Setup

#### DB-001: Supabase Database Schema Verification
- **Status**: [ ] Not Started / [ ] In Progress / [ ] Completed
- **Priority**: High
- **Assignee**: [Name]
- **Description**: Verify Supabase database schema for the calendar table exists and is correct
- **Acceptance Criteria**:
  - [ ] Calendar table exists in Supabase
  - [ ] Table schema verified:
    - `id` (DATE)
    - `studentid` (TEXT)
    - `courseid` (TEXT)
    - `timeactive` (INT8/BIGINT)
    - `pageloads` (INT8/BIGINT)
  - [ ] Can query table successfully
- **Dependencies**: None (table should already exist)
- **Estimated Effort**: [Hours/Days]

#### DB-002: Seed Data for Testing
- **Status**: [ ] Not Started / [ ] In Progress / [ ] Completed
- **Priority**: Medium
- **Assignee**: [Name]
- **Description**: Ensure test data exists in Supabase calendar table for development/testing
- **Acceptance Criteria**:
  - [ ] Test data available in calendar table
  - [ ] Multiple studentids present
  - [ ] Multiple courseids present
  - [ ] Data spans multiple dates
  - [ ] Data includes varying timeactive and pageloads values
- **Dependencies**: DB-001
- **Estimated Effort**: [Hours/Days]

### Infrastructure

#### INFRA-004: Supabase Connection Setup
- **Status**: [ ] Not Started / [ ] In Progress / [ ] Completed
- **Priority**: High
- **Assignee**: [Name]
- **Description**: Configure Supabase client and establish connection
- **Acceptance Criteria**:
  - [ ] Supabase project access configured
  - [ ] Supabase client library installed (@supabase/supabase-js)
  - [ ] Environment variables configured (.env files)
  - [ ] Supabase client initialized in application
  - [ ] Connection test successful
  - [ ] Read-only access verified
- **Dependencies**: INFRA-003 (from Milestone 1), DB-001
- **Estimated Effort**: [Hours/Days]

### API Development

#### API-001: Read Calendar Table Data
- **Status**: [ ] Not Started / [ ] In Progress / [ ] Completed
- **Priority**: High
- **Assignee**: [Name]
- **Description**: Implement functionality to read calendar table data from Supabase
- **Acceptance Criteria**:
  - [ ] SvelteKit load function or data service created
  - [ ] Query to fetch all calendar table data implemented
  - [ ] Data fetched successfully from Supabase
  - [ ] Error handling for connection failures
  - [ ] Loading states managed
- **Dependencies**: INFRA-004
- **Estimated Effort**: [Hours/Days]

### Features

#### FEAT-001: Display Calendar Data in Table
- **Status**: [ ] Not Started / [ ] In Progress / [ ] Completed
- **Priority**: High
- **Assignee**: [Name]
- **Description**: Display calendar database data in a simple Skeleton.dev table component
- **Acceptance Criteria**:
  - [ ] Skeleton.dev Table component implemented
  - [ ] Table displays all columns: id (date), studentid, courseid, timeactive, pageloads
  - [ ] Data loads and displays correctly
  - [ ] Table is responsive
  - [ ] Loading state shown while fetching data
  - [ ] Error state shown if data fetch fails
- **Dependencies**: API-001
- **Estimated Effort**: [Hours/Days]

### Testing

#### TEST-002: E2E Tests for Database Display
- **Status**: [ ] Not Started / [ ] In Progress / [ ] Completed
- **Priority**: High
- **Assignee**: [Name]
- **Description**: Create Playwright e2e tests for database connection and table display
- **Acceptance Criteria**:
  - [ ] Test: Application connects to Supabase successfully
  - [ ] Test: Calendar table displays data
  - [ ] Test: All table columns are visible
  - [ ] Test: Loading state appears and disappears
  - [ ] Test: Error handling works for connection failures
  - [ ] Test data fixtures configured
- **Dependencies**: FEAT-001, TEST-001 (from Milestone 1)
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

- [ ] Successfully connects to Supabase
- [ ] Calendar table data displays in Skeleton.dev table
- [ ] All table columns visible and formatted correctly
- [ ] E2E tests verify table displays data
- [ ] Error handling works for connection failures
