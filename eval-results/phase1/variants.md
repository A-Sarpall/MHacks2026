# Source variants (scripts/make-source-variants.mjs)

Usage: `node scripts/make-source-variants.mjs <inputDir> [--out-prefix test-images-public/dev]`
Writes `<out-prefix>-webcam`, `-phone`, `-ring-wifi`, `-ring-ble` with the same file names (jpg/jpeg/png/webp inputs, all written as JPEG under the original name) plus a `labels.json` copied from the input with the source name appended to each entry's `tags`. For letterboxed sources the normalized `aim` point is remapped into the padded frame so it still lands on the object (e.g. mug-01 aim 0.45 -> 0.4625 in the webcam variant; `node -e` check on the test output).

Inputs are EXIF-rotated first (`sharp().rotate()`), which matches `orientFrame` producing upright frames before detection.

## Parameters per source

| Source | Output size | Fit | JPEG quality | Basis |
|---|---|---|---|---|
| webcam | 640x480 exactly | keep aspect, letterbox on black | 95 | getUserMedia `width: {ideal: 640}, height: {ideal: 480}` (src/vision/sources/WebcamSource.ts:66-69, verified); frames are `createImageBitmap(video)` with no JPEG encode (WebcamSource.ts:160, verified), so q95 only stands in for "effectively uncompressed". Letterbox = what a 4:3 camera frame looks like when the eval image is not 4:3. |
| phone | fit inside 4032x3024, keep aspect, no padding, upscaling allowed | inside | 50 | phone/src/App.tsx:92 `takePictureAsync({ quality: 0.5 })` (verified); no `pictureSize`/`ratio` prop on `<CameraView>` (phone/src/App.tsx:216 and `grep -n "pictureSize\|ratio" phone/src/App.tsx` -> only line 92 `quality`), so the phone returns its default full-sensor still; 4032x3024 (12 MP, 4:3) is an INFERENCE for a modern phone, not verifiable in repo. Expo quality 0.5 mapped to libjpeg q50 (inference about expo-camera's 0-1 -> 0-100 mapping). No resize or re-encode downstream: server/ring.ts:25-27 `relay()` forwards the raw frame; src/vision/sources/types.ts:78-81 `decodeJpeg` = `new Blob(...,'image/jpeg')` -> `createImageBitmap` at full size (verified). No padding because the phone sends the whole sensor frame, and cropping would risk removing labelled objects. |
| ring-wifi | 640x480 exactly | letterbox on black | 80 | No firmware exists (README "Wire protocols (placeholders until the firmware exists)"); browser decodes any complete JPEG at native size (WebSocketSource.ts:119 -> types.ts:78-81). VGA 640x480 and q80 (~ESP32 camera default `jpeg_quality` 12 on its 0-63 scale) are INFERENCES about an ESP32-CAM-class board. |
| ring-ble | 320x240 exactly | letterbox on black | 60 | No firmware; UUIDs are placeholders (BleStillSource.ts, bleLink.ts `RING_BLE`). BLE throughput of tens of KB/s against the 8000 ms timeout / 1500 ms gap (BleStillSource.ts:74-76, verified) forces small frames; 320x240 q60 (~8 KB per frame in the test run) is an INFERENCE. |

## Why bursts are not simulated

All four directories hold one file per input image. In still mode the browser requests burst+discard frames (default 3+1, src/vision/settings.ts:43-45 verified), drops the first `discard`, scores the rest with the Laplacian sharpness measure and names the sharpest (README "Bursts"). Starting from one static image every burst frame would be pixel-identical, so the selection step would be a no-op and the eval would just run the same image N times. Simulating what bursts actually buy (hand shake, exposure flicker, timing gaps between phone shots) requires synthetic motion-blur/exposure models that are not grounded in any measurement in this repo; `settings.sim` (shake, frameMs) already covers that inside the app for the file source. The variants therefore isolate resolution + compression only.

## Test run (test-images, 25 images)

Command: `node scripts/make-source-variants.mjs /Users/romaxa/cue/test-images --out-prefix /Users/romaxa/cue/.cache-phase1/variant-test` (2.07 s wall per `time`), then a sharp decode/metadata loop over every output (`node -e` script; `sharp(...).raw().toBuffer()` on each file, 0 decode failures in all four sets). Source images are 1024x1024 class (mug-01.jpg 1024x1024 from `sharp.metadata()`), so the phone variant upsamples.

| Variant | Files | Decode failures | Dimensions | Mean file size | labels.json entries tagged |
|---|---|---|---|---|---|
| webcam | 25 | 0 | 640x480 (25/25) | 68,160 B | 25/25 |
| phone | 25 | 0 | long side 4032 or 3024 as aspect allows: 4032x2689 x9, 4032x3024 x2, 4032x2693 x2, 4032x2268 x2, 3024x3024, 2277x3024, 2002x3024, 2268x3024, 4032x2953, 3609x3024, 4011x3024, 2980x3024, 4032x2264, 4032x2670 | 289,368 B | 25/25 |
| ring-wifi | 25 | 0 | 640x480 (25/25) | 36,560 B | 25/25 |
| ring-ble | 25 | 0 | 320x240 (25/25) | 8,212 B | 25/25 |

Outputs exist only under `/Users/romaxa/cue/.cache-phase1/variant-test-*` (already-untracked cache dir). The dev set does not exist yet; run the script on it with `--out-prefix test-images-public/dev` when it does.

## Limitations

- Phone, ring-wifi and ring-ble resolutions/qualities are inferences (marked above); edit the `SOURCES` table at the top of the script once real captures are measured.
- Phone variant upsamples small eval images; a real phone still has genuine detail at that size. Treat the phone variant as "large decode + q50 artefacts" rather than "more detail".
- Webcam/ring letterbox bars are black; a real camera would show more scene instead of bars.
