import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

export interface ImageValidationResult {
    isValid: boolean;
    error?: string;
}

export const validateImageFile = (file: File): ImageValidationResult => {
    //  file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return {
            isValid: false,
            error: `Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`
        };
    }

    //  file size
    if (file.size > MAX_FILE_SIZE) {
        const currentSizeMB = (file.size / 1024 / 1024).toFixed(2);
        const maxSizeMB = (MAX_FILE_SIZE / 1024 / 1024).toFixed(2);
        return {
            isValid: false,
            error: `File size too large. Maximum size is ${maxSizeMB}MB. Current size: ${currentSizeMB}MB`
        };
    }

    // file extension
    const fileName = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
    if (!hasValidExtension) {
        return {
            isValid: false,
            error: `Invalid file extension. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`
        };
    }

    return { isValid: true };
};

export const uploadToCloudinary = async (file: Buffer, folder: string = 'band-products'): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (file.length > MAX_FILE_SIZE) {
            reject(new Error(`File size too large. Maximum size is 5MB. Current size: ${(file.length / 1024 / 1024).toFixed(2)}MB`));
            return;
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'image',
                transformation: [
                    { width: 800, height: 800, crop: 'limit' },
                    { quality: 'auto:good' },
                    { format: 'webp' }
                ]
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else if (result) {
                    resolve(result.secure_url);
                } else {
                    reject(new Error('Upload failed'));
                }
            }
        );

        uploadStream.end(file);
    });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
    await cloudinary.uploader.destroy(publicId);
};

export const extractPublicId = (url: string): string => {
    const matches = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
    return matches ? matches[1]! : '';
};

export const validateFileSize = (file: Buffer): boolean => {
    return file.length <= MAX_FILE_SIZE;
};

export const getFileSizeMB = (file: Buffer): number => {
    return parseFloat((file.length / 1024 / 1024).toFixed(2));
};