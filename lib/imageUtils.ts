import { Buffer } from "node:buffer";
import sharp from "sharp";

const IMAGE_SIZE = 300;

/**
 * Resize image to 300x300 pixels and return as JPEG buffer
 */
export async function resizeImage(imageBuffer: Buffer | Uint8Array): Promise<Uint8Array> {
    const resized = await sharp(imageBuffer)
        .resize(IMAGE_SIZE, IMAGE_SIZE, {
            fit: "cover",
            position: "center",
        })
        .jpeg({ quality: 85 })
        .toBuffer();

    return new Uint8Array(resized);
}

/**
 * Validate that image is square (aspect ratio 1:1 within tolerance)
 */
export async function validateSquareImage(imageBuffer: Buffer | Uint8Array): Promise<{ valid: boolean; width?: number; height?: number; error?: string }> {
    try {
        const metadata = await sharp(imageBuffer).metadata();

        if (!metadata.width || !metadata.height) {
            return { valid: false, error: "Could not determine image dimensions" };
        }

        const tolerance = 0.01; // 1% tolerance
        const ratio = metadata.width / metadata.height;

        if (Math.abs(ratio - 1) > tolerance) {
            return {
                valid: false,
                width: metadata.width,
                height: metadata.height,
                error: `Image must be square. Got ${metadata.width}x${metadata.height}`,
            };
        }

        return { valid: true, width: metadata.width, height: metadata.height };
    } catch (error) {
        return { valid: false, error: `Invalid image: ${error instanceof Error ? error.message : "unknown error"}` };
    }
}
