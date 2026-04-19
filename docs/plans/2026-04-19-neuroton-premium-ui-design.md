# NeuroTON Premium UI/UX Redesign (Glassmorphism)

## Overview
This document outlines the architectural and aesthetic approach for transforming the NeuroTON Telegram Mini-App into a high-end, premium "$1M feel" experience. The chosen visual direction is **Sleek Apple-like Glassmorphism**.

## Core Aesthetic Principles
1. **Glassmorphism Layering:** Heavy use of `backdrop-blur-2xl` with highly transparent background fills (`bg-white/5`) and delicate borders (`border-white/10`) to simulate frosted glass over depth.
2. **Dynamic Depth:** Replacing the flat dark void with a shifting, fluid mesh background gradient that breathes life into the app silently.
3. **Typography:** Minimalist, highly organized sans-serif layouts focusing on contrast rather than color weight for hierarchy.

## Motion & Interaction (The $1M Feel)
1. **Staggered Mounts:** Using `framer-motion`, all dashboard elements will animate gracefully from the bottom up on initial load.
2. **Physical Feedback:** Micro-interactions mapped to scale transformations (`scale: 0.97`) to emulate screen depression on button tap.
3. **Telegram SDK Haptics:** Binding physical device vibrations to interactive components (buttons, tab switches, success states) using the `@telegram-apps/sdk`.

## Structural Improvements
1. **Header Decluttering:** Move secondary features to collapsible states. Keep the user's primary balance and actions central.
2. **Floating Navigation:** Rebuild the bottom tab bar to float, applying the same glassmorphism principles and dynamic tab indicator.
3. **Modal Alignment:** Apply custom CSS rules to the TON Connect modal (where possible) and native dialogs to blend with the dark glass environment. 
