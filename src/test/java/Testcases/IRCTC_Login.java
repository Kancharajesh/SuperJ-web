package Testcases;

import java.io.FileReader;
import java.io.IOException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver; // Ensure you have the WebDriver import
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.edge.EdgeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.annotations.Test;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.edge.EdgeDriver;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.AfterSuite;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.BeforeSuite;
import org.testng.annotations.Test;

import com.aventstack.extentreports.ExtentReports;
import com.aventstack.extentreports.reporter.ExtentHtmlReporter;
import com.aventstack.extentreports.reporter.configuration.Theme;

import Baseclass.Basetest;
import io.github.bonigarcia.wdm.WebDriverManager;

public class IRCTC_Login extends Basetest {

	String irctcurl = "https://www.air.irctc.co.in/";

	@BeforeSuite
	public void setupExtentReports() {
		ExtentHtmlReporter htmlReporter = new ExtentHtmlReporter("extent.html");
		htmlReporter.config().setTheme(Theme.STANDARD);
		htmlReporter.config().setDocumentTitle("Automation Report");
		htmlReporter.config().setReportName("Test Report");

		extent = new ExtentReports();
		extent.attachReporter(htmlReporter);
		extent.setSystemInfo("Host Name", "staging superj-Web");
		extent.setSystemInfo("Environment", "Automation");
		extent.setSystemInfo("User Name", "Rajesh");
	}

	@BeforeMethod
	public void setup() throws IOException {
		if (driver == null) {
			FileReader fr = new FileReader(
					"C:\\Users\\Rajes\\eclipse-workspace\\superj-web\\src\\test\\java\\Filereadres\\DataFile");
			prop.load(fr);

			FileReader pr = new FileReader(
					"C:\\Users\\Rajes\\eclipse-workspace\\superj-web\\src\\test\\java\\Filereadres\\IRCTC");
			insight.load(pr);
		}

		if (prop.getProperty("browser").equalsIgnoreCase("chrome")) {
			WebDriverManager.chromedriver().setup();
			driver = new ChromeDriver();
		} else if (prop.getProperty("browser").equalsIgnoreCase("edge")) {
			WebDriverManager.edgedriver().setup();
			driver = new EdgeDriver();
		}

		driver.manage().window().maximize();
		driver.manage().timeouts().implicitlyWait(20, TimeUnit.SECONDS);
		driver.manage().timeouts().pageLoadTimeout(20, TimeUnit.SECONDS);
		driver.get(irctcurl);
	}

	@AfterMethod
	public void closeBrowser() {
		driver.quit();
	}

	@AfterSuite
	public void tearDownExtentReports() {
		extent.flush();
	}

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
			if (locator == null) {
				throw new IllegalArgumentException("OTP field XPath for digit " + (i + 1) + " is missing.");
			}
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

	// Login process with debug statements to check property values
	private void loginProcess(String randomMobileNumber, String otp) throws Exception {
		String loginButton = prop.getProperty("Login");
		String mobileNumberField = prop.getProperty("Mobilenumber");
		String continueButton = prop.getProperty("Mobilenumber_Continue");
		String otpContinueButton = prop.getProperty("OTP_Continue");

		// Add debug print statements
		System.out.println("Login button XPath: " + loginButton);
		System.out.println("Mobile number field XPath: " + mobileNumberField);
		System.out.println("Continue button XPath: " + continueButton);
		System.out.println("OTP Continue button XPath: " + otpContinueButton);

		// Check if any of the XPaths are missing
		if (loginButton == null || mobileNumberField == null || continueButton == null || otpContinueButton == null) {
			throw new IllegalArgumentException("One or more required XPaths are missing in the properties file.");
		}

		// Perform login actions
		driver.findElement(By.xpath(loginButton)).click();
		driver.findElement(By.xpath(mobileNumberField)).sendKeys(randomMobileNumber);
		Thread.sleep(1000);
		driver.findElement(By.xpath(continueButton)).click();
		enterOTP(otp);
		driver.findElement(By.xpath(otpContinueButton)).click();
		Thread.sleep(2500);
	}

	@Test(priority = 1, enabled = true, retryAnalyzer = Retry.class)
	public void Normal_userlogin() throws Exception {

		Thread.sleep(2500);
		// Click on the TOPBanner
		driver.findElement(By.xpath(insight.getProperty("TOPBanner"))).click();
		Thread.sleep(3500);

		// Store the current window handle (original tab)
		String originalTab = driver.getWindowHandle();
		Set<String> allTabs = driver.getWindowHandles();

		// Switch to the newly opened tab (other than the original one)
		for (String tab : allTabs) {
			if (!tab.equals(originalTab)) {
				driver.switchTo().window(tab);
				break;
			}
		}

		// Find and click on the login element
		driver.findElement(By.xpath(prop.getProperty("Login"))).click();

		// Generate a random mobile number and enter it
		String mobileNumber = randomMobileNumber();
		driver.findElement(By.xpath(prop.getProperty("Mobilenumber"))).sendKeys(mobileNumber);
		driver.findElement(By.xpath(prop.getProperty("Mobilenumber_Continue"))).click();

		// Enter OTP
		String otp = "777777";
		enterOTP(otp);
		driver.findElement(By.xpath(prop.getProperty("OTP_Continue"))).click();
		Thread.sleep(2500);

		// Validate homepage text
		WebElement homePageTextElement = driver.findElement(By.xpath(prop.getProperty("Homepagetext")));
		Assert.assertTrue(homePageTextElement.isDisplayed(), "Homepage text is not displayed");
		String homePageText = homePageTextElement.getText();
		System.out.println("Homepage text: " + homePageText);
	}

