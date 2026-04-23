--- shared-ui/README.md (原始)


+++ shared-ui/README.md (修改后)
# Shared UI Components for InForm
# =================================
# This package contains React components and types shared between:
# - browser-extension (Plasmo)
# - website (Next.js)
#
## Project Structure

```
shared-ui/
├── package.json          # @inform/ui package config
├── tsconfig.json         # TypeScript config with path aliases
├── README.md             # This file
└── src/
    ├── index.ts          # Entry point (exports all shared code)
    ├── types/
    │   └── index.ts      # Shared TypeScript types
    └── components/       # Shared React components (add as needed)
        └── .gitkeep
```

## Usage

### In browser-extension (tsconfig.json):
The path aliases are already configured. Import like this:

```typescript
import { ChatMessage, ChatSession, User } from "@inform/types";
import { Button } from "@inform/ui/components/Button"; // when you add components
```

### In website (tsconfig.json):
The path aliases are already configured. Import the same way:

```typescript
import { ChatMessage, ChatSession, User } from "@inform/types";
import { Button } from "@inform/ui/components/Button"; // when you add components
```

## Migration Guide: Moving Existing Components to shared-ui

### Step 1: Identify Shared Components
Components that exist in BOTH `browser-extension/components/` and `website/src/components/`
with identical or nearly identical code are candidates for migration.

Good candidates:
- Buttons (SendButton, SaveButton, ActionButton, etc.)
- Form inputs (FormInput)
- Common UI elements (Modal, Toast, Cards, ErrorBox)
- Logo components (BigLogo, SmallLogo)

### Step 2: Move Component to shared-ui
1. Create the component file in `shared-ui/src/components/ComponentName.tsx`
2. Update imports to use React and shared types from `@inform/types`
3. Export the component from `shared-ui/src/index.ts`

Example:
```typescript
// shared-ui/src/components/SendButton.tsx
import React from "react";

interface SendButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function SendButton({ onClick, disabled }: SendButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      Send
    </button>
  );
}
```

### Step 3: Update Exports
Add to `shared-ui/src/index.ts`:
```typescript
export * from "./types/index";
export { SendButton } from "./components/SendButton";
```

### Step 4: Update Original Projects
In `browser-extension/` and `website/`:
1. Delete the old component file
2. Update imports:
   ```typescript
   // Before
   import SendButton from "~components/buttons/SendButton";

   // After
   import { SendButton } from "@inform/ui/components/SendButton";
   ```

## Build & Development

### Development (No build required)
Both projects can import from `@inform/ui` and `@inform/types` directly using
TypeScript path aliases. No build step needed during development.

### Type Checking
```bash
cd shared-ui
npm run build  # Runs tsc --noEmit to check types
```

## Publishing (Optional)
If you want to publish to npm as a private package:

```bash
cd shared-ui
npm version patch  # or minor/major
npm publish --access restricted
```

Then update package.json in browser-extension and website:
```json
{
  "dependencies": {
    "@inform/ui": "^0.0.1"
  }
}
```

## Best Practices

1. **Keep it simple**: Only move truly shared components
2. **Avoid project-specific imports**: Don't import from `~/*` or `@/*` in shared components
3. **Use shared types**: Always use types from `@inform/types` instead of defining locally
4. **Test in both projects**: After moving a component, verify it works in both extension and website
5. **Version control**: Keep shared-ui in the same monorepo for easy development

## Troubleshooting

### Module not found errors
Make sure tsconfig.json in both projects has the correct paths:
```json
{
  "compilerOptions": {
    "paths": {
      "@inform/ui/*": ["../shared-ui/src/*"],
      "@inform/types": ["../shared-ui/src/types/index.ts"]
    }
  }
}
```

### Type conflicts
If you see duplicate type definitions, remove the local types and import from `@inform/types` instead.

### IDE issues
Restart your TypeScript language server or reload your IDE window after adding new path aliases.