// Add verse page functionality
let currentCategoryId = null;
let currentCategory = null;

document.addEventListener('DOMContentLoaded', async function() {
    // Check if we're on the add verse page by looking for the verse-reference input
    if (document.getElementById('verse-reference')) {
        currentCategoryId = getURLParameter('categoryId');
        
        if (!currentCategoryId) {
            showMessage('No category specified', 'error');
            setTimeout(() => window.location.href = 'index.html', 2000);
            return;
        }
        
        await loadCategoryInfo();
        
        // Focus on the verse reference input
        document.getElementById('verse-reference').focus();
    }
});

async function loadCategoryInfo() {
    try {
        const { data: category, error } = await db.getCategoryById(currentCategoryId);
        
        if (error || !category) {
            showMessage('Category not found', 'error');
            setTimeout(() => window.location.href = 'index.html', 2000);
            return;
        }
        
        currentCategory = category;
        document.getElementById('category-name').textContent = category.name;
        document.title = `Bible Verse Collection - Add Verse to ${category.name}`;
        
    } catch (error) {
        showMessage(`Error loading category: ${error.message}`, 'error');
    }
}

async function handleSubmit(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('submit-btn');
    const originalText = submitBtn.textContent;
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Adding Verse...';
    
    try {
        // Get form data
        const formData = new FormData(event.target);
        const verseReference = formData.get('verseReference').trim();
        const verseText = formData.get('verseText').trim();
        const verseImageFile = formData.get('verseImage');
        
        // Validate required fields
        if (!verseReference || !verseText) {
            showMessage('Please fill in all required fields', 'error');
            return;
        }
        
        // Validate verse text length
        if (verseText.length < 10 || verseText.length > 1000) {
            showMessage('Verse text must be between 10 and 1000 characters', 'error');
            return;
        }
        
        // Validate verse reference length
        if (verseReference.length < 3 || verseReference.length > 50) {
            showMessage('Verse reference must be between 3 and 50 characters', 'error');
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
        const verseData = {
            text: verseText,
            reference: formatVerseReference(verseReference),
            image_url: imageUrl
        };
        
        // Add verse to category
        const { data: verse, error } = await db.addVerseToCategory(currentCategoryId, verseData);
        
        if (error) {
            showMessage(`Failed to add verse: ${error}`, 'error');
            return;
        }
        
        // Success - show message and redirect
        showMessage('Verse added successfully!', 'success');
        
        // Clear form
        event.target.reset();
        document.getElementById('image-preview').style.display = 'none';
        
        // Redirect to the category page after a short delay
        setTimeout(() => {
            window.location.href = `category.html?id=${currentCategoryId}`;
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
    if (currentCategoryId) {
        window.location.href = `category.html?id=${currentCategoryId}`;
    } else {
        window.location.href = 'index.html';
    }
}

// Real-time character count for textarea
document.addEventListener('DOMContentLoaded', function() {
    const verseTextarea = document.getElementById('verse-text');
    const referenceInput = document.getElementById('verse-reference');
    
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
    
    if (referenceInput) {
        // Add character counter for reference
        const refCounter = document.createElement('small');
        refCounter.style.color = '#7f8c8d';
        refCounter.style.float = 'right';
        refCounter.style.marginTop = '5px';
        referenceInput.parentNode.appendChild(refCounter);
        
        function updateRefCount() {
            const remaining = 50 - referenceInput.value.length;
            refCounter.textContent = `${remaining} characters remaining`;
            
            if (remaining < 10) {
                refCounter.style.color = '#e74c3c';
            } else {
                refCounter.style.color = '#7f8c8d';
            }
        }
        
        referenceInput.addEventListener('input', updateRefCount);
        updateRefCount(); // Initial count
    }
});
