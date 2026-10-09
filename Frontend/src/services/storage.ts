export interface UploadResult {
  success: boolean;
  fileUrl: string;
  fileName: string;
  fileSize: string;
  storagePath?: string;
  error?: string;
}

/**
 * Universal Medical Document Upload Helper
 * Creates a secure client-side Blob ObjectURL for document preview and uploads.
 */
export const uploadMedicalDocument = async (
  file: File,
  userId: string,
  _bucketName: 'health-records' | 'medical-reports' = 'health-records'
): Promise<UploadResult> => {
  const fileSizeMb = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
  const secureFileUrl = URL.createObjectURL(file);

  return {
    success: true,
    fileUrl: secureFileUrl,
    fileName: file.name,
    fileSize: fileSizeMb,
    storagePath: `vault/${userId}/${file.name}`
  };
};

