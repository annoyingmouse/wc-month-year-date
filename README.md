# &lt;month-year-date&gt;

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/@annoyingmouse/wc-month-year-date)

A form-associated web component for selecting a month and year. Renders a localised month `<select>` and a year `<input type="number">` that participate in HTML forms natively via the ElementInternals API. No framework dependencies.

## Installation

```html
<script src="https://unpkg.com/@annoyingmouse/wc-month-year-date/wc-month-year-date.js" defer></script>
```

Or as a module:

```html
<script type="module" src="https://cdn.skypack.dev/@annoyingmouse/wc-month-year-date/wc-month-year-date.js"></script>
```

## Usage

```html
<wc-month-year-date name="expiry"></wc-month-year-date>
```

With a pre-filled value:

```html
<wc-month-year-date name="dob" value="1990-06"></wc-month-year-date>
```

Inside a form:

```html
<form>
  <wc-month-year-date name="expiry"></wc-month-year-date>
  <button type="submit">Submit</button>
</form>
```

On submit, the form data entry for `expiry` will be `YYYY-MM-01` (always the first of the month), or absent if either field is left empty.

## Attributes

| Attribute | Description |
|---|---|
| `name` | Form field name submitted with the form |
| `value` | Initial value in `YYYY-MM` or `YYYY-MM-DD` format |

## Public API

```js
const el = document.querySelector('wc-month-year-date')

// Read current value (YYYY-MM-01, or "" when incomplete)
console.log(el.value)

// Read form field name
console.log(el.name)

// Always "month-year-date"
console.log(el.type)

// The associated <form> element (null if not inside a form)
console.log(el.form)
```

## Theming

The component uses a Shadow DOM. The `select` and `input` parts are exposed via the `part` attribute and can be styled with `::part()`:

```css
month-year-date::part(month) {
  border-radius: 4px;
}

month-year-date::part(year) {
  width: 6rem;
}
```

## Accessibility

- The month `<select>` has `aria-label="Month"`
- The year `<input>` has `aria-label="Year"`
- Both controls use `font: inherit` so they match the surrounding text size

## Development

No build step required. Open `index.html` directly in a browser to develop and test.

```bash
npm install
npm run format   # format with Biome
npm run lint     # lint with Biome
npm test         # run tests with Web Test Runner
npm run build    # produce dist/wc-month-year-date.min.js via Rollup
```

## Releasing

Before releasing for the first time, authenticate with npm:

```bash
npm login
```

Then use one of the release scripts depending on the change:

```bash
npm run release:patch   # bug fixes (1.0.0 → 1.0.1)
npm run release:minor   # new features (1.0.0 → 1.1.0)
npm run release:major   # breaking changes (1.0.0 → 2.0.0)
```

Each script:
1. Bumps the version in `package.json` and creates a git commit and tag
2. Builds the minified dist (`dist/wc-month-year-date.min.js`) via Rollup
3. Syncs the new version into `bower.json`
4. Commits the build artifacts, pushes the commit and tags to GitHub
5. Publishes the package to npm with public access

## Licence

MIT
