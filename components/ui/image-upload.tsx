"use client"

import { CldUploadWidget } from 'next-cloudinary';
import { Button } from '@/components/ui/button';
import { ImagePlus, Trash } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
    value: string;
    onChange: (value: string) => void;
    onRemove: (value: string) => void;
    disabled?: boolean;
}

export function ImageUpload({
    value,
    onChange,
    onRemove,
    disabled
}: ImageUploadProps) {
    const onUpload = (result: any) => {
        onChange(result.info.secure_url);
    }

    return (
        <div>
            <div className="mb-4 flex items-center gap-4">
                {value && (
                    <div className="relative w-[200px] h-[200px] rounded-md overflow-hidden">
                        <div className="z-10 absolute top-2 right-2">
                            <Button
                                type="button"
                                onClick={() => onRemove(value)}
                                variant="destructive"
                                size="sm"
                            >
                                <Trash className="h-4 w-4" />
                            </Button>
                        </div>
                        <Image
                            fill
                            className="object-cover"
                            alt="Image"
                            src={value}
                        />
                    </div>
                )}
            </div>
            <CldUploadWidget
                onUpload={onUpload}
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
            >
                {({ open }) => {
                    const onClick = () => {
                        open();
                    }

                    return (
                        <Button
                            type="button"
                            disabled={disabled}
                            variant="secondary"
                            onClick={onClick}
                        >
                            <ImagePlus className="h-4 w-4 mr-2" />
                            Upload an Image
                        </Button>
                    )
                }}
            </CldUploadWidget>
        </div>
    )
}
