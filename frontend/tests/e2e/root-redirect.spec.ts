import { test, expect } from '@playwright/test';

test.describe('Root Path Redirect for Non-Authenticated Users', () => {
  
  test('should redirect from / to /home for non-authenticated users', async ({ page }) => {
    // Clear any existing authentication
    await page.context().clearCookies();
    
    // Navigate to root path
    await page.goto('/');
    
    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');
    
    // Verify we're redirected to /home
    await expect(page).toHaveURL(/\/home/);
    
    // Verify the home page content is visible
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Successfully redirected from / to /home');
  });

  test('should display public home page content at /home', async ({ page }) => {
    await page.context().clearCookies();
    
    // Navigate directly to /home
    await page.goto('/home');
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the home page
    await expect(page).toHaveURL(/\/home/);
    
    // Check for typical home page elements
    const hasContent = await page.locator('h1, h2, .hero, header').first().isVisible();
    expect(hasContent).toBeTruthy();
    
    console.log('✅ Home page displays correctly');
  });

  test('should have navigation header on home page', async ({ page }) => {
    await page.context().clearCookies();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify the page has a header/navigation
    const header = page.locator('header, nav, .header, .navbar').first();
    await expect(header).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Home page has navigation header');
  });
});
