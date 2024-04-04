import 'dotenv/config'
import { queryString } from '../index.js'

let totalJobs = 0
let pageCount = 0
async function determinePageType(browser, jobs, page, count) {
    console.log("Determining page type...");
    await page.bringToFront();

    const maxAttempts = 10;
    let attempts = 0;

    while (attempts < maxAttempts) {
        attempts++;
        console.log(`Attempt ${attempts} to determine page...`);

        const questionnaireHeader = await page.$('.ia-BasePage-heading');
        if (questionnaireHeader) {
            const headerText = await page.evaluate(header => header.textContent, questionnaireHeader);
            if (headerText.includes('Answer these questions from the employer')) {
                console.log("Questionnaire page detected.");
                await fillOutQualificationQuestions(page, browser, jobs, count);
                return;
            }
        }

        if (await page.$('#input-firstName') !== null) {
            console.log("Contact information form detected.");
            await fillContactInformationForm(page, browser, jobs, count);
            return;
        }

        if (await page.$('#input-addressLine') !== null) {
            console.log("Location details form detected.");
            await fillLocationDetailsForm(page, browser, jobs, count);
            return;
        }

        if (await page.$("input[type='radio'][value='SAVED_FILE_RESUME']") !== null) {
            console.log("Resume selection page detected.");
            await selectUploadedResume(page, browser, jobs, count);
            return;
        }

        const submitApplicationButton = await page.$x("//button[contains(., 'Submit your application')]");
        const qualificationsHeading = await page.$('h1.ia-BasePage-heading');
        const continueButton = await page.$('.ia-QualificationIntervention-continue');

        if (submitApplicationButton.length > 0) {
            console.log('Application review page detected.');
            await page.waitForTimeout(2000);

            await submitApplicationButton[0].click();
            console.log('Clicked "Submit your application" button.');
            await page.waitForTimeout(2000);
            return;
        }

        if (qualificationsHeading) {
            const headingText = await page.evaluate(element => element.textContent, qualificationsHeading);
            if (headingText.includes('These qualifications may be important for this job')) {
                console.log('Qualifications page detected.');
                if (continueButton) {
                    await continueButton.click();
                    console.log('Clicked "Continue applying" button.');
                    await page.waitForTimeout(2000);
                    return await determinePageType(browser, jobs, page, count);
                } else {
                    console.log('Continue applying button not found on qualifications page.');
                }
            } else {
                console.log('Unknown page detected.');
            }
        }

        const hasInputs = await page.$eval('input', input => input !== null);
        const hasContinueButton = await page.$eval('button[type="button"]', button => button !== null);

        if (hasInputs && hasContinueButton) {
            console.log("Input page with a continue button detected.");
            await handleInputPage(browser, jobs, page, count);
            return;
        } else {
            console.log("Not an input page with a continue button.");

            await page.close();
        }

        if (continueButton) {
            console.log('Continue applying button detected.');
            await continueButton.click();
            console.log('Clicked "Continue applying" button.');
            await page.waitForTimeout(2000);
            return await determinePageType(browser, jobs, page, count);
        }

        const submissionConfirmationSelector = 'Your selector for submission confirmation';
        if (await page.$(submissionConfirmationSelector) !== null) {
            console.log("Application submitted successfully.");
            return;
        }

        await page.waitForTimeout(2000);
    }

    console.log("Form or confirmation not detected after maximum attempts.");
    await page.close();
    await clickApply(browser, jobs, count + 1);

}

