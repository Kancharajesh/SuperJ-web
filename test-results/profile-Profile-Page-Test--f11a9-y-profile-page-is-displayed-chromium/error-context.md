# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: profile.spec.js >> Profile Page Test Cases >> Verify profile page is displayed
- Location: tests/profile.spec.js:20:7

# Error details

```
Error: page.waitForTimeout: Test ended.
```

# Test source

```ts
  1   | import { expect } from "@playwright/test";
  2   | 
  3   | export class WelcomePage {
  4   |   constructor(page) {
  5   |     this.page = page;
  6   | 
  7   |     // ---------- Mobile Number / Welcome Page ----------
  8   |     this.Mobilenumber_inputfiled = page.locator(
  9   |       "(//input[@aria-label='phone-number-input'])[1]"
  10  |     );
  11  | 
  12  |     this.RequestOTP = page.locator(
  13  |       "(//button[normalize-space()='Request OTP'])[1]"
  14  |     );
  15  | 
  16  |     this.Mobilenumber_validationmessage = page.locator(
  17  |       "(//span[contains(@class,'text-[#D20505]')])[1]"
  18  |     );
  19  | 
  20  |     // ---------- OTP Page ----------
  21  |     this.OTP_6 = page.locator("(//div[contains(@class,'gap-4')])[1]");
  22  | 
  23  |     this.ResendOTP = page.locator(
  24  |       "//button[normalize-space()='Resend OTP']"
  25  |     );
  26  | 
  27  |     this.OTP_validationmessage = page.locator(
  28  |       "(//p[contains(@class,'text-[#D20505]')])[1]"
  29  |     );
  30  | 
  31  |     // OTP Input boxes
  32  |     this.OTP_Input_Boxes = page.locator("input[type='tel']");
  33  | 
  34  |     // ---------- Home/Dashboard ----------
  35  |     this.Sidebar = page.locator(
  36  |       "(//div[contains(@class,'Sidebar')])[1]"
  37  |     );
  38  |   }
  39  | 
  40  |   // ---------- Launch Application ----------
  41  |   async launchTheBrowser() {
  42  |     await this.page.goto("https://superj.app/", {
  43  |       waitUntil: "domcontentloaded",
  44  |     });
  45  | 
  46  |     await this.page.waitForLoadState("networkidle");
  47  |   }
  48  | 
  49  |   // ---------- Enter Mobile Number ----------
  50  |   async enterMobileNumber(number) {
  51  |     await this.Mobilenumber_inputfiled.waitFor({
  52  |       state: "visible",
  53  |     });
  54  | 
  55  |     await this.Mobilenumber_inputfiled.fill(number);
  56  |   }
  57  | 
  58  |   // ---------- Click Request OTP ----------
  59  |   async clickRequestOTP() {
  60  |     await this.RequestOTP.waitFor({
  61  |       state: "visible",
  62  |     });
  63  | 
  64  |     await this.RequestOTP.click();
  65  |   }
  66  | 
  67  |   // ---------- Enter OTP ----------
  68  |   async enterOTP(otp) {
  69  |     await this.OTP_6.waitFor({
  70  |       state: "visible",
  71  |     });
  72  | 
  73  |     // Method 1 - Keyboard typing
  74  |     await this.page.keyboard.type(otp);
  75  | 
  76  |     // Wait after OTP entry
> 77  |     await this.page.waitForTimeout(3000);
      |                     ^ Error: page.waitForTimeout: Test ended.
  78  |   }
  79  | 
  80  |   // ---------- Login Method ----------
  81  |   async loginToApplication(number, otp) {
  82  |     await this.enterMobileNumber(number);
  83  | 
  84  |     await this.clickRequestOTP();
  85  | 
  86  |     await expect(this.OTP_6).toBeVisible();
  87  | 
  88  |     await this.enterOTP(otp);
  89  |   }
  90  | 
  91  |   // ---------- Verify Sidebar ----------
  92  |   async verifyUserLoggedIn() {
  93  |     await expect(this.Sidebar).toBeVisible({
  94  |       timeout: 20000,
  95  |     });
  96  |   }
  97  | 
  98  |   // ---------- Verify Mobile Validation ----------
  99  |   async verifyMobileValidationMessage() {
  100 |     await expect(
  101 |       this.Mobilenumber_validationmessage
  102 |     ).toBeVisible();
  103 |   }
  104 | 
  105 |   // ---------- Verify OTP Validation ----------
  106 |   async verifyOTPValidationMessage() {
  107 |     await expect(
  108 |       this.OTP_validationmessage
  109 |     ).toBeVisible();
  110 |   }
  111 | 
  112 |   // ---------- Click Resend OTP ----------
  113 |   async clickResendOTP() {
  114 |     await this.ResendOTP.waitFor({
  115 |       state: "visible",
  116 |     });
  117 | 
  118 |     await this.ResendOTP.click();
  119 |   }
  120 | }
```