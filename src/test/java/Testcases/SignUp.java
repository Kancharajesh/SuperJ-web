package Testcases;

import static org.testng.Assert.assertEquals;

import java.io.IOException;
import java.time.Duration;
import java.util.Iterator;
import java.util.NoSuchElementException;
import java.util.Random;

import org.openqa.selenium.By;
import org.openqa.selenium.ElementNotVisibleException;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;
import org.testng.internal.BaseTestMethod;
import com.aventstack.extentreports.Status;
import Baseclass.Basetest;
import io.netty.handler.timeout.TimeoutException;

import org.testng.annotations.Listeners;

@Listeners(TestListener.class)
public class SignUp extends Basetest {

	private static final FluentWait<WebDriver> wait = null;

	// Random mobile generator.
	public static String Random_MobileNumber() throws Exception {
		Random generator = new Random();
		generator.setSeed(System.currentTimeMillis());
		int num1 = generator.nextInt(999) + 900;
		int num2 = generator.nextInt(9999999) + 1000000;
		return "99" + num1 + num2;
	}
	
	public static String ExcitingMobileNumber() {
	    Random generator = new Random();
	    generator.setSeed(System.currentTimeMillis());
	    int num1 = generator.nextInt(99999) + 10000;
	    int num2 = generator.nextInt(99999) + 10000;

	    return "99" + num1 + num2;
	   }

	// OTP.
	private void enterOTP(String otp) throws Exception {
		for (int i = 0; i < otp.length(); i++) {
			String locator = prop.getProperty("OTP_" + (i + 1));
			driver.findElement(By.xpath(locator)).sendKeys(Character.toString(otp.charAt(i)));
		}
	}

	@Test(priority = 1, enabled = true, retryAnalyzer = Retry.class)
	public void Valid_mobileNumber() throws Exception {
		driver.findElement(By.xpath(prop.getProperty("Signup"))).click();
		String randomMobileNumber = Random_MobileNumber();
		driver.findElement(By.xpath(prop.getProperty("Mobilenumber"))).sendKeys(randomMobileNumber);
		driver.findElement(By.xpath(prop.getProperty("Mobilenumber_Continue"))).click();

		String otp = "2020";
		enterOTP(otp);

		driver.findElement(By.xpath(prop.getProperty("OTP_Continue"))).click();

		WebElement isDIDDisplayed = driver.findElement(By.xpath(prop.getProperty("DIDFirst_screen")));
		Assert.assertTrue(isDIDDisplayed.isDisplayed(),
				"DIDFirst_screen is not displayed after entering OTP and clicking Continue.");

	}

	@Test(priority = 2, enabled = true, retryAnalyzer = Retry.class)
	public void Ons() throws Exception {
		driver.findElement(By.xpath(prop.getProperty("Signup"))).click();

		String randomMobileNumber = Random_MobileNumber();
		driver.findElement(By.xpath(prop.getProperty("Mobilenumber"))).sendKeys(randomMobileNumber);

		driver.findElement(By.xpath(prop.getProperty("Mobilenumber_Continue"))).click();

		String otp = "2020";
		enterOTP(otp);

		driver.findElement(By.xpath(prop.getProperty("OTP_Continue"))).click();

		WebElement isDIDDisplayed = driver.findElement(By.xpath(prop.getProperty("DIDFirst_screen")));
		Assert.assertTrue(isDIDDisplayed.isDisplayed(),
				"DIDFirst_screen is not displayed after entering OTP and clicking Continue.");

		driver.findElement(By.xpath(prop.getProperty("DIDFirst_screen_Next"))).click();

		driver.findElement(By.xpath(prop.getProperty("Referral_Next"))).click();

		driver.findElement(By.xpath(prop.getProperty("DOB"))).click();
		Thread.sleep(2000); // Waiting for the dropdown to appear

		WebElement option2000 = driver
				.findElement(By.xpath("//div[@class='dropdown-option' and contains(text(), '2000')]"));
		option2000.click();

		Thread.sleep(5000);
		driver.findElement(By.xpath(prop.getProperty("DOB_Next"))).click();
		Thread.sleep(5000);
	}

