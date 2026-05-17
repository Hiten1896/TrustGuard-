import { _seed, _prng } from '../utils/forensicUtils';

async function runInWorker(workerPath, message) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL(workerPath, import.meta.url), { type: 'module' });
    const timeout = setTimeout(() => {
        worker.terminate();
        reject(new Error("Worker Timeout: Large file or complex loop."));
    }, 15000); // 15s circuit breaker

    worker.onmessage = (e) => {
      clearTimeout(timeout);
      resolve(e.data.result);
      worker.terminate();
    };
    worker.onerror = (err) => {
      clearTimeout(timeout);
      reject(err);
      worker.terminate();
    };
    worker.postMessage(message);
  });
}

/**
 * FIXED: ELA must happen on the original resolution to preserve JPEG grid artifacts.
 * We now use a "Center-Crop" strategy for performance if the image is massive,
 * instead of a "Global Downscale" which destroys evidence.
 */
async function extractAnalysisBuffer(imgObj, size = 1024) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // If image is manageable, use full res. If huge, take a high-res center crop.
    const sourceX = imgObj.width > size ? (imgObj.width - size) / 2 : 0;
    const sourceY = imgObj.height > size ? (imgObj.height - size) / 2 : 0;
    const drawW = Math.min(imgObj.width, size);
    const drawH = Math.min(imgObj.height, size);
    
    canvas.width = drawW;
    canvas.height = drawH;
    ctx.drawImage(imgObj, sourceX, sourceY, drawW, drawH, 0, 0, drawW, drawH);
    return { 
        data: ctx.getImageData(0, 0, drawW, drawH).data,
        width: drawW,
        height: drawH,
        canvas 
    };
}

export async function measureNoiseFloor(file) {
  try {
    const imgObj = new Image();
    const url = URL.createObjectURL(file);
    imgObj.src = url;
    await new Promise((res, rej) => { imgObj.onload = res; imgObj.onerror = rej; });
    URL.revokeObjectURL(url);
    
    const { data, width, height } = await extractAnalysisBuffer(imgObj, 800);
    
    return await runInWorker('../workers/imageWorker.js', {
      type: 'MEASURE_NOISE',
      data,
      width,
      height
    });
  } catch (e) { 
    console.error("Noise Analysis Failed:", e);
    return null; 
  }
}

export async function computeELA(file) {
  try {
    const imgObj = new Image();
    const url = URL.createObjectURL(file);
    imgObj.src = url;
    await new Promise((res, rej) => { imgObj.onload = res; imgObj.onerror = rej; });
    URL.revokeObjectURL(url);
    
    // USE CENTER CROP AT 100% SCALE TO PRESERVE ARTIFACTS
    const { data: orig, width, height, canvas } = await extractAnalysisBuffer(imgObj, 800);
    
    const img2 = new Image();
    img2.src = canvas.toDataURL('image/jpeg', 0.85); // Re-compress
    await new Promise(r => img2.onload = r);
    
    const canvas2 = document.createElement('canvas');
    canvas2.width = width; canvas2.height = height;
    const ctx2 = canvas2.getContext('2d');
    ctx2.drawImage(img2, 0, 0);
    const re = ctx2.getImageData(0, 0, width, height).data;
    
    return await runInWorker('../workers/imageWorker.js', {
      type: 'COMPUTE_ELA',
      orig,
      re,
      width,
      height
    });
  } catch (e) { 
    console.error("ELA Analysis Failed:", e);
    return null; 
  }
}

export async function analyzeImageForensics(file, buffer) {
    // REAL METRICS ONLY
    const ext = (file?.name || '').split('.').pop().toLowerCase();
    const mime = file?.type || '';
    const isImg = mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp'].includes(ext);

    let elaScore = 0;
    let noiseSigma = 0;
    let hasRealData = false;

    if (isImg) {
        const [ela, noise] = await Promise.all([
            computeELA(file),
            measureNoiseFloor(file)
        ]);
        if (ela !== null) { elaScore = ela; hasRealData = true; }
        if (noise !== null) { noiseSigma = noise; }
    }

    const socialPlatforms = /^(wa|fb|ig|msg|snap|whatsapp|instagram|telegram|twitter|x_)/i.test(file.name);
    
    // AI Score Heuristic: Based purely on real pixel anomalies
    // Unnaturally low noise + low ELA variance usually indicates synthetic generation
    const noNoise = noiseSigma < 0.4 && !socialPlatforms;
    const aiScore = (noNoise ? 60 : 0) + (elaScore < 0.8 ? 20 : 0);

    let verdict = 'clean';
    let label = 'Pixel Integrity Verified';
    let summary = 'Standard analysis shows no significant pixel inconsistencies.';

    if (elaScore > 12.0) {
        verdict = 'warning';
        label = 'Manipulation Detected';
        summary = `High ELA variance (${elaScore.toFixed(2)}) detected. This suggests selective re-saving or pixel splicing.`;
    } else if (noNoise) {
        verdict = 'warning';
        label = 'Synthetic Signature';
        summary = `Unnaturally low noise floor (σ=${noiseSigma}). Natural photographs usually exhibit sensor grain. This is consistent with AI generation.`;
    }

    const fields = {
        'Analysis Mode': 'Deterministic Signal Processing',
        'ELA Metric': hasRealData ? `${elaScore.toFixed(2)}` : 'Unavailable',
        'Noise Floor (σ)': noiseSigma > 0 ? `${noiseSigma.toFixed(4)}` : 'Unavailable',
        'AI Generation Index': `${aiScore}% (Heuristic)`,
        'C2PA Credentials': 'Check Pending (Cloud API)',
        'GAN Spectral Analysis': 'Requires Frequency Domain API',
        'Source Fingerprint': socialPlatforms ? 'Platform Compressed' : 'Original/Direct'
    };

    return {
        fields,
        verdict, verdictLabel: label, aiScore,
        summary
    };
}
