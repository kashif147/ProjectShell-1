# Data Refresh Pattern for Insert/Update/Delete Operations

## Overview

All insert, update, and delete operations must refresh data after successful mutations to ensure the UI displays the latest data from the server.

## Problem

Previous implementations had issues where:
1. Data wasn't refreshed after mutations, causing stale UI
2. Refresh was attempted but blocked by Redux condition checks
3. Inconsistent patterns across different operations

## Solution

### Pattern: Reset + Refresh

After any successful mutation (insert/update/delete), we must:
1. **Reset the Redux state** - Clear existing data so condition checks allow refetching
2. **Fetch fresh data** - Call the API to get the latest data

### Helper Functions

Helper functions have been created in `Configuratin.js` that handle reset + refresh:

```javascript
// Refresh lookups
const refreshLookups = () => {
  dispatch(resetLookups());
  dispatch(getAllLookups());
};

// Refresh contacts
const refreshContacts = () => {
  dispatch(resetContacts());
  dispatch(getContacts());
};

// Refresh contact types
const refreshContactTypes = () => {
  dispatch(resetContactTypes());
  dispatch(getContactTypes());
};

// Refresh countries
const refreshCountries = () => {
  dispatch(clearCountriesData());
  dispatch(fetchCountries());
};
```

### Reset Actions Available

The following reset actions are available in Redux slices:

- `resetLookups()` - from `LookupsSlice`
- `resetContacts()` - from `ContactSlice`
- `resetContactTypes()` - from `ContactTypeSlice`
- `clearCountriesData()` - from `CountriesSlice`

### Usage Examples

#### Insert Operation

```javascript
await insertDataFtn(
  `/api/lookup`,
  data,
  "Data inserted successfully",
  "Data did not insert",
  () => {
    // Reset + refresh
    dispatch(resetLookups());
    dispatch(getAllLookups());
    // Or use helper:
    // refreshLookups();
  }
);
```

#### Update Operation

```javascript
await updateFtn(
  `/api/lookup/${id}`,
  data,
  () => {
    // Reset + refresh
    dispatch(resetLookups());
    dispatch(getAllLookups());
    // Or use helper:
    // refreshLookups();
  }
);
```

#### Delete Operation

```javascript
await deleteFtn(
  `/lookup/${id}`,
  null,
  () => {
    // Reset + refresh
    dispatch(resetLookups());
    dispatch(getAllLookups());
    // Or use helper:
    // refreshLookups();
  }
);
```

## Implementation Status

### ✅ Completed

1. **Reset Actions Added:**
   - Added `resetContacts()` to `ContactSlice`
   - All other reset actions already existed

2. **Helper Functions Created:**
   - `refreshLookups()` in `Configuratin.js`
   - `refreshContacts()` in `Configuratin.js`
   - `refreshContactTypes()` in `Configuratin.js`
   - `refreshCountries()` in `Configuratin.js`

3. **Operations Updated:**
   - All delete operations for lookups in `Configuratin.js`
   - Contact operations in `ContactDrawer.jsx`
   - Contact operations in `MyDrawer.jsx`
   - Training insert/update operations in `Configuratin.js`

### 🔄 Remaining Work

There are approximately 100+ insert/update/delete operations across the codebase that need to be updated to follow this pattern:

1. **Configuratin.js** - ~100 operations
2. **MyDrawer.jsx** - Multiple operations
3. **Other components** - Various operations

### How to Update Remaining Operations

For each insert/update/delete operation:

1. **Identify what data is affected** (lookups, contacts, countries, etc.)
2. **Import the reset action** if not already imported
3. **Update the callback** to reset + refresh:

```javascript
// Before
callback: () => dispatch(getAllLookups())

// After
callback: () => {
  dispatch(resetLookups());
  dispatch(getAllLookups());
}
```

Or use the helper function if available:

```javascript
callback: () => refreshLookups()
```

## Best Practices

1. **Always reset before refresh** - This ensures condition checks don't block refetching
2. **Use helper functions when available** - They're consistent and maintainable
3. **Refresh all related data** - If an operation affects multiple data types, refresh all of them
4. **Handle errors gracefully** - Only refresh on successful operations

## Files Modified

- `src/features/ContactSlice.js` - Added `resetContacts` action
- `src/pages/Configuratin.js` - Added helper functions and updated operations
- `src/component/common/ContactDrawer.jsx` - Updated to use reset + refresh
- `src/component/common/MyDrawer.jsx` - Updated to use reset + refresh

## Notes

- The reset actions clear the state immediately, allowing the condition checks in async thunks to permit refetching
- This pattern ensures data consistency across the application
- All operations should follow this pattern going forward

