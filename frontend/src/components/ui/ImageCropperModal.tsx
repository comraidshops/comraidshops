'use client';

import { useState, useCallback } from 'react';
import CropperImport from 'react-easy-crop';
const Cropper = CropperImport as any;
import { AdminModal } from '@/components/admin/AdminForms';

interface Point {
    x: number;
    y: number;
}

interface Area {
    width: number;
    height: number;
    x: number;
    y: number;
}

interface ImageCropperModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    onCropComplete: (croppedBlob: Blob) => void;
    aspectRatio?: number;
}

export function ImageCropperModal({ 
    isOpen, 
    onClose, 
    imageUrl, 
    onCropComplete, 
    aspectRatio = 4 / 5 // Default portrait ratio common in fashion/luxury e-commerce
}: ImageCropperModalProps) {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropCompleteHandler = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleCropSave = async () => {
        if (!croppedAreaPixels || !imageUrl) return;
        
        try {
            const croppedImageBlob = await getCroppedImg(imageUrl, croppedAreaPixels);
            if (croppedImageBlob) {
                onCropComplete(croppedImageBlob);
                onClose();
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <AdminModal isOpen={isOpen} onClose={onClose} title="Refine Curation (Crop)">
            <div className="relative w-full h-[50vh] bg-black/50 rounded-2xl overflow-hidden border border-white/5 mb-8">
                <Cropper
                    image={imageUrl}
                    crop={crop}
                    zoom={zoom}
                    aspect={aspectRatio}
                    onCropChange={setCrop}
                    onCropComplete={onCropCompleteHandler}
                    onZoomChange={setZoom}
                    classes={{ containerClassName: 'rounded-2xl' }}
                />
            </div>
            
            <div className="flex justify-between items-center mb-8">
                <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Zoom</label>
                <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => {
                        setZoom(Number(e.target.value));
                    }}
                    className="w-2/3 accent-primary"
                />
            </div>

            <div className="flex justify-end gap-4">
                <button 
                    type="button"
                    onClick={onClose} 
                    className="px-8 py-4 rounded-xl bg-white/5 text-white/60 hover:text-white hover:bg-white/10 uppercase text-[10px] font-black tracking-[0.2em] transition-all"
                >
                    Cancel
                </button>
                <button 
                    type="button"
                    onClick={handleCropSave} 
                    className="px-8 py-4 rounded-xl bg-primary text-black uppercase text-[10px] font-black tracking-[0.2em] hover:scale-105 transition-all"
                >
                    Apply Crop
                </button>
            </div>
        </AdminModal>
    );
}

// Helper to extract the cropped image
const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        // needed to avoid cross-origin issues with external images
        image.setAttribute('crossOrigin', 'anonymous'); 
        image.src = url;
    });

export async function getCroppedImg(
    imageSrc: string,
    pixelCrop: Area,
    rotation = 0,
    flip = { horizontal: false, vertical: false }
): Promise<Blob | null> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        return null;
    }

    // set canvas size to match the image
    canvas.width = image.width;
    canvas.height = image.height;

    // move to center and rotate
    ctx.translate(image.width / 2, image.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
    ctx.translate(-image.width / 2, -image.height / 2);

    // draw image
    ctx.drawImage(image, -image.width / 2, -image.height / 2);

    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d');

    if (!croppedCtx) {
        return null;
    }

    // Set the size of the cropped canvas
    croppedCanvas.width = pixelCrop.width;
    croppedCanvas.height = pixelCrop.height;

    // Draw the cropped image onto the new canvas
    croppedCtx.drawImage(
        canvas,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    // As a blob
    return new Promise((resolve, reject) => {
        croppedCanvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Canvas is empty'));
                return;
            }
            resolve(blob);
        }, 'image/jpeg', 0.95);
    });
}
