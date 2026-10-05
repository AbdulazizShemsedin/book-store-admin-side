export interface MockUploadSession {
  sessionId: string;
  uploadId: string;
  key: string;
  contentType: string;
  expectedParts: number;
  uploadedParts: { partNumber: number; etag: string }[];
  isCompleted: boolean;
  createdAt: string;
}

export const activeUploadSessions = new Map<string, MockUploadSession>();
