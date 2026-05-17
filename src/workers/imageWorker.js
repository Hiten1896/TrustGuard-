self.onmessage = function(e) {
  const { type, data, width, height } = e.data;

  if (type === 'MEASURE_NOISE') {
    const d = data;
    const sW = width;
    const sH = height;
    let sumVar = 0, count = 0;
    for (let y = 2; y < sH - 2; y += 4) {
      for (let x = 2; x < sW - 2; x += 4) {
        const i = (y * sW + x) * 4;
        const center = (d[i] + d[i + 1] + d[i + 2]) / 3;
        let localSum = 0, localCount = 0;
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const j = ((y + dy) * sW + (x + dx)) * 4;
            if (j >= 0 && j < d.length - 2) {
              const v = (d[j] + d[j + 1] + d[j + 2]) / 3;
              localSum += (v - center) * (v - center);
              localCount++;
            }
          }
        }
        sumVar += Math.sqrt(localSum / localCount);
        count++;
      }
    }
    const noiseSigma = parseFloat((sumVar / count).toFixed(3));
    self.postMessage({ type: 'NOISE_RESULT', result: noiseSigma });
  }

  if (type === 'COMPUTE_ELA') {
    const { orig, re, width, height } = e.data;
    let mse = 0;
    for (let i = 0; i < orig.length; i += 4) {
      mse += (orig[i] - re[i]) ** 2 + (orig[i + 1] - re[i + 1]) ** 2 + (orig[i + 2] - re[i + 2]) ** 2;
    }
    mse /= (width * height * 3);
    const elaScore = parseFloat(Math.min(100, Math.sqrt(mse) * 1.5).toFixed(2));
    self.postMessage({ type: 'ELA_RESULT', result: elaScore });
  }
};
