import express from 'express';
import { jiraService } from '../services/jiraService.js';
import { testGeneratorService } from '../services/testGeneratorService.js';
import { testRunnerService } from '../services/testRunnerService.js';

export function createTestRouter(broadcast) {
  const router = express.Router();

  // List all sample tickets
  router.get('/tickets', (req, res) => {
    try {
      const tickets = jiraService.listSampleTickets();
      res.json({ success: true, tickets });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get specific ticket by key
  router.get('/tickets/:key', async (req, res) => {
    try {
      const ticket = await jiraService.getTicket(req.params.key);
      res.json({ success: true, ticket });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Generate Playwright test code from acceptance criteria
  router.post('/generate', async (req, res) => {
    try {
      const { ticket } = req.body;
      if (!ticket) {
        return res.status(400).json({ success: false, error: 'Ticket is required' });
      }
      const generated = await testGeneratorService.generateTest(ticket);
      res.json({ success: true, ...generated });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Execute test suite (triggers autonomous self-healing if locators mismatch)
  router.post('/execute', async (req, res) => {
    try {
      const { ticket, script, isRefactored } = req.body;
      if (!ticket || !script) {
        return res.status(400).json({ success: false, error: 'Ticket and script are required' });
      }

      // Execute asynchronously while streaming progress via WebSocket
      const result = await testRunnerService.executeTest({
        ticket,
        script,
        isRefactored: Boolean(isRefactored),
        broadcast
      });

      res.json({ success: true, run: result });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // List run history
  router.get('/runs', (req, res) => {
    res.json({ success: true, runs: testRunnerService.getAllRuns() });
  });

  // Get run by ID
  router.get('/runs/:id', (req, res) => {
    const run = testRunnerService.getRun(req.params.id);
    if (!run) {
      return res.status(404).json({ success: false, error: 'Run not found' });
    }
    res.json({ success: true, run });
  });

  // Post test run results to Jira
  router.post('/jira/sync', async (req, res) => {
    try {
      const { issueKey, runSummary } = req.body;
      if (!issueKey || !runSummary) {
        return res.status(400).json({ success: false, error: 'issueKey and runSummary required' });
      }
      const syncResult = await jiraService.postTestResultComment(issueKey, runSummary);
      res.json({ success: true, result: syncResult });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
}

