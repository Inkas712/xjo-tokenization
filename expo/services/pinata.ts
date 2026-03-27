import { Platform } from 'react-native';
import * as Sentry from '@sentry/react-native';

const PINATA_JWT = process.env.EXPO_PUBLIC_PINATA_JWT || '';
const PINATA_GATEWAY = process.env.EXPO_PUBLIC_PINATA_GATEWAY || 'https://gateway.pinata.cloud';
const PINATA_UPLOAD_URL = 'https://uploads.pinata.cloud/v3/files';

export interface PinataUploadResult {
  success: boolean;
  ipfsHash?: string;
  ipfsUrl?: string;
  pinSize?: number;
  timestamp?: string;
  error?: string;
}

export interface PinataMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: { trait_type: string; value: string | number }[];
  properties?: Record<string, any>;
}

function uploadWithXHR(
  formData: FormData,
): Promise<any> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', PINATA_UPLOAD_URL);
    xhr.setRequestHeader('Authorization', `Bearer ${PINATA_JWT}`);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new Error('Failed to parse response'));
        }
      } else {
        reject(new Error(`Upload failed: ${xhr.status} - ${xhr.responseText}`));
      }
    };
    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.ontimeout = () => reject(new Error('Upload timed out'));
    xhr.timeout = 60000;
    xhr.send(formData);
  });
}

export async function uploadFileToPinata(
  fileUri: string,
  fileName: string,
): Promise<PinataUploadResult> {
  try {
    if (!PINATA_JWT) {
      console.error('[Pinata] JWT not configured');
      return { success: false, error: 'Pinata JWT not configured' };
    }

    console.log(`[Pinata] Uploading file: ${fileName}`);

    const formData = new FormData();

    if (Platform.OS === 'web') {
      const response = await fetch(fileUri);
      const blob = await response.blob();
      formData.append('file', blob, fileName);
    } else {
      const fileExtension = fileUri.split('.').pop() || 'jpg';
      const mimeType = fileExtension === 'png' ? 'image/png'
        : fileExtension === 'gif' ? 'image/gif'
        : fileExtension === 'svg' ? 'image/svg+xml'
        : fileExtension === 'pdf' ? 'application/pdf'
        : 'image/jpeg';

      formData.append('file', {
        uri: fileUri,
        name: fileName,
        type: mimeType,
      } as any);
    }

    const data = await uploadWithXHR(formData);
    const cid = data?.data?.cid || data?.cid || data?.IpfsHash || data?.ipfsHash;
    console.log(`[Pinata] File uploaded successfully. CID: ${cid}`);

    const ipfsUrl = `${PINATA_GATEWAY}/ipfs/${cid}`;

    return {
      success: true,
      ipfsHash: cid,
      ipfsUrl,
      pinSize: data?.data?.size || data?.PinSize,
      timestamp: data?.data?.created_at || new Date().toISOString(),
    };
  } catch (err: any) {
    console.error('[Pinata] Upload error:', err);
    Sentry.captureException(err, { tags: { service: 'pinata', method: 'uploadFileToPinata' } });
    return { success: false, error: err?.message || 'Network error during upload' };
  }
}

export async function uploadMetadataToPinata(
  metadata: PinataMetadata,
): Promise<PinataUploadResult> {
  try {
    if (!PINATA_JWT) {
      console.error('[Pinata] JWT not configured');
      return { success: false, error: 'Pinata JWT not configured' };
    }

    console.log(`[Pinata] Uploading metadata for: ${metadata.name}`);

    const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
    const formData = new FormData();
    formData.append('file', blob, `${metadata.name}-metadata.json`);

    const data = await uploadWithXHR(formData);
    const cid = data?.data?.cid || data?.cid || data?.IpfsHash || data?.ipfsHash;
    console.log(`[Pinata] Metadata uploaded. CID: ${cid}`);

    const ipfsUrl = `${PINATA_GATEWAY}/ipfs/${cid}`;

    return {
      success: true,
      ipfsHash: cid,
      ipfsUrl,
      pinSize: data?.data?.size || data?.PinSize,
      timestamp: data?.data?.created_at || new Date().toISOString(),
    };
  } catch (err) {
    console.error('[Pinata] Metadata upload error:', err);
    Sentry.captureException(err, { tags: { service: 'pinata', method: 'uploadMetadataToPinata' } });
    return { success: false, error: 'Network error during metadata upload' };
  }
}

export interface PinataConnectionTest {
  configured: boolean;
  connected: boolean;
  latencyMs?: number;
  error?: string;
}

export async function testPinataConnection(): Promise<PinataConnectionTest> {
  if (!PINATA_JWT) {
    console.log('[Pinata] JWT not configured');
    return { configured: false, connected: false, error: 'EXPO_PUBLIC_PINATA_JWT not set' };
  }

  try {
    const start = Date.now();
    console.log('[Pinata] Testing connection via authentication endpoint...');

    const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
        'Content-Type': 'application/json',
      },
    });

    const latencyMs = Date.now() - start;

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`[Pinata] Test failed: ${response.status} - ${errorText}`);
      return { configured: true, connected: false, latencyMs, error: `Pinata returned ${response.status}` };
    }

    const data = await response.json();
    console.log(`[Pinata] Connection OK. Message: ${data?.message}, Latency: ${latencyMs}ms`);

    return { configured: true, connected: true, latencyMs };
  } catch (err: any) {
    console.error('[Pinata] Connection test error:', err);
    Sentry.captureException(err, { tags: { service: 'pinata', method: 'testPinataConnection' } });
    return { configured: true, connected: false, error: err?.message || 'Network error' };
  }
}

export function getIpfsUrl(hash: string): string {
  return `${PINATA_GATEWAY}/ipfs/${hash}`;
}

const isPinataConfigured = (): boolean => !!PINATA_JWT;

export { isPinataConfigured, PINATA_GATEWAY };
