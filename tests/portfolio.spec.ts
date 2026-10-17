import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir } from 'node:fs/promises';
import { portfolio } from '../src/data/portfolio';
import { LINKAGE, forwardKinematics } from '../src/lib/kinematics';
import { DRAWING_FIELD, LINKAGE_BASE } from '../src/lib/linkage-view';

const ready = async (page: Page) => {
  await expect(page.locator('#linkage-experiment')).toHaveAttribute('data-linkage-ready', 'true');
};
const setAngle = async (page: Page, id: string, value: string) => {
  await page.locator(id).evaluate((input, next) => {
    (input as HTMLInputElement).value = next;
    input.dispatchEvent(new Event('input', { bubbles:true }));
  }, value);
};

test('the linkage initializes a real Three.js canvas without runtime errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await ready(page);
  await expect(page.locator('#linkage-experiment')).toHaveAttribute('data-renderer', 'webgl', {timeout:20000});
  await expect(page.getByRole('img', { name: 'An illustrative two-link robotic mechanism' })).toBeVisible();
  await expect(page.locator('#hero-title')).toHaveText('WHATIF?');
  await expect(page.locator('.linkage-canvas')).toBeVisible();
  expect(await page.locator('canvas').evaluate(canvas => (canvas as HTMLCanvasElement).width)).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test('sliders, keyboard control, and reset share the same pose', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  await setAngle(page, '#shoulder-angle', '62');
  await setAngle(page, '#elbow-angle', '-80');
  await expect(page.locator('#shoulder-value')).toHaveText('62.0°');
  await expect(page.locator('#elbow-value')).toHaveText('-80.0°');
  await page.locator('#shoulder-angle').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#shoulder-value')).toHaveText('62.1°');
  await page.getByRole('button', {name:'Reset pose'}).click();
  await expect(page.locator('#shoulder-value')).toHaveText('55.0°', {timeout:5000});
  await expect(page.locator('#elbow-value')).toHaveText('-71.9°');
});

test('pointer inverse kinematics reaches a feasible target and reports joint limits', async ({ page }) => {
  await page.emulateMedia({ reducedMotion:'reduce' });
  await page.goto('/');
  await ready(page);
  const rect = await page.locator('.linkage-viewport').boundingBox();
  if (!rect) throw new Error('Drawing field missing');
  const target = forwardKinematics({shoulder:60*Math.PI/180,elbow:-85*Math.PI/180}).tool;
  await page.mouse.click(rect.x+(LINKAGE_BASE.x+target.x-DRAWING_FIELD.x)/DRAWING_FIELD.width*rect.width, rect.y+(LINKAGE_BASE.y-target.y-DRAWING_FIELD.y)/DRAWING_FIELD.height*rect.height);
  await expect(page.locator('#shoulder-value')).toHaveText('60.0°');
  await expect(page.locator('#elbow-value')).toHaveText('-85.0°');
  await expect(page.locator('#linkage-experiment')).toHaveAttribute('data-limited', 'false');
  await page.mouse.click(rect.x+rect.width*.98, rect.y+rect.height*.1);
  await expect(page.locator('#linkage-experiment')).toHaveAttribute('data-limited', 'true');
  await expect(page.locator('#linkage-status')).toContainText('closest reachable pose');
  const pose = await page.locator('#linkage-experiment').evaluate(root => ({shoulder:Number((root as HTMLElement).dataset.shoulder),elbow:Number((root as HTMLElement).dataset.elbow)}));
  expect(pose.shoulder).toBeGreaterThanOrEqual(LINKAGE.shoulder.min);
  expect(pose.shoulder).toBeLessThanOrEqual(LINKAGE.shoulder.max);
  expect(pose.elbow).toBeGreaterThanOrEqual(LINKAGE.elbow.min);
  expect(pose.elbow).toBeLessThanOrEqual(LINKAGE.elbow.max);
});

test('native project disclosures and section navigation work', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Explore the work' }).click();
  await expect(page).toHaveURL(/#work$/);
  await page.locator('summary').first().click();
  await expect(page.locator('details').first()).toHaveAttribute('open', '');
  await expect(page.getByText('No project has been published in this slot yet.').first()).toBeVisible();
  await page.getByRole('link', { name: 'T labs', exact: true }).click();
  await expect(page).toHaveURL(/#tlabs$/);
});

test('reduced motion removes interpolation without removing controls', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
  await ready(page);
  await setAngle(page, '#shoulder-angle', '64');
  await page.getByRole('button', {name:'Reset pose'}).click();
  await expect(page.locator('#shoulder-value')).toHaveText('55.0°');
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
});

