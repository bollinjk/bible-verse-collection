// Database configuration and functions using Supabase
class Database {
    constructor() {
        // For now, we'll use localStorage as a simple solution
        // This can be easily upgraded to Supabase later
        this.initializeLocalStorage();
    }

    initializeLocalStorage() {
        // Initialize with the default "War on the Flesh" category if no data exists
        if (!localStorage.getItem('categories')) {
            const defaultCategories = [
                {
                    id: 1,
                    name: 'War on the Flesh',
                    color: 'category-war-flesh',
                    created_at: new Date().toISOString()
                }
            ];
            localStorage.setItem('categories', JSON.stringify(defaultCategories));
        }

        if (!localStorage.getItem('verses')) {
            const defaultVerses = [
                {
                    id: 1,
                    category_id: 1,
                    verse_text: 'For I know that good itself does not dwell in me, that is, in my sinful nature. For I have the desire to do what is good, but I cannot carry it out.',
                    verse_reference: 'Romans 7:18',
                    image_url: null,
                    created_at: new Date().toISOString()
                }
            ];
            localStorage.setItem('verses', JSON.stringify(defaultVerses));
        }

        // Initialize viewed verses tracking for each category
        if (!localStorage.getItem('viewedVerses')) {
            localStorage.setItem('viewedVerses', JSON.stringify({}));
        }
    }

    // Category methods
    async getCategories() {
        try {
            const categories = JSON.parse(localStorage.getItem('categories') || '[]');
            return { data: categories, error: null };
        } catch (error) {
            return { data: null, error: error.message };
        }
    }

    async getCategoryById(id) {
        try {
            const categories = JSON.parse(localStorage.getItem('categories') || '[]');
            const category = categories.find(cat => cat.id === parseInt(id));
            return { data: category, error: null };
        } catch (error) {
            return { data: null, error: error.message };
        }
    }

    async createCategory(name, firstVerse) {
        try {
            const categories = JSON.parse(localStorage.getItem('categories') || '[]');
            const verses = JSON.parse(localStorage.getItem('verses') || '[]');
            
            // Check for duplicate category names
            const existingCategory = categories.find(cat => 
                cat.name.toLowerCase() === name.toLowerCase()
            );
            
            if (existingCategory) {
                return { data: null, error: 'Category already exists' };
            }

            // Generate new IDs
            const newCategoryId = Math.max(...categories.map(c => c.id), 0) + 1;
            const newVerseId = Math.max(...verses.map(v => v.id), 0) + 1;

            // Create color class based on category name
            const colorClasses = [
                'category-hope', 'category-faith', 'category-love', 'category-comfort',
                'category-strength', 'category-wisdom', 'category-peace'
            ];
            const colorClass = colorClasses[categories.length % colorClasses.length];

            // Create new category
            const newCategory = {
                id: newCategoryId,
                name: name,
                color: colorClass,
                created_at: new Date().toISOString()
            };

            // Create first verse for the category
            const newVerse = {
                id: newVerseId,
                category_id: newCategoryId,
                verse_text: firstVerse.text,
                verse_reference: firstVerse.reference,
                image_url: firstVerse.image_url || null,
                created_at: new Date().toISOString()
            };

            // Save to localStorage
            categories.push(newCategory);
            verses.push(newVerse);
            
            localStorage.setItem('categories', JSON.stringify(categories));
            localStorage.setItem('verses', JSON.stringify(verses));

            return { data: newCategory, error: null };
        } catch (error) {
            return { data: null, error: error.message };
        }
    }

    // Verse methods
    async getVersesByCategory(categoryId) {
        try {
            const verses = JSON.parse(localStorage.getItem('verses') || '[]');
            const categoryVerses = verses.filter(verse => verse.category_id === parseInt(categoryId));
            return { data: categoryVerses, error: null };
        } catch (error) {
            return { data: null, error: error.message };
        }
    }

    async getRandomVerseFromCategory(categoryId) {
        try {
            const { data: verses, error } = await this.getVersesByCategory(categoryId);
            if (error) return { data: null, error };

            if (verses.length === 0) {
                return { data: null, error: 'No verses found in this category' };
            }

            // Get viewed verses for this category
            const viewedVerses = JSON.parse(localStorage.getItem('viewedVerses') || '{}');
            const categoryViewed = viewedVerses[categoryId] || [];

            // Filter out already viewed verses
            const unviewedVerses = verses.filter(verse => !categoryViewed.includes(verse.id));

            let selectedVerse;
            
            if (unviewedVerses.length > 0) {
                // Select random from unviewed verses
                const randomIndex = Math.floor(Math.random() * unviewedVerses.length);
                selectedVerse = unviewedVerses[randomIndex];
            } else {
                // All verses have been viewed, reset and select randomly from all
                viewedVerses[categoryId] = [];
                localStorage.setItem('viewedVerses', JSON.stringify(viewedVerses));
                const randomIndex = Math.floor(Math.random() * verses.length);
                selectedVerse = verses[randomIndex];
            }

            // Mark this verse as viewed
            if (!viewedVerses[categoryId]) {
                viewedVerses[categoryId] = [];
            }
            viewedVerses[categoryId].push(selectedVerse.id);
            localStorage.setItem('viewedVerses', JSON.stringify(viewedVerses));

            return { data: selectedVerse, error: null };
        } catch (error) {
            return { data: null, error: error.message };
        }
    }

    async addVerseToCategory(categoryId, verseData) {
        try {
            const verses = JSON.parse(localStorage.getItem('verses') || '[]');
            const newVerseId = Math.max(...verses.map(v => v.id), 0) + 1;

            const newVerse = {
                id: newVerseId,
                category_id: parseInt(categoryId),
                verse_text: verseData.text,
                verse_reference: verseData.reference,
                image_url: verseData.image_url || null,
                created_at: new Date().toISOString()
            };

            verses.push(newVerse);
            localStorage.setItem('verses', JSON.stringify(verses));

            return { data: newVerse, error: null };
        } catch (error) {
            return { data: null, error: error.message };
        }
    }

    // Image upload helper (for future implementation)
    async uploadImage(file) {
        // For now, convert to base64 data URL
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve({ data: reader.result, error: null });
            reader.onerror = () => reject({ data: null, error: 'Failed to read image' });
            reader.readAsDataURL(file);
        });
    }
}

// Create global database instance
const db = new Database();
