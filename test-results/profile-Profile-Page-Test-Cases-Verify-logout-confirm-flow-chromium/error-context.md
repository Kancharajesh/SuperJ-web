# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: profile.spec.js >> Profile Page Test Cases >> Verify logout confirm flow
- Location: tests/profile.spec.js:52:7

# Error details

```
Error: locator.click: Error: strict mode violation: locator('//button[contains(@class,\'logout-module\') or normalize-space()=\'Yes\']') resolved to 2 elements:
    1) <button class="logout-module__7x-5pG__deleteButton">Yes, I'll be back</button> aka getByRole('button', { name: 'Yes, I\'ll be back' })
    2) <button class="logout-module__7x-5pG__cancelButton">Cancel</button> aka getByRole('button', { name: 'Cancel' })

Call log:
  - waiting for locator('//button[contains(@class,\'logout-module\') or normalize-space()=\'Yes\']')

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - generic:
      - generic:
        - generic [ref=e4]:
          - generic [ref=e6]:
            - img "profile" [ref=e7]
            - paragraph [ref=e8] [cursor=pointer]: did:zkjm:superj:...
            - button "Copy DID Copy" [ref=e9] [cursor=pointer]:
              - text: Copy DID
              - img "Copy" [ref=e10]
          - generic [ref=e11]:
            - list [ref=e13]:
              - listitem [ref=e14] [cursor=pointer]:
                - img "Home" [ref=e15]
                - paragraph [ref=e16]: Home
              - listitem [ref=e17] [cursor=pointer]:
                - img "Wallet" [ref=e18]
                - paragraph [ref=e19]: Wallet
              - listitem [ref=e20] [cursor=pointer]:
                - img "Discussions" [ref=e21]
                - paragraph [ref=e22]: Discussions
              - listitem [ref=e23] [cursor=pointer]:
                - img "Profile" [ref=e24]
                - paragraph [ref=e25]: Profile
            - generic [ref=e26]:
              - generic [ref=e27]:
                - img "Super J Logo" [ref=e28]
                - generic [ref=e29]: SUPER J
              - button "Download the App iOS android" [ref=e30] [cursor=pointer]:
                - generic [ref=e31]:
                  - paragraph [ref=e32]: Download the App
                  - img "iOS" [ref=e33]
                  - img "android" [ref=e34]
        - main
    - main [ref=e35]:
      - generic [ref=e38]:
        - heading "Profile" [level=1] [ref=e39]
        - generic [ref=e41]:
          - generic [ref=e42]:
            - generic [ref=e43]:
              - heading "Decentralised ID" [level=2] [ref=e44]
              - generic [ref=e46]:
                - img "DID" [ref=e47]
                - paragraph [ref=e49]: did:zkjm:superj:13a9aeF1f78866697F1FD525E4AB6aab3A07C85a
              - button "Learn more about DID" [ref=e51] [cursor=pointer]
            - button "Super J Logo SUPER J REFER A FRIEND TO DOWNLOAD AND GET REWARDED boy" [ref=e53] [cursor=pointer]:
              - generic [ref=e54]:
                - img "Super J Logo" [ref=e55]
                - generic [ref=e56]: SUPER J
              - generic [ref=e57]: REFER A FRIEND TO DOWNLOAD
              - generic [ref=e58]: AND GET REWARDED
              - img "boy" [ref=e59]
          - generic [ref=e60]:
            - generic [ref=e61]:
              - generic [ref=e62]:
                - heading "Profile" [level=2] [ref=e63]
                - button "Edit edit" [ref=e64] [cursor=pointer]:
                  - text: Edit
                  - img "edit" [ref=e65]
              - generic [ref=e67]:
                - generic [ref=e68]:
                  - paragraph [ref=e69]: Gender
                  - paragraph [ref=e70]: male
                - generic [ref=e71]:
                  - paragraph [ref=e72]: Birth Year
                  - paragraph [ref=e73]: "2000"
                - generic [ref=e74]:
                  - paragraph [ref=e75]: City
                  - paragraph [ref=e76]: Lucknow
            - button "policy Privacy Policy" [ref=e77] [cursor=pointer]:
              - img "policy" [ref=e78]
              - paragraph [ref=e80]: Privacy Policy
          - generic [ref=e82]:
            - generic [ref=e83]:
              - img "Help and support" [ref=e84]
              - button "Help and support" [ref=e85] [cursor=pointer]:
                - paragraph [ref=e86]: Help and support
            - generic [ref=e88]:
              - paragraph [ref=e89]: You created this account on
              - paragraph [ref=e90]: 07 Aug 2024
              - button
        - generic [ref=e91]:
          - generic [ref=e92]:
            - paragraph [ref=e93]: Transaction History
            - button "View All all" [ref=e94] [cursor=pointer]:
              - text: View All
              - img "all" [ref=e95]
          - generic [ref=e96]:
            - generic [ref=e97]:
              - paragraph [ref=e98]: Rs 250 for your next Order on Amazon! Enjoy
              - generic [ref=e99]:
                - generic [ref=e102]: + ₹ 250
                - paragraph [ref=e103]: 18 May, 2026
            - generic [ref=e104]:
              - paragraph [ref=e105]: Importance of Success, Wealth, Happiness.
              - generic [ref=e106]:
                - generic [ref=e109]:
                  - img "Reward" [ref=e110]
                  - generic [ref=e111]: 1 reward
                - paragraph [ref=e112]: 18 May, 2026
            - generic [ref=e113]:
              - paragraph [ref=e114]: What Makes You Go Viral?
              - generic [ref=e115]:
                - img "Reward" [ref=e119]
                - paragraph [ref=e120]: 18 May, 2026
          - button "Logout" [active] [ref=e121] [cursor=pointer]
      - generic [ref=e123]:
        - img "star" [ref=e124]
        - img "star" [ref=e125]
        - generic [ref=e126]:
          - paragraph [ref=e127]: It's not so super to see you go!
          - paragraph [ref=e128]: Sure you want to logout?
        - generic [ref=e129]:
          - button "Yes, I'll be back" [ref=e130] [cursor=pointer]
          - button "Cancel" [ref=e131] [cursor=pointer]
  - alert [ref=e132]: My Profile | SuperJ
```

