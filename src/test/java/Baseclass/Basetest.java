package Baseclass;

import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;
import java.util.Random;
import java.util.concurrent.TimeUnit;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.edge.EdgeDriver;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.AfterSuite;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.BeforeSuite;

import com.aventstack.extentreports.ExtentReports;
import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.reporter.ExtentHtmlReporter;
import com.aventstack.extentreports.reporter.configuration.Theme;
import io.github.bonigarcia.wdm.WebDriverManager;

public class Basetest {

    public static WebDriver driver;
    public static Properties prop = new Properties();
    public static Properties insight = new Properties();
    public static ExtentReports extent;
    public static ExtentTest test;
    public static Properties survey = new Properties();

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
            // Load properties from resources
            InputStream fr = getClass().getClassLoader().getResourceAsStream("Filereadres/DataFile");
            if (fr != null) {
                prop.load(fr);
            } else {
                System.out.println("DataFile not found in resources folder.");
            }

            InputStream pr = getClass().getClassLoader().getResourceAsStream("Filereadres/IRCTC");
            if (pr != null) {
                insight.load(pr);
            } else {
                System.out.println("IRCTC file not found in resources folder.");
            }

            InputStream sr = getClass().getClassLoader().getResourceAsStream("Filereadres/Survey types");
            if (sr != null) {
                survey.load(sr);
            } else {
                System.out.println("Survey types file not found in resources folder.");
            }

            // Initialize WebDriver
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
            driver.get(prop.getProperty("SuperJ_URL"));
        }
    }

    @AfterMethod
    public void closeBrowser() {
        if (driver != null) {
            driver.quit();
        }
    }

    @AfterSuite
    public void tearDownExtentReports() {
        extent.flush();
    }

    // Generate random mobile number (Indonesian format as example)
    public static String Random_MobileNumber() throws Exception {
        Random generator = new Random();
        generator.setSeed(System.currentTimeMillis());
        int num1 = generator.nextInt(999) + 900; // Ensures the first 3 digits are between 900-999
        int num2 = generator.nextInt(9999999) + 1000000; // Ensures the last 7 digits are between 1000000-9999999
        return "62" + num1 + num2; // Using "62" as the prefix for Indonesian numbers
    }

    // Generate random text of specified length
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
}
