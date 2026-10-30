export class TestGeneratorService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
  }

  // Generate Playwright test script from ticket Acceptance Criteria
  async generateTest(ticket) {
    if (this.apiKey) {
      try {
        const generatedCode = await this.generateWithGemini(ticket);
        if (generatedCode) {
          return {
            source: 'gemini_ai',
            script: generatedCode,
            steps: ticket.targetActions || []
          };
        }
      } catch (err) {
        console.warn(`[TestGenerator] Gemini call failed: ${err.message}. Using deterministic engine.`);
      }
    }

    // Deterministic rule-based template generation
    const deterministicCode = this.generateDeterministicScript(ticket);
    return {
      source: 'deterministic_template_engine',
      script: deterministicCode,
      steps: ticket.targetActions || []
    };
  }

  // Call Gemini model dynamically if API key is present
  async generateWithGemini(ticket) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(this.apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `
You are an expert QA Automation Engineer.
Write an executable Playwright (TypeScript/JavaScript) test script based on the following Jira ticket:

Ticket: ${ticket.key} - ${ticket.summary}
Acceptance Criteria:
${ticket.acceptanceCriteria.map(ac => `- ${ac}`).join('\n')}

Target Actions Planned:
${JSON.stringify(ticket.targetActions, null, 2)}

Requirements:
1. Use standard Playwright syntax: test.describe(), test(), page.locator(), expect().
2. Include explicit step-by-step comments matching each Acceptance Criterion.
3. Keep selectors clean and standard (IDs, CSS classes, text selectors).
4. Return ONLY valid executable code inside a typescript markdown fence or raw code block.
      `.trim();

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Clean markdown code fences if present
      const cleanCode = text
        .replace(/^```(typescript|javascript|ts|js)?\n/i, '')
        .replace(/\n```$/i, '')
        .trim();

      return cleanCode;
    } catch (err) {
      console.warn(`[TestGenerator] Could not load @google/generative-ai: ${err.message}`);
      return null;
    }
  }

  // Deterministic clean Playwright test code generation
  generateDeterministicScript(ticket) {
    const stepsCode = (ticket.targetActions || []).map(step => {
      if (step.action === 'navigate') {
        return `    // Step ${step.step}: ${step.description}\n    await page.goto(baseURL + '${step.path}');\n    await expect(page).toHaveURL(new RegExp('${step.path}'));`;
      } else if (step.action === 'click') {
        return `    // Step ${step.step}: ${step.description}\n    const target_${step.step} = page.locator('${step.selector}');\n    await target_${step.step}.waitFor({ state: 'visible', timeout: 5000 });\n    await target_${step.step}.click();`;
      } else if (step.action === 'fill') {
        return `    // Step ${step.step}: ${step.description}\n    const input_${step.step} = page.locator('${step.selector}');\n    await input_${step.step}.fill('${step.value}');`;
      } else if (step.action === 'assertText') {
        return `    // Step ${step.step}: ${step.description}\n    const element_${step.step} = page.locator('${step.selector}');\n    await expect(element_${step.step}).toHaveText('${step.expected}');`;
      } else if (step.action === 'assertVisible') {
        return `    // Step ${step.step}: ${step.description}\n    const banner_${step.step} = page.locator('${step.selector}');\n    await expect(banner_${step.step}).toBeVisible();`;
      }
      return `    // Step ${step.step}: ${step.description}`;
    }).join('\n\n');

    return `// ====================================================================
// SentinelQA Autonomous Generated Playwright Test Suite
// Ticket: ${ticket.key} - ${ticket.summary}
// Generated at: ${new Date().toISOString()}
// ====================================================================

import { test, expect } from '@playwright/test';

test.describe('${ticket.key}: ${ticket.summary}', () => {
  test('Execute Acceptance Criteria Verification', async ({ page, baseURL }) => {
${stepsCode}
  });
});
`;
  }
}

export const testGeneratorService = new TestGeneratorService();
