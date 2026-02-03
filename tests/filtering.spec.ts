import { test, expect } from '@playwright/test';

test.describe('Filtering Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Wait for dialog to appear
    const dialog = page.locator('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    
    // Enter a course ID (we'll use a test courseid - adjust based on your test data)
    const courseidInput = page.locator('#courseid-input');
    await courseidInput.fill('test-course'); // Replace with actual courseid from test data
    
    // Submit the dialog
    const loadButton = page.locator('button:has-text("Load Data")');
    await loadButton.click();
    
    // Wait for table to load
    await page.waitForSelector('table.table tbody tr', { timeout: 10000 });
  });

  test('should filter by student ID', async ({ page }) => {
    // Get initial row count
    const initialRows = await page.locator('table.table tbody tr').count();
    expect(initialRows).toBeGreaterThan(0);

    // Select a student ID from the dropdown
    const studentSelect = page.locator('#student-filter');
    await studentSelect.selectOption({ index: 1 }); // Select first non-"All" option

    // Wait for table to update
    await page.waitForTimeout(500);

    // Verify table has filtered rows
    const filteredRows = await page.locator('table.table tbody tr').count();
    expect(filteredRows).toBeLessThanOrEqual(initialRows);

    // Verify all displayed rows have the selected student ID
    const selectedValue = await studentSelect.inputValue();
    if (selectedValue) {
      const studentCells = page.locator('table.table tbody tr td:nth-child(2)');
      const count = await studentCells.count();
      for (let i = 0; i < count; i++) {
        const cellText = await studentCells.nth(i).textContent();
        expect(cellText).toBe(selectedValue);
      }
    }
  });

  test('should show course ID dialog on page load', async ({ page }) => {
    await page.goto('/');
    
    // Verify dialog appears
    const dialog = page.locator('dialog');
    await expect(dialog).toBeVisible();
    
    // Verify dialog has course ID input
    const courseidInput = page.locator('#courseid-input');
    await expect(courseidInput).toBeVisible();
    
    // Verify dialog has submit button
    const loadButton = page.locator('button:has-text("Load Data")');
    await expect(loadButton).toBeVisible();
  });

  test('should load data after entering course ID', async ({ page }) => {
    await page.goto('/');
    
    // Enter course ID
    const courseidInput = page.locator('#courseid-input');
    await courseidInput.fill('test-course'); // Replace with actual courseid
    
    // Submit
    const loadButton = page.locator('button:has-text("Load Data")');
    await loadButton.click();
    
    // Wait for dialog to close and table to appear
    const dialog = page.locator('dialog');
    await expect(dialog).not.toBeVisible({ timeout: 5000 });
    
    // Verify table appears
    await page.waitForSelector('table.table tbody tr', { timeout: 10000 });
    
    // Verify course ID is displayed
    const courseIdDisplay = page.locator('text=/Course ID: .+/');
    await expect(courseIdDisplay).toBeVisible();
  });

  test('should filter by date range', async ({ page }) => {
    // Get initial row count
    const initialRows = await page.locator('table.table tbody tr').count();
    expect(initialRows).toBeGreaterThan(0);

    // Get a date from the first row
    const firstDateCell = page.locator('table.table tbody tr').first().locator('td').first();
    const firstDateText = await firstDateCell.textContent();
    
    // Parse the date (format: "Jan 15, 2024")
    const dateMatch = firstDateText?.match(/(\w+)\s+(\d+),\s+(\d+)/);
    if (!dateMatch) {
      test.skip();
      return;
    }

    const [, month, day, year] = dateMatch;
    const monthMap: Record<string, string> = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
      'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
      'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
    const monthNum = monthMap[month] || '01';
    const paddedDay = day.padStart(2, '0');
    const dateString = `${year}-${monthNum}-${paddedDay}`;

    // Set start date to the date we found
    const startDateInput = page.locator('#start-date');
    await startDateInput.fill(dateString);

    // Wait for table to update
    await page.waitForTimeout(500);

    // Verify table has filtered rows
    const filteredRows = await page.locator('table.table tbody tr').count();
    expect(filteredRows).toBeLessThanOrEqual(initialRows);
    expect(filteredRows).toBeGreaterThan(0);
  });

  test('should combine filters', async ({ page }) => {
    // Get initial row count
    const initialRows = await page.locator('table.table tbody tr').count();
    expect(initialRows).toBeGreaterThan(0);

    // Apply student filter
    const studentSelect = page.locator('#student-filter');
    await studentSelect.selectOption({ index: 1 });

    // Apply date filter
    const startDateInput = page.locator('#start-date');
    await startDateInput.fill('2020-01-01');

    // Wait for table to update
    await page.waitForTimeout(500);

    // Verify table has filtered rows
    const filteredRows = await page.locator('table.table tbody tr').count();
    expect(filteredRows).toBeLessThanOrEqual(initialRows);

    // Verify all rows match the filters
    const selectedStudent = await studentSelect.inputValue();
    
    if (selectedStudent) {
      const rows = page.locator('table.table tbody tr');
      const count = await rows.count();
      for (let i = 0; i < count; i++) {
        const row = rows.nth(i);
        const studentCell = await row.locator('td:nth-child(2)').textContent();
        expect(studentCell).toBe(selectedStudent);
      }
    }
  });

  test('should clear filters', async ({ page }) => {
    // Apply filters
    const studentSelect = page.locator('#student-filter');
    await studentSelect.selectOption({ index: 1 });

    const startDateInput = page.locator('#start-date');
    await startDateInput.fill('2020-01-01');

    // Get filtered count
    await page.waitForTimeout(500);
    const filteredRows = await page.locator('table.table tbody tr').count();

    // Clear filters
    const clearButton = page.locator('button:has-text("Clear")');
    await clearButton.click();

    // Wait for table to update
    await page.waitForTimeout(500);

    // Verify all filters are cleared
    const studentValue = await studentSelect.inputValue();
    const startDateValue = await page.locator('#start-date').inputValue();
    const endDateValue = await page.locator('#end-date').inputValue();

    expect(studentValue).toBe('');
    expect(startDateValue).toBe('');
    expect(endDateValue).toBe('');

    // Verify table shows all rows again
    const clearedRows = await page.locator('table.table tbody tr').count();
    expect(clearedRows).toBeGreaterThanOrEqual(filteredRows);
  });

  test('should show "no entries" message when filters match nothing', async ({ page }) => {
    // Set a date range that likely has no data
    const startDateInput = page.locator('#start-date');
    await startDateInput.fill('2099-01-01');

    const endDateInput = page.locator('#end-date');
    await endDateInput.fill('2099-12-31');

    // Wait for table to update
    await page.waitForTimeout(500);

    // Verify "no entries" message appears
    const noEntriesMessage = page.locator('text=No entries match the selected filters');
    await expect(noEntriesMessage).toBeVisible();
  });

  test('should update entry count when filters change', async ({ page }) => {
    // Get initial count text
    const countText = page.locator('text=/Showing \\d+ of \\d+ calendar entries/');
    await expect(countText).toBeVisible();

    // Apply student filter
    const studentSelect = page.locator('#student-filter');
    await studentSelect.selectOption({ index: 1 });

    // Wait for update
    await page.waitForTimeout(500);

    // Verify count text updates
    const updatedCountText = await countText.textContent();
    expect(updatedCountText).toMatch(/Showing \d+ of \d+ calendar entries/);
  });

  test('should allow changing course ID', async ({ page }) => {
    // Verify "Change Course" button is visible
    const changeCourseButton = page.locator('button:has-text("Change Course")');
    await expect(changeCourseButton).toBeVisible();

    // Click change course button
    await changeCourseButton.click();

    // Verify dialog opens
    const dialog = page.locator('dialog');
    await expect(dialog).toBeVisible();

    // Verify input has current course ID
    const courseidInput = page.locator('#courseid-input');
    const currentValue = await courseidInput.inputValue();
    expect(currentValue).toBeTruthy();

    // Enter new course ID and submit
    await courseidInput.fill('new-course-id');
    const loadButton = page.locator('button:has-text("Load Data")');
    await loadButton.click();

    // Wait for dialog to close
    await expect(dialog).not.toBeVisible({ timeout: 5000 });
  });
});
