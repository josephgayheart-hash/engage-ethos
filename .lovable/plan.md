

# Keeping Users Flowing Back to the Dashboard

## The Problem

Right now, when a user finishes building a message, evaluating content, or designing a journey, they hit a dead end. The tool shows results, they copy or save, and then... they're stuck staring at the page. There's no nudge back to the dashboard, no suggestion of what to do next, and no sense of momentum. Breadcrumbs help them navigate *up*, but they don't create a *forward* pull.

## Proposed Patterns (Beyond Breadcrumbs)

### 1. "What's Next?" Action Bar on Tool Completion

After a user completes a task (generates a message, finishes an evaluation, saves a journey), show a contextual action bar at the bottom of the results:

```text
+---------------------------------------------------+
| Message saved to library                          |
|                                                   |
| [Evaluate This Message]  [Build Another]  [Home]  |
+---------------------------------------------------+
```

The suggestions are contextual:
- After **Build**: "Evaluate this message" | "Build another" | "Back to Command Center"
- After **Evaluate**: "Edit in Builder" | "Save to Library" | "Back to Command Center"
- After **Strategy/Journey**: "Build a message for this stage" | "Back to Command Center"

This creates a **loop** -- Build leads to Evaluate leads to Library leads back to Dashboard.

**Implementation**: Create a reusable `NextStepsBar` component rendered at the bottom of `BuilderResults`, `EvaluationResults`, and the Journey Designer output. Each tool passes its own set of contextual next actions.

### 2. Persistent "Home" Floating Action Button (Mobile + Desktop)

A small, unobtrusive floating button in the bottom-left corner that always takes you back to the dashboard. Not a full FAB -- just a subtle home icon that pulses gently when you've been on a tool page for more than 60 seconds without action. Think of it as a gentle "you can come back" reminder.

**Implementation**: A `HomeBeacon` component added to the app layout (in `App.tsx`), only visible on authenticated tool pages (not on the dashboard itself, not on landing/login).

### 3. Dashboard "Resume Where You Left Off" Card

When a user returns to the dashboard, show a card acknowledging what they just did and suggesting the logical next step:

```text
+---------------------------------------------------+
| Welcome back! You just built a message for        |
| Prospective Students.                             |
|                                                   |
| [Evaluate It]  [View in Library]  [Build Another] |
+---------------------------------------------------+
```

This uses the existing `tool_usage_events` table to detect the user's last action and surface it as a personalized prompt.

**Implementation**: A `ResumeWorkCard` component on the dashboard that queries the user's most recent `tool_usage_events` entry and renders a contextual suggestion. This replaces the static workflow grid with something dynamic and personal.

### 4. Breadcrumb "Sibling" Navigation

Enhance the existing breadcrumbs to show not just the path back, but also sibling tools. When you're on `/build`, the breadcrumb area could show:

```text
Home > Build     [also: Evaluate | Strategy | Library]
```

This creates lateral movement between tools without requiring a trip back to the dashboard, while still keeping the dashboard as the anchor point.

**Implementation**: Extend the `FeatureBreadcrumbs` component to accept an optional `siblings` prop -- an array of related tool links shown inline after the breadcrumb trail.

### 5. Session Progress Indicator

A subtle progress indicator in the header that shows "today's session" -- how many messages built, evaluations run, journeys created. It gamifies the workflow lightly and makes the dashboard feel like a scorecard:

```text
[Home icon]  Today: 3 messages | 1 evaluation | 0 journeys
```

Clicking any stat takes you to the relevant section. This lives in the header and updates in real-time as the user works.

**Implementation**: A `SessionProgress` component in the header area, querying `tool_usage_events` for today's activity. Only shown for authenticated users on tool pages.

---

## Recommended Priority

| Pattern | Effort | Impact | Priority |
|---------|--------|--------|----------|
| "What's Next?" Action Bar | Low | High | Phase 1 |
| Dashboard "Resume" Card | Medium | High | Phase 1 |
| Breadcrumb Siblings | Low | Medium | Phase 2 |
| Session Progress Indicator | Medium | Medium | Phase 2 |
| Home Beacon FAB | Low | Low | Phase 3 |

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/NextStepsBar.tsx` | Contextual action bar shown after task completion |
| `src/components/dashboard/ResumeWorkCard.tsx` | Personalized "pick up where you left off" card |
| `src/components/SessionProgress.tsx` | Header session stats indicator |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/BuilderResults.tsx` | Add NextStepsBar after results |
| `src/components/EvaluationResults.tsx` | Add NextStepsBar after results |
| `src/pages/StrategyPage.tsx` | Add NextStepsBar after journey completion |
| `src/components/FeatureBreadcrumbs.tsx` | Add optional sibling nav links |
| `src/pages/Index.tsx` | Add ResumeWorkCard to dashboard layout |
| `src/components/Header.tsx` | Add SessionProgress component |

## Design Principles

- Every tool endpoint should answer "what now?" -- never leave users at a dead end
- The dashboard is gravity -- all paths eventually pull back to it
- Forward motion over backward motion -- suggest the next logical step, not just "go back"
- Lightweight and non-intrusive -- suggestions, not pop-ups

