import { put } from "@vercel/blob";

export async function uploadFile(file: File) {
  const blob = await put(file.name, file, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return {
    url: blob.url,
    downloadUrl: blob.downloadUrl,
    filename: blob.pathname,
    contentType: blob.contentType,
  };
}

export async function deleteFile(url: string) {
  const { del } = await import("@vercel/blob");
  await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
}

export function getFileUrl(filename: string, publicAccess = true): string {
  if (publicAccess) {
    return `${process.env.BLOB_BASE_URL || process.env.VERCEL_BLOB_URL || ""}/${filename}`;
  }
  return `/api/blob/${filename}`;
}
