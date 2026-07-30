export interface IUploadedImage {
  url: string;
  storageKey: string;
  width?: number;
  height?: number;
  fileSize?: number;
  mimeType?: string;
}

export interface IUploadOptions {
  folder: string;
}