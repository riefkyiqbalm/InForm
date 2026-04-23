# Shared UI Setup & Troubleshooting Guide

This guide explains how to set up, build, and troubleshoot the `@inform/ui` shared package used by both the browser extension (Plasmo) and website (Next.js/Vite).

## 📁 Project Structure

```
InForm/
├── shared-ui/              # Shared UI package
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── types/          # TypeScript types
│   │   └── index.ts        # Entry point
│   ├── dist/               # Built output (generated)
│   ├── package.json
│   └── tsconfig.json
├── browser-extension/      # Plasmo extension
└── website/                # Next.js/Vite website
```

## 🔧 Initial Setup

### 1. Install Dependencies

Run these commands from the **root directory**:

```bash
# Install shared-ui dependencies
cd shared-ui
npm install

# Install browser-extension dependencies
cd ../browser-extension
npm install

# Install website dependencies
cd ../website
npm install
```

### 2. Build the Shared Package

**Important:** You must build `shared-ui` BEFORE running dev/build on either project.

```bash
# From root directory
cd shared-ui
npm run build
```

This generates the `dist/` folder with compiled JavaScript and TypeScript declarations.

### 3. Link the Package (Development Only)

For local development, link the package so both projects can find it:

```bash
# From shared-ui folder
cd shared-ui
npm link

# Link in browser-extension
cd ../browser-extension
npm link @inform/ui

# Link in website
cd ../website
npm link @inform/ui
```

**Alternative:** If you prefer not to use `npm link`, add the package as a workspace in your root `package.json`:

```json
{
  "workspaces": ["shared-ui", "browser-extension", "website"]
}
```

Then run `npm install` from the root.

## 🚀 Development Workflow

### Option A: Using npm link (Recommended for Dev)

1. **Build shared-ui first:**
   ```bash
   cd shared-ui && npm run build
   ```

2. **Run browser-extension:**
   ```bash
   cd browser-extension
   npm run dev
   ```

3. **Run website:**
   ```bash
   cd website
   npm run dev
   ```

### Option B: Using Workspaces (Monorepo)

If using workspaces, changes in `shared-ui/src` will automatically reflect in both projects without rebuilding (depending on your bundler configuration).

## ⚠️ Common Errors & Solutions

### Error 1: `"--jsx" is not set`

**Symptom:**
```
Module '@inform/ui/components/logo/BigLogo' was resolved to '.../shared-ui/src/components/logo/BigLogo.tsx', but '--jsx' is not set.
```

**Cause:** TypeScript is trying to compile `.tsx` files directly without JSX configuration.

**Solutions:**

1. **Ensure shared-ui is built:**
   ```bash
   cd shared-ui
   npm run build
   ```

2. **Verify tsconfig.json has jsx setting:**
   Check `shared-ui/tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "jsx": "react-jsx",  // ← Must be present
       "noEmit": false,     // ← Must be false
       "isolatedModules": false
     }
   }
   ```

3. **Import from dist, not src:**
   Make sure your imports resolve to the built `dist/` folder, not `src/`.

4. **Clear cache and rebuild:**
   ```bash
   # In shared-ui
   npm run clean
   npm run build
   
   # In browser-extension and website
   rm -rf node_modules/.vite  # or .next
   npm run dev
   ```

### Error 2: Module Not Found

**Symptom:**
```
Cannot find module '@inform/ui/components/logo/BigLogo'
```

**Solutions:**

1. **Check package.json exports:**
   Ensure `shared-ui/package.json` has proper exports (already configured).

2. **Verify path aliases:**
   
   In `browser-extension/tsconfig.json`:
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
   
   In `website/tsconfig.json`:
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

3. **Restart TypeScript server:**
   In VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

### Error 3: Changes Not Reflecting

**Symptom:** You update a component in `shared-ui`, but the change doesn't show in the extension/website.

**Solutions:**

1. **Rebuild shared-ui:**
   ```bash
   cd shared-ui
   npm run build
   ```

