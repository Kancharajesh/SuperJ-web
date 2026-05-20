import { expect } from "@playwright/test";

    export class Mobile_wallet {
        constructor (page) {
            this.page = page;

        this.clickonWallet = page.locator ("//div[@class='urbanist_21f4fdec-module__hNISTG__className']//a[2]");
       
        this.Userbalancevisible = page.locator ("(//div[@class='CashBalanceComponent-module__xUC3AW__container'])[1]");
        this.GiftcardsVisible = page.locator ("(//div[@class='MyGiftCardsComponent-module__XlpArG__container'])[1]");


        }
    }