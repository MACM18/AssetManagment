# Theme Toggle System - User Guide

## Overview

The app now features a comprehensive three-option theme system with:

- **Light Mode**: Always uses light theme
- **Dark Mode**: Always uses dark theme
- **System Mode**: Automatically follows your device/browser theme preference

## How to Use

### Accessing the Theme Toggle

Look for the theme icon in the top navigation bar (next to the Sign In button):

- 🌞 Sun icon = Light mode active
- 🌙 Moon icon = Dark mode active
- 🖥️ Monitor icon = System mode active

### Changing the Theme

1. Click on the theme icon in the navigation bar
2. A dropdown menu will appear with three options:
   - **Light** - Forces light mode
   - **Dark** - Forces dark mode
   - **System** - Follows your device settings
3. Click your preferred option
4. The theme will change immediately and be saved for future visits

### System Mode Details

When "System" is selected:

- The app will use your operating system's theme preference
- If you change your OS theme (e.g., from light to dark), the app will automatically update
- This is the default setting if you haven't chosen a preference

## Technical Details

### Theme Persistence

- Your theme preference is saved in browser localStorage
- The setting persists across browser sessions
- Each device/browser maintains its own preference

### No Flash of Unstyled Content (FOUC)

- A small script runs before the page loads to apply the correct theme
- This prevents the brief flash of the wrong theme when loading

### Accessibility

- All theme colors maintain proper contrast ratios
- Focus states are visible in both themes
- Icons update to reflect the current mode

## Troubleshooting

### Theme Not Switching

1. Clear your browser cache and localStorage
2. Refresh the page
3. Try selecting the theme again

### Preference Not Saving

1. Check if your browser allows localStorage
2. Ensure you're not in private/incognito mode
3. Check browser console for any errors

### Wrong Theme on Load

1. Check your system theme settings
2. Try explicitly selecting "Light" or "Dark" instead of "System"
3. Clear browser cache and reload

## Developer Notes

The theme system uses:

- React Context API for state management
- localStorage for persistence
- CSS custom properties (Tailwind v4)
- matchMedia API for system preference detection
- Class-based theme switching (.light / .dark on html element)

Files involved:

- `/src/contexts/ThemeContext.tsx` - Theme state and logic
- `/src/components/ThemeToggle.tsx` - UI dropdown component
- `/src/app/layout.tsx` - FOUC prevention script
- `/src/app/globals.css` - Theme color definitions
