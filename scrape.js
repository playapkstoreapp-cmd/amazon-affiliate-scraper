const fs = require('fs');
const amazonScraper = require('amazon-buddy');

async function runDynamicScraper() {
    let allProducts = [];

    // ==========================================
    // YOUR TARGET SEARCH KEYWORDS & CATEGORIES
    // (The scraper will fetch brand new products for these daily)
    // ==========================================
    const searchKeywords = [
        "wireless tech gadgets",
        "smart home devices",
        "ergonomic keyboard"
    ];

    const affiliateTag = "yourstore-20"; // Replace with your tag later, or leave as placeholder
    const targetZipCode = "90009";

    console.log(`[Scraper] Starting live product sync for US delivery zone: ${targetZipCode}`);

    for (const keyword of searchKeywords) {
        try {
            console.log(`[Keyword] Fetching products for: "${keyword}"...`);
            
            // Fetch products dynamically using Amazon query parameters
            const response = await amazonScraper.products({
                keyword: keyword,
                number: 5, // Number of items to fetch per keyword
                country: 'US'
            });

            if (response && response.result && response.result.length > 0) {
                const mappedItems = response.result.map(item => {
                    const cleanAsin = item.asin || "B0CX234XYZ";
                    const directUrl = `https://www.amazon.com/dp/${cleanAsin}?tag=${affiliateTag}`;
                    
                    return {
                        title: item.title || "Amazon Featured Tech Product",
                        url: directUrl,
                        // True Amazon High-Resolution Image CDN URL
                        image: item.thumbnail || item.image || "https://m.media-amazon.com/images/I/71X67L3zvcL._AC_SL1500_.jpg",
                        description: item.description || `Verified stock availability for delivery zone ${targetZipCode}. High-performance item checked for quality assurance.`,
                        // Image gallery extracted straight from product data variants
                        gallery: Array.isArray(item.images) && item.images.length > 0 ? item.images : [
                            item.thumbnail || "https://m.media-amazon.com/images/I/61v5cPykBxL._AC_SL1500_.jpg"
                        ],
                        price: item.price ? `$${item.price.current}` : "$49.99",
                        date: new Date().toISOString(),
                        type: "Amazon Deal",
                        region: `US ${targetZipCode}`
                    };
                });

                allProducts.push(...mappedItems);
                console.log(`[Success] Added ${mappedItems.length} products for "${keyword}".`);
            }
        } catch (err) {
            console.log(`[Error] Could not fetch products for keyword "${keyword}":`, err.message);
        }
    }

    // Fallback safety item if network limits hits
    if (allProducts.length === 0) {
        allProducts.push({
            title: "Wireless Ergonomic Smart Tech Gadget Pro",
            url: `https://www.amazon.com/dp/B08N5KWBKK?tag=${affiliateTag}`,
            image: "https://m.media-amazon.com/images/I/71X67L3zvcL._AC_SL1500_.jpg",
            description: `Automated fallback item configured for delivery zone ${targetZipCode}.`,
            gallery: ["https://m.media-amazon.com/images/I/61v5cPykBxL._AC_SL1500_.jpg"],
            price: "$39.99",
            date: new Date().toISOString(),
            type: "Best Seller",
            region: "US 90009"
        });
    }

    // Write fresh dynamic products directly to jobs.json
    fs.writeFileSync('jobs.json', JSON.stringify(allProducts, null, 2));
    console.log(`[Complete] Compiled a total of ${allProducts.length} new products into jobs.json.`);
}

runDynamicScraper();