	@Test(priority = 2, enabled = true, retryAnalyzer = Retry.class)
	public void Guest_userlogin() throws Exception {

		Thread.sleep(4000);

		driver.findElement(By.xpath(insight.getProperty("IRCTCLogins"))).click();

		// Guest user login.
		driver.findElement(By.xpath(insight.getProperty("GuestUserlogin"))).click();
		Thread.sleep(3000);
		driver.findElement(By.xpath(insight.getProperty("Email"))).sendKeys("irctc@gmail.com");
		driver.findElement(By.xpath(insight.getProperty("mobilenumber"))).sendKeys("9898745632");

		driver.findElement(By.xpath(insight.getProperty("Signin"))).click();

		Thread.sleep(2500);

		// Click on the TOPBanner
		driver.findElement(By.xpath(insight.getProperty("TOPBanner"))).click();
		Thread.sleep(3500);

		// Store the current window handle (original tab)
		String originalTab = driver.getWindowHandle();
		Set<String> allTabs = driver.getWindowHandles();

		// Switch to the newly opened tab
		for (String tab : allTabs) {
			if (!tab.equals(originalTab)) {
				driver.switchTo().window(tab);
				break;
			}
		}
		Thread.sleep(2500);

		Boolean login = driver.findElement(By.xpath(prop.getProperty("Login"))).isDisplayed();
		if (login) {
			System.out.println("Login button is displayed.");
		} else {
			System.out.println("Login button is not displayed.");
		}
	}

	@Test(priority = 3, enabled = true, retryAnalyzer = Retry.class)
	public void name() throws Exception {

		Thread.sleep(4000);

		driver.findElement(By.xpath(insight.getProperty("IRCTCLogins"))).click();

		// Guest user login.
		driver.findElement(By.xpath(insight.getProperty("GuestUserlogin"))).click();
		Thread.sleep(3000);
		driver.findElement(By.xpath(insight.getProperty("Email"))).sendKeys("irctc@gmail.com");
		driver.findElement(By.xpath(insight.getProperty("mobilenumber"))).sendKeys("9898745632");

		driver.findElement(By.xpath(insight.getProperty("Signin"))).click();

		Thread.sleep(2500);

		// Click on the TOPBanner
		driver.findElement(By.xpath(insight.getProperty("TOPBanner"))).click();
		Thread.sleep(3500);

		// Store the current window handle (original tab)
		String originalTab = driver.getWindowHandle();
		Set<String> allTabs = driver.getWindowHandles();

		// Switch to the newly opened tab
		for (String tab : allTabs) {
			if (!tab.equals(originalTab)) {
				driver.switchTo().window(tab);
				break;
			}
		}
		Thread.sleep(2500);

		driver.findElement(By.xpath(prop.getProperty("Login"))).click();

		// Generate a random mobile number and enter it
		String mobileNumber = randomMobileNumber();
		driver.findElement(By.xpath(prop.getProperty("Mobilenumber"))).sendKeys(mobileNumber);
		driver.findElement(By.xpath(prop.getProperty("Mobilenumber_Continue"))).click();

		// Enter OTP
		String otp = "777777";
		enterOTP(otp);
		driver.findElement(By.xpath(prop.getProperty("OTP_Continue"))).click();
		Thread.sleep(2500);

		// Validate homepage text
		WebElement homePageTextElement = driver.findElement(By.xpath(prop.getProperty("Homepagetext")));
		Assert.assertTrue(homePageTextElement.isDisplayed(), "Homepage text is not displayed");
		String homePageText = homePageTextElement.getText();
		System.out.println("Homepage text: " + homePageText);
	}

	@Test(priority = 4, enabled = true, retryAnalyzer = Retry.class)
	public void validNormalUserLogin() throws Exception {
		// Click on the TOPBanner
		driver.findElement(By.xpath(insight.getProperty("TOPBanner"))).click();
		Thread.sleep(3000);

		// Store the current window handle (original tab)
		String originalTab = driver.getWindowHandle();
		Set<String> allTabs = driver.getWindowHandles();

		// Switch to the newly opened tab
		for (String tab : allTabs) {
			if (!tab.equals(originalTab)) {
				driver.switchTo().window(tab);
				break;
			}
		}

		// Login process
		String mobileNumber = randomMobileNumber();
		String otp = generateRandomOTP();
		loginProcess(mobileNumber, otp);

		WebElement errorMessage = driver.findElement(By.xpath(prop.getProperty("IncorrectOTP_message")));
		String actualText = errorMessage.getText();
		String expectedText = "Incorrect OTP";
		System.out.println("Actual text: " + actualText);
		Assert.assertEquals(actualText, expectedText, "OTP error message does not match");
	}

