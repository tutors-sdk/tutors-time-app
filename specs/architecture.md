# Architecture Specification

## Overview

This document describes the architecture of the Tutors Time application - a **read-only** calendar visualization tool that displays the time spent by students on courses each day over a calendar duration. The application uses Supabase as the backend database and API layer. The application is designed for browsing and visualizing calendar data only - no data modification capabilities are required.

## System Architecture

### High-Level Architecture

The application follows a client-server architecture:
- **Frontend**: Web application providing read-only calendar visualization interface
- **Backend**: Supabase (PostgreSQL database + REST API for read-only access)
- **Data Flow**: Frontend queries Supabase for calendar data and renders it in a calendar view
- **Read-Only**: No data modification operations - all interactions are read-only queries

### Components

#### Core Components

- **Calendar Visualization Component**: Renders a calendar view showing daily timeactive and pageloads data
- **Data Fetching Service**: Handles read-only data queries and aggregation from Supabase
- **Filter Components**: Student and course filters for data filtering
- **Date Range Selector**: Allows users to select calendar duration for visualization

#### Integration Points

- **Supabase Database**: PostgreSQL database storing calendar data (read-only access)
- **Supabase REST API**: Read-only API access for querying calendar data

### Technology Stack

#### Frontend
- **Framework**: SvelteKit ([Svelte Documentation](https://svelte.dev/docs/llms))
- **UI Framework**: Skeleton.dev ([Skeleton Documentation](https://www.skeleton.dev/docs/svelte/resources/llms))
  - Built on Tailwind CSS
  - Provides Svelte components for UI elements
  - Includes calendar, date picker, and other visualization components
- **State Management**: Svelte stores (built-in reactive state management)
- **Styling**: Tailwind CSS (via Skeleton.dev)
- **Calendar Component**: Custom calendar component using Skeleton.dev components or Svelte calendar library
- **Data Fetching**: Supabase JavaScript Client Library (@supabase/supabase-js)

#### Testing
- **E2E Testing**: Playwright for end-to-end browser testing
- **Unit Testing**: Vitest (SvelteKit default) for component and unit tests
- **Component Testing**: @playwright/test with Svelte component testing (optional)

#### Backend
- **Backend-as-a-Service**: Supabase
- **API**: Supabase REST API (read-only access)

#### Database
- **Database**: PostgreSQL (via Supabase)
- **ORM/Query Builder**: Supabase JavaScript Client (PostgREST)

#### Infrastructure
- **Hosting**: Vercel, Netlify, Cloudflare Pages, or similar (SvelteKit supports static site generation and server-side rendering)
- **Database Hosting**: Supabase Cloud
- **CDN**: Provided by hosting platform
- **Build**: SvelteKit adapter for static site generation (adapter-static) for read-only application

## Data Model

### Entities

#### Calendar Table
The primary table storing daily time tracking data for students and courses.

- **Fields**:
  - `id` (DATE, Primary Key) - The date for which the time was tracked
  - `studentid` (TEXT) - Identifier for the student
  - `courseid` (TEXT) - Identifier for the course
  - `timeactive` (INT8/BIGINT) - Time spent active (likely in seconds or milliseconds)
  - `pageloads` (INT8/BIGINT) - Number of page loads for that day
- **Relationships**: 
  - Each row represents a unique combination of date, student, and course
  - Multiple rows can exist for the same date (different students/courses)
- **Indexes**: 
  - Composite index on `(id, studentid)` for efficient date and student queries
  - Index on `courseid` for course-based queries
  - Index on `id` (date) for date range queries
  - Composite index on `(studentid, courseid, id)` for comprehensive filtering

### Database Schema Design

```sql
-- Calendar table (primary data table)
CREATE TABLE calendar (
  id DATE NOT NULL,
  studentid TEXT NOT NULL,
  courseid TEXT NOT NULL,
  timeactive BIGINT NOT NULL DEFAULT 0 CHECK (timeactive >= 0),
  pageloads BIGINT NOT NULL DEFAULT 0 CHECK (pageloads >= 0),
  PRIMARY KEY (id, studentid, courseid) -- Composite primary key
);

-- Alternative: If id is meant to be the sole primary key with unique constraint
-- CREATE TABLE calendar (
--   id DATE PRIMARY KEY,
--   studentid TEXT NOT NULL,
--   courseid TEXT NOT NULL,
--   timeactive BIGINT NOT NULL DEFAULT 0 CHECK (timeactive >= 0),
--   pageloads BIGINT NOT NULL DEFAULT 0 CHECK (pageloads >= 0),
--   UNIQUE(id, studentid, courseid) -- Ensure unique combination
-- );

-- Indexes for performance
CREATE INDEX idx_calendar_date ON calendar(id);
CREATE INDEX idx_calendar_studentid ON calendar(studentid);
CREATE INDEX idx_calendar_courseid ON calendar(courseid);
CREATE INDEX idx_calendar_date_studentid ON calendar(id, studentid);
CREATE INDEX idx_calendar_studentid_courseid_date ON calendar(studentid, courseid, id);
```

### Data Notes

- **Time Units**: The `timeactive` field is stored as INT8 (bigint). The unit (seconds, milliseconds, minutes) should be documented and consistent throughout the application. Common conventions:
  - **Seconds**: Most common for time tracking (e.g., 3600 = 1 hour)
  - **Milliseconds**: For high-precision tracking (e.g., 3600000 = 1 hour)
  - **Minutes**: Less common but possible (e.g., 60 = 1 hour)
  - **Recommendation**: Document the unit clearly and provide conversion utilities if needed for display
- **Student/Course IDs**: `studentid` and `courseid` are TEXT fields, suggesting they may be identifiers from an external system or string-based IDs. No foreign key constraints exist, so these are likely managed externally.
- **Primary Key**: The `id` field being a DATE suggests a composite primary key with (id, studentid, courseid) - one row per date/student/course combination. This allows multiple entries per date for different students and courses.
- **Pageloads**: The `pageloads` field tracks the number of page loads, which can be useful for understanding engagement patterns alongside timeactive.
- **Aggregation**: For calendar visualization, data typically needs to be aggregated by:
  - **Date only**: Sum timeactive and pageloads across all students/courses for a given date
  - **Date + Student**: Sum timeactive and pageloads for a specific student across all courses
  - **Date + Course**: Sum timeactive and pageloads for a specific course across all students
  - **Date + Student + Course**: Individual row data (no aggregation needed)

## API Design

The application uses Supabase's auto-generated REST API based on the database schema. The following endpoints are available through Supabase:

### Calendar Endpoints

#### Get Calendar Data for Date Range
- **Method**: GET
- **Path**: `/rest/v1/calendar`
- **Description**: Retrieve calendar data for a specific date range
- **Query Parameters**:
  - `id` (gte, lte): Date range filter (e.g., `id=gte.2024-01-01&id=lte.2024-01-31`)
  - `studentid` (eq): Filter by student ID
  - `courseid` (eq): Filter by course ID
  - `select`: Specify fields to return (default: all fields)
- **Response**: Array of calendar objects
  ```json
  [
    {
      "id": "2024-01-15",
      "studentid": "student123",
      "courseid": "course456",
      "timeactive": 3600,
      "pageloads": 5
    }
  ]
  ```

#### Get Aggregated Time by Day
- **Method**: GET
- **Path**: `/rest/v1/calendar`
- **Description**: Get aggregated timeactive and pageloads per day (aggregated in frontend or via database function)
- **Query Parameters**:
  - `id` (gte, lte): Date range filter
  - `studentid` (eq): Optional filter by student ID
  - `courseid` (eq): Optional filter by course ID
- **Response**: Array of calendar objects, aggregated by date in frontend or via database aggregation
- **Aggregation Logic**: Sum `timeactive` and `pageloads` grouped by `id` (date)

#### Get Distinct Students
- **Method**: GET
- **Path**: `/rest/v1/calendar?select=studentid`
- **Description**: Get list of unique student IDs
- **Query Parameters**:
  - `id` (gte, lte): Optional date range filter
- **Response**: Array of unique student IDs (may need frontend deduplication)

#### Get Distinct Courses
- **Method**: GET
- **Path**: `/rest/v1/calendar?select=courseid`
- **Description**: Get list of unique course IDs
- **Query Parameters**:
  - `id` (gte, lte): Optional date range filter
- **Response**: Array of unique course IDs (may need frontend deduplication)

### Note: Read-Only Application

This application is read-only. All endpoints are GET requests only. No POST, PATCH, or DELETE operations are required or implemented. Data modifications are handled by external systems that populate the calendar table.

## Security

### Authentication
- **Approach**: Not required for read-only public visualization (unless access control needed)
- **If Required**: Supabase Authentication can be added for access control
- **Methods**: Email/Password, OAuth providers (Google, GitHub, etc.) if authentication is needed

### Authorization
- **Row Level Security (RLS)**: Optional - can be enabled if access control is needed
- **Policies** (if RLS enabled): 
  - Public read access for calendar table (read-only)
  - No write policies needed (application is read-only)
- **Default**: Public read-only access via Supabase anonymous key

### Data Protection
- **API Keys**: Store Supabase anonymous/public keys in environment variables (read-only access)
- **HTTPS**: All API communication over HTTPS
- **Input Validation**: Validate query parameters (date ranges, filters) on client side
- **SQL Injection Protection**: Supabase PostgREST handles parameterized queries automatically
- **Rate Limiting**: Consider Supabase rate limits for public read access

## Scalability & Performance

### Performance Targets
- **Calendar Load Time**: < 2 seconds for a month view
- **Data Fetching**: < 500ms for date range queries
- **Concurrent Users**: Support for [X] concurrent users (read-only operations are lightweight)

### Scaling Strategy
- **Database**: Supabase handles PostgreSQL scaling automatically
- **Frontend**: SvelteKit static site generation (SSG) for optimal performance and CDN caching
- **Caching**: 
  - Cache calendar data in Svelte stores (reactive state management)
  - Use Supabase caching headers
  - Implement client-side caching for frequently accessed date ranges
  - Leverage SvelteKit's built-in caching for API routes
- **Query Optimization**: 
  - Use database indexes on `id` (date), `studentid`, and `courseid`
  - Aggregate `timeactive` and `pageloads` at database level when possible using GROUP BY
  - Limit date range queries to reasonable periods (e.g., max 1 year at a time)
  - Consider database functions/views for common aggregations
  - Use SvelteKit load functions for efficient data fetching

## Deployment

### Environments
- **Development**: 
  - Local Supabase instance or development Supabase project
  - Local frontend development server
  - Environment variables for development Supabase credentials
- **Staging**: 
  - Separate Supabase project for staging
  - Staging frontend deployment (Vercel preview/Netlify staging)
  - Test data seeded in staging database
- **Production**: 
  - Production Supabase project
  - Production frontend deployment (Vercel/Netlify production)
  - Production database with proper backups

### Deployment Process
1. **Database Setup**: Ensure calendar table exists in Supabase (no migrations needed from this app)
2. **Pre-Deployment Testing**: Run full Playwright e2e test suite
   - All e2e tests must pass before deployment
   - Cross-browser testing (Chrome, Firefox, Safari)
   - Performance benchmarks verified
3. **Frontend Build**: Build SvelteKit application using `adapter-static` for static site generation
4. **Environment Variables**: Configure production Supabase URL and anonymous key in `.env` file
5. **Deploy Frontend**: Deploy static site to hosting platform (Vercel/Netlify/Cloudflare Pages)
   - SvelteKit generates optimized static assets
   - No server required for read-only application
6. **Post-Deployment Verification**: Run smoke tests against deployed application
7. **Monitor**: Monitor application health and API usage

## Monitoring & Observability

### Logging
- **Frontend Logging**: Browser console logging for development, error tracking service (Sentry) for production
- **Supabase Logging**: Use Supabase dashboard for API logs and database query logs
- **Error Tracking**: Integrate error tracking service (Sentry, LogRocket) for frontend errors

### Metrics
- **Key metrics to track**:
  - Calendar load time
  - API response times
  - Error rates
  - User interactions (date range selections, student/course filters)
  - Database query performance
  - Active users

### Alerting
- **Error Alerts**: Alert on error rate spikes (> 5% error rate)
- **Performance Alerts**: Alert on slow API responses (> 2 seconds)
- **Database Alerts**: Monitor Supabase database health and connection pool usage

## Future Considerations

### Planned Enhancements
- **Multi-student Views**: View multiple students' calendars side-by-side
- **Export Functionality**: Export calendar data to CSV/PDF (read-only export)
- **Advanced Filtering**: Filter by course, date ranges, time thresholds
- **Visualizations**: Charts and graphs showing time trends
- **Mobile Responsive**: Optimize for mobile viewing
- **Offline Support**: Cache data for offline calendar viewing

### Technical Debt
- **Data Aggregation**: Consider moving aggregation logic to database functions for better performance
- **Caching Strategy**: Implement more sophisticated caching for large date ranges
- **Code Splitting**: Optimize bundle size with code splitting for calendar component
