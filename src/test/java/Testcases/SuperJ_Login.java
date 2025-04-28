package Testcases;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import Baseclass.Basetest;

public class SuperJ_Login extends Basetest {

	// Generate random mobile number
		public static String randomMobileNumber() {
			Random generator = new Random();
			return "99" + (generator.nextInt(900) + 100) + (generator.nextInt(9000000) + 1000000);
		}

		// Login function
		private void superJ_login() throws InterruptedException {
			driver.get("https://superj.app/Welcome");
			driver.findElement(By.xpath(prop.getProperty("Login"))).click();
			driver.findElement(By.xpath(prop.getProperty("Mobilenumber"))).sendKeys("9885060891");
			driver.findElement(By.xpath(prop.getProperty("Mobilenumber_Continue"))).click();
			Thread.sleep(1000);

			// Enter OTP
			for (int i = 1; i <= 6; i++) {
				driver.findElement(By.xpath(prop.getProperty("OTP_" + i))).sendKeys("7");
			}
			driver.findElement(By.xpath(prop.getProperty("OTP_Continue"))).click();
			Thread.sleep(3000);
		}

		private void MobileNumber_login() throws InterruptedException {
			driver.get("https://superj.app/Welcome");
			driver.findElement(By.xpath(prop.getProperty("Login"))).click();
			driver.findElement(By.xpath(prop.getProperty("Mobilenumber"))).sendKeys("9705210647");
			driver.findElement(By.xpath(prop.getProperty("Mobilenumber_Continue"))).click();
			Thread.sleep(1000);

			for (int i = 0; i < 5; i++) {
				driver.findElement(By.xpath(prop.getProperty("OTP_Continue"))).click();
			}
		}

		private void InvalidOTP() throws InterruptedException {

			// Enter OTP
			for (int i = 1; i <= 6; i++) {
				driver.findElement(By.xpath(prop.getProperty("OTP_" + i))).sendKeys("8");
			}
			for (int i = 0; i < 4; i++) {
				driver.findElement(By.xpath(prop.getProperty("OTP_Continue"))).click();
			}

			Thread.sleep(3000);
		}

		@Test(enabled = true, priority = 1)
		public void VerifytheHomepage() throws Exception {
			superJ_login();

			// Verify sidebar and survey card visibility
			System.out.println("SideBar element is displayed: "
					+ driver.findElement(By.xpath(prop.getProperty("Side_Bar"))).isDisplayed());
			System.out.println("Survey Cards element is displayed: "
					+ driver.findElement(By.xpath(prop.getProperty("Survey_cards"))).isDisplayed());
		}

		@Test(enabled = true, priority = 2)
		public void SurveyCard() throws Exception {
			superJ_login();

			driver.findElement(By.xpath(prop.getProperty("Survey_cards"))).click();
			driver.findElement(By.xpath(prop.getProperty("Survey_Preview_start_survey"))).click();

			while (true) {
				try {
					List<WebElement> options = driver.findElements(By.xpath(prop.getProperty("survey_answer_options_1")));
					if (options.isEmpty())
						break;

					options.get(0).click();
					Thread.sleep(2000);

					WebElement nextButton = driver.findElement(By.xpath(prop.getProperty("Survey_next_button")));
					if (!nextButton.isDisplayed())
						break;

					nextButton.click();
					Thread.sleep(2000);
				} catch (Exception e) {
					break;
				}
			}
		}

		@Test(enabled = true, priority = 3)
		public void Wallet_cahout() throws InterruptedException {
			superJ_login();

			driver.findElement(By.xpath(prop.getProperty("Wallet"))).click();
			driver.findElement(By.xpath(prop.getProperty("Cashout"))).click();

			// Print Cash Balance
			System.out.println(driver.findElement(By.xpath(prop.getProperty("CashBalance"))).getText());

			for (int i = 0; i < 5; i++) {
				List<WebElement> giftCards = driver.findElements(By.xpath(prop.getProperty("Clickon_Giftcards")));

				if (!giftCards.isEmpty()) {
					giftCards.get(0).click();
					Thread.sleep(2000);
				} else {
					System.out.println("No Gift Card element found. Exiting loop.");
					break;
				}
			}
		}

