//package Testcases;
//
//import java.io.File;
//import java.io.FileInputStream;
//import java.util.ArrayList;
//import java.util.List;
//import org.apache.poi.ss.usermodel.*;
//import org.openqa.selenium.By;
//import org.openqa.selenium.WebDriver;
//import org.openqa.selenium.WebElement;
//import org.testng.Assert;
//import org.testng.annotations.DataProvider;
//import org.testng.annotations.Test;
//import Baseclass.Basetest;
//
//public class Post_login extends Basetest {
//
//    private static final String EXCEL_PATH = "C:\\Users\\Rajes\\eclipse-workspace\\superj-web\\src\\test\\java\\Filereadres\\Mobilenumbers.xlsx";
//
//    // ✅ Read mobile numbers from Excel
//    public static String[] getMobileNumbersFromExcel() {
//        String[] mobileNumbers = new String[2];
//
//        try (FileInputStream file = new FileInputStream(new File(EXCEL_PATH))) {
//            Workbook workbook = WorkbookFactory.create(file);
//            Sheet sheet = workbook.getSheetAt(0);
//
//            // Fetch mobile numbers from the first two rows in the Excel sheet
//            for (int i = 0; i < 2; i++) {
//                Row row = sheet.getRow(i);
//                if (row != null) {
//                    Cell cell = row.getCell(0);
//                    if (cell != null) {
//                        if (cell.getCellType() == CellType.NUMERIC) {
//                            mobileNumbers[i] = String.valueOf((long) cell.getNumericCellValue());
//                        } else {
//                            mobileNumbers[i] = cell.getStringCellValue();
//                        }
//                    }
//                }
//            }
//        } catch (Exception e) {
//            e.printStackTrace();
//        }
//
//        // Ensure numbers are read, else fallback to empty strings (or any desired fallback logic)
//        if (mobileNumbers[0] == null || mobileNumbers[0].isEmpty()) mobileNumbers[0] = "9885060891"; // Default or predefined number
//        if (mobileNumbers[1] == null || mobileNumbers[1].isEmpty()) mobileNumbers[1] = "9705210647"; // Default or predefined number
//
//        return mobileNumbers;
//    }
//
//    // ✅ DataProvider to return both numbers from the Excel sheet
//    @DataProvider(name = "MobileNumbers")
//    public Object[][] provideMobileNumbers() {
//        String[] numbers = getMobileNumbersFromExcel();
//        return new Object[][]{{numbers[0]}, {numbers[1]}};
//    }
//
//    // ✅ Dynamic login using the given mobile number
//    private void loginWithNumber(String mobileNumber) throws InterruptedException {
//        System.out.println("Logging in with mobile number: " + mobileNumber);
//
//        driver.findElement(By.xpath(prop.getProperty("Login"))).click();
//        driver.findElement(By.xpath(prop.getProperty("Mobilenumber"))).sendKeys(mobileNumber);
//        driver.findElement(By.xpath(prop.getProperty("Mobilenumber_Continue"))).click();
//        Thread.sleep(2000);
//
//        enterOTP("7");
//    }
//
//    // ✅ Method to enter OTP
//    private void enterOTP(String digit) throws InterruptedException {
//        for (int i = 1; i <= 6; i++) {
//            driver.findElement(By.xpath(prop.getProperty("OTP_" + i))).sendKeys(digit);
//        }
//        driver.findElement(By.xpath(prop.getProperty("OTP_Continue"))).click();
//        Thread.sleep(3000);
//    }
//
//    // ✅ Run this test for both mobile numbers from Excel
//    @Test(dataProvider = "MobileNumbers", priority = 1)
//    public void VerifytheHomepage(String mobileNumber) throws Exception {
//        loginWithNumber(mobileNumber);
//
//        // Verify sidebar and survey card visibility
//        System.out.println("SideBar element is displayed: " +
//                driver.findElement(By.xpath(prop.getProperty("Side_Bar"))).isDisplayed());
//        System.out.println("Survey Cards element is displayed: " +
//                driver.findElement(By.xpath(prop.getProperty("Survey_cards"))).isDisplayed());
//    }
//
//    @Test(dataProvider = "MobileNumbers", priority = 2)
//    public void SurveyCard(String mobileNumber) throws Exception {
//        loginWithNumber(mobileNumber);
//
//        driver.findElement(By.xpath(prop.getProperty("Survey_cards"))).click();
//        driver.findElement(By.xpath(prop.getProperty("Survey_Preview_start_survey"))).click();
//
//        while (true) {
//            try {
//                List<WebElement> options = driver.findElements(By.xpath(prop.getProperty("survey_answer_options_1")));
//                if (options.isEmpty()) break;
//
//                options.get(0).click();
//                Thread.sleep(2000);
//
//                WebElement nextButton = driver.findElement(By.xpath(prop.getProperty("Survey_next_button")));
//                if (!nextButton.isDisplayed()) break;
//
//                nextButton.click();
//                Thread.sleep(2000);
//            } catch (Exception e) {
//                break;
//            }
//        }
//    }
//
//    @Test(dataProvider = "MobileNumbers", priority = 3)
//    public void Wallet_cashout(String mobileNumber) throws InterruptedException {
//        loginWithNumber(mobileNumber);
//
//        driver.findElement(By.xpath(prop.getProperty("Wallet"))).click();
//        driver.findElement(By.xpath(prop.getProperty("Cashout"))).click();
//
//        System.out.println(driver.findElement(By.xpath(prop.getProperty("CashBalance"))).getText());
//
//        for (int i = 0; i < 5; i++) {
//            List<WebElement> giftCards = driver.findElements(By.xpath(prop.getProperty("Clickon_Giftcards")));
//
//            if (!giftCards.isEmpty()) {
//                giftCards.get(0).click();
//                Thread.sleep(2000);
//            } else {
//                System.out.println("No Gift Card element found. Exiting loop.");
//                break;
//            }
//        }
//    }
//
//    @Test(dataProvider = "MobileNumbers", priority = 4)
//    public void Check_transaction_history(String mobileNumber) throws InterruptedException {
//        loginWithNumber(mobileNumber);
//
//        driver.findElement(By.xpath(prop.getProperty("Profile"))).click();
//        System.out.println(driver.findElement(By.xpath(prop.getProperty("Print_the_whole_text"))).getText());
//
//        driver.findElement(By.xpath(prop.getProperty("view_all"))).click();
//        driver.findElement(By.xpath(prop.getProperty("Transaction_Cash"))).click();
//
//        System.out.println(driver.findElement(By.xpath(prop.getProperty("printthe_Transcation_cash"))).getText());
//
//        driver.findElement(By.xpath(prop.getProperty("Back_to_Profile"))).click();
//        driver.findElement(By.xpath(prop.getProperty("Click_logout"))).click();
//        driver.findElement(By.xpath(prop.getProperty("yes_illback"))).click();
//
//        Thread.sleep(3000);
//        Assert.assertEquals(driver.getCurrentUrl(), "https://superj.app/Welcome",
//                "Logout failed - Redirect not as expected!");
//    }
//
//    @Test(dataProvider = "MobileNumbers", priority = 5)
//    public void Verify_Session_Expiry_After_Logout(String mobileNumber) throws InterruptedException {
//        loginWithNumber(mobileNumber);
//        driver.findElement(By.xpath(prop.getProperty("Profile"))).click();
//        driver.findElement(By.xpath(prop.getProperty("Click_logout"))).click();
//        driver.findElement(By.xpath(prop.getProperty("yes_illback"))).click();
//        Thread.sleep(3000);
//        driver.navigate().back();
//        Assert.assertEquals(driver.getCurrentUrl(), "https://superj.app/Welcome",
//                "Session not expired properly!");
//    }
//}
