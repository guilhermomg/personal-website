# Save Button & Toast Implementation

This document describes the implementation of loading states for save buttons and toast notifications in the admin forms.

## Overview

All admin forms now have:
1. **SaveButton Component**: A reusable React component that shows a loading spinner when processing
2. **Toast Component**: A dismissible notification that appears in the top-right corner
3. **Disabled state management**: Cancel and other action buttons are disabled during form submission

## Components Created

### 1. SaveButton Component (`src/components/SaveButton.tsx`)

A React component that:
- Shows a loading spinner and "Saving..." text when processing
- Disables itself during the loading state
- Responds to custom events (`{id}-loading-start` and `{id}-loading-end`)
- Maintains consistent styling with the rest of the application

**Usage:**
```tsx
<SaveButton id="save-btn" client:load>
    Save Article
</SaveButton>
```

### 2. Toast Component (`src/components/Toast.tsx`)

A React component that:
- Displays success (green) or error (red) notifications
- Appears in the top-right corner with slide-in animation
- Auto-dismisses after 5 seconds
- Has a close button (X) for manual dismissal
- Uses Lucide icons for visual feedback

**Usage:**
```tsx
<Toast client:load />
```

**Triggering a toast:**
```javascript
window.dispatchEvent(
    new CustomEvent("show-toast", {
        detail: {
            message: "Changes saved successfully!",
            type: "success",  // or "error"
        },
    }),
);
```

## Updated Admin Forms

All the following forms have been updated:

### Articles
- ✅ `src/pages/admin/articles/new.astro`
- ✅ `src/pages/admin/articles/[id]/edit.astro`

### Experiences
- ✅ `src/pages/admin/experiences/new.astro`
- ✅ `src/pages/admin/experiences/[id]/edit.astro`

### Skills
- ✅ `src/pages/admin/skills/new.astro`
- ✅ `src/pages/admin/skills/[id]/edit.astro`

### Projects
- ✅ `src/pages/admin/projects/new.astro`
- ✅ `src/pages/admin/projects/[id]/edit.astro`

### Personal Info
- ✅ `src/pages/admin/personal-info/edit.astro`

## Changes Made to Each Form

### 1. Imports Added
```astro
import SaveButton from "../../../components/SaveButton";
import Toast from "../../../components/Toast";
```

### 2. Button Replaced
**Before:**
```html
<button
    type="submit"
    id="save-btn"
    class="px-6 py-2 bg-primary-600 text-white..."
>
    Save Article
</button>
```

**After:**
```html
<SaveButton id="save-btn" client:load>
    Save Article
</SaveButton>
```

### 3. Cancel Button Updated
Added `id="cancel-btn"` to the cancel link for disabling during submission.

### 4. Old Message Divs Removed
Removed the inline error-message and success-message divs that were previously used.

### 5. Toast Component Added
```html
<Toast client:load />
```

### 6. Script Updates

**Form submission handler updated:**
```javascript
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const cancelBtn = document.getElementById("cancel-btn");
    
    // Start loading state
    window.dispatchEvent(new Event("save-btn-loading-start"));
    
    // Disable cancel button
    if (cancelBtn) {
        cancelBtn.classList.add("pointer-events-none", "opacity-50");
    }
    
    try {
        // ... form submission logic ...
        
        // Show success toast
        window.dispatchEvent(
            new CustomEvent("show-toast", {
                detail: {
                    message: "Article created successfully! Redirecting...",
                    type: "success",
                },
            }),
        );
        
        // Redirect after 1.5s
        setTimeout(() => {
            window.location.href = "/admin/dashboard";
        }, 1500);
    } catch (err) {
        // Show error toast
        window.dispatchEvent(
            new CustomEvent("show-toast", {
                detail: {
                    message: err.message || "Failed to save",
                    type: "error",
                },
            }),
        );
        
        // Stop loading state
        window.dispatchEvent(new Event("save-btn-loading-end"));
        
        // Re-enable cancel button
        if (cancelBtn) {
            cancelBtn.classList.remove("pointer-events-none", "opacity-50");
        }
    }
});
```

**Alert calls replaced with toasts:**
```javascript
// Before:
alert("Error: Something went wrong");

// After:
window.dispatchEvent(
    new CustomEvent("show-toast", {
        detail: {
            message: "Error: Something went wrong",
            type: "error",
        },
    }),
);
```

## Benefits

1. **Better UX**: Users now see clear visual feedback when forms are being saved
2. **Prevents duplicate submissions**: The save button is disabled during processing
3. **Consistent notifications**: All success/error messages use the same toast system
4. **Dismissible messages**: Users can close notifications or wait for auto-dismiss
5. **Accessible**: All buttons maintain proper disabled states and aria-labels

## Testing

The build has been tested and successfully compiles:
```bash
npm run build
```

All components integrate properly with Astro's client-side hydration using the `client:load` directive.
