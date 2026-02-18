# MediCall AI - Project Prompts

## What the project IS

A **medical call management and analytics dashboard** for healthcare facilities (clinics, doctor's offices) built with React 19 + TypeScript + Vite + Tailwind CSS. It manages incoming patient calls, tracks urgency/symptoms, provides analytics, and supports German (Austrian) localization. The backend API runs at `localhost:8000/api`.

**Key features:** Dashboard with KPIs, call list with filtering/search/pagination, call detail modal with notes & callback tracking, analytics page with charts & PDF export, responsive sidebar layout.

---

## Estimated Original Prompt

```
Erstelle ein React-Frontend für eine medizinische Anrufverwaltung ("MediCall AI").

Tech Stack: React + TypeScript + Vite + Tailwind CSS + Lucide Icons.

Die App soll folgende Seiten haben:

1. Dashboard - Übersichtskarten (heutige Anrufe, dringende Anrufe, durchschnittliche
   Dauer, Monatsanrufe) und eine Liste der letzten Anrufe mit Statusanzeige.

2. Anrufe-Seite - Tabelle aller Anrufe mit Suche, Filtern (Status, Dringlichkeit),
   Paginierung und Aktionen (als gelesen markieren, löschen).

3. Analytics-Seite - KPI-Karten, 7-Tage-Trend-Diagramm, Dringlichkeitsverteilung,
   Top-Symptome-Analyse, PDF-Export.

4. Anrufdetail-Modal - Patienteninfo, Zusammenfassung, Symptome, Notizen (bearbeitbar),
   Rückruf-Tracking, Statusverwaltung.

Layout: Sidebar-Navigation + TopBar mit Suche und Benachrichtigungen.
Sprache: Deutsch (Österreich).

Backend API läuft auf localhost:8000/api mit Endpunkten für:
- /calls (CRUD + Filter)
- /calls/{id}/status, /notes, /callback (PATCH)
- /stats, /stats/daily, /stats/urgency, /stats/symptoms
- /stats/export/pdf

Verwende Custom Hooks für Datenabruf, eine API-Abstraktionsschicht, und
camelCase-Transformation der snake_case API-Antworten.

Farbpalette: Beige (#F5F1E8), Mint (#A8D5BA), Blau (#7FB3D5), Coral (#F4A8A0),
mit sanftem, medizinischem Design.
```

---

## Upgraded Prompt (send this to Claude)

```markdown
# MediCall AI - Medical Call Management Dashboard (Frontend Upgrade)

## Project Overview
Build an upgraded React frontend for "MediCall AI", a medical call management and
analytics dashboard for healthcare facilities (clinics, doctor's offices) in Austria.
The app helps staff manage incoming patient calls, track urgency levels and symptoms,
handle callbacks, and gain analytics insights.

## Existing Tech Stack (keep these)
- React 19 + TypeScript (strict mode)
- Vite as build tool
- Tailwind CSS for styling
- Lucide React for icons
- clsx for conditional classes

## Backend API
Base URL: `http://localhost:8000/api` (make this configurable via environment variable
`VITE_API_BASE_URL` with localhost as default).

### Endpoints (already exist, do not change):
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/calls` | GET | Fetch calls (query params: urgency, status, search, skip, limit) |
| `/calls/{id}` | GET | Single call detail |
| `/calls` | POST | Create new call |
| `/calls/{id}` | PUT | Update call |
| `/calls/{id}` | DELETE | Delete call |
| `/calls/{id}/status` | PATCH | Toggle read/unread |
| `/calls/{id}/notes` | PATCH | Update notes |
| `/calls/{id}/callback` | PATCH | Mark callback completed/pending |
| `/stats` | GET | Dashboard stats (today_calls, urgent_calls, avg_duration, etc.) |
| `/stats/daily?days=7` | GET | Daily call counts for trend chart |
| `/stats/urgency` | GET | Urgency distribution |
| `/stats/symptoms?limit=10` | GET | Top symptoms |
| `/stats/export/pdf` | GET | Download PDF report |

### Data Model (snake_case from API, transform to camelCase in frontend):
```typescript
interface Call {
  id: number
  name: string
  phone: string
  urgency: 'high' | 'medium' | 'low'
  time: string // ISO datetime
  duration: string
  summary: string
  status: 'unread' | 'read'
  symptoms: string[]
  callback_requested: boolean
  callback_completed: boolean
  callback_completed_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}
