const { Jimp } = require('jimp');
const QRCode = require('qrcode');

async function test() {
    try {
        const shareUrl = "http://localhost:3000/shared/test-token";
        const qrCodeBuffer = await QRCode.toBuffer(shareUrl, {
            width: 400,
            margin: 2,
            color: {
                dark: '#1e40af',
                light: '#FFFFFF',
            },
            errorCorrectionLevel: 'H',
        });

        console.log("QR Code generated");

        const qrImage = await Jimp.read(qrCodeBuffer);

        const canvas = new Jimp({
            width: 400,
            height: 460,
            color: 0xFFFFFFFF
        });

        canvas.composite(qrImage, 0, 0);

        try {
            console.log("Loading font...");
            // In CommonJS / older node it might be different, let's try the modern way
            // But for Jimp 1.6.0 it should be exportable
            const { loadFont } = require('jimp');
            // For fonts in 1.x, they are often on Jimp object or separately
            // Let's check what's available
            console.log("Available on Jimp:", Object.keys(Jimp).filter(k => k.includes('FONT')));

            // Try to load a known font path if it exists or use standard ones
            // In Jimp 1.x fonts are actually harder to find via require
            // Let's try to just print text without custom font first if possible? No, Jimp needs a font.
        } catch (fontErr) {
            console.error("Font test failed:", fontErr);
        }

        const finalBuffer = await canvas.getBuffer('image/png');
        console.log("Final buffer generated");
    } catch (err) {
        console.error("Test failed:", err);
    }
}

test();
