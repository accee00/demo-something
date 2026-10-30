import { v4 as uuidv4 } from 'uuid';
import { selfHealingService } from './selfHealingService.js';

export class TestRunnerService {
  constructor() {
    this.runs = new Map();
  }

  // Get all past runs
  getAllRuns() {
    return Array.from(this.runs.values()).reverse();
  }

  // Get specific run
  getRun(runId) {
    return this.runs.get(runId);
  }

  // Execute test suite with live WebSocket streaming and autonomous self-healing
  async executeTest({ ticket, script, isRefactored = false, broadcast }) {
    const runId = uuidv4().slice(0, 8);
    const startTime = Date.now();

    const runRecord = {
      runId,
      ticketKey: ticket.key,
      ticketSummary: ticket.summary,
      status: 'RUNNING',
      startTime: new Date().toISOString(),
      durationMs: 0,
      steps: [],
      healed: null,
      script: script,
      healedScript: null,
      patchDiff: null
    };

    this.runs.set(runId, runRecord);

    const emit = (type, payload) => {
      if (typeof broadcast === 'function') {
        broadcast({ type, runId, timestamp: new Date().toISOString(), ...payload });
      }
    };

    emit('RUN_STARTED', { ticketKey: ticket.key, summary: ticket.summary });

    const targetActions = ticket.targetActions || [
      { step: 1, action: 'navigate', path: '/store', description: 'Navigate to store catalog' },
      { step: 2, action: 'click', selector: '#add-to-bag-shoes', description: 'Add Quantum Running Shoes to Bag' },
      { step: 3, action: 'click', selector: '#cart-drawer-trigger', description: 'Open Cart Drawer' },
      { step: 4, action: 'click', selector: '#checkout-btn', description: 'Click Checkout Button' },
      { step: 5, action: 'assertText', selector: '#order-status-msg', expected: 'Order Placed Successfully!', description: 'Verify Order Placed message' }
    ];

    let currentScript = script;
    let runStatus = 'PASSED';

    for (let i = 0; i < targetActions.length; i++) {
      const step = targetActions[i];
      const stepStart = Date.now();

      emit('STEP_STARTED', { step: step.step, description: step.description, selector: step.selector });

      // Artificial short delay for realistic live telemetry visibility (300ms - 500ms)
      await new Promise(r => setTimeout(r, 400));

      // Check if this step encounters a broken locator due to UI refactoring
      // In SHOP-101, Step 4 targets `#checkout-btn`. If `isRefactored` is true, that button was renamed to `#place-order-v2`!
      const isBrokenLocator = isRefactored && step.selector === '#checkout-btn';

      if (isBrokenLocator) {
        const stepDuration = Date.now() - stepStart;
        const errorMsg = `TimeoutError: locator.waitFor: Timeout exceeded. Waiting for selector: "${step.selector}" to be visible.`;
        
        emit('STEP_FAILED', {
          step: step.step,
          description: step.description,
          selector: step.selector,
          error: errorMsg,
          durationMs: stepDuration
        });

        // Current live DOM snapshot of the refactored page
        const domSnapshot = [
          { tag: 'div', id: 'cart-drawer', className: 'drawer-container active', role: 'dialog' },
          { tag: 'h3', className: 'cart-title', text: 'Shopping Bag (1 item)' },
          { tag: 'button', id: 'close-drawer-btn', className: 'btn-secondary', text: 'Continue Shopping' },
          {
            tag: 'button',
            id: 'place-order-v2',
            className: 'btn-primary-checkout-revamp active-pulse',
            text: 'Complete Order & Pay',
            role: 'button',
            ariaLabel: 'Place Order Now'
          },
          { tag: 'span', className: 'cart-total-price', text: '$149.00' }
        ];

        emit('HEALING_STARTED', {
          failedSelector: step.selector,
          step: step.step,
          reason: 'Locator Timeout / DOM Mutation Detected',
          domCandidatesCount: domSnapshot.length
        });

        // Trigger autonomous self-healing engine
        const healingResult = await selfHealingService.healLocator({
          failedSelector: step.selector,
          stepDescription: step.description,
          domSnapshot,
          script: currentScript
        });

        currentScript = healingResult.patchedScript;
        runRecord.healed = {
          originalSelector: step.selector,
          healedSelector: healingResult.healedSelector,
          confidence: healingResult.confidence,
          reason: healingResult.reason
        };
        runRecord.healedScript = healingResult.patchedScript;
        runRecord.patchDiff = healingResult.patchDiff;
        runStatus = 'HEALED';

        emit('HEALING_COMPLETED', {
          originalSelector: step.selector,
          healedSelector: healingResult.healedSelector,
          confidence: healingResult.confidence,
          reason: healingResult.reason,
          patchDiff: healingResult.patchDiff
        });

        // Retrying the step with the healed locator
        await new Promise(r => setTimeout(r, 300));
        emit('STEP_RETRY_PASS', {
          step: step.step,
          healedSelector: healingResult.healedSelector,
          durationMs: 120,
          description: `${step.description} (Auto-Healed via ${healingResult.healedSelector})`
        });

        runRecord.steps.push({
          step: step.step,
          description: `${step.description} [Healed: ${step.selector} -> ${healingResult.healedSelector}]`,
          selector: healingResult.healedSelector,
          status: 'HEALED',
          durationMs: stepDuration + 120
        });

      } else {
        const stepDuration = Date.now() - stepStart;
        emit('STEP_PASSED', {
          step: step.step,
          description: step.description,
          selector: step.selector,
          durationMs: stepDuration
        });

        runRecord.steps.push({
          step: step.step,
          description: step.description,
          selector: step.selector,
          status: 'PASSED',
          durationMs: stepDuration
        });
      }
    }

    runRecord.durationMs = Date.now() - startTime;
    runRecord.status = runStatus;

    emit('RUN_COMPLETED', {
      status: runStatus,
      durationMs: runRecord.durationMs,
      stepsCount: runRecord.steps.length,
      healed: runRecord.healed
    });

    return runRecord;
  }
}

export const testRunnerService = new TestRunnerService();

