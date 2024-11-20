import { Storage } from '@google-cloud/storage';
import internal from 'stream';
import { GOOGLE_BUCKET_NAME, GOOGLE_PROJECT_ID } from '../constants';

// Create a storage client using the API Key for authentication
const storage = new Storage({
  projectId: GOOGLE_PROJECT_ID,
  keyFilename: 'google-bucket-key.json',
});

// Get a reference to the bucket
const bucket = storage.bucket(GOOGLE_BUCKET_NAME);

export const uploadAudio = async (readableStream: NodeJS.ReadableStream) => {
  // The name of the file to upload the stream
  const timestamp = Date.now();
  const fileName = `audio_${timestamp}.mp3`;

  // Reference to the bucket and the file where we want to upload
  const file = bucket.file(fileName);

  // Generate signed URL
  const [signedUrl] = await file.getSignedUrl({
    action: 'read', // 'read' allows downloading the file
    expires: Date.now() + 1000 * 60 * 60, // URL expires in 1 hour
  });

  // Create a writable stream for uploading to Google Cloud Storage
  const writeStream = file.createWriteStream({
    resumable: false, // Set to true for large file uploads
    contentType: 'audio/mpeg', // Adjust the content type if necessary
  });

  // Pipe the readable stream to the writable stream
  readableStream.pipe(writeStream);

  // Wait for the stream upload to complete (or error)
  try {
    await streamUploadPromise(writeStream);

    return {
      error: null,
      data: { audioUrl: signedUrl },
    };
  } catch (err) {
    console.error('Error uploading file:', err);
    return {
      error: { message: `Error uploading file` },
      data: null,
    };
  }
};

async function clearBucket() {
  await bucket.deleteFiles();
}

// Function to wrap writeStream events in a promise
async function streamUploadPromise(writeStream: internal.Writable) {
  return new Promise((resolve, reject) => {
    writeStream.on('finish', resolve); // Resolve the promise when upload finishes
    writeStream.on('error', reject); // Reject the promise if an error occurs
  });
}