```

## Language & Localization
- All UI text in **German (Austria / de-AT)**
- Date formatting: Austrian German locale with "Heute"/"Gestern" relative labels
- Use a centralized translations object or constants file for all UI strings
  (makes future i18n easier)

## Design System & Color Palette
Keep the existing soft, healthcare-friendly aesthetic:

| Token | Hex | Usage |
|-------|-----|-------|
| primary-beige | #F5F1E8 | Backgrounds |
| primary-mint | #A8D5BA | Primary actions, success |
| primary-blue | #7FB3D5 | Secondary actions, info |
| soft-coral | #F4A8A0 | Accents, symptom tags |
| light-gray | #E8E8E8 | Borders |
| medium-gray | #B0B0B0 | Secondary text |
| dark-gray | #4A4A4A | Primary text |
| success-green | #88C97B | Positive trends |
| warning-orange | #FFB74D | Medium urgency |
| error-red | #EF5350 | High urgency, errors |

Design principles: Rounded corners, subtle shadows, clear visual hierarchy, generous
whitespace, accessible contrast ratios.

## Pages & Features

### 1. Dashboard (/)
- **4 KPI stat cards**: Today's calls (with trend vs yesterday), urgent calls
  (with unhandled count), average duration (with comparison), total monthly calls
- **Recent calls list** with urgency color badges, unread indicator dots, and
  click-to-open detail
- **Quick action buttons** on each call card (mark read, request callback)

### 2. Calls Page (/calls)
- **Full table view** of all calls with columns: Name, Phone, Urgency, Time,
  Duration, Status, Actions
- **Search bar** with 300ms debounce (searches name and phone)
- **Filter dropdowns**: Status (All/Unread/Read), Urgency (All/High/Medium/Low)
- **Pagination** with page size of 10
- **Row click** opens detail modal
- **Action dropdown** per row: mark as read, delete (with confirmation)

### 3. Analytics Page (/analytics)
- **4 KPI cards**: Monthly total, avg duration, % urgent, unhandled urgent
- **7-day trend bar chart** (build with CSS/SVG, no chart library needed)
- **Urgency distribution** as progress bars + visual pie/donut chart
- **Top 5 symptoms** ranked list with frequency counts
- **PDF export button** (calls /stats/export/pdf and triggers download)

### 4. Settings Page (/settings)
- Placeholder page for now with a "Einstellungen - Bald verfügbar" message

### 5. Call Detail Modal (opened from Dashboard or Calls page)
- Patient name, phone, urgency badge
- Call time and duration
- Read/unread status toggle
- AI-generated call summary
- Symptoms as colored tags
- Editable notes field with auto-save indicator (debounced save)
- Callback section: shows if requested, button to mark completed with timestamp
- Delete button with confirmation dialog
- Close on Escape key or backdrop click

### Layout
- **Sidebar**: Logo, nav links (Dashboard, Anrufe, Analytics, Einstellungen),
  active page highlight, version number at bottom. Collapsible on mobile as
  slide-out overlay with backdrop.
- **TopBar**: App title, search input (hidden on mobile), notification bell with
  unread count badge, user avatar with name "Dr. Sarah Weber"

## Architecture Requirements

### File Structure:
```
src/
├── api/           # Generic HTTP client + typed endpoint modules
├── components/    # Reusable UI components (Layout, CallCard, StatCard, etc.)
├── pages/         # Page-level components
├── hooks/         # Custom data-fetching hooks
├── types/         # TypeScript interfaces and types
├── utils/         # Helpers (date formatting, data transforms)
├── constants/     # UI strings, config values
└── index.css      # Tailwind directives + custom styles
```

### Patterns to follow:
- **Custom hooks** for all data fetching (useCalls, useStats, useDailyStats,
  useUrgencyStats, useSymptomStats)
- **API abstraction layer** with generic fetch wrapper, error handling, and
  query string builder
- **snake_case to camelCase** transform layer between API and frontend
- **No external state management** (React hooks + context if needed)
- **No chart libraries** - build simple charts with CSS/Tailwind/SVG

## Improvements to Make (over the existing version)

### Must-have upgrades:
1. **Environment variable for API URL** - Use `VITE_API_BASE_URL` instead of
   hardcoded localhost
2. **Error boundaries** - Add React error boundary component wrapping each page
3. **Toast notifications** - Show success/error toasts for actions (mark read,
   delete, save notes, callback completed) instead of silent updates
4. **Loading skeletons** - Replace plain "Laden..." text with skeleton placeholder
   components that match the layout
5. **Empty states** - Design proper empty state illustrations/messages for when
   there are no calls or no search results
6. **Delete confirmation dialog** - Proper modal confirmation before deleting calls
7. **Retry on API failure** - Show error state with "Erneut versuchen" button
8. **Accessibility** - Add proper ARIA labels, roles, focus management in modals,
   keyboard navigation for dropdowns and table rows
9. **Responsive polish** - Ensure all pages work well on mobile (320px+), tablet,
   and desktop
10. **Optimistic updates** - When toggling read/callback status, update UI
    immediately and revert on API failure

### Nice-to-have upgrades:
1. **Auto-refresh** - Poll for new calls every 30 seconds on Dashboard
   (with visual indicator)
2. **Bulk actions** on Calls page - Select multiple calls to mark as read or delete
3. **Sort columns** in calls table (by time, urgency, name)
4. **Date range filter** on Calls and Analytics pages
5. **Animations** - Subtle enter/exit transitions on modals, toasts, and list items
   using CSS transitions
6. **Dark mode toggle** - Respect system preference with manual override
7. **Sound notification** for new urgent calls (optional, with toggle)

## What NOT to do:
- Do not add authentication (backend handles this separately)
- Do not add a chart library (build charts with CSS/SVG)
- Do not change the API endpoints or data model
- Do not add a router library if not already present (use simple state-based
  routing if that's the current approach, or add react-router if beneficial)
- Do not over-engineer - keep it practical for a small medical practice
```

---

## How to Use

1. Copy the **Upgraded Prompt** section above
2. Paste it into a new Claude conversation
3. Claude will generate the improved frontend based on the existing architecture
   with all the upgrades listed

The upgraded prompt preserves everything that works in the current project while
adding proper error handling, accessibility, better UX patterns (toasts, skeletons,
empty states, confirmations), and configuration improvements.
