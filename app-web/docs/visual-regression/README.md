# Visual Regression Workflow

This project uses Playwright screenshot snapshots to guard UI parity during the Ant Design v6 migration.

## Run visual regression checks

```bash
pnpm test:e2e --grep "visual regression"
```

## Update screenshot baselines

```bash
pnpm exec playwright test e2e/visual-regression.spec.ts --update-snapshots
```

## Full acceptance verification

```bash
pnpm test:e2e
pnpm lint
pnpm build
pnpm test:e2e --grep "visual regression"
```

## Notes

- Baseline images are stored in `e2e/visual-regression.spec.ts-snapshots/`.
- Always update baselines in the same branch as the UI changes.
- Review visual diffs before accepting snapshot updates.
