# Agent Instructions

## Isolated Build Command

When you need to run a build that should NOT disturb the main build cache (e.g., testing build changes without invalidating the regular build cache), use:

```bash
npm run build:ISOLATED
```

This command uses a separate cache directory (`.next-isolated-cache`) so it won't interfere with the main build cache used by `npm run build`.

**When to use:**
- Testing build configuration changes
- Experimenting with build flags or settings
- Verifying build fixes without affecting regular builds

**Related commands:**
- `npm run build:ISOLATED` - Isolated build (uses `.next-isolated-cache`)
- `npm run clean:isolated` - Clean up the isolated cache directory