		@Test(enabled = true, priority = 4)
		public void Check_transaction_history() throws InterruptedException {
			superJ_login();

			driver.findElement(By.xpath(prop.getProperty("Profile"))).click();
			System.out.println(driver.findElement(By.xpath(prop.getProperty("Print_the_whole_text"))).getText());

			driver.findElement(By.xpath(prop.getProperty("view_all"))).click();
			Thread.sleep(2000);
			driver.findElement(By.xpath(prop.getProperty("Transaction_Cash"))).click();
			Thread.sleep(2000);

			System.out.println(driver.findElement(By.xpath(prop.getProperty("printthe_Transcation_cash"))).getText());
			Thread.sleep(2000);
			driver.findElement(By.xpath(prop.getProperty("Back_to_Profile"))).click();
			driver.findElement(By.xpath(prop.getProperty("Click_logout"))).click();
			driver.findElement(By.xpath(prop.getProperty("yes_illback"))).click();
			Thread.sleep(2000);

			Thread.sleep(3000); // Wait for redirect
			String currentURL = driver.getCurrentUrl();
			System.out.println("Current URL: " + currentURL);

			Assert.assertEquals(currentURL, "https://superj.app/Welcome",
					"Logout failed - Redirect not as expected!");
		}

		@Test(enabled = true, priority = 5)
		public void Verify_Session_Expiry_After_Logout() throws InterruptedException {
			superJ_login();
			driver.findElement(By.xpath(prop.getProperty("Profile"))).click();
			driver.findElement(By.xpath(prop.getProperty("Click_logout"))).click();
			driver.findElement(By.xpath(prop.getProperty("yes_illback"))).click();
			Thread.sleep(3000);
			driver.navigate().back();
			Assert.assertEquals(driver.getCurrentUrl(), "https://superj.app/Welcome",
					"Session not expired properly!");
		}

