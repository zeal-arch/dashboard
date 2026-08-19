import { useState } from 'react';

interface UploadResult {
    publicUrl: string;
    fileName: string;
}

export function useB2Upload() {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const uploadFile = async (file: File): Promise<UploadResult> => {
        setIsUploading(true);
        setError(null);
        setUploadProgress(0);

        try {
            // 1. Get presigned URL
            const res = await fetch('/api/admin/storage/b2', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName: file.name,
                    fileType: file.type,
                    fileSize: file.size
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to get upload URL');
            }

            const { signedUrl, publicUrl, fileName } = await res.json();

            // 2. Upload directly to B2
            // We use XMLHttpRequest instead of fetch to get upload progress
            await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                
                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        const progress = Math.round((event.loaded / event.total) * 100);
                        setUploadProgress(progress);
                    }
                });

                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve();
                    } else {
                        reject(new Error(`B2 Upload failed with status ${xhr.status}`));
                    }
                });

                xhr.addEventListener('error', () => {
                    reject(new Error('Network error during upload'));
                });

                xhr.open('PUT', signedUrl);
                xhr.setRequestHeader('Content-Type', file.type);
                // Important: don't let browser set its own Content-Type with boundary for generic data,
                // setting it to file.type explicitly above should be enough, but sending `file` as body works
                xhr.send(file);
            });

            setUploadProgress(100);
            return { publicUrl, fileName };
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unknown upload error';
            setError(msg);
            throw err;
        } finally {
            setIsUploading(false);
        }
    };

    return { uploadFile, isUploading, uploadProgress, error };
}
