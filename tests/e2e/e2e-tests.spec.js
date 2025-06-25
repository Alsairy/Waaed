const { test, expect } = require('@playwright/test');

// End-to-End Tests for Hudur Platform
// These tests simulate real user interactions across the entire platform

test.describe('Hudur Platform E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');
  });

  test.describe('Authentication Flow', () => {
    
    test('User can login with valid credentials', async ({ page }) => {
      // Navigate to login page
      await page.click('text=Login');
      
      // Fill login form
      await page.fill('[data-testid=email-input]', 'admin@test.com');
      await page.fill('[data-testid=password-input]', 'Test123!');
      await page.fill('[data-testid=tenant-input]', 'test');
      
      // Submit login
      await page.click('[data-testid=login-button]');
      
      // Verify successful login
      await expect(page).toHaveURL(/.*dashboard/);
      await expect(page.locator('[data-testid=user-menu]')).toBeVisible();
    });

    test('User cannot login with invalid credentials', async ({ page }) => {
      await page.click('text=Login');
      
      await page.fill('[data-testid=email-input]', 'invalid@test.com');
      await page.fill('[data-testid=password-input]', 'wrongpassword');
      await page.fill('[data-testid=tenant-input]', 'test');
      
      await page.click('[data-testid=login-button]');
      
      // Verify error message
      await expect(page.locator('[data-testid=error-message]')).toBeVisible();
      await expect(page.locator('[data-testid=error-message]')).toContainText('Invalid credentials');
    });

    test('User can register new account', async ({ page }) => {
      await page.click('text=Register');
      
      await page.fill('[data-testid=first-name-input]', 'John');
      await page.fill('[data-testid=last-name-input]', 'Doe');
      await page.fill('[data-testid=email-input]', 'john.doe@test.com');
      await page.fill('[data-testid=password-input]', 'Test123!');
      await page.fill('[data-testid=confirm-password-input]', 'Test123!');
      await page.fill('[data-testid=tenant-input]', 'test');
      
      await page.click('[data-testid=register-button]');
      
      await expect(page.locator('[data-testid=success-message]')).toBeVisible();
      await expect(page.locator('[data-testid=success-message]')).toContainText('Registration successful');
    });
  });

  test.describe('Attendance Management', () => {
    
    test.beforeEach(async ({ page }) => {
      // Login before each attendance test
      await page.goto('https://app.hudur.sa/login');
      await page.fill('[data-testid=email-input]', 'admin@test.com');
      await page.fill('[data-testid=password-input]', 'Test123!');
      await page.fill('[data-testid=tenant-input]', 'test');
      await page.click('[data-testid=login-button]');
      await expect(page).toHaveURL(/.*dashboard/);
    });

    test('User can check in successfully', async ({ page }) => {
      // Navigate to attendance page
      await page.click('[data-testid=attendance-nav]');
      await expect(page).toHaveURL(/.*attendance/);
      
      // Mock geolocation
      await page.context().grantPermissions(['geolocation']);
      await page.setGeolocation({ latitude: 40.7128, longitude: -74.0060 });
      
      // Perform check-in
      await page.click('[data-testid=checkin-button]');
      
      // Verify successful check-in
      await expect(page.locator('[data-testid=checkin-success]')).toBeVisible();
      await expect(page.locator('[data-testid=current-status]')).toContainText('Checked In');
    });

    test('User can check out successfully', async ({ page }) => {
      await page.click('[data-testid=attendance-nav]');
      
      // Assume user is already checked in
      await page.context().grantPermissions(['geolocation']);
      await page.setGeolocation({ latitude: 40.7128, longitude: -74.0060 });
      
      // Perform check-out
      await page.click('[data-testid=checkout-button]');
      
      // Verify successful check-out
      await expect(page.locator('[data-testid=checkout-success]')).toBeVisible();
      await expect(page.locator('[data-testid=current-status]')).toContainText('Checked Out');
    });

    test('User can view attendance history', async ({ page }) => {
      await page.click('[data-testid=attendance-nav]');
      
      // Navigate to history tab
      await page.click('[data-testid=history-tab]');
      
      // Verify attendance records are displayed
      await expect(page.locator('[data-testid=attendance-table]')).toBeVisible();
      await expect(page.locator('[data-testid=attendance-record]').first()).toBeVisible();
    });
  });

  test.describe('Face Recognition', () => {
    
    test.beforeEach(async ({ page }) => {
      await page.goto('https://app.hudur.sa/login');
      await page.fill('[data-testid=email-input]', 'admin@test.com');
      await page.fill('[data-testid=password-input]', 'Test123!');
      await page.fill('[data-testid=tenant-input]', 'test');
      await page.click('[data-testid=login-button]');
      await expect(page).toHaveURL(/.*dashboard/);
    });

    test('User can enroll face for recognition', async ({ page }) => {
      await page.click('[data-testid=face-recognition-nav]');
      await expect(page).toHaveURL(/.*face-recognition/);
      
      // Grant camera permissions
      await page.context().grantPermissions(['camera']);
      
      // Start face enrollment
      await page.click('[data-testid=enroll-face-button]');
      
      // Simulate camera capture
      await page.click('[data-testid=capture-button]');
      
      // Confirm enrollment
      await page.click('[data-testid=confirm-enrollment]');
      
      // Verify successful enrollment
      await expect(page.locator('[data-testid=enrollment-success]')).toBeVisible();
    });

    test('User can verify face for attendance', async ({ page }) => {
      await page.click('[data-testid=face-recognition-nav]');
      
      await page.context().grantPermissions(['camera']);
      
      // Start face verification
      await page.click('[data-testid=verify-face-button]');
      
      // Simulate camera capture
      await page.click('[data-testid=capture-button]');
      
      // Verify successful recognition
      await expect(page.locator('[data-testid=verification-result]')).toBeVisible();
    });
  });

  test.describe('Leave Management', () => {
    
    test.beforeEach(async ({ page }) => {
      await page.goto('https://app.hudur.sa/login');
      await page.fill('[data-testid=email-input]', 'admin@test.com');
      await page.fill('[data-testid=password-input]', 'Test123!');
      await page.fill('[data-testid=tenant-input]', 'test');
      await page.click('[data-testid=login-button]');
      await expect(page).toHaveURL(/.*dashboard/);
    });

    test('User can submit leave request', async ({ page }) => {
      await page.click('[data-testid=leave-management-nav]');
      await expect(page).toHaveURL(/.*leave-management/);
      
      // Click new leave request
      await page.click('[data-testid=new-leave-request]');
      
      // Fill leave request form
      await page.selectOption('[data-testid=leave-type]', 'Annual');
      await page.fill('[data-testid=start-date]', '2024-07-01');
      await page.fill('[data-testid=end-date]', '2024-07-05');
      await page.fill('[data-testid=reason]', 'Family vacation');
      
      // Submit request
      await page.click('[data-testid=submit-request]');
      
      // Verify successful submission
      await expect(page.locator('[data-testid=request-success]')).toBeVisible();
    });

    test('Manager can approve leave request', async ({ page }) => {
      await page.click('[data-testid=leave-management-nav]');
      
      // Navigate to pending requests
      await page.click('[data-testid=pending-requests-tab]');
      
      // Approve first request
      await page.click('[data-testid=approve-button]').first();
      
      // Add approval comments
      await page.fill('[data-testid=approval-comments]', 'Approved by manager');
      await page.click('[data-testid=confirm-approval]');
      
      // Verify approval
      await expect(page.locator('[data-testid=approval-success]')).toBeVisible();
    });
  });

  test.describe('User Management', () => {
    
    test.beforeEach(async ({ page }) => {
      await page.goto('https://app.hudur.sa/login');
      await page.fill('[data-testid=email-input]', 'admin@test.com');
      await page.fill('[data-testid=password-input]', 'Test123!');
      await page.fill('[data-testid=tenant-input]', 'test');
      await page.click('[data-testid=login-button]');
      await expect(page).toHaveURL(/.*dashboard/);
    });

    test('Admin can create new user', async ({ page }) => {
      await page.click('[data-testid=user-management-nav]');
      await expect(page).toHaveURL(/.*user-management/);
      
      // Click add new user
      await page.click('[data-testid=add-user-button]');
      
      // Fill user form
      await page.fill('[data-testid=user-first-name]', 'Jane');
      await page.fill('[data-testid=user-last-name]', 'Smith');
      await page.fill('[data-testid=user-email]', 'jane.smith@test.com');
      await page.selectOption('[data-testid=user-role]', 'Employee');
      await page.fill('[data-testid=user-department]', 'Engineering');
      
      // Submit user creation
      await page.click('[data-testid=create-user-button]');
      
      // Verify user creation
      await expect(page.locator('[data-testid=user-created-success]')).toBeVisible();
    });

    test('Admin can edit user details', async ({ page }) => {
      await page.click('[data-testid=user-management-nav]');
      
      // Click edit on first user
      await page.click('[data-testid=edit-user-button]').first();
      
      // Update user details
      await page.fill('[data-testid=user-phone]', '+1234567890');
      await page.selectOption('[data-testid=user-status]', 'Active');
      
      // Save changes
      await page.click('[data-testid=save-user-button]');
      
      // Verify update
      await expect(page.locator('[data-testid=user-updated-success]')).toBeVisible();
    });
  });

  test.describe('Reports and Analytics', () => {
    
    test.beforeEach(async ({ page }) => {
      await page.goto('https://app.hudur.sa/login');
      await page.fill('[data-testid=email-input]', 'admin@test.com');
      await page.fill('[data-testid=password-input]', 'Test123!');
      await page.fill('[data-testid=tenant-input]', 'test');
      await page.click('[data-testid=login-button]');
      await expect(page).toHaveURL(/.*dashboard/);
    });

    test('User can generate attendance report', async ({ page }) => {
      await page.click('[data-testid=reports-nav]');
      await expect(page).toHaveURL(/.*reports/);
      
      // Select report type
      await page.selectOption('[data-testid=report-type]', 'attendance');
      
      // Set date range
      await page.fill('[data-testid=from-date]', '2024-06-01');
      await page.fill('[data-testid=to-date]', '2024-06-30');
      
      // Generate report
      await page.click('[data-testid=generate-report]');
      
      // Verify report generation
      await expect(page.locator('[data-testid=report-table]')).toBeVisible();
      await expect(page.locator('[data-testid=download-report]')).toBeVisible();
    });

    test('User can export report to PDF', async ({ page }) => {
      await page.click('[data-testid=reports-nav]');
      
      await page.selectOption('[data-testid=report-type]', 'attendance');
      await page.fill('[data-testid=from-date]', '2024-06-01');
      await page.fill('[data-testid=to-date]', '2024-06-30');
      await page.click('[data-testid=generate-report]');
      
      // Start download
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid=export-pdf]');
      const download = await downloadPromise;
      
      // Verify download
      expect(download.suggestedFilename()).toContain('attendance-report');
      expect(download.suggestedFilename()).toContain('.pdf');
    });
  });

  test.describe('Settings and Configuration', () => {
    
    test.beforeEach(async ({ page }) => {
      await page.goto('https://app.hudur.sa/login');
      await page.fill('[data-testid=email-input]', 'admin@test.com');
      await page.fill('[data-testid=password-input]', 'Test123!');
      await page.fill('[data-testid=tenant-input]', 'test');
      await page.click('[data-testid=login-button]');
      await expect(page).toHaveURL(/.*dashboard/);
    });

    test('Admin can configure geofence settings', async ({ page }) => {
      await page.click('[data-testid=settings-nav]');
      await expect(page).toHaveURL(/.*settings/);
      
      // Navigate to geofence settings
      await page.click('[data-testid=geofence-settings-tab]');
      
      // Add new geofence
      await page.click('[data-testid=add-geofence]');
      await page.fill('[data-testid=geofence-name]', 'Main Office');
      await page.fill('[data-testid=geofence-latitude]', '40.7128');
      await page.fill('[data-testid=geofence-longitude]', '-74.0060');
      await page.fill('[data-testid=geofence-radius]', '100');
      
      // Save geofence
      await page.click('[data-testid=save-geofence]');
      
      // Verify geofence creation
      await expect(page.locator('[data-testid=geofence-success]')).toBeVisible();
    });

    test('Admin can configure notification settings', async ({ page }) => {
      await page.click('[data-testid=settings-nav]');
      
      // Navigate to notification settings
      await page.click('[data-testid=notification-settings-tab]');
      
      // Configure email notifications
      await page.check('[data-testid=email-notifications]');
      await page.fill('[data-testid=smtp-server]', 'smtp.gmail.com');
      await page.fill('[data-testid=smtp-port]', '587');
      
      // Save settings
      await page.click('[data-testid=save-notification-settings]');
      
      // Verify settings saved
      await expect(page.locator('[data-testid=settings-success]')).toBeVisible();
    });
  });

  test.describe('Mobile Responsiveness', () => {
    
    test('Platform works on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('http://localhost:3000');
      
      // Verify mobile navigation
      await expect(page.locator('[data-testid=mobile-menu-button]')).toBeVisible();
      
      // Test mobile login
      await page.click('[data-testid=mobile-menu-button]');
      await page.click('text=Login');
      
      await page.fill('[data-testid=email-input]', 'admin@test.com');
      await page.fill('[data-testid=password-input]', 'Test123!');
      await page.fill('[data-testid=tenant-input]', 'test');
      await page.click('[data-testid=login-button]');
      
      // Verify mobile dashboard
      await expect(page).toHaveURL(/.*dashboard/);
      await expect(page.locator('[data-testid=mobile-dashboard]')).toBeVisible();
    });
  });

  test.describe('Performance and Accessibility', () => {
    
    test('Platform meets performance benchmarks', async ({ page }) => {
      await page.goto('http://localhost:3000');
      
      // Measure page load time
      const startTime = Date.now();
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Verify load time is under 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('Platform is accessible', async ({ page }) => {
      await page.goto('http://localhost:3000');
      
      // Check for accessibility landmarks
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('nav')).toBeVisible();
      
      // Check for proper heading structure
      await expect(page.locator('h1')).toBeVisible();
      
      // Check for alt text on images
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < imageCount; i++) {
        const alt = await images.nth(i).getAttribute('alt');
        expect(alt).toBeTruthy();
      }
    });
  });
});

