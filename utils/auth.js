const { WelcomePage } = require("../pages/WelcomePage");
const { PHONE_NUMBER, OTP_CODES } = require("./config");

async function login(page) {
  const welcomePage = new WelcomePage(page);
  await welcomePage.launchTheBrowser();
  await welcomePage.loginToApplication(PHONE_NUMBER, OTP_CODES);
  return welcomePage;
}

module.exports = { login, PHONE_NUMBER, OTP_CODES };
