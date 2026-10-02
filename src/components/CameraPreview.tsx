import { useEffect, useRef } from "react";
import { initCamera } from "../lib/capture";

interface Props {
  onReady: () => void;
}

export function CameraPreview({ onReady }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    initCamera(video).then(onReady).catch(console.error);
  }, [onReady]);

  return (
    <div className="relative">
      <video
        ref={videoRef}
        className="w-80 h-60 rounded-lg bg-gray-900 object-cover"
        playsInline
        muted
      />
      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
        Press Space to capture
      </div>
    </div>
  );
}
