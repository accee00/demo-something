import axios from 'axios';

// Built-in realistic mock ticket bank for offline / zero-setup hackathon evaluation
const MOCK_TICKETS = [
  {
    key: 'SHOP-101',
    summary: 'E-Commerce Checkout Flow: Add to bag and complete checkout',
    issueType: 'Story',
    priority: 'High',
    status: 'Ready for QA',
    assignee: 'Alex Chen',
    acceptanceCriteria: [
      'AC-1: Given user is on the store catalog, when they select "Quantum Running Shoes", then item details and price are visible.',
      'AC-2: Given an item is selected, when user clicks "Add to Bag", then cart counter increments to 1.',
      'AC-3: Given item is in cart, when user clicks "Checkout" (#checkout-btn), then order confirmation modal appears with "Order Placed Successfully!".'
    ],
    targetPath: '/store',
    targetActions: [
      { step: 1, action: 'navigate', path: '/store', description: 'Navigate to store catalog' },
      { step: 2, action: 'click', selector: '#add-to-bag-shoes', description: 'Add Quantum Running Shoes to Bag' },
      { step: 3, action: 'click', selector: '#cart-drawer-trigger', description: 'Open Cart Drawer' },
      { step: 4, action: 'click', selector: '#checkout-btn', description: 'Click Checkout Button' },
      { step: 5, action: 'assertText', selector: '#order-status-msg', expected: 'Order Placed Successfully!', description: 'Verify Order Placed message' }
    ]
  },
  {
    key: 'AUTH-202',
    summary: 'User Authentication: Sign in with valid email and password',
    issueType: 'Story',
    priority: 'Critical',
    status: 'In Review',
    assignee: 'Sarah Miller',
    acceptanceCriteria: [
      'AC-1: Given user on login page, when they enter valid email and password, then submit button is enabled.',
      'AC-2: Given valid credentials, when user clicks "Sign In" (#login-submit-btn), then redirected to dashboard with greeting.'
    ],
    targetPath: '/login',
    targetActions: [
      { step: 1, action: 'navigate', path: '/login', description: 'Navigate to Login screen' },
      { step: 2, action: 'fill', selector: '#input-email', value: 'qa.engineer@sentinel.ai', description: 'Enter email address' },
      { step: 3, action: 'fill', selector: '#input-password', value: 'SentinelQA#2026', description: 'Enter password' },
      { step: 4, action: 'click', selector: '#login-submit-btn', description: 'Click Sign In Button' },
      { step: 5, action: 'assertVisible', selector: '#dashboard-welcome-banner', description: 'Verify Dashboard Welcome banner' }
    ]
  },
  {
    key: 'TODO-303',
    summary: 'Task Management: Create and filter high-priority tasks',
    issueType: 'Story',
    priority: 'Medium',
    status: 'Ready for Test',
    assignee: 'Dev Team',
    acceptanceCriteria: [
      'AC-1: Given task manager view, when user enters "Refactor Playwright Locators" and submits, then task appears in list.',
      'AC-2: Given new task, when user marks it complete, then strike-through styling applies.'
    ],
    targetPath: '/todos',
    targetActions: [
      { step: 1, action: 'navigate', path: '/todos', description: 'Navigate to Tasks' },
      { step: 2, action: 'fill', selector: '#new-task-input', value: 'Audit Test Locators', description: 'Enter task title' },
      { step: 3, action: 'click', selector: '#add-task-btn', description: 'Click Add Task' },
      { step: 4, action: 'click', selector: '#toggle-task-0', description: 'Mark Task Completed' },
      { step: 5, action: 'assertVisible', selector: '.task-item.completed', description: 'Verify Completed status' }
    ]
  }
];

export class JiraService {
  constructor() {
    this.host = process.env.JIRA_HOST || '';
    this.email = process.env.JIRA_EMAIL || '';
    this.token = process.env.JIRA_API_TOKEN || '';
    this.isConfigured = Boolean(this.host && this.email && this.token);
  }

