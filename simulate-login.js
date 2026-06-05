const puppeteer = require('puppeteer');

(async () => {
  console.log('Starting puppeteer script...');
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle0' });
  
  console.log('Page loaded. Submitting phone number...');
  
  // The phone input is pre-filled with +17743126471 by default in the component:
  // const [phone, setPhone] = useState('+17743126471');
  
  // Wait for the submit button and click it
  await page.waitForSelector('button[type="submit"]');
  await page.click('button[type="submit"]');
  
  console.log('Button clicked. Waiting for response...');
  
  // Wait for network activity to settle or the input for the code to appear
  try {
    await page.waitForSelector('input[name="code"]', { timeout: 10000 });
    console.log('Success! The application transitioned to the verification step.');
  } catch (err) {
    console.error('Failed to transition to the verification step. Error:', err);
    // Print the page content for debugging
    const html = await page.content();
    console.log('Page HTML:', html);
  }
  
  await browser.close();
  console.log('Script finished.');
})();
