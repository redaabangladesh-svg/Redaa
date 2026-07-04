import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

export function getR2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

export async function uploadToR2(key: string, body: Buffer, contentType: string): Promise<string> {
  const client = getR2Client();
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;
}

export async function deleteFromR2(key: string): Promise<void> {
  const client = getR2Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    })
  );
}
