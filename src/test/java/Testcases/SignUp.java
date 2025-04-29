//package Testcases;
//
//import org.testng.annotations.Test;
//import java.io.IOException;
//import java.time.Duration;
//import java.time.Year;
//import java.util.List;
//import java.util.Random;
//import java.util.Set;
//
//import org.openqa.selenium.By;
//import org.openqa.selenium.WebElement;
//import org.openqa.selenium.support.ui.ExpectedConditions;
//import org.openqa.selenium.support.ui.Select;
//import org.openqa.selenium.support.ui.WebDriverWait;
//import org.testng.Assert;
//import org.testng.annotations.Listeners;
//import Baseclass.Basetest;
//
//@Listeners(TestListener.class)
//public class SignUp extends Basetest {
//
//	// Generate a random 10-digit mobile number
//	public static String randomMobileNumber() {
//		Random generator = new Random();
//		generator.setSeed(System.currentTimeMillis());
//		int num1 = generator.nextInt(900) + 100; // Ensures the first 3 digits are between 100 and 999
//		int num2 = generator.nextInt(9000000) + 1000000; // Ensures the next 7 digits are between 1000000 and 9999999
//		return "99" + num1 + num2; // Always start with '99'
//	}
//
//	// Generate a random 6-digit OTP
//	public static String generateRandomOTP() {
//		Random rand = new Random();
//		int otp = rand.nextInt(900000) + 100000; // Generate random OTP between 100000 and 999999
//		return String.valueOf(otp);
//	}
//
//	// Method to enter OTP into input fields
//	public void enterOTP(String otp) throws Exception {
//		for (int i = 0; i < otp.length(); i++) {
//			String locator = prop.getProperty("OTP_" + (i + 1));
//			driver.findElement(By.xpath(locator)).sendKeys(Character.toString(otp.charAt(i)));
//		}
//	}
//
//	// Method to check if the homepage text is displayed
//	public boolean isHomePageTextDisplayed() {
//		try {
//			return driver.findElement(By.xpath(prop.getProperty("Homepagetext"))).isDisplayed();
//		} catch (Exception e) {
//			return false;
//		}
//	}
//
//	// Clear OTP input fields
//	public void clearOTPFields() {
//		for (int i = 0; i < 6; i++) {
//			String locator = prop.getProperty("OTP_" + (i + 1));
//			WebElement otpField = driver.findElement(By.xpath(locator));
//			otpField.clear();
//		}
//	}
//
//	private void Login_New_number() throws Exception {
//
//		driver.findElement(By.xpath(prop.getProperty("Login"))).click();
//		String mobileNumber = randomMobileNumber();
//		driver.findElement(By.xpath(prop.getProperty("Mobilenumber"))).sendKeys(mobileNumber);
//		driver.findElement(By.xpath(prop.getProperty("Mobilenumber_Continue"))).click();
//
//		// Enter OTP
//		String otp = "777777";
//		enterOTP(otp);
//		driver.findElement(By.xpath(prop.getProperty("OTP_Continue"))).click();
//		Thread.sleep(2500);
//
//	}
//
//	private void TOP_Banner() throws InterruptedException {
//		Thread.sleep(2500);
//		// Click on the TOPBanner
//		driver.findElement(By.xpath(insight.getProperty("TOPBanner"))).click();
//		Thread.sleep(3500);
//
//		// Store the current window handle (original tab)
//		String originalTab = driver.getWindowHandle();
//		Set<String> allTabs = driver.getWindowHandles();
//
//		// Switch to the newly opened tab (other than the original one)
//		for (String tab : allTabs) {
//			if (!tab.equals(originalTab)) {
//				driver.switchTo().window(tab);
//				break;
//			}
//		}
//	}
//
//	@Test(priority = 1, enabled = true, retryAnalyzer = Retry.class)
//	public void verifyMobileOTP() throws Exception {
//		try {
//
//			TOP_Banner();
//
//			driver.findElement(By.xpath(prop.getProperty("Login"))).click();
//
//			String mobileNumber = randomMobileNumber();
//			driver.findElement(By.xpath(prop.getProperty("Mobilenumber"))).sendKeys(mobileNumber);
//			driver.findElement(By.xpath(prop.getProperty("Mobilenumber_Continue"))).click();
//
//			String otp = "777777";
//			enterOTP(otp);
//
////			driver.findElement(By.xpath(prop.getProperty("OTP_Continue"))).click();
////			Thread.sleep(2500);
////
////			WebElement homePageTextElement = driver.findElement(By.xpath(prop.getProperty("Homepagetext")));
////			Assert.assertTrue(homePageTextElement.isDisplayed(), "Homepage text is not displayed");
////			String homePageText = homePageTextElement.getText();
////			System.out.println("Homepage text: " + homePageText);
//
//			System.out.println("SignUp.verifyMobileOTP()");
//
//		} catch (Exception e) {
//			e.printStackTrace();
//			throw e;
//		}
//	}
//
//	@Test(priority = 2, enabled = true, retryAnalyzer = Retry.class)
//	public void verifyMobileContinueButtonHighlight() throws Exception {
//		try {
//
//			TOP_Banner();
//
//			driver.findElement(By.xpath(prop.getProperty("Login"))).click();
//			String mobileNumber = randomMobileNumber();
//			driver.findElement(By.xpath(prop.getProperty("Mobilenumber"))).sendKeys(mobileNumber);
//			WebElement continueButton = driver.findElement(By.xpath(prop.getProperty("Mobilenumber_Continue")));
//			Assert.assertTrue(continueButton.isEnabled(), "Mobilenumber Continue button is not enabled");
//
//			String backgroundColor = continueButton.getCssValue("background-color");
//			System.out.println("Continue button background color: " + backgroundColor);
//
//			String borderColor = continueButton.getCssValue("border-color");
//			System.out.println("Continue button border color: " + borderColor);
//
//			continueButton.click();
//
//		} catch (Exception e) {
//			e.printStackTrace();
//			throw e;
//		}
//	}
//
//	@Test(priority = 3, enabled = true, retryAnalyzer = Retry.class)
//	public void invalidOTPTest() throws Exception {
//		try {
//
//			TOP_Banner();
//
//			driver.findElement(By.xpath(prop.getProperty("Login"))).click();
//			String mobileNumber = randomMobileNumber();
//			driver.findElement(By.xpath(prop.getProperty("Mobilenumber"))).sendKeys(mobileNumber);
//			driver.findElement(By.xpath(prop.getProperty("Mobilenumber_Continue"))).click();
//
//			String invalidOtp = "200020"; // Set invalid OTP
//			enterOTP(invalidOtp);
//
//			driver.findElement(By.xpath(prop.getProperty("OTP_Continue"))).click();
//			Thread.sleep(2000);
//
//			WebElement errorMessage = driver.findElement(By.xpath(prop.getProperty("IncorrectOTP_message")));
//			String actualText = errorMessage.getText();
//			String expectedText = "Incorrect OTP";
//			System.out.println("Actual text: " + actualText);
//			Assert.assertEquals(actualText, expectedText, "OTP error message does not match");
//
//		} catch (Exception e) {
//			e.printStackTrace();
//			throw e;
//		}
//	}
//
//	@Test(priority = 4, enabled = false, retryAnalyzer = Retry.class)
//	public void resendOTPTest() throws Exception {
//		try {
//
//			TOP_Banner();
//
//			driver.findElement(By.xpath(prop.getProperty("Login"))).click();
//			String mobileNumber = randomMobileNumber();
//			driver.findElement(By.xpath(prop.getProperty("Mobilenumber"))).sendKeys(mobileNumber);
//			driver.findElement(By.xpath(prop.getProperty("Mobilenumber_Continue"))).click();
//
//			// Click the resend OTP button
//			WebElement resendOtpElement = driver.findElement(By.xpath(prop.getProperty("resendOTP")));
//			resendOtpElement.click();
//
//			Thread.sleep(2000);
//			String actualText = resendOtpElement.getText();
//			String expectedText = "OTP sent successfully";
//			System.out.println("Actual text: " + actualText);
//			Assert.assertEquals(actualText, expectedText, "Resend OTP message does not match");
//
//		} catch (Exception e) {
//			e.printStackTrace();
//			throw e;
//		}
//	}
//
//	@Test(priority = 5, enabled = true, retryAnalyzer = Retry.class)
//	public void testEnterOTPContinueMultipleTimes() throws Exception {
//		try {
//
//			TOP_Banner();
//
//			driver.findElement(By.xpath(prop.getProperty("Login"))).click();
//			String mobileNumber = randomMobileNumber();
//			driver.findElement(By.xpath(prop.getProperty("Mobilenumber"))).sendKeys(mobileNumber);
//			driver.findElement(By.xpath(prop.getProperty("Mobilenumber_Continue"))).click();
//
//			String invalidOtp = "202020";
//			enterOTP(invalidOtp);
//
//			int attempts = 5;
//			for (int i = 0; i < attempts; i++) {
//				driver.findElement(By.xpath(prop.getProperty("OTP_Continue"))).click();
//				Thread.sleep(800);
//			}
//
//			WebElement errorMessage = driver.findElement(By.xpath(prop.getProperty("IncorrectOTP_message")));
//			String actualText = errorMessage.getText();
//			String expectedText = "Incorrect OTP";
//			System.out.println("Actual text: " + actualText);
//			Assert.assertEquals(actualText, expectedText,
//					"Error message does not match after multiple OTP submissions");
//
//		} catch (Exception e) {
//			e.printStackTrace();
//			throw e;
//		}
//	}
//
//	@Test(priority = 6, enabled = true, retryAnalyzer = Retry.class)
//	public void testMobileNumberInputClear() throws Exception {
//		try {
//			TOP_Banner();
//
//			driver.findElement(By.xpath(prop.getProperty("Login"))).click();
//			WebElement mobileNumberField = driver.findElement(By.xpath(prop.getProperty("Mobilenumber")));
//			mobileNumberField.sendKeys("6281674691");
//			Thread.sleep(2000);
//
//			driver.findElement(By.xpath(prop.getProperty("Close_Mobilenumber_popup"))).click();
//			Thread.sleep(2000);
//
//			driver.findElement(By.xpath(prop.getProperty("Login"))).click();
//			mobileNumberField = driver.findElement(By.xpath(prop.getProperty("Mobilenumber")));
//			String actualMobileNumber = mobileNumberField.getAttribute("value");
//
//			if (!actualMobileNumber.isEmpty()) {
//				mobileNumberField.clear();
//			}
//
//			Assert.assertEquals(mobileNumberField.getAttribute("value"), "",
//					"Mobile number field is not empty after clearing.");
//
//		} catch (Exception e) {
//			e.printStackTrace();
//			throw e;
//		}
//	}
//
//	@Test(priority = 7, enabled = true, retryAnalyzer = Retry.class)
//	public void testOTPRefresh() throws Exception {
//		try {
//
//			TOP_Banner();
//
//			Login_New_number();
//
////			driver.findElement(By.xpath(prop.getProperty("Login"))).click();
////			String mobileNumber = randomMobileNumber();
////			driver.findElement(By.xpath(prop.getProperty("Mobilenumber"))).sendKeys(mobileNumber);
////			driver.findElement(By.xpath(prop.getProperty("Mobilenumber_Continue"))).click();
////
////			String validOtp = "777777";
////			enterOTP(validOtp);
////			driver.findElement(By.xpath(prop.getProperty("OTP_Continue"))).click();
////			Thread.sleep(2000);
//
//			WebElement homepageTextElement = driver.findElement(By.xpath(prop.getProperty("Homepagetext")));
//			String actualText = homepageTextElement.getText();
//			System.out.println("Homepage text: " + actualText);
//
//			Assert.assertTrue(homepageTextElement.isDisplayed(), "Homepage text is not displayed after OTP refresh.");
//
//		} catch (Exception e) {
//			e.printStackTrace();
//			throw e;
//		}
//
//	}
//
//	@Test(priority = 8, enabled = false, retryAnalyzer = Retry.class)
//	public void verify_Mobile01_OTP() throws Exception {
//		try {
//
//			TOP_Banner();
//
//			driver.findElement(By.xpath(prop.getProperty("Login"))).click();
//
//			// Generate and use random mobile number
//			String randomMobileNumber = randomMobileNumber();
//			driver.findElement(By.xpath(prop.getProperty("Mobilenumber"))).sendKeys(randomMobileNumber);
//
//			Thread.sleep(1000);
//
//			driver.findElement(By.xpath(prop.getProperty("Mobilenumber_Continue"))).click();
//
//			boolean otpSubmitted = false;
//			int attempts = 0;
//			int maxAttempts = 5;
//
//			while (!otpSubmitted && attempts < maxAttempts) {
//				String otp = generateRandomOTP();
//				enterOTP(otp);
//
//				driver.findElement(By.xpath(prop.getProperty("OTP_Continue"))).click();
//				Thread.sleep(500);
//
//				if (isHomePageTextDisplayed()) {
//					otpSubmitted = true;
//					System.out.println("OTP submission successful.");
//				} else {
//					clearOTPFields();
//					attempts++;
//					System.out.println("OTP submission failed. Retrying... Attempt " + attempts);
//				}
//			}
//
//			if (!otpSubmitted) {
//				Assert.fail("OTP submission failed after " + maxAttempts + " attempts.");
//			}
//
//		} catch (Exception e) {
//			e.printStackTrace();
//			throw e;
//		}
//	}
//
//// On-Boarding.
//
//	@Test(priority = 9, enabled = true, retryAnalyzer = Retry.class)
//	public void completeOnboardingFlow() throws Exception {
//
//		TOP_Banner();
//
//		driver.findElement(By.xpath(prop.getProperty("Login"))).click();
//		String mobileNumber = randomMobileNumber();
//		driver.findElement(By.xpath(prop.getProperty("Mobilenumber"))).sendKeys(mobileNumber);
//		driver.findElement(By.xpath(prop.getProperty("Mobilenumber_Continue"))).click();
//
//		// Enter OTP
//		String otp = "777777";
//		enterOTP(otp);
//		driver.findElement(By.xpath(prop.getProperty("OTP_Continue"))).click();
//		Thread.sleep(2500);
//
//		// Select Gender
//		driver.findElement(By.xpath(prop.getProperty("Click_Gender"))).click();
//		Thread.sleep(1000);
//		driver.findElement(By.xpath(prop.getProperty("Male"))).click();
//		Thread.sleep(2000);
//		driver.navigate().refresh();
//		Thread.sleep(3000);
//
//		// Select Year of Birth
//		driver.findElement(By.xpath(prop.getProperty("Click_Gender"))).click();
//		Thread.sleep(1000);
//		driver.findElement(By.xpath(prop.getProperty("2002"))).click();
//		Thread.sleep(2000);
//
//		// Select Location
//		driver.findElement(By.xpath(prop.getProperty("Click_Gender"))).click();
//		Thread.sleep(1000);
//		driver.findElement(By.xpath(prop.getProperty("Adilabad1"))).click();
//		Thread.sleep(3000);
//
//		// Select Onboarding Coupons
//		driver.findElement(By.xpath(prop.getProperty("Coupon_1"))).click();
//		driver.findElement(By.xpath(prop.getProperty("Coupon_2"))).click();
//		Thread.sleep(3000);
//
//		// Collect Onboarding Coupons
//		driver.findElement(By.xpath(prop.getProperty("Collect_Onboarding_coupons"))).click();
//		Thread.sleep(1000);
//
//		Boolean coupons = driver.findElement(By.xpath(prop.getProperty("On_boarding_reward_sucess_coupons")))
//				.isDisplayed();
//		if (coupons) {
//			System.out.println("coupons are displayed.");
//		} else {
//			System.out.println("couposn are not displayed.");
//		}
//
//		// Click to earn more rewards
//		driver.findElement(By.xpath(prop.getProperty("Earn_more_rewards!"))).click();
//		Thread.sleep(1000);
//
//		WebElement homePageTextElement = driver.findElement(By.xpath(prop.getProperty("Homepagetext")));
//		Assert.assertTrue(homePageTextElement.isDisplayed(), "Homepage text is not displayed");
//		System.out.println("Homepage text: " + homePageTextElement.getText());
//	}
//
//	@Test(priority = 10, enabled = true, retryAnalyzer = Retry.class)
//	public void completeOnboardingFlow1() throws Exception {
//
//		TOP_Banner();
//
//		Login_New_number();
//
//		driver.findElement(By.xpath(prop.getProperty("survey_headings"))).click();
//		driver.findElement(By.xpath(prop.getProperty("Survey_Preview_start_survey"))).click();
//
//		// Find all answer options dynamically
//		List<WebElement> answerOptions = driver.findElements(By.xpath(prop.getProperty("survey_answer_options_1")));
//
//		// Iterate through all options and click them
//		for (WebElement option : answerOptions) {
//			option.click();
//		}
//	}
//
//}