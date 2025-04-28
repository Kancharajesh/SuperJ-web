package Testcases;

import java.time.Duration;
import java.util.Random;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.annotations.Test;

import Baseclass.Basetest;

public class Survey extends Basetest {

	// Generate random mobile number
		public static String randomMobileNumber() {
			Random generator = new Random();
			generator.setSeed(System.currentTimeMillis());
			int num1 = generator.nextInt(900) + 100;
			int num2 = generator.nextInt(9000000) + 1000000;
			return "99" + num1 + num2;
		}

		// Generate a random 6-digit OTP
		public static String generateRandomOTP() {
			Random rand = new Random();
			int otp = rand.nextInt(900000) + 100000;
			return String.valueOf(otp);
		}

		// Enter OTP method
		public void enterOTP(String otp) throws Exception {
			for (int i = 0; i < otp.length(); i++) {
				String locator = prop.getProperty("OTP_" + (i + 1));
				driver.findElement(By.xpath(locator)).sendKeys(Character.toString(otp.charAt(i)));
			}
		}

		// Check if Home Page text is displayed
		public boolean isHomePageTextDisplayed() {
			try {
				return driver.findElement(By.xpath(prop.getProperty("Homepagetext"))).isDisplayed();
			} catch (Exception e) {
				return false;
			}
		}

		// Scroll to survey cards
		public void scrollToSurveyCards() throws InterruptedException {
			JavascriptExecutor js = (JavascriptExecutor) driver;
			WebElement surveyCardsElement = driver.findElement(By.xpath(prop.getProperty("Survey_cards")));

			while (!surveyCardsElement.isDisplayed()) {
				js.executeScript("window.scrollBy(0, 250);");
				Thread.sleep(500);
			}
		}

		// Helper method to check if element is present
		public boolean isElementPresent(By locator) {
			try {
				return driver.findElement(locator).isDisplayed();
			} catch (Exception e) {
				return false;
			}
		}

		// Helper method to select dropdown options
		private void selectDropdownOption(String clickXpath, String optionXpath) throws InterruptedException {
			driver.findElement(By.xpath(prop.getProperty(clickXpath))).click();
			Thread.sleep(2000);
			driver.findElement(By.xpath(prop.getProperty(optionXpath))).click();
			Thread.sleep(2000);
		}

		// Login process
		private void loginProcess(String randomMobileNumber, String otp) throws Exception {
			driver.findElement(By.xpath(prop.getProperty("Login"))).click();
			driver.findElement(By.xpath(prop.getProperty("Mobilenumber"))).sendKeys(randomMobileNumber);
			Thread.sleep(1000);
			driver.findElement(By.xpath(prop.getProperty("Mobilenumber_Continue"))).click();
			enterOTP(otp);
			driver.findElement(By.xpath(prop.getProperty("OTP_Continue"))).click();
			Thread.sleep(2500);
		}
	
		@Test
	    public void Start_survey() throws Exception {
	        // Login Process
	        String randomMobileNumber = randomMobileNumber();
	        String otp = "777777";
	        loginProcess(randomMobileNumber, otp);

	        Thread.sleep(2500);

	     // Start Survey
	        driver.findElement(By.xpath(survey.getProperty("StartSurvey"))).click();
	        Thread.sleep(5000);

	        // Store main window handle
	        String mainWindow = driver.getWindowHandle();

	        // Switch to popup window
	        for (String windowHandle : driver.getWindowHandles()) {
	            if (!windowHandle.equals(mainWindow)) {
	                driver.switchTo().window(windowHandle);
	                break;
	            }
	        }

	        // Click Preview Start Survey (Fix XPath Issue)
	        WebElement previewButton = driver.findElement(By.xpath("//button[@class='preview_startSurveyButton__oAeLD']"));
	        previewButton.click();
	        Thread.sleep(5000);

	        // Switch back to main window
	        driver.switchTo().window(mainWindow);
	        Thread.sleep(10000);

	        // Loop through MCQs & Click Next
	        while (true) {
	            try {
//	            	Thread.sleep(10000);
	            	// Initialize WebDriverWait correctly
	            	WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
	            	Thread.sleep(10000);

	            	WebElement earnMoreRewardButton = wait.until(
	            	    ExpectedConditions.elementToBeClickable(By.xpath("//div[@class='SurveyRewardSuccess_bottomSection__sZhC4']"))
	            	);

	            	earnMoreRewardButton.click();

	                // Click Next Button
	                WebElement nextButton = driver.findElement(By.xpath(survey.getProperty("NextButton")));
	                nextButton.click();
	                System.out.println("Clicked Next");

	                // Wait 6 seconds before checking next question
	                Thread.sleep(6000);

	            } catch (Exception e) {
	                System.out.println("No more questions or error encountered: " + e.getMessage());
	                break; // Exit loop if no more questions
	            }
	        }

	        // Click EarnMoreReward
	        WebElement earnMoreReward = driver.findElement(By.xpath(survey.getProperty("EarnMoreReward")));
	        earnMoreReward.click();
	        System.out.println("Clicked EarnMoreReward");

	        // Wait 6 sec to ensure process is complete
	        Thread.sleep(6000);
	    }
	
}
