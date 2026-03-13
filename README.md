# Calorie Tracker

A simple, web-based calorie counting app inspired by MyFitnessPal. Built with vanilla HTML, CSS, and JavaScript - no build step required.

## Features

- **Food Search**: Search 3M+ products from the Open Food Facts API
- **Quick-Add Saved Meals**: Save and reuse common meals with one click
- **Custom Foods**: Add foods not in the database
- **Daily Log**: Track calories, protein, carbs, and fat
- **Weekly Summary**: View 7-day trends with visual bar chart
- **Data Export/Import**: Backup and restore your data as JSON
- **Local Storage**: All data stays on your device

## Quick Start

1. Open `index.html` in any modern browser
2. No build step, no server required
3. Start tracking!

## Data Storage

All data is stored locally in your browser using localStorage:
- Daily food logs
- Custom foods you create
- Saved meal templates
- Settings

## Testing

Install dependencies:
```bash
npm install
npx playwright install chromium
```

Run tests:
```bash
npm test
```

Run tests with UI:
```bash
npm run test:ui
```

## API

Uses the [Open Food Facts](https://world.openfoodfacts.org/) API:
- Free, no API key required
- Open source
- Rate limit: 10 searches/minute (app enforces this)

## Keyboard Shortcuts

- Press `Enter` in search box to search
- `Escape` to close modals (click overlay)

## Browser Compatibility

- Chrome/Edge 80+
- Firefox 75+
- Safari 13+

## File Structure

```
├── index.html          # Main application (all-in-one)
├── test/
│   └── calorie-tracker.spec.js  # Playwright tests
├── package.json        # Test dependencies
└── README.md
```

## License

MIT
