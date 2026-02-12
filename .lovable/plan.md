

## Remove Recent Messages Panel from Dashboard

The **Recent Messages** panel is redundant now that the **Library Overview Panel** provides direct access to saved messages. This change simplifies the dashboard layout.

### Changes

**`src/pages/Index.tsx`**
- Remove the `RecentMessagesPanel` import
- Restructure the grid section that currently holds Recent Messages + InstitutionManagementCard + ContentDNAStatusCard
- Move `InstitutionManagementCard` and `ContentDNAStatusCard` into a simple two-column row instead of the current 2:1 split

**No file deletions** — the `RecentMessagesPanel` component will remain available in case it's needed elsewhere (e.g., a dedicated library page).

### Result
The dashboard flow becomes:

```text
Hero
Scratchpad
Resume Work
Quick Actions
My Drafts
Library Overview (personal + university + collections)
Institution Management | Content DNA Status
Admin Team Overview
Quick Launch Bar
Footer
```

Cleaner, less repetitive, and the Library Overview serves as the single entry point into saved content.

