# Heat.js Documentation Reference

Source: [https://www.heatjs.com/docs](https://www.heatjs.com/docs)

## Overview

Heat.js is a customizable JavaScript library for generating interactive heatmaps. It transforms data into heat layers with patterns and intensity visualization. Zero-dependencies, TypeScript, MIT licensed.

## Installation

```bash
npm install jheat.js
```

Or via CDN:

```html
<script src="https://cdn.jsdelivr.net/gh/williamtroup/Heat.js@5.0.0/dist/heat.min.js"></script>
<link href="https://cdn.jsdelivr.net/gh/williamtroup/Heat.js@5.0.0/dist/heat.js.min.css" rel="stylesheet">
```

## Getting Started

1. **Prerequisites**: Include `<!DOCTYPE html>` at top of HTML
2. **Include**: Add the CSS and JS files
3. **DOM element**: Add a container with `data-heat-js` binding
4. **Add dates**: Use public API to add/remove dates; heatmap updates automatically

## Key Features

- **6 views**: Map, Line, Chart, Days, Months, Color Ranges
- **60 languages** supported
- **9 export formats**: CSV, JSON, XML, TXT, HTML, MD, TSV, YAML, TOML
- **7 import formats**: CSV, JSON, TXT, MD, TSV, YAML, TOML
- **31 themes** (dark/light)
- **Yearly statistics**: Total for day, week, month, year
- **Customizable**: Tooltips, color ranges, holidays, date formatting
- **Framework support**: React, Vue, Angular via export bindings

## Binding Options (data-heat-js)

Key initialization parameters:

| Option | Type | Description |
|--------|------|-------------|
| `year` | number | Year to show (default: current) |
| `view` | string | "map", "chart", or "statistics" |
| `colorRanges` | Object[] | Color config per data range |
| `exportType` | string | "csv", "json", "xml", "txt" |
| `useLocalStorageForData` | boolean | Persist data in localStorage |
| `holidays` | Object[] | Holiday definitions |
| `yearsToHide` | number[] | Years to exclude |

## Documentation Sections

- **Setup**: Getting Started, CDN Links
- **Configuration**: Main, Text (locale)
- **Binding Options**: Basic, Holiday, Color Range, Dynamic Color Range, Date Formatting, Custom Triggers
- **Layout**: Title Bar, Side Menu, Description, Guide, Zooming, ToolTip, Yearly Statistics
- **Views**: Map, Line, Chart, Days, Months, Color Ranges
- **API**: Public Functions
- **Navigation**: Shortcut Keys

## Links

- [Documentation](https://www.heatjs.com/docs)
- [GitHub](https://github.com/williamtroup/Heat.js)
- [Download](https://www.heatjs.com/download)
- [Support](https://www.heatjs.com/support)
