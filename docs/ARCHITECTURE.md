# Architecture Overview

## File Structure

- **sections/** — Liquid section files (schema + markup)
- **assets/** — CSS and JavaScript for styling and interactivity

## Data Flow

1. Theme Editor settings → Liquid schema → CSS variables + HTML
2. User interactions → Vanilla JS → DOM updates / form field injection
3. No external API calls; all logic is client-side and self-contained

## Key Patterns

- CSS custom properties for theme-editor-driven styling
- Vanilla JS (no frameworks) for bundle picker, subscription toggle, modal, carousel
- Liquid for conditional rendering and schema-driven config
