// Category page functionality
let currentCategoryId = null;
let currentCategory = null;

document.addEventListener('DOMContentLoaded', async function() {
    // Check if we're on the category page by looking for the category-title element
    if (document.getElementById('category-title')) {
        currentCategoryId = getURLParameter('id');
        
        if (!currentCategoryId) {
            showMessage('No category specified', 'error');
            setTimeout(() => window.location.href = 'index.html', 2000);
            return;
        }
        
        await loadCategoryAndVerse();
    }
});

async function loadCategoryAndVerse() {
    try {
        // Load category info
        const { data: category, error: categoryError } = await db.getCategoryById(currentCategoryId);
        
        if (categoryError || !category) {
            showMessage('Category not found', 'error');
            setTimeout(() => window.location.href = 'index.html', 2000);
            return;
        }
        
        currentCategory = category;
        document.getElementById('category-title').textContent = category.name;
        document.title = `Bible Verse Collection - ${category.name}`;
        
        // Load a random verse
        await loadRandomVerse();
        
    } catch (error) {
        showMessage(`Error loading category: ${error.message}`, 'error');
    }
}

async function loadRandomVerse() {
    const verseContainer = document.getElementById('verse-container');
    verseContainer.innerHTML = '<div class="loading">Loading verse...</div>';
    
    try {
        const { data: verse, error } = await db.getRandomVerseFromCategory(currentCategoryId);
        
        if (error) {
            verseContainer.innerHTML = `<div class="error">Error loading verse: ${error}</div>`;
            return;
        }
        
        if (!verse) {
            verseContainer.innerHTML = '<div class="error">No verses found in this category</div>';
            return;
        }
        
        // Display the verse
        displayVerse(verse);
        
    } catch (error) {
        verseContainer.innerHTML = `<div class="error">Failed to load verse: ${error.message}</div>`;
    }
}

function displayVerse(verse) {
    const verseContainer = document.getElementById('verse-container');
    
    let imageHTML = '';
    if (verse.image_url) {
        imageHTML = `<img src="${verse.image_url}" alt="Verse image" class="verse-image">`;
    }
    
    verseContainer.innerHTML = `
        <div class="verse-text">"${sanitizeInput(verse.verse_text)}"</div>
        <div class="verse-reference">${sanitizeInput(verse.verse_reference)}</div>
        ${imageHTML}
    `;
}

async function generateAnotherVerse() {
    await loadRandomVerse();
}

function goBack() {
    window.location.href = 'index.html';
}

function goToAddVerse() {
    window.location.href = `add-verse.html?categoryId=${currentCategoryId}`;
}
