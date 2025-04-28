package Testcases;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

public class TestScript {

	
	public static String runTest() {
        System.setProperty("webdriver.chrome.driver", "path/to/chromedriver");
        WebDriver driver = new ChromeDriver();

        String result = "Fail";

        try {
            driver.get("https://irctc.superj.app/Welcome");
            if (driver.getTitle().contains("https://irctc.superj.app/Welcome")) {
                result = "Pass";
            }
        } catch (Exception e) {
            result = "Fail";
        } finally {
            driver.quit();
        }

        return result;
    }

}