async function handleInputPage(browser, jobs, page, count) {
    const inputs = await page.$$('input');
    for (const input of inputs) {
        const inputType = await input.evaluate(node => node.type);
        console.log("Detected input type:", inputType);
    }

    const continueButton = await page.$('button[type="button"]');
    await continueButton.click();

    await determinePageType(browser, jobs, page, count);

}

    async function fillInputs(inputs, page)
    {
            for(let input of inputs)
            {
            if(input != null)
            {
                if(input.type == 'number')
                {
                    for(let i = 0; i < 4; i++)
                    {
                        await page.focus(input.id)
                        await page.keyboard.press('Backspace')
                    }
                        await page.type(input.id, process.env.num_param)
                }
                if(input.type == 'text')
                {
                    for(let i = 0; i < 4; i++)
                    {
                        await page.focus(input.id)
                        await page.keyboard.press('Backspace')
                    }
                        await page.type(input.id, process.env.text_param)
                }
                if(input.type == 'textarea')
                {
                    for(let i = 0; i < 4; i++)
                    {
                        await page.focus(input.id)
                        await page.keyboard.press('Backspace')
                    }
                    await page.type(input.id, 'I answer these questions during interviews.')
                }
                if(input.type == 'select' || input.type == 'select-one')
                {
                    await page.select(input.id, input.option)
                }
                if(input.type == 'tel')
                {
                    await page.type(input.id, '3215573344')
                }
                if(input.type == 'date')
                {
                    await page.type(input.id,'06162023')
                }
            }
        }
    }

    async function clearAndType(selector, value, page) {
        console.log("typing")
        await page.click(selector, { clickCount: 3 });
        await page.keyboard.press('Backspace');
        await page.type(selector, value);
    }


    async function fillContactInformationForm(page, browser, jobs, count) {
        console.log("Filling in the contact information form...");

        const firstName = 'John';
        const lastName = 'Doe';
        const phoneNumber = '3524410601';

        await clearAndType('#input-firstName', firstName, page);

        await clearAndType('#input-lastName', lastName, page);

        if (await page.$('#input-phoneNumber') !== null) {
            await clearAndType('#input-phoneNumber', phoneNumber, page);
        }

        await clickContinueButton(page);

        console.log("Contact information form submitted.");
        await determinePageType(browser, jobs, page, count);
    }

    async function fillLocationDetailsForm(page, browser, jobs, count) {
        console.log("Filling in the location details form...");

        const streetAddress = '123 Main St';
        const cityState = 'Orlando, FL';
        const postalCode = '32801';

        await clearAndType('#input-addressLine', streetAddress, page);
        await clearAndType('#input-city', cityState, page);
        await clearAndType('#input-postalCode', postalCode, page);

        console.log("Location details form filled.");
        await clickContinueButton(page);
        await determinePageType(browser, jobs, page, count);
    }

    async function clickContinueButton(page) {
        try {
            await page.waitForSelector('.ia-BasePage-footer .css-pqhqxt button[type="button"]', { timeout: 5000 });

            await page.click('.ia-BasePage-footer .css-pqhqxt button[type="button"]');
            console.log("Clicked the 'Continue' button.");

            await page.waitForTimeout(2000);

        } catch (error) {
            console.error("Error clicking 'Continue' button:", error.message);
        }
    }

    async function selectUploadedResume(page, browser, jobs, count) {
        console.log("Selecting uploaded resume...");

        try {
            const label = await page.$("label[data-testid='FileResumeCard-label']");

            if (label) {
                await label.click();
                console.log("Uploaded resume selected.");
            } else {
                console.error("Uploaded resume label not found.");
            }

            await clickContinueButton(page);

            await determinePageType(browser, jobs, page, count);
        } catch (error) {
            console.error("Error selecting uploaded resume:", error.message);
        }
    }

    async function fillOutQualificationQuestions(page, browser, jobs, count) {
        console.log("Filling out qualification questions...");

        try {
            const questionItems = await page.$$('.ia-Questions-item');

            for (const questionItem of questionItems) {
                const questionText = await questionItem.$eval('.css-12axhzd', node => node.textContent.trim());
                console.log("Question:", questionText);

                const radioInputs = await questionItem.$$('input[type="radio"]');

                if (radioInputs.length > 0) {
                    await radioInputs[0].click();
                    console.log("Answered:", radioInputs[0].value);
                } else {
                    console.log("No radio inputs found for this question.");
                }
            }

            await clickContinueButton(page);

            await determinePageType(browser, jobs, page, count);

        } catch (error) {
            console.error("Error filling out qualification questions:", error.message);
        }
    }

    async function evaluateInputs(browser, jobs, page, count, title)
    {
        switch(title)
        {
            case 'Answer screener questions from the employer | Indeed.com' : {
                        const inputs = await page.$$eval('.ia-Questions-item', (e) => {
                        let filteredInputs = e.map(e => {
                                if(e.querySelectorAll('input')[0])
                                {
                                    if(e.querySelectorAll('input')[0].type == 'radio')
                                    {
                                        e.querySelectorAll('input')[0].click()
                                        return null
                                    }
                                    else if(e.querySelectorAll('input')[0].type == 'text' ||
                                    e.querySelectorAll('input')[0].type == 'number' ||
                                    e.querySelectorAll('input')[0].type == 'checkbox' ||
                                    e.querySelectorAll('input')[0].type == 'date' ||
                                    e.querySelectorAll('input')[0].type == 'tel' ||
                                    e.querySelectorAll('input')[0].type == 'checkbox')
                                    {
                                        if(e.querySelectorAll('input')[0].type == 'checkbox' &&
                                        e.querySelectorAll('input')[0].checked == false)
                                        {
                                            e.querySelectorAll('input')[0].click()
                                        }
                                        return e = {
                                            type:e.querySelectorAll('input')[0].type,
                                            id:'#' + e.querySelectorAll('input')[0].id,
                                            value:e.querySelectorAll('input')[0].value
                                        }
                                    }
                                }
                                else if(e.querySelectorAll('select')[0])
                                {
                                    return e = {
                                        type:e.querySelectorAll('select')[0].type,
                                        id:'#' + e.querySelectorAll('select')[0].id,
                                        option:e.querySelectorAll('select')[0][1].value,
                                    }
                                }
                                else if(e.querySelectorAll('textarea')[0])
                                {
                                    return e = {
                                        type:e.querySelectorAll('textarea')[0].type,
                                        id:'#' + e.querySelectorAll('textarea')[0].id
                                    }
                                }
                                else
                                {
                                    return e = null
                                }
                            }
                        ).filter((e) => {
                            return e != null
                        })

                        return filteredInputs
                        })

                        await fillInputs(inputs, page)

                        let button = await page.waitForSelector('.ia-continueButton')
                        await button.click()
                        break
                }
                case 'Review your location details from your profile | Indeed.com': {
                    await fillLocationDetailsForm(page);
                    break;
                }
            case 'Upload or build a resume for this application | Indeed.com' : {
                let button = await page.waitForSelector('.ia-continueButton')
                await button.click()
                break
            }
            case 'Review the contents of this job application | Indeed.com' : {
                let button = await page.waitForSelector('.ia-continueButton')
                await button.click()
                break
            }
            case 'Add relevant work experience information | Indeed.com' : {
                let button = await page.waitForSelector('.ia-continueButton')
                await button.click()
                break
            }
            case 'Add documents to support this application | Indeed.com' : {
                let button = await page.waitForSelector('.ia-continueButton')
                await button.click()
                break
            }
            case 'Add or update your contact information | Indeed.com' : {
                let button = await page.waitForSelector('.ia-continueButton')
                await button.click()
                break
            }
            case 'Your application has been submitted | Indeed.com' : {
                console.log("MASTER I AM HERE TO SERVE YOU")
                console.log(jobs[count].title + " at " + jobs[count].organization + " applied to successfully.")
                totalJobs++
                console.log("[" + totalJobs + "] " + " total jobs applied for so far!")
                await page.close()
                await clickApply(browser, jobs, count + 1)
                break
            }
            case 'Qualification check | Indeed.com' : {
                let button = await page.waitForSelector('.ia-continueButton')
                await button.click()
                break
            }
            case 'Indeed Apply' : {
                await page.close()
                return await clickApply(browser, jobs, count)
                break
            }
            default : {
                await page.close()
                return await clickApply(browser, jobs, count)
                break
            }
            }
            if(title != 'Your application has been submitted | Indeed.com')
            {
                setTimeout(async() => {
                    await determinePageType(browser, jobs, page, count)
                }, 5000);
            }
    }

    async function clickApply(browser, jobs, count, page = null) {
        console.log(`Attempting to apply for job ${count + 1}: ${jobs[count].title} at ${jobs[count].organization}`);
        if (count < jobs.length) {
            let jobPage = await browser.newPage();
            await jobPage.goto(jobs[count].href, { waitUntil: 'networkidle2' });
            console.log(`Navigated to job page: ${jobs[count].title}`);

            try {
                const applyButtonSelector = 'button[id="indeedApplyButton"]';

                await jobPage.waitForSelector(applyButtonSelector, { timeout: 5000 });
                console.log('Found "Apply now" button.');

                await jobPage.click(applyButtonSelector);
                console.log('Clicked "Apply now" button.');

                await jobPage.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(e => console.log('Navigation timeout after click.'));
                console.log('Navigation after click confirmed.');

                setTimeout(async () => {
                    await determinePageType(browser, jobs, jobPage, count);
                }, 6000);
            } catch (error) {
                console.error(`Error clicking "Apply now" button for ${jobs[count].title}: ${error.message}`);
                await jobPage.close();
                await clickApply(browser, jobs, count + 1);
            }
        } else {
            let pages = await browser.pages();
            return await gotoNextPage(pages[0], browser, count);
        }
    }




