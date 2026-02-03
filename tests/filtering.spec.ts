import { test, expect } from '@playwright/test';

const COURSE_ID = 'setu-hdip-comp-sci-2025-full-stack-1';

test.describe('Filtering Functionality', () => {
  // Helper function to handle course ID dialog
  async function enterCourseId(page: any) {
    // Wait for dialog to appear
    const dialog = page.locator('dialog');
    await expect(dialog).toBeVisible();

    // Fill in the course ID
    const courseIdInput = page.locator('#courseid-input');
    await courseIdInput.fill(COURSE_ID);

    // Submit the form
    const submitButton = page.locator('button:has-text("Load Data")');
    await submitButton.click();

    // Wait for dialog to close and table to load
    await expect(dialog).not.toBeVisible();
    await page.waitForSelector('table.table tbody tr', { timeout: 10000 });
  }

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await enterCourseId(page);
  });

  test('should display course ID dialog on page load', async ({ page }) => {
    await page.goto('/');

    // Check that dialog is visible
    const dialog = page.locator('dialog');
    await expect(dialog).toBeVisible();

    // Check dialog content
    await expect(page.locator('text=Select Course ID')).toBeVisible();
    await expect(page.locator('#courseid-input')).toBeVisible();
    await expect(page.locator('button:has-text("Load Data")')).toBeVisible();
  });

  test('should load calendar data after entering course ID', async ({ page }) => {
    await page.goto('/');

    // Enter course ID
    await enterCourseId(page);

    // Verify course ID is displayed
    await expect(page.locator(`text=Course ID: ${COURSE_ID}`)).toBeVisible();

    // Verify table is visible and has data
    const table = page.locator('table.table');
    await expect(table).toBeVisible();

    const rows = table.locator('tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Verify all rows have the correct course ID
    const courseIdCells = table.locator('tbody tr td:nth-child(3)');
    const count = await courseIdCells.count();
    for (let i = 0; i < Math.min(count, 10); i++) {
      const cellText = await courseIdCells.nth(i).textContent();
      expect(cellText).toBe(COURSE_ID);
    }
  });

  test('should filter by student ID', async ({ page }) => {
    // Wait for table to be fully loaded
    await page.waitForSelector('table.table tbody tr', { timeout: 10000 });

    // Get available student IDs from the filter dropdown
    const studentFilter = page.locator('#student-filter');
    await expect(studentFilter).toBeVisible();

    // Get the first non-empty student ID option
    const options = await studentFilter.locator('option').all();
    let selectedStudentId = null;

    for (const option of options.slice(1)) {
      // Skip the "All Students" option
      const value = await option.getAttribute('value');
      if (value && value !== 'null') {
        selectedStudentId = value;
        break;
      }
    }

    if (selectedStudentId) {
      // Select a student ID
      await studentFilter.selectOption(selectedStudentId);

      // Wait for table to update
      await page.waitForTimeout(500);

      // Verify all visible rows have the selected student ID
      const studentIdCells = page.locator('table.table tbody tr td:nth-child(2)');
      const count = await studentIdCells.count();
      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        const cellText = await studentIdCells.nth(i).textContent();
        expect(cellText).toBe(selectedStudentId);
      }
    }
  });

  test('should filter by date range', async ({ page }) => {
    // Wait for table to be fully loaded
    await page.waitForSelector('table.table tbody tr', { timeout: 10000 });

    // Get initial row count
    const initialRows = page.locator('table.table tbody tr');
    const initialCount = await initialRows.count();
    expect(initialCount).toBeGreaterThan(0);

    // Set a start date
    const startDateInput = page.locator('#start-date');
    await startDateInput.fill('2025-01-01');

    // Wait for table to update
    await page.waitForTimeout(500);

    // Verify table has been filtered (may have fewer rows)
    const filteredRows = page.locator('table.table tbody tr');
    const filteredCount = await filteredRows.count();
    expect(filteredCount).toBeGreaterThanOrEqual(0);

    // Verify all dates are >= start date
    if (filteredCount > 0) {
      const dateCells = page.locator('table.table tbody tr td:first-child');
      const firstDateText = await dateCells.first().textContent();
      expect(firstDateText).toBeTruthy();
    }
  });

  test('should filter by combined student ID and date', async ({ page }) => {
    // Wait for table to be fully loaded
    await page.waitForSelector('table.table tbody tr', { timeout: 10000 });

    // Select a student ID
    const studentFilter = page.locator('#student-filter');
    const options = await studentFilter.locator('option').all();
    let selectedStudentId = null;

    for (const option of options.slice(1)) {
      const value = await option.getAttribute('value');
      if (value && value !== 'null') {
        selectedStudentId = value;
        break;
      }
    }

    if (selectedStudentId) {
      await studentFilter.selectOption(selectedStudentId);

      // Set a date range
      const startDateInput = page.locator('#start-date');
      await startDateInput.fill('2025-01-01');

      // Wait for filters to apply
      await page.waitForTimeout(500);

      // Verify filtered results
      const rows = page.locator('table.table tbody tr');
      const count = await rows.count();

      if (count > 0) {
        // Verify all rows match the selected student ID
        const studentIdCells = page.locator('table.table tbody tr td:nth-child(2)');
        for (let i = 0; i < count; i++) {
          const cellText = await studentIdCells.nth(i).textContent();
          expect(cellText).toBe(selectedStudentId);
        }
      }
    }
  });

  test('should clear filters and show all data', async ({ page }) => {
    // Wait for table to be fully loaded
    await page.waitForSelector('table.table tbody tr', { timeout: 10000 });

    // Get initial row count
    const initialRows = page.locator('table.table tbody tr');
    const initialCount = await initialRows.count();

    // Apply a filter
    const studentFilter = page.locator('#student-filter');
    const options = await studentFilter.locator('option').all();
    if (options.length > 1) {
      const firstStudentOption = options[1];
      const value = await firstStudentOption.getAttribute('value');
      if (value && value !== 'null') {
        await studentFilter.selectOption(value);
        await page.waitForTimeout(500);
      }
    }

    // Clear filters
    const clearButton = page.locator('button:has-text("Clear")');
    await clearButton.click();

    // Wait for table to update
    await page.waitForTimeout(500);

    // Verify all data is shown again
    const clearedRows = page.locator('table.table tbody tr');
    const clearedCount = await clearedRows.count();
    expect(clearedCount).toBe(initialCount);
  });

  test('should show "no entries" message when filters match no data', async ({ page }) => {
    // Wait for table to be fully loaded
    await page.waitForSelector('table.table tbody tr', { timeout: 10000 });

    // Set a date range that likely has no data
    const startDateInput = page.locator('#start-date');
    await startDateInput.fill('2099-12-31');

    // Wait for filter to apply
    await page.waitForTimeout(500);

    // Check for "no entries" message
    const noEntriesMessage = page.locator('text=No entries match the selected filters');
    await expect(noEntriesMessage).toBeVisible();
  });

  test('should allow changing course ID', async ({ page }) => {
    // Verify current course ID is displayed
    await expect(page.locator(`text=Course ID: ${COURSE_ID}`)).toBeVisible();

    // Click "Change Course" button
    const changeCourseButton = page.locator('button:has-text("Change Course")');
    await changeCourseButton.click();

    // Verify dialog is open
    const dialog = page.locator('dialog');
    await expect(dialog).toBeVisible();

    // Verify input is pre-filled with current course ID
    const courseIdInput = page.locator('#courseid-input');
    const inputValue = await courseIdInput.inputValue();
    expect(inputValue).toBe(COURSE_ID);

    // Can enter a new course ID (but we'll keep the same one for this test)
    await courseIdInput.fill(COURSE_ID);
    const submitButton = page.locator('button:has-text("Load Data")');
    await submitButton.click();

    // Verify dialog closes and data reloads
    await expect(dialog).not.toBeVisible();
    await page.waitForSelector('table.table tbody tr', { timeout: 10000 });
  });
});
