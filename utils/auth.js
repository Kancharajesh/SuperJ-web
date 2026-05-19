const { LoginPage, PHONE, OTP_CODES } = require('../pages/LoginPage');

async function login(page) {
  const loginPage = new LoginPage(page);
  return loginPage.login(PHONE, OTP_CODES);
}

async function openLogin(page) {
  const loginPage = new LoginPage(page);
  return loginPage.openLogin();
}

module.exports = { login, openLogin, PHONE, OTP_CODES };
