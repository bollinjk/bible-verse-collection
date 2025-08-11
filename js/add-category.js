// Add category page functionality
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.endsWith('add-category.html')) {
        // Focus on the category name input
        document.getElementById('category-name').focus();
    }
});

async function handleSubmit(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('submit-btn');
    const originalText = submitBtn.textContent;
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Category...';
    
    try {
        // Get form data
        const formData = new FormData(event.target);
        const categoryName = formData.get('categoryName').trim();
        const verseReference = formData.get('verseReference').trim();
        const verseText = formData.get('verseText').trim();
        const verseImageFile = formData.get('verseImage');
        
        // Validate required fields
        if (!categoryName || !verseReference || !verseText) {
            showMessage('Please fill in all required fields', 'error');
            return;
        }
        
        // Validate category name length
        if (categoryName.length < 2 || categoryName.length > 50) {
            showMessage('Category name must be between 2 and 50 characters', 'error');
            return;
        }
        
        // Validate verse text length
        if (verseText.length < 10 || verseText.length > 1000) {
            showMessage('Verse text must be between 10 and 1000 characters', 'error');
            return;
        }
        
        // Handle image upload if present
        let imageUrl = null;
        if (verseImageFile && verseImageFile.size > 0) {
            const imageResult = await db.uploadImage(verseImageFile);
            if (imageResult.error) {
                showMessage(`Image upload failed: ${imageResult.error}`, 'error');
                return;
            }
            imageUrl = imageResult.data;
        }
        
        // Prepare verse data
        const firstVerse = {
            text: verseText,
            reference: formatVerseReference(verseReference),
            image_url: imageUrl
        };
        
        // Create category with first verse
        const { data: category, error } = await db.createCategory(categoryName, firstVerse);
        
        if (error) {
            if (error === 'Category already exists') {
                showMessage('A category with this name already exists. Please choose a different name.', 'error');
            } else {
                showMessage(`Failed to create category: ${error}`, 'error');
            }
            return;
        }
        
        // Success - show message and redirect
        showMessage(`Category "${categoryName}" created successfully!`, 'success');
        
        // Clear form
        event.target.reset();
        document.getElementById('image-preview').style.display = 'none';
        
        // Redirect to the new category page after a short delay
        setTimeout(() => {
            window.location.href = `category.html?id=${category.id}`;
        }, 1500);
        
    } catch (error) {
        showMessage(`An unexpected error occurred: ${error.message}`, 'error');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

function goBack() {
    window.location.href = 'index.html';
}

// Real-time character count for textarea
document.addEventListener('DOMContentLoaded', function() {
    const verseTextarea = document.getElementById('verse-text');
    const categoryInput = document.getElementById('category-name');
    
    if (verseTextarea) {
        // Add character counter
        const charCounter = document.createElement('small');
        charCounter.style.color = '#7f8c8d';
        charCounter.style.float = 'right';
        charCounter.style.marginTop = '5px';
        verseTextarea.parentNode.appendChild(charCounter);
        
        function updateCharCount() {
            const remaining = 1000 - verseTextarea.value.length;
            charCounter.textContent = `${remaining} characters remaining`;
            
            if (remaining < 100) {
                charCounter.style.color = '#e74c3c';
            } else {
                charCounter.style.color = '#7f8c8d';
            }
        }
        
        verseTextarea.addEventListener('input', updateCharCount);
        updateCharCount(); // Initial count
    }
    
    if (categoryInput) {
        // Add character counter for category name
        const nameCounter = document.createElement('small');
        nameCounter.style.color = '#7f8c8d';
        nameCounter.style.float = 'right';
        nameCounter.style.marginTop = '5px';
        categoryInput.parentNode.appendChild(nameCounter);
        
        function updateNameCount() {
            const remaining = 50 - categoryInput.value.length;
            nameCounter.textContent = `${remaining} characters remaining`;
            
            if (remaining < 10) {
                nameCounter.style.color = '#e74c3c';
            } else {
                nameCounter.style.color = '#7f8c8d';
            }
        }
        
        categoryInput.addEventListener('input', updateNameCount);
        updateNameCount(); // Initial count
    }
});
