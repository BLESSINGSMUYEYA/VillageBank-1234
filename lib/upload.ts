
export async function uploadReceipt(file: Blob): Promise<string> {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

    console.log("Cloudinary Config:", {
        cloudName,
        uploadPreset: uploadPreset || 'USING DEFAULT (ml_default)'
    });

    if (!cloudName) throw new Error("Cloudinary configuration missing");

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'receipts');

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
    });

    if (!res.ok) {
        const errorData = await res.json();
        console.error("Cloudinary Error:", errorData);
        throw new Error(errorData.error?.message || 'Image upload failed');
    }
    const data = await res.json();
    return data.secure_url;
}