	@Test(priority = 3, enabled = true, retryAnalyzer = Retry.class)
	public void Withoutadding_OTP() throws Exception {
		driver.findElement(By.xpath(prop.getProperty("Signup"))).click();
		String randomMobileNumber = Random_MobileNumber();
		driver.findElement(By.xpath(prop.getProperty("Mobilenumber"))).sendKeys(randomMobileNumber);
		driver.findElement(By.xpath(prop.getProperty("Mobilenumber_Continue"))).click();

		driver.findElement(By.xpath(prop.getProperty("OTP_Continue"))).click();

		WebElement e = driver.findElement(By.xpath(prop.getProperty("ValidOTP_message")));
		String actualElementText = e.getText();
		String expectedElementText = "Please enter a valid OTP";
		Assert.assertEquals(actualElementText, expectedElementText, "Expected and Actual both are same");

	}

	@Test(priority = 4, enabled = true, retryAnalyzer = Retry.class)
	public void Invalid_OTP() throws Exception {
		driver.findElement(By.xpath(prop.getProperty("Signup"))).click();
		String randomMobileNumber = Random_MobileNumber();
		driver.findElement(By.xpath(prop.getProperty("Mobilenumber"))).sendKeys(randomMobileNumber);
		driver.findElement(By.xpath(prop.getProperty("Mobilenumber_Continue"))).click();

		String InvalidOtp = "2000";
		enterOTP(InvalidOtp);

		driver.findElement(By.xpath(prop.getProperty("OTP_Continue"))).click();

		WebElement e = driver.findElement(By.xpath(prop.getProperty("IncorrectOTP_message")));
		String actualElementText = e.getText();
		String expectedElementText = "Incorrect OTP";
		Assert.assertEquals(actualElementText, expectedElementText, "Expected and Actual both are same");

	}

	@Test(priority = 5, enabled = true, retryAnalyzer = Retry.class)
	public void EnterOTP_Continue_Multipletimes() throws Exception {
		driver.findElement(By.xpath(prop.getProperty("Signup"))).click();
		String randomMobileNumber = Random_MobileNumber();
		driver.findElement(By.xpath(prop.getProperty("Mobilenumber"))).sendKeys(randomMobileNumber);
		driver.findElement(By.xpath(prop.getProperty("Mobilenumber_Continue"))).click();

		String InvalidOtp = "2002";
		enterOTP(InvalidOtp);

		int numberOfClicks = 5;
		for (int click = 0; click < numberOfClicks; click++) {
			driver.findElement(By.xpath(prop.getProperty("OTP_Continue"))).click();
			Thread.sleep(800);
		}

		WebElement e = driver.findElement(By.xpath(prop.getProperty("IncorrectOTP_message")));
		String actualElementText = e.getText();
		String expectedElementText = "Incorrect OTP";
		Assert.assertEquals(actualElementText, expectedElementText, "Expected and Actual both are same");
	}

	@Test(priority = 6, enabled = true, retryAnalyzer = Retry.class)
	public void MobileNumber_input_clear() throws IOException, InterruptedException {

		driver.findElement(By.xpath(prop.getProperty("Signup"))).click();
		WebElement mobileNumberField = driver.findElement(By.xpath(prop.getProperty("Mobilenumber")));
		mobileNumberField.sendKeys("6281674691");

		driver.findElement(By.xpath(prop.getProperty("close_mobilescreen_popup"))).click();
		Thread.sleep(2000);

		driver.findElement(By.xpath(prop.getProperty("Signup"))).click();
//		mobileNumberField = driver.findElement(By.xpath(prop.getProperty("Mobilenumber")));
		String actualMobileNumber = mobileNumberField.getAttribute("value");
		if (!actualMobileNumber.isEmpty()) {
			mobileNumberField.clear();
		}

		actualMobileNumber = mobileNumberField.getAttribute("value");
		Assert.assertEquals(actualMobileNumber, "", "Mobile number field is not empty after clearing.");
	}

	@Test(enabled = false)
	public void Mobilenumber_clickmultipletimes() throws Exception {

		driver.findElement(By.xpath(prop.getProperty("Signup"))).click();
		String randomMobileNumber = Random_MobileNumber();
		driver.findElement(By.xpath(prop.getProperty("Mobilenumber"))).sendKeys(randomMobileNumber);

		int numberOfClicks = 5;
		for (int i = 0; i < numberOfClicks; i++) {
			driver.findElement(By.xpath(prop.getProperty("Mobilenumber_Continue"))).click();
		}
	}

