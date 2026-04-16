const { chromium } = require('playwright');
const path = require('path');

async function testApp() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            const text = msg.text();
            if (!text.includes('Failed to fetch') && 
                !text.includes('CORS') && 
                !text.includes('net::ERR')) {
                errors.push(text);
            }
        }
    });
    
    page.on('pageerror', err => {
        if (!err.message.includes('fetch')) {
            errors.push(err.message);
        }
    });
    
    const filePath = path.resolve(__dirname, 'index.html');
    await page.goto(`file://${filePath}`);
    
    await page.waitForTimeout(2000);
    
    const title = await page.title();
    console.log('Page title:', title);
    
    const logoText = await page.locator('.logo-text').textContent();
    console.log('Logo:', logoText);
    
    const chatInput = await page.locator('#chatInput').isVisible();
    console.log('Chat input visible:', chatInput);
    
    const sendBtn = await page.locator('#sendBtn').isVisible();
    console.log('Send button visible:', sendBtn);
    
    const chartSection = await page.locator('.chart-section').isVisible();
    console.log('Chart section visible:', chartSection);
    
    const tfBtns = await page.locator('.tf-btn').count();
    console.log('Timeframe buttons:', tfBtns);
    
    if (errors.length > 0) {
        console.log('\nCritical errors found:');
        errors.forEach(e => console.log(' -', e));
    } else {
        console.log('\nNo critical errors!');
    }
    
    await browser.close();
    
    return errors.length === 0;
}

testApp()
    .then(success => {
        console.log(success ? '\n✅ App test passed!' : '\n❌ App test failed');
        process.exit(success ? 0 : 1);
    })
    .catch(err => {
        console.error('Test error:', err);
        process.exit(1);
    });
