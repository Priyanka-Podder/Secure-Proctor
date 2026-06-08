import * as faceapi from 'face-api.js';

const MODEL_URL = '/models'; 

/**
 * Checks if the models are loaded. 
 * If not, it loads them.
 */
const ensureModelsLoaded = async () => {
  // If the tinyFaceDetector isn't initialized, we need to load models
  if (!faceapi.nets.tinyFaceDetector.params) {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
  }
};

export const detectFaceAndExtractEmbedding = async (input) => {
  try {
    await ensureModelsLoaded();
    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.3 });

    // Retry loop: try detection 5 times
    for (let i = 0; i < 5; i++) {
      const detection = await faceapi
        .detectSingleFace(input, options)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        return { success: true, embedding: Array.from(detection.descriptor) };
      }
      // Wait 500ms before next attempt
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return { success: false, message: 'No face detected after retries' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const compareFaceEmbeddings = (embedding1, embedding2, threshold = 0.6) => {
  // Ensure inputs are valid before calculating distance
  if (!embedding1 || !embedding2) return false;
  
  const distance = Math.sqrt(
    embedding1.reduce((sum, val, idx) => sum + Math.pow(val - embedding2[idx], 2), 0)
  );
  return distance < threshold;
};