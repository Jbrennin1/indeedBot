import 'dotenv/config'
import { queryString } from '../index.js'

let totalJobs = 0
let pageCount = 0
async function determinePageType(browser, jobs, page, count)
    {
            await page.bringToFront()
            let title = await page.title()
            console.log(count + "|" + title)
            if (await page.$('#input-firstName') !== null) { // Checks if the first name field is present
                await fillContactInformationForm(page);
                return; // Stop execution to prevent timeout
            }

            setTimeout(async() => {
                await evaluateInputs(browser, jobs, page, count, title)
            }, 7000);
    }

    async function fillInputs(inputs, page)
    {
            for(let input of inputs)
            {
            if(input != null)
            {
                //console.log(input)
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

    async function fillContactInformationForm(page) {
        console.log("Filling in the contact information form...");

        // Assuming default values for demonstration. Replace with actual values or use environment variables as needed.
        const firstName = 'John';
        const lastName = 'Doe';
        const email = 'john.doe@example.com'; // This field might be pre-filled and read-only.
        const phoneNumber = '234567890'; // Optional, based on your requirements.

        // Fill in the First Name and Last Name
        await page.type('#input-firstName', firstName);
        await page.type('#input-lastName', lastName);

        // Check if the Phone Number field exists and fill it in (if applicable).
        if (await page.$('#input-phoneNumber') !== null) {
            await page.type('#input-phoneNumber', phoneNumber);
        }

        // Click the "Continue" button to proceed with the application
        const continueButtonSelector = '.css-pqhqxt button[type="button"]'; // Adjust selector as needed
        await page.click(continueButtonSelector);

        console.log("Contact information form submitted.");
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

                        // determined issue is raw value being returned, still have to debug y
                        return filteredInputs
                        })

                        await fillInputs(inputs, page)

                        let button = await page.waitForSelector('.ia-continueButton')
                        await button.click()
                        break
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
                // Updated selector to target the new "Apply now" button structure
                const applyButtonSelector = 'button[id="indeedApplyButton"]';

                // Wait for the "Apply now" button to be rendered in the DOM
                await jobPage.waitForSelector(applyButtonSelector, { timeout: 5000 });
                console.log('Found "Apply now" button.');

                // Click the "Apply now" button
                await jobPage.click(applyButtonSelector);
                console.log('Clicked "Apply now" button.');

                // Wait for navigation to ensure the click has led to a new page
                await jobPage.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(e => console.log('Navigation timeout after click.'));
                console.log('Navigation after click confirmed.');

                setTimeout(async () => {
                    await determinePageType(browser, jobs, jobPage, count);
                }, 6000);
            } catch (error) {
                console.error(`Error clicking "Apply now" button for ${jobs[count].title}: ${error.message}`);
                await jobPage.close();
                await clickApply(browser, jobs, count + 1); // Proceed to the next job
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

        // Proceed with job application logic
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