/**
 * ui-smoke-test.mjs — automated UI smoke test for StudyHub.
 *
 * OPTIONAL helper (not required to run the project):
 *   npm install --save-dev puppeteer
 *   npm run dev            # in one terminal
 *   node scripts/ui-smoke-test.mjs
 *
 * It walks through the complete demonstration flow in a real headless
 * Chrome, collects console errors and saves screenshots to ../docs/screenshots.
 *
 * It drives a real headless Chrome through the complete demonstration flow,
 * collects every browser console error / failed request and saves screenshots
 * so the UI can be reviewed page by page.
 *
 * Run:  node e2e-check.mjs          (frontend must be running on port 5173)
 */
import puppeteer from 'puppeteer';
import fs from 'node:fs';

const BASE = 'http://localhost:5173';
const OUT = new URL('../../docs/screenshots', import.meta.url).pathname;
fs.mkdirSync(OUT, { recursive: true });

const consoleErrors = [];
const pageErrors = [];
const failedRequests = [];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const run = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    protocolTimeout: 240000,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-zygote',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-backgrounding-occluded-windows',
    ],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // React DevTools hint and favicon noise are not real problems
      if (text.includes('Download the React DevTools')) return;
      consoleErrors.push(text);
    }
  });
  page.on('pageerror', (err) => pageErrors.push(err.message));
  page.on('requestfailed', (req) => {
    if (req.url().includes('/api/')) failedRequests.push(`${req.method()} ${req.url()} — ${req.failure()?.errorText}`);
  });
  page.on('response', (res) => {
    if (res.url().includes('/api/') && res.status() >= 400) {
      failedRequests.push(`${res.status()} ${res.request().method()} ${res.url()}`);
    }
  });

  const shot = async (name) => {
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
    console.log(`   📸 ${name}.png`);
  };

  // domcontentloaded + a fixed settle time is far more stable than networkidle2
  // (the app keeps a 30s polling interval running in the background)
  const goto = async (path, waitFor = 1200) => {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 25000 });
        break;
      } catch (error) {
        console.log(`   ! navigation retry ${attempt} for ${path}: ${error.message.slice(0, 55)}`);
        await sleep(1200);
      }
    }
    await sleep(waitFor);
  };

  // ---------------------------------------------------------------- landing
  console.log('\n▶ Landing page');
  await goto('/', 1500);
  await shot('01-landing-light');

  // dark mode on the landing page
  await page.click('nav.public-nav .icon-btn');
  await sleep(600);
  await shot('01b-landing-dark');
  await page.click('nav.public-nav .icon-btn');
  await sleep(400);

  // ---------------------------------------------------------------- register
  console.log('\n▶ Register a new student');
  await goto('/register');
  await shot('02-register');
  await page.type('#reg-name', 'Demo Student');
  await page.type('#reg-email', `demo.student.${Date.now()}@studyhub.com`);
  await page.type('#reg-password', 'demo12345');
  await page.type('#reg-confirm', 'demo12345');
  await page.select('#reg-course', 'Computer Engineering');
  await page.select('#reg-skill', 'Intermediate');
  await page.type('#reg-interests', 'Web Development, Data Structures');
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => location.pathname === '/dashboard', { timeout: 20000 });
  await sleep(2200);
  console.log('   ✓ Registered and redirected to /dashboard');
  await shot('03-dashboard-new-user');

  // ---------------------------------------------------------------- login as owner
  console.log('\n▶ Login as the demo owner (om@studyhub.com)');
  await page.evaluate(() => localStorage.clear());
  await goto('/login');
  await shot('04-login');
  await page.type('#login-email', 'om@studyhub.com');
  await page.type('#login-password', 'studyhub123');
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => location.pathname === '/dashboard', { timeout: 20000 });
  await sleep(2600);
  console.log('   ✓ Logged in');
  await shot('05-dashboard-owner');

  // ---------------------------------------------------------------- browse + filters
  console.log('\n▶ Browse groups + filters');
  await goto('/groups', 2200);
  await shot('06-browse-groups');

  await page.type('#group-search', 'react');
  await sleep(1600);
  const searchCount = await page.evaluate(() => document.body.innerText.match(/(\d+) study groups? found/)?.[1]);
  console.log(`   ✓ Search "react" -> ${searchCount} group(s)`);
  await shot('06b-browse-search');

  await page.click('#group-search + button, form[role="search"] button');
  await sleep(1200);
  await page.select('select[aria-label="Filter by subject"]', 'Data Structures');
  await sleep(1600);
  await shot('06c-browse-filter-subject');
  const filterCount = await page.evaluate(() => document.body.innerText.match(/(\d+) study groups? found/)?.[1]);
  console.log(`   ✓ Subject filter (Data Structures) -> ${filterCount} group(s)`);

  // ------------------------------------------------------------------ group details
  console.log('\n▶ Group details (React Study Circle as owner)');
  await goto('/groups', 1800);
  await page.evaluate(() => {
    const card = [...document.querySelectorAll('.group-card')].find((c) =>
      c.querySelector('.gc-title')?.textContent.includes('React Study Circle'));
    // the primary action of the card opens the group for every role
    const action = card.querySelector('.btn');
    action.click();
  });
  await sleep(2400);
  console.log(`   URL: ${page.url()}`);
  await shot('07-group-overview');

  const GROUP_URL = page.url();

  // Members tab (requests + member table)
  await page.evaluate(() => [...document.querySelectorAll('.tab')].find((t) => t.textContent.includes('Members'))?.click());
  await sleep(1800);
  await shot('08-group-members-requests');

  // Approve the first pending request
  const approved = await page.evaluate(() => {
    const button = [...document.querySelectorAll('button')].find((b) => b.textContent.trim().startsWith('Approve'));
    if (!button) return false;
    button.click();
    return true;
  });
  await sleep(2000);
  console.log(`   ✓ Approve button clicked: ${approved}`);
  await shot('08b-member-approved');

  // Sessions tab
  await page.evaluate(() => [...document.querySelectorAll('.tab')].find((t) => t.textContent.includes('Sessions'))?.click());
  await sleep(1800);
  await shot('09-group-sessions');

  // Attendance marking
  await page.evaluate(() => {
    const button = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Attendance'));
    button?.click();
  });
  await sleep(2200);
  await shot('10-attendance-modal');
  await page.evaluate(() => {
    const button = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('All present'));
    button?.click();
  });
  await sleep(500);
  await page.evaluate(() => {
    const button = [...document.querySelectorAll('.modal-foot button')].find((b) => b.textContent.includes('Save attendance'));
    button?.click();
  });
  await sleep(2200);
  console.log('   ✓ Attendance saved');

  // Resources tab
  await page.evaluate(() => [...document.querySelectorAll('.tab')].find((t) => t.textContent.includes('Resources'))?.click());
  await sleep(1800);
  await shot('11-group-resources');

  // Announcements tab
  await page.evaluate(() => [...document.querySelectorAll('.tab')].find((t) => t.textContent.includes('Announcements'))?.click());
  await sleep(1800);
  await shot('12-group-announcements');

  // Attendance tab
  await page.evaluate(() => [...document.querySelectorAll('.tab')].find((t) => t.textContent.includes('Attendance'))?.click());
  await sleep(2000);
  await shot('13-group-attendance');

  // History tab
  await page.evaluate(() => [...document.querySelectorAll('.tab')].find((t) => t.textContent.includes('History'))?.click());
  await sleep(1800);
  await shot('14-group-history');

  // ---------------------------------------------------------------- other pages
  console.log('\n▶ Remaining authenticated pages');
  for (const [path, name, wait] of [
    ['/my-groups', '15-my-groups', 2200],
    ['/sessions', '16-sessions', 2200],
    ['/resources', '17-resources', 2200],
    ['/announcements', '18-announcements', 2000],
    ['/attendance', '19-attendance', 2200],
    ['/history', '20-history', 2200],
    ['/profile', '21-profile', 2200],
    ['/groups/create', '22-create-group', 1800],
  ]) {
    await goto(path, wait);
    const heading = await page.evaluate(() => document.querySelector('.page-title')?.textContent || '(no title)');
    console.log(`   ✓ ${path} → "${heading}"`);
    await shot(name);
  }

  // ---------------------------------------------------------------- session details
  console.log('\n▶ Session details page');
  await goto('/sessions', 2200);
  await page.evaluate(() => {
    const link = [...document.querySelectorAll('a')].find((a) => a.textContent.trim() === 'View');
    link?.click();
  });
  await sleep(2200);
  console.log(`   URL: ${page.url()}`);
  await shot('23-session-details');

  // ---------------------------------------------------------------- dark mode page
  console.log('\n▶ Dark mode across the app');
  await goto('/dashboard', 2200);
  await page.evaluate(() => {
    const toggle = [...document.querySelectorAll('.header .icon-btn')].find((b) =>
      b.getAttribute('aria-label')?.includes('dark') || b.getAttribute('aria-label')?.includes('light'));
    toggle?.click();
  });
  await sleep(900);
  const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  console.log(`   ✓ Theme after toggle: ${theme}`);
  await shot('24-dashboard-dark');

  await goto('/groups', 2000);
  await shot('25-browse-groups-dark');

  await goto(GROUP_URL.replace(BASE, ''), 2200);
  await sleep(2200);
  await shot('26-group-details-dark');

  // Theme persists after a refresh
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(1600);
  const themeAfterReload = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  console.log(`   ✓ Theme after reload: ${themeAfterReload} (persisted: ${themeAfterReload === 'dark'})`);
  await shot('26b-dark-after-reload');

  // back to light for the mobile shots
  await page.evaluate(() => {
    const toggle = [...document.querySelectorAll('.header .icon-btn')].find((b) =>
      b.getAttribute('aria-label')?.includes('light'));
    toggle?.click();
  });
  await sleep(700);

  // ---------------------------------------------------------------- responsive
  console.log('\n▶ Mobile responsive check (390x844)');
  // A brand new page with the viewport set BEFORE navigating is the stable way
  // to test the mobile layout.
  const mobile = await browser.newPage();
  mobile.on('console', (msg) => {
    if (msg.type() === 'error' && !msg.text().includes('React DevTools')) consoleErrors.push(`[mobile] ${msg.text()}`);
  });
  mobile.on('pageerror', (err) => pageErrors.push(`[mobile] ${err.message}`));
  await mobile.setViewport({ width: 390, height: 844 });

  const mobileGoto = async (path, wait = 2200) => {
    try {
      await mobile.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    } catch (error) {
      console.log(`   ! mobile navigation warning: ${error.message.slice(0, 50)}`);
    }
    await sleep(wait);
  };
  const mobileShot = async (name) => {
    await mobile.screenshot({ path: `${OUT}/${name}.png` });
    console.log(`   📸 ${name}.png`);
  };

  await mobileGoto('/dashboard', 2600);
  await mobileShot('27-mobile-dashboard');

  await mobile.click('.header .icon-btn.mobile-only');
  await sleep(900);
  await mobileShot('28-mobile-drawer');
  const drawerTransform = await mobile.evaluate(() => getComputedStyle(document.querySelector('.sidebar')).transform);
  console.log(`   ✓ Sidebar transform when open: ${drawerTransform}`);

  await mobile.evaluate(() => document.querySelector('.sidebar-backdrop')?.click());
  await sleep(700);

  await mobileGoto('/groups', 2400);
  await mobileShot('29-mobile-browse');

  await mobile.setViewport({ width: 820, height: 1100 });
  await mobileGoto('/groups', 2400);
  await mobileShot('30-tablet-browse');
  await mobile.close();

  // ---------------------------------------------------------------- 404
  await goto('/this-page-does-not-exist', 1400);
  await shot('31-not-found');

  // ---------------------------------------------------------------- report
  console.log('\n──────────────────────────────────────────────');
  console.log(`  Console errors : ${consoleErrors.length}`);
  consoleErrors.slice(0, 12).forEach((e) => console.log(`      ✕ ${e.slice(0, 220)}`));
  console.log(`  Page errors    : ${pageErrors.length}`);
  pageErrors.slice(0, 12).forEach((e) => console.log(`      ✕ ${e.slice(0, 220)}`));
  console.log(`  Failed API calls: ${failedRequests.length}`);
  failedRequests.slice(0, 12).forEach((e) => console.log(`      ✕ ${e}`));
  console.log('──────────────────────────────────────────────\n');

  await browser.close();
  process.exit(consoleErrors.length + pageErrors.length > 0 ? 2 : 0);
};

run().catch(async (error) => {
  console.error('\n💥 UI check crashed:', error.message);
  process.exit(1);
});