test('WebGL failure retains an interactive SVG fallback', async ({ page }) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args: any[]) {
      if (String(args[0]).includes('webgl')) return null;
      return (getContext as Function).apply(this, args);
    } as typeof getContext;
  });
  await page.goto('/');
  await ready(page);
  await expect(page.locator('#linkage-experiment')).toHaveAttribute('data-renderer', 'svg', {timeout:20000});
  await expect(page.locator('.linkage-drawing')).toBeVisible();
  await expect(page.locator('.hero-identity')).toContainText('Engineer.');
  await setAngle(page, '#shoulder-angle', '60');
  await expect(page.locator('#shoulder-value')).toHaveText('60.0°');
  await expect(page.locator('[data-upper]')).toHaveAttribute('transform', /rotate\(-59\.999|rotate\(-60/);
});

test('WebGL context loss keeps controls working in SVG', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#linkage-experiment')).toHaveAttribute('data-renderer', 'webgl', {timeout:20000});
  await page.locator('canvas').evaluate(canvas => canvas.dispatchEvent(new Event('webglcontextlost', {cancelable:true})));
  await expect(page.locator('#linkage-experiment')).toHaveAttribute('data-renderer', 'svg');
  await setAngle(page, '#elbow-angle', '-90');
  await expect(page.locator('#elbow-value')).toHaveText('-90.0°');
});

test('rendering settles rather than keeping an idle animation loop running', async ({ page }) => {
  await page.addInitScript(() => {
    const state = window as unknown as { frameRequests:number };
    state.frameRequests = 0;
    const original = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = callback => { state.frameRequests++; return original(callback); };
  });
  await page.goto('/');
  await expect(page.locator('#linkage-experiment')).toHaveAttribute('data-renderer', 'webgl', {timeout:20000});
  await setAngle(page, '#shoulder-angle', '62');
  await expect(page.locator('#shoulder-value')).toHaveText('62.0°');
  await page.waitForTimeout(300);
  const before = await page.evaluate(() => (window as unknown as {frameRequests:number}).frameRequests);
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => (window as unknown as {frameRequests:number}).frameRequests)).toBe(before);
});

test('controls update readouts when the drawing is offscreen, then resume consistently', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  await page.locator('#work').scrollIntoViewIfNeeded();
  await setAngle(page, '#shoulder-angle', '61');
  await expect(page.locator('#shoulder-value')).toHaveText('61.0°');
  await page.locator('.linkage-viewport').scrollIntoViewIfNeeded();
  await expect(page.locator('[data-upper]')).toHaveAttribute('transform', /rotate\(-60\.999|rotate\(-61/);
});

test('touch dragging controls the mechanism while gestures elsewhere can scroll', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ viewport:{width:390,height:844}, hasTouch:true, reducedMotion:'reduce' });
  const page = await context.newPage();
  await page.goto(baseURL!);
  await ready(page);
  await page.locator('.linkage-viewport').scrollIntoViewIfNeeded();
  const handle = await page.locator('[data-target]').boundingBox();
  if (!handle) throw new Error('Touch target missing');
  const client = await context.newCDPSession(page);
  const point = {x:handle.x+handle.width/2,y:handle.y+handle.height/2};
  await client.send('Input.dispatchTouchEvent', {type:'touchStart',touchPoints:[point]});
  await client.send('Input.dispatchTouchEvent', {type:'touchMove',touchPoints:[{x:point.x-18,y:point.y-35}]});
  await client.send('Input.dispatchTouchEvent', {type:'touchEnd',touchPoints:[]});
  await expect(page.locator('#shoulder-value')).not.toHaveText('55.0°');
  const viewport = await page.locator('.linkage-viewport').boundingBox();
  if (!viewport) throw new Error('Touch drawing missing');
  const beforeScroll = await page.evaluate(() => scrollY);
  const scrollPoint = {x:viewport.x+30,y:viewport.y+viewport.height*.65};
  await client.send('Input.dispatchTouchEvent', {type:'touchStart',touchPoints:[scrollPoint]});
  for (const distance of [20,45,75,100]) await client.send('Input.dispatchTouchEvent', {type:'touchMove',touchPoints:[{x:scrollPoint.x,y:scrollPoint.y-distance}]});
  await client.send('Input.dispatchTouchEvent', {type:'touchEnd',touchPoints:[]});
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(beforeScroll);
  await context.close();
});

