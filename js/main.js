// Main JavaScript for homepage functionality
document.addEventListener('DOMContentLoaded', async function() {
    // Check if we're on the homepage by looking for the categories-list element
    if (document.getElementById('categories-list')) {
        await loadCategories();
    }
});

// Load and display categories on the homepage
async function loadCategories() {
    const categoriesList = document.getElementById('categories-list');
    
    try {
        const { data: categories, error } = await db.getCategories();
        
        if (error) {
            categoriesList.innerHTML = `<div class="error">Error loading categories: ${error}</div>`;
            return;
        }
        
        if (categories.length === 0) {
            categoriesList.innerHTML = `<div class="loading">No categories found. Add your first category!</div>`;
            return;
        }
        
        // Clear loading message and render categories
        categoriesList.innerHTML = '';
        
        categories.forEach(category => {
            const categoryButton = document.createElement('button');
            categoryButton.className = `category-button ${category.color}`;
            categoryButton.textContent = category.name;
            categoryButton.onclick = () => goToCategory(category.id);
            
            categoriesList.appendChild(categoryButton);
        });
        
    } catch (error) {
        categoriesList.innerHTML = `<div class="error">Failed to load categories: ${error.message}</div>`;
    }
}

// Navigation functions
function goToCategory(categoryId) {
    window.location.href = `category.html?id=${categoryId}`;
}

function goToAddCategory() {
    window.location.href = 'add-category.html';
}

// Utility function to get URL parameters
function getURLParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Show success/error messages
function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = type;
    messageDiv.textContent = message;
    
    // Insert at top of container
    const container = document.querySelector('.container');
    container.insertBefore(messageDiv, container.firstChild);
    
    // Remove message after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Form validation helpers
function validateForm(formData) {
    const errors = [];
    
    // Check required fields
    Object.keys(formData).forEach(key => {
        if (!formData[key] && formData[key] !== false) {
            errors.push(`${key.replace('_', ' ')} is required`);
        }
    });
    
    return errors;
}

// Image handling
function handleImageUpload(input, previewId) {
    const file = input.files[0];
    const preview = document.getElementById(previewId);
    
    if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showMessage('Please select a valid image file', 'error');
            input.value = '';
            return null;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showMessage('Image file size must be less than 5MB', 'error');
            input.value = '';
            return null;
        }
        
        // Show preview
        const reader = new FileReader();
        reader.onload = function(e) {
            if (preview) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
        
        return file;
    }
    
    return null;
}

// Format verse reference
function formatVerseReference(reference) {
    // Basic formatting to ensure consistency
    return reference.trim().replace(/\s+/g, ' ');
}

// Sanitize input text
function sanitizeInput(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Data import/export functions
function exportData() {
    try {
        const result = db.exportData();
        if (!result.success) {
            showMessage('Failed to export data: ' + result.error, 'error');
        } else {
            showMessage('Data exported successfully! Check your downloads folder.', 'success');
        }
    } catch (error) {
        showMessage('Error exporting data: ' + error.message, 'error');
    }
}

async function importData(input) {
    try {
        if (!input.files || input.files.length === 0) {
            showMessage('No file selected', 'error');
            return;
        }
        
        const file = input.files[0];
        if (!file.name.endsWith('.json')) {
            showMessage('Please select a .json file', 'error');
            return;
        }
        
        // Show loading message
        showMessage('Importing data...', 'info');
        
        const result = await db.importData(file);
        
        if (!result.success) {
            showMessage('Failed to import data: ' + result.error, 'error');
            return;
        }
        
        showMessage('Data imported successfully! Refreshing...', 'success');
        
        // Clear the file input
        input.value = '';
        
        // Refresh the page after a short delay
        setTimeout(() => {
            window.location.reload();
        }, 1500);
        
    } catch (error) {
        showMessage('Error importing data: ' + error.message, 'error');
    }
}
