/**
 * Upload Limits Configuration
 * 
 * Centralized configuration for file upload restrictions
 * to prevent API abuse and improve reliability.
 */

export const UPLOAD_LIMITS = {
    /** Maximum number of files allowed in a single batch upload */
    MAX_FILES_PER_BATCH: 20,

    /** Maximum file size in megabytes per individual file */
    MAX_FILE_SIZE_MB: 10,

    /** Maximum total batch size in megabytes */
    MAX_BATCH_SIZE_MB: 100,

    /** Maximum number of concurrent uploads to process at once */
    MAX_CONCURRENT_UPLOADS: 3,

    /** Number of retry attempts for failed uploads */
    RETRY_ATTEMPTS: 3,

    /** Retry delay in milliseconds for exponential backoff [1s, 2s, 4s] */
    RETRY_DELAY_MS: [1000, 2000, 4000] as const,

    /** Allowed image MIME types */
    ALLOWED_IMAGE_TYPES: [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
    ] as const,

    /** Allowed video MIME types */
    ALLOWED_VIDEO_TYPES: [
        'video/mp4',
        'video/webm',
        'video/quicktime',
    ] as const,
} as const;

/**
 * Get all allowed file types as a comma-separated string
 * for use in file input accept attribute
 */
export const getAllowedFileTypes = (): string => {
    return [...UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES, ...UPLOAD_LIMITS.ALLOWED_VIDEO_TYPES].join(',');
};

/**
 * Check if a file type is allowed
 */
export const isFileTypeAllowed = (fileType: string): boolean => {
    type AllowedType = typeof UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES[number] | typeof UPLOAD_LIMITS.ALLOWED_VIDEO_TYPES[number];
    const allTypes: readonly string[] = [...UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES, ...UPLOAD_LIMITS.ALLOWED_VIDEO_TYPES];
    return allTypes.includes(fileType as AllowedType);
};

/**
 * Get human-readable file size
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 KB';

    const suffixes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    return `${Math.floor(bytes / Math.pow(1024, i))} ${suffixes[i]}`;
};