test('failed 3D download does not disable the kinematics controls', async ({ page }) => {
  await page.route('**/*linkage-renderer*.js', route => route.abort());
  await page.goto('/');
  await ready(page);
  await expect(page.locator('#linkage-experiment')).toHaveAttribute('data-renderer', 'svg', {timeout:20000});
  await setAngle(page, '#elbow-angle', '-88');
  await expect(page.locator('#elbow-value')).toHaveText('-88.0°');
});

test('project content and navigation destinations are preserved', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', {name:'Francesco Trotti — home'})).toBeVisible();
  await expect(page).toHaveTitle(/Francesco Trotti/);
  expect(await page.locator('nav a').evaluateAll(links => links.map(link => link.getAttribute('href')))).toEqual(['#work', '#approach', '#tlabs', '#about']);
  for (const project of portfolio.projects) {
    const article = page.locator(`#project-${project.id}`);
    await expect(article.locator('h3')).toHaveText(project.title);
    await expect(article).toContainText(project.description);
    await expect(article).toContainText('Project placeholder');
  }
});

test('the notebook has one registered document-wide dotted field', async ({ page }) => {
  await page.goto('/');
  const background = await page.evaluate(() => {
    const style = getComputedStyle(document.body);
    return { color: style.backgroundColor, image: style.backgroundImage, size: style.backgroundSize };
  });
  expect(background.color).toBe('rgb(17, 18, 20)');
  expect(background.image).toContain('radial-gradient');
  expect(background.size).toBe('24px 24px');
  for (const selector of ['.hero', '.approach-section', '.tlabs-panel', '.site-footer']) {
    expect(await page.locator(selector).evaluate(element => getComputedStyle(element).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
  }
});

test('keyboard users can skip to the main content', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
});

test('the page and project disclosures work without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(baseURL!);
  await expect(page.locator('.hero-identity')).toContainText('Engineer.');
  await expect(page.locator('.linkage-drawing')).toBeVisible();
  await expect(page.locator('#linkage-caption')).toContainText('Static view');
  await expect(page.locator('#shoulder-angle')).toBeDisabled();
  await page.locator('summary').first().click();
  await expect(page.locator('details').first()).toHaveAttribute('open', '');
  await context.close();
});

test('desktop and mobile have no horizontal overflow or serious a11y violations', async ({ page }) => {
  for (const width of [1600, 1440, 1280, 1024, 768, 700, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `Overflow at ${width}px`).toBe(true);
    await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Approach' })).toBeVisible();
    if (width === 1440 || width === 390) {
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      expect(results.violations).toEqual([]);
    }
  }
});

test('capture desktop and mobile review evidence', async ({ page }) => {
  await mkdir('.impeccable/review', { recursive: true });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [name, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]] as const) {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await expect(page.locator('#linkage-experiment')).toHaveAttribute('data-renderer', 'webgl', {timeout:20000});
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `.impeccable/review/linkage-${name}.png`, fullPage: true });
    await setAngle(page, '#shoulder-angle', '65');
    await setAngle(page, '#elbow-angle', '-45');
    const bounds = await page.locator('[data-linkage-solid]').evaluate(element => {
      const box = (element as SVGGraphicsElement).getBBox();
      return {x:box.x,y:box.y,right:box.x+box.width,bottom:box.y+box.height};
    });
    expect(bounds.x).toBeGreaterThan(DRAWING_FIELD.x+8);
    expect(bounds.y).toBeGreaterThan(DRAWING_FIELD.y+8);
    expect(bounds.right).toBeLessThan(DRAWING_FIELD.x+DRAWING_FIELD.width-8);
    expect(bounds.bottom).toBeLessThan(DRAWING_FIELD.y+DRAWING_FIELD.height-8);
    expect(bounds.right-bounds.x).toBeGreaterThan(600);
    await page.screenshot({ path: `.impeccable/review/linkage-limit-webgl-${name}.png`, fullPage: true });
    await page.locator('canvas').evaluate(canvas => canvas.dispatchEvent(new Event('webglcontextlost', {cancelable:true})));
    await expect(page.locator('#linkage-experiment')).toHaveAttribute('data-renderer', 'svg');
    await page.screenshot({ path: `.impeccable/review/linkage-limit-svg-${name}.png`, fullPage: true });
  }
});
