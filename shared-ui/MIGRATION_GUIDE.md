# Shared UI Migration Guide

## ✅ Completed Migrations

### BigLogo Component
- **Location**: `shared-ui/src/components/logo/BigLogo.tsx`
- **Import Path**: `@inform/ui/components/logo/BigLogo`
- **Status**: ✅ Migrated and updated in both browser-extension and website

#### Files Updated:
1. `browser-extension/components/Hello.tsx` - Now imports from `@inform/ui`
2. `browser-extension/components/Welcome.tsx` - Now imports from `@inform/ui`
3. `website/src/components/Hello.tsx` - Now imports from `@inform/ui`
4. `website/src/components/Welcome.tsx` - Now imports from `@inform/ui`

## 📦 Package Structure

```
shared-ui/
├── package.json          # @inform/ui package
├── tsconfig.json         # TypeScript config with paths
├── README.md             # Documentation
└── src/
    ├── index.ts          # Entry point (exports all)
    ├── components/
    │   └── logo/
    │       └── BigLogo.tsx
    └── types/
        └── index.ts
```

## 🔧 Configuration

### Browser Extension (tsconfig.json)
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

### Website (tsconfig.json)
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

## 🚀 Usage

### Import Components
```tsx
import BigLogo from "@inform/ui/components/logo/BigLogo";
// or
import { BigLogo } from "@inform/ui";
```

### Import Types
```tsx
import { MessageType, ChatSession } from "@inform/types";
```

## 📝 How to Migrate More Components

1. **Move component** to `shared-ui/src/components/[category]/[ComponentName].tsx`
2. **Update component** to be framework-agnostic (no Plasmo/Next.js specific APIs)
3. **Export** from `shared-ui/src/index.ts`
4. **Update imports** in browser-extension and website
5. **Test** both projects build successfully

## ⚠️ Important Notes

- Components must NOT use Plasmo-specific APIs (e.g., `~` aliases, `chrome.storage`)
- Components must NOT use Next.js-specific APIs (e.g., `next/router`, server components)
- Use standard React props and CSS for styling
- For project-specific logic, keep it in the respective codebase and pass via props

## 🛠 Development Workflow

```bash
# Install dependencies (run once)
cd shared-ui && npm install

# In browser-extension
cd browser-extension && npm install
npm run dev

# In website
cd website && npm install
npm run dev
```

Both projects will hot-reload when you edit files in `shared-ui/`.

## 🏗 Build & Production

The path aliases are resolved at build time by both Plasmo and Next.js bundlers. No additional build steps needed for `shared-ui`.

## 🐛 Troubleshooting

### Error: "--jsx is not set"
Ensure your `shared-ui/tsconfig.json` has:
```json
{
  "compilerOptions": {
    "jsx": "react-jsx"
  }
}
```

### Error: Module not found
Check that:
1. Path alias is configured in both `tsconfig.json` files
2. Component is exported from `shared-ui/src/index.ts`
3. Import path matches the export structure

### Error: Chrome API not available
Shared components cannot use Chrome APIs directly. Pass data via props instead.