# Test source

```ts
  1   | import { expect } from "@playwright/test";
  2   | 
  3   | export class Profile {
  4   |   constructor(page) {
  5   |     this.page = page;
  6   | 
  7   |     this.side_profile = page.locator(
  8   |       "(//p[normalize-space()='Profile'])[1]"
  9   |     );
  10  | 
  11  |     this.did_section = page.locator("(//div)[21]");
  12  | 
  13  |     this.refer_button = page.locator(
  14  |       "(//button[contains(@class,'min-[1728px]:w-[562.44px]')])[1]"
  15  |     );
  16  | 
  17  |     this.profile_info = page.locator("(//div)[31]");
  18  |     this.transaction_history = page.locator("(//div)[44]");
  19  | 
  20  |     this.transaction_viewall = page.locator(
  21  |       "(//button[normalize-space()='View All'])[1]"
  22  |     );
  23  | 
  24  |     this.transaction_details = page.locator(
  25  |       "(//div[contains(@class,'Cash-module')])[1]"
  26  |     );
  27  | 
  28  |     this.logout_button = page.locator(
  29  |       "(//button[normalize-space()='Logout'])[1]"
  30  |     );
  31  | 
  32  |     this.logout_cancel = page.locator(
  33  |       "//button[normalize-space()='Cancel']"
  34  |     );
  35  | 
  36  |     this.logout_yes = page.locator(
  37  |       "//button[contains(@class,'logout-module') or normalize-space()='Yes']"
  38  |     );
  39  | 
  40  |     this.profile_fullpage = page.locator("(//div)[17]");
  41  | 
  42  |     this.profile_afterlogout = page.locator(
  43  |       "//div[contains(@class,'absolute inset-0 flex flex-col')]"
  44  |     );
  45  |   }
  46  | 
  47  |   async verifyVisible(locator) {
  48  |     await expect(locator).toBeVisible({ timeout: 15000 });
  49  |   }
  50  | 
  51  |   async openProfilePage() {
  52  |     await this.side_profile.click();
  53  |     await this.page.waitForTimeout(3000);
  54  |   }
  55  | 
  56  |   async verifyProfilePage() {
  57  |     await this.verifyVisible(this.profile_fullpage);
  58  |   }
  59  | 
  60  |   async verifyProfileInfo() {
  61  |     await this.verifyVisible(this.profile_info);
  62  |   }
  63  | 
  64  |   async verifyDIDSection() {
  65  |     await this.verifyVisible(this.did_section);
  66  |   }
  67  | 
  68  |   async verifyReferButton() {
  69  |     await this.verifyVisible(this.refer_button);
  70  |   }
  71  | 
  72  |   async clickReferButton() {
  73  |     await this.refer_button.click();
  74  |   }
  75  | 
  76  |   async verifyTransactionHistory() {
  77  |     await this.verifyVisible(this.transaction_history);
  78  |   }
  79  | 
  80  |   async clickTransactionViewAll() {
  81  |     await this.transaction_viewall.click();
  82  |   }
  83  | 
  84  |   async verifyTransactionDetails() {
  85  |     await this.verifyVisible(this.transaction_details);
  86  |   }
  87  | 
  88  |   async clickLogout() {
  89  |     await this.logout_button.click();
  90  |   }
  91  | 
  92  |   async clickLogoutCancel() {
  93  |     await this.logout_cancel.click();
  94  |   }
  95  | 
  96  |   async confirmLogout() {
> 97  |     await this.logout_yes.click();
      |                           ^ Error: locator.click: Error: strict mode violation: locator('//button[contains(@class,\'logout-module\') or normalize-space()=\'Yes\']') resolved to 2 elements:
  98  |   }
  99  | 
  100 |   async verifyAfterLogoutScreen() {
  101 |     await this.verifyVisible(this.profile_afterlogout);
  102 |   }
  103 | }
```