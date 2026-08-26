import { readFile } from 'node:fs/promises';
import type { MultipartFile } from '@adonisjs/bodyparser';
import { BadRequestException } from '#exceptions/http_exceptions';

export interface UploadedFilePayload {
  /** Raw file bytes, ready for streaming to storage. */
  buffer: Buffer;
  /** MIME type reported by the client, validated against an allowlist when provided. */
  mimetype: string;
  /** Original file name as uploaded by the client. */
  originalname: string;
}

/**
 * Image MIME types accepted across the application.
 */
export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
]);

/**
 * Normalizes a bodyparser multipart file into the payload shape consumed
 * by the storage/cloudinary services.
 *
 * Bodyparser stores uploads in a temporary file on disk; this helper reads
 * those bytes so callers never depend on where the temp file lives.
 */
export async function toUploadedFilePayload(
  file: MultipartFile,
  options: { allowedMimeTypes?: Set<string> } = {},
): Promise<UploadedFilePayload> {
  if (!file.isValid) {
    throw new BadRequestException(
      file.errors[0]?.message || 'The uploaded file is invalid.',
    );
  }

  if (!file.tmpPath) {
    throw new BadRequestException('The uploaded file could not be processed.');
  }

  const mimetype = file.type;
  if (
    options.allowedMimeTypes &&
    (!mimetype || !options.allowedMimeTypes.has(mimetype))
  ) {
    throw new BadRequestException(
      'Only JPG, PNG, WEBP, AVIF, and GIF images are allowed.',
    );
  }

  const buffer = await readFile(file.tmpPath);

  return {
    buffer,
    mimetype: mimetype || 'application/octet-stream',
    originalname: file.clientName,
  };
}
