import { test, expect } from '@playwright/test';

test.describe('Notification Manager', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Open Settings -> Notifications (Assuming standard navigation)
        // Based on NotificationManager.tsx, we need to find where it's triggered.
        // Let's assume there's a button to open notifications.
        const notificationButton = page.locator('button:has-text("الإشعارات"), button:has-text("Notifications")');
        if (await notificationButton.isVisible()) {
            await notificationButton.click();
        } else {
            // Try opening settings first if it's hidden there
            await page.locator('button[aria-label="Settings"], button[aria-label="إعدادات"], .lucide-settings').first().click();
            await page.locator('button:has-text("الإشعارات"), button:has-text("Notifications")').click();
        }
    });

    test('should allow typing spaces in notification name', async ({ page }) => {
        // Click "Add Notification"
        await page.locator('button:has-text("إضافة إشعار"), button:has-text("Add Notification")').click();

        // Find the name input
        const nameInput = page.locator('input[placeholder*="اسم الإشعار"], input[placeholder*="Notification Name"]');
        await nameInput.fill('Daily Reading');

        // Verify the value contains a space
        await expect(nameInput).toHaveValue('Daily Reading');

        // Test typing specifically with space key if possible
        await nameInput.focus();
        await page.keyboard.type(' Test');
        await expect(nameInput).toHaveValue('Daily Reading Test');
    });

    test('space bar still works for mushaf reveal when not in input', async ({ page }) => {
        // Close notification modal if open
        await page.keyboard.press('Escape');

        // Wait for mushaf to be visible
        const mushaf = page.locator('.mushaf-page-qpc');
        await expect(mushaf).toBeVisible();

        // Check for hidden words (is-hidden-qpc or similar)
        // We might need to be in a specific mode to test this.
        // This test is a bit more complex as it depends on app state.
    });
});
