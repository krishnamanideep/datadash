/**
 * Database Cleanup Script
 * Run this ONCE to clean all polluted HTML from the database
 * 
 * Usage:
 * 1. Go to admin portal
 * 2. Open browser console (F12)
 * 3. Copy and paste this entire script
 * 4. Press Enter
 * 5. Wait for "Cleanup complete!" message
 */

// Comprehensive HTML cleaning function
const cleanHTML = (html) => {
    if (!html) return '';

    let cleaned = html.replace(/\s*style="[^"]*"/gi, '');
    cleaned = cleaned.replace(/\s*class="[^"]*"/gi, '');
    cleaned = cleaned.replace(/\s*id="[^"]*"/gi, '');
    cleaned = cleaned.replace(/\s*dir="[^"]*"/gi, '');
    cleaned = cleaned.replace(/\s*aria-[^=]*="[^"]*"/gi, '');
    cleaned = cleaned.replace(/\s*data-[^=]*="[^"]*"/gi, '');
    cleaned = cleaned.replace(/\s*role="[^"]*"/gi, '');
    cleaned = cleaned.replace(/<span[^>]*>/gi, '');
    cleaned = cleaned.replace(/<\/span>/gi, '');
    cleaned = cleaned.replace(/<div>/gi, '<p>');
    cleaned = cleaned.replace(/<\/div>/gi, '</p>');
    cleaned = cleaned.replace(/<p>\s*<\/p>/gi, '');
    cleaned = cleaned.replace(/\s+/g, ' ');

    return cleaned.trim();
};

// Clean array of strings
const cleanArray = (arr) => {
    if (!Array.isArray(arr)) return arr;
    return arr.map(item => typeof item === 'string' ? cleanHTML(item) : item);
};

// Main cleanup function
async function cleanupDatabase() {
    console.log('🧹 Starting database cleanup...');

    try {
        // Import Firebase
        const { db } = await import('/src/lib/firebase/client.js');
        const { collection, getDocs, doc, updateDoc } = await import('firebase/firestore');

        // Get all candidates
        const candidatesRef = collection(db, 'candidates');
        const snapshot = await getDocs(candidatesRef);

        console.log(`Found ${snapshot.size} candidates to clean`);

        let cleaned = 0;

        for (const docSnapshot of snapshot.docs) {
            const data = docSnapshot.data();
            const updates = {};

            // Clean SWOT fields
            if (data.strengths) updates.strengths = cleanArray(data.strengths);
            if (data.weaknesses) updates.weaknesses = cleanArray(data.weaknesses);
            if (data.advantages) updates.advantages = cleanArray(data.advantages);
            if (data.opportunities) updates.opportunities = cleanArray(data.opportunities);
            if (data.threats) updates.threats = cleanArray(data.threats);

            // Clean custom cards
            if (data.customCards && Array.isArray(data.customCards)) {
                updates.customCards = data.customCards.map(card => ({
                    ...card,
                    content: cleanHTML(card.content || '')
                }));
            }

            // Only update if there are changes
            if (Object.keys(updates).length > 0) {
                await updateDoc(doc(db, 'candidates', docSnapshot.id), updates);
                cleaned++;
                console.log(`✅ Cleaned candidate: ${data.name}`);
            }
        }

        console.log(`🎉 Cleanup complete! Cleaned ${cleaned} candidates`);
        alert(`Database cleanup complete! Cleaned ${cleaned} candidates. Please refresh the page.`);

    } catch (error) {
        console.error('❌ Cleanup failed:', error);
        alert('Cleanup failed! Check console for details.');
    }
}

// Run the cleanup
cleanupDatabase();