async function gotoNextPage(page, browser, count) {
            count = 0
            pageCount++
            if(process.env.display_page_traversal == true)
            {
                if(pageCount > 1)
                {
                    console.log("Done with this page. Moving on... | Traversed " + pageCount + " pages so far.")
                }
                else
                {
                    console.log("Done with this page. Moving on... | Traversed " + pageCount + " page so far.")
                }
            }
            setTimeout(async() => {
                try{
                    const nextPage = await page.waitForSelector(('a[data-testid=pagination-page-next]'))
                    await nextPage.click()
                    }
                catch{
                    pageCount = 0
                    if(process.env.display_page_traversal == true)
                    {
                        console.log("No more pages left to traverse; looping back...")
                    }
                    await page.goto(queryString)
                }
                finally
                {
                    return await findJobs(page, browser, count)
                }
            }, 5000);
}

async function findJobs(page, browser, count) {
    try {
        console.log("Initiating search...");
        await page.waitForSelector('div[data-testid="slider_item"]', {timeout: 10000}); // Wait for the job listings to load
        console.log("found job listing selector");

        const jobs = await page.$$eval('div[data-testid="slider_item"]', (listings) => {
            return listings.map(listing => {
                const titleElement = listing.querySelector('h2.jobTitle > a');
                const companyElement = listing.querySelector('[data-testid="company-name"]');
                const locationElement = listing.querySelector('[data-testid="text-location"]');
                return {
                    title: titleElement ? titleElement.innerText : "Title not found",
                    organization: companyElement ? companyElement.innerText : "Company not found",
                    location: locationElement ? locationElement.innerText : "Location not found",
                    href: titleElement ? titleElement.href : "#"
                };
            });
        });

        console.log("Jobs found: ", jobs);

        if (jobs.length > 0) {
            console.log("Proceeding to apply to jobs...");
            return await clickApply(browser, jobs, count);
        } else {
            console.log("No jobs found, going to the next page...");
            return await gotoNextPage(page, browser, count);
        }
    } catch (e) {
        console.log("Error finding jobs: ", e);
    }
}


export { findJobs, clickApply, determinePageType, evaluateInputs }