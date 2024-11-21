const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY as string;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY as string;
const GOOGLE_BUCKET_NAME = process.env.GOOGLE_BUCKET_NAME as string;
const GOOGLE_PROJECT_ID = process.env.GOOGLE_BUCKET_NAME as string;

// Elevenlabs voices
const ELEVENLABS_VOICEID_JESSICA = 'cgSgspJ2msm6clMCkdW9'; // conversational, expressive
const ELEVENLABS_VOICEID_SARAH = 'EXAVITQu4vr4xnSDxMaL'; // news, soft

export {
  ELEVENLABS_API_KEY,
  ELEVENLABS_VOICEID_JESSICA,
  ELEVENLABS_VOICEID_SARAH,
  GOOGLE_API_KEY,
  GOOGLE_BUCKET_NAME,
  GOOGLE_PROJECT_ID,
};