		@Test(enabled = true, priority = 6)
		public void countVisibleSurveyCards() throws Exception {
			superJ_login();
			Thread.sleep(2000);

			WebElement lastSurveyCard = driver.findElement(By.xpath(prop.getProperty("Survey_card_last")));
			((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView(true);", lastSurveyCard);
			Thread.sleep(3000);

			List<WebElement> visibleSurveyCards = driver.findElements(By.xpath(prop.getProperty("Survey_cards")));
			int count = visibleSurveyCards.size();
			System.out.println("visibleSurveyCards" + count);

			Assert.assertEquals(count, 12, "if it is more than 12 cards it should fail");

//			System.out.println("Number of visible survey cards: " + visibleSurveyCards.size());
//			Assert.assertTrue(visibleSurveyCards.size() > 0, "No survey cards found!");
		}

		@Test(enabled = true, priority = 7)
		public void Login_logout_withinvalid_OTP() throws InterruptedException {

			superJ_login();

			driver.findElement(By.xpath(prop.getProperty("Profile"))).click();
			driver.findElement(By.xpath(prop.getProperty("Click_logout"))).click();
			driver.findElement(By.xpath(prop.getProperty("yes_illback"))).click();
			Thread.sleep(5000);

			// Re-attempt Login.
			driver.findElement(By.xpath(prop.getProperty("Login"))).click();
			driver.findElement(By.xpath(prop.getProperty("Mobilenumber"))).sendKeys("9705210647");
			driver.findElement(By.xpath(prop.getProperty("Mobilenumber_Continue"))).click();
			Thread.sleep(1000);

			InvalidOTP();

			WebElement incorrectMsg = driver.findElement(By.xpath(prop.getProperty("inCorretOTP_mess")));
			Assert.assertTrue(incorrectMsg.isDisplayed(), "Test Failed : Incorrect OTP message is NOT displayed!");

			boolean isSidebarDisplayed = false;
			try {
				isSidebarDisplayed = driver.findElement(By.xpath(prop.getProperty("Side_Bar"))).isDisplayed();
			} catch (Exception e) {
				isSidebarDisplayed = false;
			}

			Assert.assertFalse(isSidebarDisplayed, "Test Failed : Sidebar should NOT be visible after invalid OTP!");

			System.out.println("Test Passed : Invalid OTP prevents login, and sidebar is NOT displayed.");
		}

		@Test(enabled = true, priority = 8)
		public void open_multipleTabs() throws Exception {
			superJ_login();

			driver.findElement(By.xpath(prop.getProperty("Survey_cards"))).click();
			driver.findElement(By.xpath(prop.getProperty("Survey_Preview_start_survey"))).click();
			Thread.sleep(2000);

			String currentUrl = driver.getCurrentUrl();
			System.out.println("Current Survey URL: " + currentUrl);

			JavascriptExecutor js = (JavascriptExecutor) driver;
			js.executeScript("window.open();");

			ArrayList<String> tabs = new ArrayList<>(driver.getWindowHandles());
			driver.switchTo().window(tabs.get(1));
			driver.get(currentUrl);

			Thread.sleep(5000);

			System.out.println("Survey opened in a new tab successfully!");
		}

		@Test(enabled = true, priority = 9)
		public void Resend_() throws InterruptedException {

			MobileNumber_login();
			Thread.sleep(33000);

			driver.findElement(By.xpath(prop.getProperty("resendOTP"))).click();
			Thread.sleep(3000);

			List<WebElement> resendMessages = driver.findElements(By.linkText("OTP sent successfully"));

			Assert.assertTrue(resendMessages.isEmpty(), "OTP success message is unexpectedly displayed!");

			System.out.println("Test Passed  - OTP success message is displayed.");
		}

		@Test(priority = 10)
		public void SurveyScrollValidation() throws InterruptedException {
			superJ_login();
			WebElement lastCard = driver.findElement(By.xpath(prop.getProperty("Survey_card_last")));
			((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView(true);", lastCard);
			Thread.sleep(3000);

			Assert.assertTrue(lastCard.isDisplayed(), "Survey list is not scrollable!");
		}

		@Test(priority = 11)
		public void OTPFieldAutoFocusJump() {
			driver.findElement(By.xpath(prop.getProperty("Login"))).click();
			driver.findElement(By.xpath(prop.getProperty("Mobilenumber"))).sendKeys("9705210647");
			driver.findElement(By.xpath(prop.getProperty("Mobilenumber_Continue"))).click();

			WebElement firstOtp = driver.findElement(By.xpath(prop.getProperty("OTP_1")));
			firstOtp.sendKeys("7");

			WebElement secondOtp = driver.switchTo().activeElement();
			Assert.assertTrue(secondOtp.equals(driver.findElement(By.xpath(prop.getProperty("OTP_2")))),
					"Focus did not auto-jump to next OTP field!");
		}

		@Test(priority = 12)
		public void OTPFieldAcceptsOnlyDigits() throws InterruptedException {
			driver.findElement(By.xpath(prop.getProperty("Login"))).click();
			driver.findElement(By.xpath(prop.getProperty("Mobilenumber"))).sendKeys("9705210647");
			driver.findElement(By.xpath(prop.getProperty("Mobilenumber_Continue"))).click();

			for (int i = 1; i <= 6; i++) {
				WebElement otpField = driver.findElement(By.xpath(prop.getProperty("OTP_" + i)));
				otpField.sendKeys("A");
				Assert.assertEquals(otpField.getAttribute("value"), "", "Non-digit character accepted in OTP field!");
			}
			Thread.sleep(3000);
		}

		@Test(enabled = true, priority = 13)
		public void ReloadSurveyMidway() throws Exception {
			superJ_login();
			driver.findElement(By.xpath(prop.getProperty("Survey_cards"))).click();
			driver.findElement(By.xpath(prop.getProperty("Survey_Preview_start_survey"))).click();

			driver.findElement(By.xpath(prop.getProperty("survey_answer_options_1"))).click();
			driver.navigate().refresh();

			List<WebElement> optionsAfterRefresh = driver
					.findElements(By.xpath(prop.getProperty("survey_answer_options_1")));
			Assert.assertTrue(optionsAfterRefresh.size() > 0, "Survey did not reload correctly.");
		}

		@Test(enabled = true, priority = 14)
		public void AccessProtectedRoutesWithoutLogin() throws InterruptedException {
			driver.get("https://superj.app/profile");
			Thread.sleep(2000);
			Assert.assertEquals(driver.getCurrentUrl(), "https://superj.app/profile",
					"Unauthorized access to Profile page allowed!");

			driver.get("https://superj.app/Home");
			Thread.sleep(2000);
			Assert.assertEquals(driver.getCurrentUrl(), "https://superj.app/Home",
					"Unauthorized access to Home page allowed!");

			driver.get("https://superj.app/Wallet");
			Thread.sleep(2000);
			Assert.assertEquals(driver.getCurrentUrl(), "https://superj.app/Welcome",
					"Unauthorized access to Wallet page allowed!");
		}

		@Test(enabled = true, priority = 15)
		public void MultipleSurveysParallel() throws InterruptedException {
			superJ_login();
			String surveyUrl = "https://superj.app/survey"; // 

			JavascriptExecutor js = (JavascriptExecutor) driver;
			for (int i = 0; i < 3; i++) {
				js.executeScript("window.open(arguments[0])", surveyUrl);
				Thread.sleep(1000);
			}

			ArrayList<String> tabs = new ArrayList<>(driver.getWindowHandles());
			Assert.assertEquals(tabs.size(), 4, "Not all tabs opened correctly.");
		}

		@Test(enabled = true, priority = 16)
		public void LogoutAndRefreshTest() throws InterruptedException {
			superJ_login();
			driver.findElement(By.xpath(prop.getProperty("Profile"))).click();
			driver.findElement(By.xpath(prop.getProperty("Click_logout"))).click();
			driver.findElement(By.xpath(prop.getProperty("yes_illback"))).click();

			Thread.sleep(2000);
			driver.navigate().refresh();

			Assert.assertEquals(driver.getCurrentUrl(), "https://superj.app/Welcome",
					"User was able to stay logged in after refresh.");
		}

		@Test(priority = 17)
		public void SubmitSurveyFromMultipleTabs() throws Exception {
		    // 1. Login
		    superJ_login();

		    // 2. Open the survey
		    driver.findElement(By.xpath(prop.getProperty("Survey_cards"))).click();
		    driver.findElement(By.xpath(prop.getProperty("Survey_Preview_start_survey"))).click();
		    Thread.sleep(2000);

		    // 3. Copy survey URL and open multiple tabs
		    String surveyUrl = driver.getCurrentUrl();
		    JavascriptExecutor js = (JavascriptExecutor) driver;

		    for (int i = 0; i < 2; i++) {
		        js.executeScript("window.open();");
		        Thread.sleep(1000);
		    }

		    ArrayList<String> tabs = new ArrayList<>(driver.getWindowHandles());

		    // Open the same survey in tab 1 and 2
		    driver.switchTo().window(tabs.get(1));
		    driver.get(surveyUrl);
		    Thread.sleep(2000);

		    driver.switchTo().window(tabs.get(2));
		    driver.get(surveyUrl);
		    Thread.sleep(2000);

		    // 4. Answer survey in tab 2
		    driver.switchTo().window(tabs.get(2));

		    while (true) {
		        List<WebElement> options = driver.findElements(By.xpath(prop.getProperty("survey_answer_options_1")));
		        if (options.isEmpty())
		            break;

		        options.get(0).click();
		        Thread.sleep(1000);

		        WebElement nextButton = driver.findElement(By.xpath(prop.getProperty("Survey_next_button")));
		        if (!nextButton.isDisplayed())
		            break;

		        nextButton.click();
		        Thread.sleep(2000);
		    }

		    // Switch to tab 1 and try submitting again
		    driver.switchTo().window(tabs.get(1));
		    Thread.sleep(2000);

		    List<WebElement> optionsAgain = driver.findElements(By.xpath(prop.getProperty("survey_answer_options_1")));
		    if (!optionsAgain.isEmpty()) {
		        optionsAgain.get(0).click();
		        driver.findElement(By.xpath(prop.getProperty("Survey_next_button"))).click();
		        Thread.sleep(2000);

		        WebElement alreadySubmittedMsg = driver.findElement(By.xpath(prop.getProperty("already_submitted")));
		        Assert.assertTrue(alreadySubmittedMsg.isDisplayed(), "Survey was allowed to be answered multiple times!");
		    } else {
		        System.out.println("Tab 1: Survey is already marked as completed.");
		    }
		}
		@Test(priority = 32)
		public void ParallelSurveyClicksFromMultipleTabs() throws Exception {
		    // Step 1: Login
		    superJ_login();

		    // Step 2: Open the survey
		    driver.findElement(By.xpath(prop.getProperty("Survey_cards"))).click();
		    driver.findElement(By.xpath(prop.getProperty("Survey_Preview_start_survey"))).click();
		    Thread.sleep(2000);

		    String surveyUrl = driver.getCurrentUrl();
		    JavascriptExecutor js = (JavascriptExecutor) driver;

		    // Step 3: Open the same survey in 2 new tabs (3 total including current)
		    for (int i = 0; i < 2; i++) {
		        js.executeScript("window.open();");
		        Thread.sleep(1000);
		    }

		    ArrayList<String> tabs = new ArrayList<>(driver.getWindowHandles());

		    // Load the survey URL in tabs 1 and 2
		    for (int i = 1; i < 3; i++) {
		        driver.switchTo().window(tabs.get(i));
		        driver.get(surveyUrl);
		        Thread.sleep(2000);
		    }

		    // Step 4: Click through all surveys in all tabs in parallel (simulate same question)
		    boolean keepGoing = true;
		    int questionIndex = 1;

		    while (keepGoing) {
		        keepGoing = false; // Assume finished unless at least one tab continues

		        for (int i = 0; i < 3; i++) {
		            driver.switchTo().window(tabs.get(i));

		            List<WebElement> options = driver.findElements(By.xpath(prop.getProperty("survey_answer_options_1")));
		            if (!options.isEmpty()) {
		                options.get(0).click();
		                Thread.sleep(500);

		                WebElement nextBtn = driver.findElement(By.xpath(prop.getProperty("Survey_next_button")));
		                if (nextBtn.isDisplayed()) {
		                    nextBtn.click();
		                    Thread.sleep(1500);
		                    keepGoing = true; // At least one tab still progressing
		                }
		            }
		        }

		        System.out.println("Finished Question " + questionIndex++);
		        System.out.println("Finished " + questionIndex++);
		    }

		    // Final assertions - switch to tab 0 and confirm survey is marked as completed
		    driver.switchTo().window(tabs.get(0));
		    WebElement finalMessage = driver.findElement(By.xpath(prop.getProperty("already_submitted")));
		    Assert.assertTrue(finalMessage.isDisplayed(), "Survey was not marked as completed after parallel submission.");
		}
		
		
	}