  // Get list of mock / cached tickets
  listSampleTickets() {
    return MOCK_TICKETS.map(t => ({
      key: t.key,
      summary: t.summary,
      priority: t.priority,
      status: t.status,
      issueType: t.issueType,
      assignee: t.assignee,
      acceptanceCriteriaCount: t.acceptanceCriteria.length
    }));
  }

  // Fetch ticket details by Key (either from live Jira or mock store)
  async getTicket(issueKey) {
    // Check mock store first
    const mock = MOCK_TICKETS.find(t => t.key.toUpperCase() === issueKey.toUpperCase());
    
    // If live Jira is configured, attempt fetch with graceful fallback
    if (this.isConfigured) {
      try {
        const auth = Buffer.from(`${this.email}:${this.token}`).toString('base64');
        const url = `https://${this.host}/rest/api/3/issue/${issueKey}`;
        const response = await axios.get(url, {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json'
          },
          timeout: 5000
        });

        const data = response.data;
        const fields = data.fields || {};
        
        // Parse description or custom acceptance criteria fields
        const rawDescription = fields.description?.content 
          ? fields.description.content.map(p => p.content?.map(c => c.text).join('')).join('\n')
          : (typeof fields.description === 'string' ? fields.description : '');

        const criteriaLines = rawDescription
          .split('\n')
          .filter(line => line.toLowerCase().includes('given') || line.toLowerCase().includes('when') || line.toLowerCase().includes('ac-'));

        return {
          key: data.key,
          summary: fields.summary,
          priority: fields.priority?.name || 'Medium',
          status: fields.status?.name || 'In Progress',
          issueType: fields.issuetype?.name || 'Story',
          assignee: fields.assignee?.displayName || 'Unassigned',
          acceptanceCriteria: criteriaLines.length > 0 ? criteriaLines : [rawDescription],
          targetPath: mock?.targetPath || '/store',
          targetActions: mock?.targetActions || []
        };
      } catch (err) {
        console.warn(`[JiraService] Live fetch failed for ${issueKey}. Falling back to mock store. Reason: ${err.message}`);
      }
    }

    if (mock) {
      return mock;
    }

    // Default synthesized ticket if unknown key entered
    return {
      key: issueKey.toUpperCase(),
      summary: `Feature verification for ${issueKey}`,
      priority: 'High',
      status: 'Ready for Test',
      assignee: 'QA Engineer',
      acceptanceCriteria: [
        `AC-1: Given target page for ${issueKey}, verify elements load without error.`,
        `AC-2: When primary interaction is triggered, verify success state.`
      ],
      targetPath: '/store',
      targetActions: MOCK_TICKETS[0].targetActions
    };
  }

  // Post test run results and self-healed diff back to Jira
  async postTestResultComment(issueKey, runSummary) {
    const commentBody = `
h3. 🛡️ SentinelQA Test Execution Report
*Run ID:* \`${runSummary.runId}\`
*Status:* ${runSummary.status === 'HEALED' ? '🟢 PASSED (SELF-HEALED)' : runSummary.status === 'PASSED' ? '🟢 PASSED' : '🔴 FAILED'}
*Duration:* ${runSummary.durationMs}ms
*Total Steps:* ${runSummary.stepsCount}

${runSummary.healed ? `
h4. ⚡ Autonomous Self-Healing Audit Trail
*Broken Locator:* \`${runSummary.healed.originalSelector}\`
*Healed Locator:* \`${runSummary.healed.healedSelector}\`
*Confidence Score:* ${(runSummary.healed.confidence * 100).toFixed(1)}%
*Reasoning:* ${runSummary.healed.reason}
` : ''}

_Generated autonomously by SentinelQA AIOps Harness._
    `.trim();

    if (this.isConfigured) {
      try {
        const auth = Buffer.from(`${this.email}:${this.token}`).toString('base64');
        const url = `https://${this.host}/rest/api/3/issue/${issueKey}/comment`;
        await axios.post(url, { body: commentBody }, {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        });
        return { success: true, target: 'live_jira', comment: commentBody };
      } catch (err) {
        console.warn(`[JiraService] Failed to post comment to live Jira: ${err.message}`);
      }
    }

    // Mock response
    return { success: true, target: 'mock_jira', comment: commentBody };
  }
}

export const jiraService = new JiraService();

