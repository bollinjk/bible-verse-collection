# Bible Verse Collection

A simple, clean web application for browsing and sharing Bible verses organized by categories.

## Features

- 📖 Browse Bible verses by category
- ➕ Add new categories with initial verses
- 📝 Contribute verses to existing categories
- 🔄 Smart random verse selection (no repeats until all are shown)
- 📱 Mobile-responsive design
- 🖼️ Optional image uploads for verses
- 🚫 No user accounts required - anonymous contributions

## Getting Started

1. Clone this repository
2. Open `index.html` in your web browser
3. Start browsing and adding verses!

## Project Structure

```
├── index.html          # Homepage with category list
├── category.html       # Individual category view
├── add-category.html   # Form to create new categories
├── add-verse.html      # Form to add verses to categories
├── css/
│   └── styles.css      # All styling
└── js/
    ├── main.js         # Main functionality and utilities
    ├── database.js     # Data storage and management
    ├── category.js     # Category page functionality
    ├── add-category.js # Add category form handling
    └── add-verse.js    # Add verse form handling
```

## Live Demo

Visit the live website at: https://bollinjk.github.io/bible-verse-collection/

## Contributing

This is a community-driven project! Feel free to:
- Add new Bible verse categories
- Contribute verses to existing categories
- Submit bug reports or feature requests

## Technology

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Storage**: localStorage (upgradeable to database)
- **Hosting**: GitHub Pages

## Default Category

The application starts with one default category: "War on the Flesh" containing Romans 7:18.

## License

This project is open source and available under the MIT License.
