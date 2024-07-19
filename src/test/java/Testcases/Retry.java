package Testcases;

import org.testng.IRetryAnalyzer;
import org.testng.ITestResult;

public class Retry implements IRetryAnalyzer {

	int counter = 0;
	int retryLimit = 1; // maximum number of times, the case can be retried

	public boolean retry(ITestResult result) {
		if (counter < retryLimit) {
			counter++;
			return true; // retry the case if retryLimit is not exhausted
		}
		return false; // Do not retry anymore, as retryLimit is exhausted
	}

}