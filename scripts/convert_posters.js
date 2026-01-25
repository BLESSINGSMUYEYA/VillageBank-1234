const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
    console.log('🚀 Starting poster conversion...');

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Poster files to convert
    const posters = [
        { name: 'poster-transparency', path: '../marketing/poster-transparency.html' },
        { name: 'poster-growth', path: '../marketing/poster-growth.html' }
    ];

    // Set Viewport to A4 @ 300 DPI equivalent (High Res)
    // Scale factor 3 = ~2400px width (Very High Quality)
    await page.setViewport({ width: 800, height: 1131, deviceScaleFactor: 3 });

    for (const poster of posters) {
        const fileUrl = 'file://' + path.resolve(__dirname, poster.path);

        console.log(`📸 Processing ${poster.name}...`);

        try {
            await page.goto(fileUrl, { waitUntil: 'networkidle0' });
            await new Promise(r => setTimeout(r, 1000));

            // 1. Save High Quality Version (Original)
            await page.screenshot({
                path: path.resolve(__dirname, `../marketing/${poster.name}-hq.png`),
                fullPage: true,
                type: 'png'
            });
            console.log(`✅ Saved HQ: ${poster.name}-hq.png`);

            // 2. Prepare for Transparency (Remove Backgrounds)
            await page.evaluate(() => {
                document.body.style.background = 'transparent';
                const container = document.querySelector('body > div');
                if (container) {
                    // Remove generic background/gradient classes
                    container.className = container.className.split(' ').filter(c => !c.startsWith('bg-') && !c.startsWith('shadow-')).join(' ');
                    container.style.background = 'transparent';
                    container.style.boxShadow = 'none';
                }
                // Hide purely decorative background blobs/grids
                const blobs = document.querySelectorAll('.blur-\\[120px\\], .blur-\\[100px\\], .blur-\\[150px\\], .grid-pattern');
                blobs.forEach(el => el.style.display = 'none');
            });

            // 3. Save Transparent Version
            await page.screenshot({
                path: path.resolve(__dirname, `../marketing/${poster.name}-transparent.png`),
                fullPage: true,
                omitBackground: true,
                type: 'png'
            });
            console.log(`✅ Saved Transparent: ${poster.name}-transparent.png`);

            // 4. Save Background Only Version
            // Reload to restore background styles
            await page.reload({ waitUntil: 'networkidle0' });
            await new Promise(r => setTimeout(r, 500));

            await page.evaluate(() => {
                // Find the main content wrapper (it has z-10 in my html) and hide it
                const content = document.querySelector('.relative.z-10');
                if (content) content.style.display = 'none';

                // Ensure background container is fully visible (in case it was hidden previously)
                const container = document.querySelector('body > div');
                if (container) {
                    container.style.opacity = '1';
                }
            });

            await page.screenshot({
                path: path.resolve(__dirname, `../marketing/${poster.name}-background.png`),
                fullPage: true,
                type: 'png'
            });
            console.log(`✅ Saved Background: ${poster.name}-background.png`);

        } catch (error) {
            console.error(`❌ Error converting ${poster.name}:`, error);
        }
    }

    await browser.close();
    console.log('✨ All conversions complete! Check your marketing/ folder.');
})();
