

# Rebrand Super Admin Tenant for Demo Purposes

## Goal
Transform the "Southern Gateway University" tenant into a clean "CampusVoice" admin/demo tenant, keeping all existing data (Iowa profiles, DNA, drafts, templates) intact while removing the SGU branding. No other tenants are touched.

## Current State

| Item | Details |
|------|---------|
| Tenant name | Southern Gateway University |
| Tenant ID | c839f165-... |
| Your account | Tyler Gayheart (super_admin + admin) |
| Profiles | Southern Gateway University (root), International Center (sub-unit), The University of Iowa (root) |
| Content DNA | SGU profile (1 sample), Iowa profile (7 samples) |
| Other data | 7 shared templates, 38 drafts, 6 collections, 1776 usage events |

## What Changes

### 1. Rename the Tenant
- Update `tenants.institution_name` from "Southern Gateway University" to **"CampusVoice"**
- Optionally update colors to CampusVoice brand colors and swap the logo

### 2. Rebrand the SGU Profile as a Demo Profile
- Rename the "Southern Gateway University" institutional profile to **"Demo University"** (or delete it if you prefer)
- Rename its sub-unit "International Center" to **"Demo - International Center"** (or delete)
- This preserves the 1 DNA sample attached to it

### 3. Keep Iowa Untouched
- "The University of Iowa" profile stays exactly as-is with all 7 DNA samples and analysis
- Perfect for demos showing real Content DNA in action

### 4. Clean Up Other Users on the Tenant
- Heath Price and John Smith are both "invited" status users under this tenant
- Option to remove them if they were test accounts, or leave them as demo users

### 5. Update Hardcoded References (Code)
- Two files reference "Southern Gateway University" in showcase/marketing components (`BuilderStepsShowcase.tsx` and `MultiLevelProfileShowcase.tsx`)
- Update these to use "Demo University" or a generic name so the landing page doesn't reference SGU

### 6. UI Label for Super Admin
- The top bar and sidebar already show the tenant name dynamically
- Once renamed to "CampusVoice", your header will show "CampusVoice" instead of "Southern Gateway University"
- No code changes needed for this -- it reads from the database

## What Does NOT Change
- Ohio State University tenant and all its data
- University of Vermont tenant and all its data
- USC Upstate tenant and all its data
- University of Kentucky tenant and all its data
- McFadden + Co (agency) tenant and all its data
- Hard Knocks University tenant

## Implementation Steps

1. **Database update** -- Rename tenant to "CampusVoice"
2. **Database update** -- Rename SGU institutional profile to "Demo University" (and sub-unit)
3. **Code update** -- Update 2 showcase components to remove "Southern Gateway University" references
4. **Optional** -- Upload a CampusVoice logo to replace the SGU logo on the tenant
5. **Optional** -- Update tenant brand colors to CampusVoice colors
6. **Optional** -- Remove or reassign the two invited test users (Heath Price, John Smith)

## Technical Details

- All changes are data updates (UPDATE statements) on the `tenants` and `institutional_profiles` tables -- no schema migrations needed
- The 2 code files with hardcoded "Southern Gateway University" are landing page showcase components, not functional logic
- All existing drafts, templates, collections, DNA samples, and usage events remain linked by tenant_id and profile_id -- renaming does not break any references

