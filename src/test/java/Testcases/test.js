const { Builder, By, until } = require('selenium-webdriver');
const chai = require('chai');
const assert = chai.assert;

describe('Google Search Test', function () {
  this.timeout(10000); // Set timeout for tests

  let driver;

  before(async function () {
    driver = await new Builder().forBrowser('chrome').build();
  });

  it('should load Google', async function () {
    await driver.get('https://www.google.com');
    let title = await driver.getTitle();
    assert.equal(title, 'Google');
  });

  after(async function () {
    await driver.quit();
  });
});
