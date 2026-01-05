
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");

        if (!file || !(file instanceof Blob)) {
            console.error("No file received in share target");
            return NextResponse.redirect(new URL("/contributions/new", req.url));
        }

        // Upload to Cloudinary
        // Note: We are reimplementing a basic upload here to ensure server-side compatibility without circular deps or client-side assumptions
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

        if (!cloudName) {
            console.error("Cloudinary config missing");
            return NextResponse.redirect(new URL("/contributions/new?error=config_missing", req.url));
        }

        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        uploadFormData.append('upload_preset', uploadPreset);
        uploadFormData.append('folder', 'receipts');

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: uploadFormData
        });

        if (!res.ok) {
            console.error("Upload failed in share target", await res.text());
            return NextResponse.redirect(new URL("/contributions/new?error=upload_failed", req.url));
        }

        const data = await res.json();
        const secureUrl = data.secure_url;

        // Redirect to contributions page with the uploaded image URL
        // We encode it to ensure it passes safely
        return NextResponse.redirect(new URL(`/contributions/new?receiptUrl=${encodeURIComponent(secureUrl)}`, req.url), 303);

    } catch (error) {
        console.error("Error in share target:", error);
        return NextResponse.redirect(new URL("/contributions/new?error=server_error", req.url));
    }
}