	@Test(priority = 7, enabled = true, retryAnalyzer = Retry.class)
	public void Fullflow() throws Exception {

		driver.findElement(By.xpath(prop.getProperty("Signup"))).click();
		String randomMobileNumber = Random_MobileNumber();
		driver.findElement(By.xpath(prop.getProperty("Mobilenumber"))).sendKeys(randomMobileNumber);
		driver.findElement(By.xpath(prop.getProperty("Mobilenumber_Continue"))).click();

		String Otp = "2020";
		enterOTP(Otp);

		driver.findElement(By.xpath(prop.getProperty("OTP_Continue"))).click();

		driver.findElement(By.xpath(prop.getProperty("DIDFirst_screen")));
		driver.findElement(By.xpath(prop.getProperty("DIDFirst_screen_Next"))).click();

		driver.findElement(By.xpath(prop.getProperty("Referral_Next"))).click();
		driver.findElement(By.xpath(prop.getProperty("DOB"))).click();
		Thread.sleep(2000);
		WebElement option2000 = driver
				.findElement(By.xpath("//div[@class='dropdown-option' and contains(text(), '1985')]"));
		option2000.click();
		driver.findElement(By.xpath(prop.getProperty("DOB_Next"))).click();
		Thread.sleep(2000);

		driver.findElement(By.xpath(prop.getProperty("Male"))).click();

		driver.findElement(By.xpath(prop.getProperty("Gender_Next"))).click();
		driver.findElement(By.xpath(prop.getProperty("Location"))).click();
		WebElement dropdown = driver.findElement(By.xpath(prop.getProperty("Location")));
		WebElement optionHyderabad = dropdown.findElement(By.xpath("//li[contains(text(), 'Hyderabad')]"));
		optionHyderabad.click();

		Thread.sleep(3000);
		driver.findElement(By.xpath(prop.getProperty("Location_Next"))).click();

		Thread.sleep(4000);
		driver.findElement(By.xpath(prop.getProperty("Coupon_2"))).click();
		driver.findElement(By.xpath(prop.getProperty("Coupon_3"))).click();
		Thread.sleep(3000);
		driver.findElement(By.xpath(prop.getProperty("Goforthecoupon"))).click();
		Thread.sleep(2000);
		driver.findElement(By.xpath(prop.getProperty("startjourney"))).click();
		Thread.sleep(5000);
	}

	@Test(priority = 8, enabled = true, retryAnalyzer = Retry.class)
	public void Selected_value() throws Exception {

		driver.findElement(By.xpath(prop.getProperty("Signup"))).click();
		String randomMobileNumber = Random_MobileNumber();
		driver.findElement(By.xpath(prop.getProperty("Mobilenumber"))).sendKeys(randomMobileNumber);
		driver.findElement(By.xpath(prop.getProperty("Mobilenumber_Continue"))).click();

		String Otp = "2020";
		enterOTP(Otp);

		driver.findElement(By.xpath(prop.getProperty("OTP_Continue"))).click();

		driver.findElement(By.xpath(prop.getProperty("DIDFirst_screen")));
		driver.findElement(By.xpath(prop.getProperty("DIDFirst_screen_Next"))).click();

		driver.findElement(By.xpath(prop.getProperty("Referral_Next"))).click();
		driver.findElement(By.xpath(prop.getProperty("DOB"))).click();
		Thread.sleep(2000);
		WebElement option2000 = driver
				.findElement(By.xpath("//div[@class='dropdown-option' and contains(text(), '2000')]"));
		option2000.click();
		driver.findElement(By.xpath(prop.getProperty("DOB_Next"))).click();
		Thread.sleep(2000);

		driver.findElement(By.xpath(prop.getProperty("Gender_Backbutton"))).click();

		String selectedYearXPath = "//div[@class='dropdown-selected' and contains(text(), '2000')]";
		Boolean isSelectedYearDisplayed = driver.findElement(By.xpath(selectedYearXPath)).isDisplayed();
		if (isSelectedYearDisplayed) {
			System.out.println("PASS: The previously selected year is displayed.");
		} else {
			System.out.println("FAIL: The previously selected year is not displayed.");
		}
		Thread.sleep(5000);
	}

