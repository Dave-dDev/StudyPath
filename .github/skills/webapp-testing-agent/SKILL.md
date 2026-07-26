---
name: webapp-testing-agent
description: "Workspace skill for automated web application QA. Use when you need a structured testing workflow covering functional behavior, UI/UX, performance, and security for browser-based apps."
---

# WebApp Testing Agent

## Purpose

The WebApp Testing Agent helps you verify web application quality through a guided testing workflow. It supports functional validation, visual and accessibility checks, performance measurement, and security review across browsers and viewport sizes.

## Supported testing areas

- Functional Testing
  - Form validation, field workflows, dropdowns, checkboxes, radio buttons
  - Navigation and routing, internal/external link validation, redirects
  - CRUD scenario execution and data consistency checks
  - API integration and backend synchronization validation

- UI/UX Testing
  - Responsive design checks for mobile, tablet, and desktop
  - Visual regression and baseline comparison guidance
  - Accessibility review for WCAG 2.1, ARIA support, keyboard navigation
  - Cross-browser compatibility analysis for Chrome, Firefox, Safari, Edge

- Performance Testing
  - Page load diagnostics including TTFB and FCP
  - Resource optimization recommendations for large images, JS/CSS, and render-blocking assets
  - Stress/load testing guidance for concurrent users
  - Network throttling scenarios for slow 3G, 4G, and offline states

- Security Testing
  - Input sanitization checks for XSS, SQL injection, and command injection vectors
  - Authentication and session handling validation, including token and MFA flows
  - Authorization review for role-based access control and data exposure
  - Sensitive data exposure checks in responses, storage, and debug output

## Prerequisites

- Node >= 18.x
- npm or yarn
- Playwright
- Cypress
- Jest
- Lighthouse
- OWASP ZAP

## Workflow

1. Understand the application context
   - Identify the target environment, entry URLs, auth flows, and user roles.
2. Choose the testing focus
   - Functional, UI/UX, performance, security, or a combined audit.
3. Generate test scenarios or scripts
   - Produce concrete test plans, Playwright/Cypress examples, or Lighthouse commands.
4. Execute and collect results
   - Run tests, capture failures, and identify issues.
5. Recommend fixes
   - Provide remediation steps, severity classification, and regression prevention guidance.

## Use cases

- Validate login, signup, search, and checkout flows.
- Audit page performance and identify slow assets.
- Review responsive layout behavior across breakpoints.
- Inspect API endpoints for missing validation or unsafe responses.
- Generate accessibility checks and keyboard navigation tests.

## Example prompts

- `/skill webapp-testing-agent Run a functional and accessibility audit on the dashboard page.`
- `/skill webapp-testing-agent Generate Playwright tests for the signup and login flow.`
- `/skill webapp-testing-agent Review the app for performance issues and recommend Lighthouse checks.`
- `/skill webapp-testing-agent Identify potential security issues in the authentication and profile management flows.`

## Notes

- If automation tools are not installed, the agent should still provide an actionable test plan and sample commands.
- When baseline screenshots or metrics are unavailable, the agent should recommend an initial baseline and describe how to capture it.