	@Test(priority = 5, enabled = false, retryAnalyzer = Retry.class)
	public void invalidMobileNumberFormat() throws Exception {
		// Click on the TOPBanner
		driver.findElement(By.xpath(insight.getProperty("TOPBanner"))).click();
		Thread.sleep(3000);

		// Store the current window handle (original tab)
		String originalTab = driver.getWindowHandle();
		Set<String> allTabs = driver.getWindowHandles();

		// Switch to the newly opened tab
		for (String tab : allTabs) {
			if (!tab.equals(originalTab)) {
				driver.switchTo().window(tab);
				break;
			}
		}

		// Invalid mobile number
		String invalidMobileNumber = "12345"; // Invalid mobile number
		driver.findElement(By.xpath(prop.getProperty("Login"))).click();
		driver.findElement(By.xpath(prop.getProperty("Mobilenumber"))).sendKeys(invalidMobileNumber);
		driver.findElement(By.xpath(prop.getProperty("Mobilenumber_Continue"))).click();

		// Check for error message or validation message
		Assert.assertFalse(driver.findElement(By.xpath(prop.getProperty("OTP_Continue"))).isDisplayed());
	}

	@Test(priority = 6, enabled = true, retryAnalyzer = Retry.class)
	public void guestUserLoginAndNavigate() throws Exception {
		// Click on the IRCTC Logins
		driver.findElement(By.xpath(insight.getProperty("IRCTCLogins"))).click();
		Thread.sleep(3000);

		// Guest user login
		driver.findElement(By.xpath(insight.getProperty("GuestUserlogin"))).click();
		Thread.sleep(3000);
		driver.findElement(By.xpath(insight.getProperty("Email"))).sendKeys("irctc@gmail.com");
		driver.findElement(By.xpath(insight.getProperty("mobilenumber"))).sendKeys("9898745632");
		driver.findElement(By.xpath(insight.getProperty("Signin"))).click();

		Thread.sleep(2500);

		driver.findElement(By.xpath(insight.getProperty("TOPBanner"))).click();
		Thread.sleep(2500);
		// Store the current window handle (original tab)
		String originalTab = driver.getWindowHandle();
		Set<String> allTabs = driver.getWindowHandles();

		// Switch to the newly opened tab
		for (String tab : allTabs) {
			if (!tab.equals(originalTab)) {
				driver.switchTo().window(tab);
				break;
			}
		}

		// Validate homepage text
		Assert.assertFalse(isHomePageTextDisplayed(), "Homepage text is not displayed after guest user login.");
	}

	@Test(priority = 7, enabled = true, retryAnalyzer = Retry.class)
	public void IRCTC_Guest_validateHomepageAfterLogin() throws Exception {
		driver.findElement(By.xpath(insight.getProperty("IRCTCLogins"))).click();

		// Guest user login.
		driver.findElement(By.xpath(insight.getProperty("GuestUserlogin"))).click();
		Thread.sleep(3000);
		driver.findElement(By.xpath(insight.getProperty("Email"))).sendKeys("irctc@gmail.com");
		driver.findElement(By.xpath(insight.getProperty("mobilenumber"))).sendKeys("9898745632");

		driver.findElement(By.xpath(insight.getProperty("Signin"))).click();

		Thread.sleep(2500);

		// Click on the TOPBanner
		driver.findElement(By.xpath(insight.getProperty("TOPBanner"))).click();
		Thread.sleep(3000);

		// Store the current window handle (original tab)
		String originalTab = driver.getWindowHandle();
		Set<String> allTabs = driver.getWindowHandles();

		// Switch to the newly opened tab
		for (String tab : allTabs) {
			if (!tab.equals(originalTab)) {
				driver.switchTo().window(tab);
				break;
			}
		}

		driver.findElement(By.xpath(prop.getProperty("Login"))).click();

		String mobileNumber = randomMobileNumber();
		driver.findElement(By.xpath(prop.getProperty("Mobilenumber"))).sendKeys(mobileNumber);
		driver.findElement(By.xpath(prop.getProperty("Mobilenumber_Continue"))).click();

		// Enter OTP
		String otp = "777777";
		enterOTP(otp);
		driver.findElement(By.xpath(prop.getProperty("OTP_Continue"))).click();
		Thread.sleep(2500);
		;

		// Validate homepage text
		WebElement homePageTextElement = driver.findElement(By.xpath(prop.getProperty("Homepagetext")));
		Assert.assertTrue(homePageTextElement.isDisplayed(), "Homepage text is not displayed after successful login.");
		String homePageText = homePageTextElement.getText();
		System.out.println("Homepage text: " + homePageText);

	}

}
