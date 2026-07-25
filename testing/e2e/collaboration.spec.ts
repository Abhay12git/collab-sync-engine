import { test, expect } from '@playwright/test';

test.describe('Real-Time Collaborative Editing E2E', () => {
  test('two concurrent users should register, open document, and sync edits', async ({ browser }) => {
    // Context User 1
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();

    // Context User 2
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();

    // User 1 Registers
    await page1.goto('http://localhost:5173/login');
    await page1.click('text="Don\'t have an account? Sign up"');
    await page1.fill('input[placeholder="Your name"]', 'Alice');
    await page1.fill('input[placeholder="you@example.com"]', `alice_${Date.now()}@test.com`);
    await page1.fill('input[placeholder="••••••••"]', 'password123');
    await page1.click('button:has-text("Create Account")');

    // Alice creates document
    await expect(page1).toHaveURL('http://localhost:5173/');
    await page1.click('button:has-text("New Document")');

    // Obtain document URL
    await page1.waitForURL(/\/doc\//);
    const docUrl = page1.url();

    // User 2 Registers and joins same document URL
    await page2.goto('http://localhost:5173/login');
    await page2.click('text="Don\'t have an account? Sign up"');
    await page2.fill('input[placeholder="Your name"]', 'Bob');
    await page2.fill('input[placeholder="you@example.com"]', `bob_${Date.now()}@test.com`);
    await page2.fill('input[placeholder="••••••••"]', 'password123');
    await page2.click('button:has-text("Create Account")');
    await page2.goto(docUrl);

    // Verify both users see "2 Online"
    await expect(page1.locator('text="2 Online"')).toBeVisible({ timeout: 5000 });
    await expect(page2.locator('text="2 Online"')).toBeVisible({ timeout: 5000 });

    // Clean up
    await context1.close();
    await context2.close();
  });
});
