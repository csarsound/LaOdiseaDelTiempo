self.onmessage = async function (event) {
  const data = event.data;
  try {
    if (data.type === 'init') {
      self.postMessage({ type: 'status', message: 'Classic worker started - loading MediaPipe library...' });
      const visionModule = await import(data.moduleUrl);
      self.postMessage({ type: 'status', message: 'MediaPipe library loaded - starting WASM...' });
      const wasmLoaderUrl = data.wasmRoot.replace(/\/$/, '') + '/vision_wasm_internal.js';
      const wasmCheck = await fetch(wasmLoaderUrl, { cache: 'no-store' });
      if (!wasmCheck.ok) throw new Error('MediaPipe WASM loader HTTP ' + wasmCheck.status + ': ' + wasmLoaderUrl);
      const wasmSource = await wasmCheck.text();
      if (wasmSource.trimStart().startsWith('<')) throw new Error('The preview returned HTML for MediaPipe WASM: ' + wasmLoaderUrl);
      const vision = await visionModule.FilesetResolver.forVisionTasks(data.wasmRoot, false);
      const response = await fetch(data.modelUrl, { cache: 'no-store' });
      if (!response.ok) throw new Error('Hand model HTTP ' + response.status);
      const model = new Uint8Array(await response.arrayBuffer());
      self.landmarker = await visionModule.HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetBuffer: model }, runningMode: 'VIDEO', numHands: data.numHands || 1,
        minHandDetectionConfidence: .35, minHandPresenceConfidence: .35, minTrackingConfidence: .35
      });
      self.postMessage({ type: 'ready' });
    } else if (data.type === 'frame' && self.landmarker) {
      if (typeof OffscreenCanvas === 'undefined') throw new Error('OffscreenCanvas is not supported by this browser.');
      if (!self.frameCanvas || self.frameCanvas.width !== data.width || self.frameCanvas.height !== data.height) {
        self.frameCanvas = new OffscreenCanvas(data.width, data.height);
        self.frameContext = self.frameCanvas.getContext('2d');
      }
      self.frameContext.putImageData(new ImageData(new Uint8ClampedArray(data.buffer), data.width, data.height), 0, 0);
      const result = self.landmarker.detectForVideo(self.frameCanvas, data.timestamp);
      self.postMessage({ type: 'result', landmarks: result.landmarks, handedness: result.handedness });
    }
  } catch (error) {
    self.postMessage({ type: 'error', message: error && error.message || String(error), stack: error && error.stack || '' });
  }
};