	@Test(priority = 9, retryAnalyzer = Retry.class, enabled = false)
	public void refresh() throws Exception {
		driver.findElement(By.xpath(prop.getProperty("Signup"))).click();
		String randomMobileNumber = Random_MobileNumber();
		driver.findElement(By.xpath(prop.getProperty("Mobilenumber"))).sendKeys(randomMobileNumber);
		driver.findElement(By.xpath(prop.getProperty("Mobilenumber_Continue"))).click();

		String Otp = "2020";
		enterOTP(Otp);

		driver.findElement(By.xpath(prop.getProperty("OTP_Continue"))).click();

		driver.findElement(By.xpath(prop.getProperty("DIDFirst_screen")));
		driver.findElement(By.xpath(prop.getProperty("DIDFirst_screen_Next"))).click();

		driver.findElement(By.xpath(prop.getProperty("Referral_Next"))).click();
		driver.findElement(By.xpath(prop.getProperty("DOB"))).click();
		Thread.sleep(2000);
		WebElement option1985 = driver
				.findElement(By.xpath("//div[@class='dropdown-option' and contains(text(), '1985')]"));
		option1985.click();
		driver.findElement(By.xpath(prop.getProperty("DOB_Next"))).click();
		Thread.sleep(2000);

		driver.navigate().refresh();
		Thread.sleep(2000);

		boolean isButtonDisplayed = false;
		try {
			isButtonDisplayed = driver.findElement(By.xpath(prop.getProperty("Gender_Backbutton"))).isDisplayed();
		} catch (NoSuchElementException | TimeoutException e) {
		}

		System.out.println("Is Gender_Backbutton displayed? " + isButtonDisplayed);
		Assert.assertFalse(isButtonDisplayed, "After refreshing the page, Gender_Backbutton should not be displayed.");
	}

	@Test(priority = 10, enabled = true, retryAnalyzer = Retry.class)
	public void Coupon_validationmessage() throws Exception {

		driver.findElement(By.xpath(prop.getProperty("Signup"))).click();
		String randomMobileNumber = Random_MobileNumber();
		driver.findElement(By.xpath(prop.getProperty("Mobilenumber"))).sendKeys(randomMobileNumber);
		driver.findElement(By.xpath(prop.getProperty("Mobilenumber_Continue"))).click();

		String Otp = "2020";
		enterOTP(Otp);

		driver.findElement(By.xpath(prop.getProperty("OTP_Continue"))).click();

		driver.findElement(By.xpath(prop.getProperty("DIDFirst_screen")));
		driver.findElement(By.xpath(prop.getProperty("DIDFirst_screen_Next"))).click();

		driver.findElement(By.xpath(prop.getProperty("Referral_Next"))).click();
		driver.findElement(By.xpath(prop.getProperty("DOB"))).click();
		Thread.sleep(2000);
		WebElement option2000 = driver
				.findElement(By.xpath("//div[@class='dropdown-option' and contains(text(), '1985')]"));
		option2000.click();
		driver.findElement(By.xpath(prop.getProperty("DOB_Next"))).click();
		Thread.sleep(2000);

		driver.findElement(By.xpath(prop.getProperty("Male"))).click();

		driver.findElement(By.xpath(prop.getProperty("Gender_Next"))).click();
		driver.findElement(By.xpath(prop.getProperty("Location"))).click();
		WebElement dropdown = driver.findElement(By.xpath(prop.getProperty("Location")));
		WebElement optionHyderabad = dropdown.findElement(By.xpath("//li[contains(text(), 'Hyderabad')]"));
		optionHyderabad.click();

		Thread.sleep(3000);
		driver.findElement(By.xpath(prop.getProperty("Location_Next"))).click();

		Thread.sleep(4000);

		int numberofclicks = 5;
		for (int i = 0; i < numberofclicks; i++) {
			Thread.sleep(1000);
			driver.findElement(By.xpath(prop.getProperty("Goforthecoupon"))).click();
		}

		WebElement validationmessage = driver
				.findElement(By.xpath(prop.getProperty("Onboarding_coupon_validation_message")));
		String actualelement = validationmessage.getText();
		String exceptedelement = "Please select 2 coupons to continue";
		Assert.assertEquals(actualelement, exceptedelement, "both should bee same");
		Thread.sleep(2000);
	}
	
	

	
}
