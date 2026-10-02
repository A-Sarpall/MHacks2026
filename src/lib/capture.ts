let stream: MediaStream | null = null;
let videoEl: HTMLVideoElement | null = null;

export async function initCamera(video: HTMLVideoElement): Promise<void> {
  stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment", width: 640, height: 480 },
    audio: false,
  });
  video.srcObject = stream;
  await video.play();
  videoEl = video;
}

export function getFrame(): ImageBitmap | null {
  if (!videoEl || videoEl.readyState < 2) return null;
  const canvas = new OffscreenCanvas(videoEl.videoWidth, videoEl.videoHeight);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(videoEl, 0, 0);
  // createImageBitmap is sync-like from OffscreenCanvas but we return the canvas data directly
  // For MediaPipe we need the video element itself, so we also expose it
  return null; // MediaPipe uses the video element directly
}

export function getVideoElement(): HTMLVideoElement | null {
  return videoEl;
}

export function stopCamera(): void {
  stream?.getTracks().forEach((t) => t.stop());
  stream = null;
  videoEl = null;
}