2. **If using npm link:**
   ```bash
   cd shared-ui
   npm run build
   npm link
   
   cd ../browser-extension
   npm link @inform/ui
   
   cd ../website
   npm link @inform/ui
   ```

3. **Clear bundler cache:**
   ```bash
   # For Vite (website)
   rm -rf node_modules/.vite
   
   # For Plasmo (extension)
   rm -rf .plasmo
   ```

4. **Restart dev server**

### Error 4: Type Errors in Production Build

**Symptom:**
```
TS2307: Cannot find module '@inform/ui' or its corresponding type declarations.
```

**Solutions:**

1. **Ensure dist folder exists:**
   ```bash
   cd shared-ui
   npm run build
   ls dist  # Should show index.d.ts, components/, types/
   ```

2. **Check package.json "types" field:**
   Must point to `dist/index.d.ts` (already configured).

3. **Include dist in git:**
   Add `shared-ui/dist/` to your `.gitignore` exceptions or commit it:
   ```bash
   git add shared-ui/dist/
   git commit -m "Add shared-ui build output"
   ```

## 🏗️ Production Build

### Build Order (Critical!)

1. **Build shared-ui:**
   ```bash
   cd shared-ui
   npm run build
   ```

2. **Build browser-extension:**
   ```bash
   cd browser-extension
   npm run build
   ```

3. **Build website:**
   ```bash
   cd website
   npm run build
   ```

### CI/CD Pipeline Example

```yaml
# Example GitHub Actions step
- name: Build Shared UI
  run: |
    cd shared-ui
    npm ci
    npm run build

- name: Build Browser Extension
  run: |
    cd browser-extension
    npm ci
    npm run build

- name: Build Website
  run: |
    cd website
    npm ci
    npm run build
```

## 📝 Adding New Components

1. **Create component in shared-ui:**
   ```bash
   # shared-ui/src/components/Button.tsx
   export default function Button({ children, ...props }) {
     return <button {...props}>{children}</button>;
   }
   ```

2. **Export from index.ts:**
   ```typescript
   // shared-ui/src/index.ts
   export { default as Button } from "./components/Button";
   ```

3. **Rebuild:**
   ```bash
   cd shared-ui
   npm run build
   ```

4. **Use in projects:**
   ```typescript
   import { Button } from "@inform/ui";
   ```

## 🔍 Debugging Tips

1. **Check resolved paths:**
   ```bash
   # In browser-extension or website
   npx tsc --showConfig
   ```

2. **Verify package resolution:**
   ```bash
   # Check where Node resolves the package
   node -e "console.log(require.resolve('@inform/ui'))"
   ```

3. **Inspect dist folder:**
   ```bash
   ls -la shared-ui/dist/
   # Should have: index.js, index.d.ts, components/, types/
   ```

4. **Enable verbose logging:**
   Add to `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "diagnostics": true,
       "explainFiles": true
     }
   }
   ```

## ✅ Checklist Before Pushing

- [ ] `shared-ui/dist/` folder exists and is up-to-date
- [ ] All components compile without errors
- [ ] Both browser-extension and website run in dev mode
- [ ] Production builds succeed for both projects
- [ ] No TypeScript errors in any project

## 🆘 Still Having Issues?

1. **Nuclear option - Clean reinstall:**
   ```bash
   # Remove all node_modules and build artifacts
   rm -rf shared-ui/node_modules shared-ui/dist
   rm -rf browser-extension/node_modules browser-extension/.plasmo
   rm -rf website/node_modules website/.next website/node_modules/.vite
   
   # Reinstall everything
   npm install  # from each directory
   ```

2. **Check Node version:**
   ```bash
   node --version  # Should be 18.x or higher
   ```

3. **Verify TypeScript version:**
   ```bash
   npx tsc --version  # Should be 5.x
   ```

---

**Last Updated:** April 2025  
**Maintainer:** InForm Team
