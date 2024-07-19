package Baseclass;

import java.io.FileReader;
import java.io.IOException;
import java.util.Properties;
import java.util.Random;
import java.util.concurrent.TimeUnit;

import javax.mail.Message;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.edge.EdgeDriver;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.AfterSuite;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.BeforeSuite;
import org.testng.annotations.Test;

import com.aventstack.extentreports.ExtentReports;
import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.Status;
import com.aventstack.extentreports.reporter.ExtentHtmlReporter;
import com.aventstack.extentreports.reporter.configuration.Theme;
import com.mailosaur.MailosaurClient;
import io.github.bonigarcia.wdm.WebDriverManager;

public class Basetest<retrieveEmailFromMailosaur> {

	public static WebDriver driver;
	public static Properties prop = new Properties();
	public static Properties insight = new Properties();
	public static ExtentReports extent;
	public static ExtentTest test;

	@BeforeSuite
	public void setupExtentReports() {
		ExtentHtmlReporter htmlReporter = new ExtentHtmlReporter("extent.html");
		htmlReporter.config().setTheme(Theme.STANDARD);
		htmlReporter.config().setDocumentTitle("Automation Report");
		htmlReporter.config().setReportName("Test Report");

		extent = new ExtentReports();
		extent.attachReporter(htmlReporter);
		extent.setSystemInfo("Host Name", "staging superj Web");
		extent.setSystemInfo("Environment", "Automation");
		extent.setSystemInfo("User Name", "Rajesh");

	}

	@BeforeMethod
	public void setup() throws IOException {
		if (driver == null) {
			FileReader fr = new FileReader(
					"C:\\Users\\Rajes\\eclipse-workspace\\superj-web\\src\\test\\java\\Filereadres\\DataFile");
			prop.load(fr);

//			FileReader pr = new FileReader(
//					"C:\\Users\\Rajes\\eclipse-workspace\\insightengine.in\\src\\test\\java\\Filereadres\\insights");
//			insight.load(pr);
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
		driver.get(prop.getProperty("Website"));
	}

	@AfterMethod
	public void closeBrowser() {
		driver.quit();
	}

	@AfterSuite
	public void tearDownExtentReports() {
		extent.flush();
	}

	public static String Random_MobileNumber() throws Exception {
	    Random generator = new Random();
	    generator.setSeed(System.currentTimeMillis());
	    int num1 = generator.nextInt(999) + 900; // Ensures the first 3 digits are between 900-999
	    int num2 = generator.nextInt(9999999) + 1000000; // Ensures the last 7 digits are between 1000000-9999999
	    return "62" + num1 + num2; // Using "62" as the prefix for Indonesian numbers
	}

	
	public String generateRandomText(int length) {
		String alphabet = "abcdefghijklmnopqrstuvwxyz";
		StringBuilder sb = new StringBuilder();
		Random random = new Random();
		for (int i = 0; i < length; i++) {
			int index = random.nextInt(alphabet.length());
			char randomChar = alphabet.charAt(index);
			sb.append(randomChar);
		}
		return sb.toString();
	}

	public WebDriver getDriver() {
		return driver;
	}

	

	/*
	 * public static String RandomText() throws Exception { String alphabet =
	 * "abcdefghijklmnopqrstuvwxyz"; StringBuilder sb = new StringBuilder(); Random
	 * random = new Random(); int length = 7; for(int i = 0; i < length; i++) { int
	 * index = random.nextInt(alphabet.length()); char randomChar =
	 * alphabet.charAt(index); sb.append(randomChar); } String randomString =
	 * sb.toString(); return randomString; }
	 * 
	 * 
	 * @Test public void sendEmailViaMailosaur() throws Exception { test =
	 * extent.createTest("Send Email Test"); test.log(Status.INFO,
	 * "Starting send email test");
	 * 
	 * // Initialize Mailosaur client mailosaurClient = new MailosaurClient(apiKey);
	 * 
	 * // Compose and send email via Mailosaur SMTP String recipientEmail =
	 * "desert-correctly@a1ddodnl.mailosaur.net"; String subject =
	 * "Login Code for Insight Engine"; String body =
	 * "Hi,\n\nYour Login Code for Insight Engine is 0526";
	 * 
	 * sendEmail(recipientEmail, subject, body);
	 * 
	 * // Verify email received Message receivedEmail =
	 * retrieveEmailFromMailosaur(recipientEmail, subject);
	 * Assert.assertNotNull(receivedEmail, "Email was not received or found.");
	 * 
	 * // Perform further assertions on the received email if needed
	 * Assert.assertTrue(receivedEmail.getSubject().contains(subject),
	 * "Email subject matches");
	 * 
	 * // Example: Assert email body contains expected content
	 * Assert.assertTrue(receivedEmail.text().getBody().contains(body),
	 * "Email body contains expected content"); }
	 * 
	 * // Method to send email via Mailosaur SMTP private void sendEmail(String
	 * recipientEmail, String subject, String body) throws Exception {
	 * SendEmailOptions options = new SendEmailOptions() .to(recipientEmail)
	 * .from(smtpUsername) .subject(subject) .html(body); // or .text(body) for
	 * plain text email
	 * 
	 * mailosaurClient.messages().send(serverId, options, smtpUsername,
	 * smtpPassword); }
	 * 
	 * // Method to retrieve email from Mailosaur private Message
	 * retrieveEmailFromMailosaur(String recipientEmail, String subject) throws
	 * Exception { // Retrieve emails matching criteria MessagesResul result =
	 * mailosaurClient.messages().list(serverId, new
	 * MessagesListOptions().to(recipientEmail).subject(subject));
	 * 
	 * // Assuming the latest email matches the criteria return
	 * result.getItems().get(0); }
	 */
}
