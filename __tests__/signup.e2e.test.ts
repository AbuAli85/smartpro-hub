import { test, expect } from "@playwright/test"

test("user can sign up", async ({ page }) => {
  // Navigate to the signup page
  await page.goto("/signup")

  // Fill out the signup form
  await page.selectOption('select[name="userType"]', "business")
  await page.fill('input[name="email"]', "test@example.com")
  await page.fill('input[name="password"]', "StrongPassword123!")
  await page.fill('input[name="confirmPassword"]', "StrongPassword123!")
  await page.fill('input[name="crNumber"]', "12345")
  await page.fill('input[name="companyName"]', "Test Company")
  await page.fill('input[name="industry"]', "Technology")
  await page.fill('input[name="phoneNumber"]', "+96812345678")

  // Submit the form
  await page.click('button[type="submit"]')

  // Check if we're redirected to the email verification page
  await expect(page).toHaveURL("/verify-email")

  // Check if the success message is displayed
  const successMessage = await page.textContent("h2")
  expect(successMessage).toContain("Email Verification")
})

test("user sees error with invalid input", async ({ page }) => {
  // Navigate to the signup page
  await page.goto("/signup")

  // Fill out the form with invalid data
  await page.selectOption('select[name="userType"]', "business")
  await page.fill('input[name="email"]', "invalid-email")
  await page.fill('input[name="password"]', "weak")
  await page.fill('input[name="confirmPassword"]', "weak")

  // Submit the form
  await page.click('button[type="submit"]')

  // Check if error messages are displayed
  const errorMessages = await page.textContent(".text-red-500")
  expect(errorMessages).toContain("Invalid email address")
  expect(errorMessages).toContain("Password must be at least 8 characters long")
})

