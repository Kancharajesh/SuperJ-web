//package Testcases;
//
//import org.openqa.selenium.By;
//import org.openqa.selenium.WebDriver;
//import org.openqa.selenium.WebElement;
//
//import Baseclass.Basetest;
//
//import java.util.Properties;
//
//public class OTPHandler extends SignUp{
//    private WebDriver driver;
//    private Properties prop;
//
//    public OTPHandler(WebDriver driver, Properties prop) {
//        this.driver = driver;
//        this.prop = prop;
//    }
//
//    public void enterOTP(String otp) {
//        for (int i = 0; i < otp.length(); i++) {
//            String locator = prop.getProperty("OTP_" + (i + 1));
//            driver.findElement(By.xpath(locator)).sendKeys(Character.toString(otp.charAt(i)));
//        }
//    }
//
//    public void enterValidOTP() {
//        String validOTP = "1234"; // Replace with the logic or method to fetch the valid OTP
//        enterOTP(validOTP);
//    }
//
//    public void enterInvalidOTP() {
//        String invalidOTP = "2020";
//        enterOTP(invalidOTP);
//    }
//
//    public static void main(String[] args) {
//       
//    }
//}