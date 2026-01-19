import imageCompression from 'browser-image-compression';

/**
 * Compress an image file before upload
 * @param file - The image file to compress
 * @returns Compressed file
 */
export async function compressImage(file: File): Promise<File> {
    const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/jpeg' as const, // Convert to JPEG for better compression
    };

    try {
        const compressedFile = await imageCompression(file, options);

        // Log compression results
        console.log(`Original size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        console.log(`Compressed size: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
        console.log(`Compression ratio: ${((1 - compressedFile.size / file.size) * 100).toFixed(1)}%`);

        return compressedFile;
    } catch (error) {
        console.error('Image compression failed:', error);
        // Return original file if compression fails
        return file;
    }
}

/**
 * Compress multiple image files
 * @param files - Array of image files to compress
 * @returns Array of compressed files
 */
export async function compressImages(files: File[]): Promise<File[]> {
    const compressionPromises = files.map(file => compressImage(file));
    return Promise.all(compressionPromises);
}
