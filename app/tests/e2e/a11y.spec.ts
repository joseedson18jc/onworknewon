import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('A11y — login + overview', () => {
  test('login page has no serious or critical axe violations', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /welcome|bem-vindo|欢迎/i })).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const serious = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
    if (serious.length) console.log('Serious/critical violations:', JSON.stringify(serious.map((v) => ({ id: v.id, impact: v.impact, help: v.help })), null, 2));
    expect(serious, 'No serious or critical WCAG violations on the login surface').toHaveLength(0);
  });

  test('overview has no serious or critical axe violations after sign-in', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel(/username|usuário|用户名/i).fill('jose');
    await page.getByLabel(/password|senha|密码/i).fill('anything');
    await page.getByRole('button', { name: /sign in|entrar|登录/i }).click();
    await expect(page.getByRole('heading', { name: /intelligence for every sales conversation|inteligência para cada conversa|为每一次销售对话/i })).toBeVisible({ timeout: 10_000 });
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      // Exclude the decorative noise + mesh layers that rely on mix-blend-mode for atmosphere,
      // which axe flags as contrast issues on a background canvas.
      .exclude('.bg-noise::before')
      .analyze();
    const serious = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
    if (serious.length) console.log('Serious/critical violations:', JSON.stringify(serious.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length })), null, 2));
    expect(serious).toHaveLength(0);
  });

  test('command palette opens with ⌘K (and is closable)', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel(/username|usuário|用户名/i).fill('jose');
    await page.getByLabel(/password|senha|密码/i).fill('anything');
    await page.getByRole('button', { name: /sign in|entrar|登录/i }).click();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10_000 });
    await page.keyboard.press('Meta+K');
    await expect(page.getByRole('dialog', { name: /command palette/i })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: /command palette/i })).not.toBeVisible();
  });
});
