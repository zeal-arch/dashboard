export const VIDEO_EXTENSIONS = ["mp4", "mov", "webm", "mkv", "avi", "wmv", "flv"];

/**
 * Checks if a URL seems to be a video file based on its extension.
 */
export function isVideoUrl(url: string | null | undefined): boolean {
    if (!url) return false;
    const extension = url.split(".").pop()?.toLowerCase();
    return !!extension && VIDEO_EXTENSIONS.includes(extension);
}

/**
 * Ensures a URL is a valid image URL. 
 * If the URL ends in a video extension, it returns null (invalid as an image).
 */
export function getValidImageUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    const trimmed = url.trim();
    if (!trimmed) return null;

    // If it looks like a video, it's not a valid *static* image URL
    if (isVideoUrl(trimmed)) return null;

    // Basic validation: must be absolute path or start with /
    return /^https?:\/\//i.test(trimmed) || trimmed.startsWith("/") ? trimmed : null;
}

/**
 * Generates a thumbnail URL for a video by replacing the file extension with .jpg.
 */
export function getVideoThumbnail(videoUrl: string | null | undefined): string | null {
    if (!videoUrl) return null;
    return videoUrl.replace(/\.[^/.]+$/, ".jpg");
}

/**
 * Smart resolver for media posters.
 * 1. Prefer the explicit image_url if provided and valid.
 * 2. If image_url is missing or is actually a video file, try to generate a thumbnail from video_url.
 */
export function getMediaPoster(item: { image_url?: string | null; video_url?: string | null; media_type?: string }): string | undefined {
    const validImage = getValidImageUrl(item.image_url);
    if (validImage) return validImage;

    if (item.video_url) {
        return getVideoThumbnail(item.video_url) || undefined; // Force null to undefined for React props
    }

    return undefined;
}
