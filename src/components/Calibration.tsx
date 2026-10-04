import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { offsetFromSamples, type CalibrationSample } from "../vision/core/aim";
import { MARKER_COLOR, findMarker } from "../vision/core/marker";
import type { StoredCalibration } from "../vision/calibration";

export interface CalibrationHandle {
  press(): void;
  undo(): void;
  save(): void;
}

interface Props {
  title: string;
  current: StoredCalibration | null;
  capture: () => Promise<HTMLCanvasElement | null>;
  onSave: (cal: StoredCalibration) => void;
  onReset: () => void;
  onClose: () => void;
}

const MIN_SAMPLES = 3;
const MAX_SAMPLES = 5;

export const Calibration = forwardRef<CalibrationHandle, Props>(function Calibration(
  { title, current, capture, onSave, onReset, onClose },
  ref
) {
  const [samples, setSamples] = useState<CalibrationSample[]>([]);
  const [pending, setPending] = useState<HTMLCanvasElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const samplesRef = useRef(samples);
  samplesRef.current = samples;

  const result = offsetFromSamples(samples);
  const canSave = samples.length >= MIN_SAMPLES;

  const add = (sample: CalibrationSample) => {
    setSamples((prev) => [...prev, sample].slice(-MAX_SAMPLES));
    setPending(null);
  };

  const save = () => {
    const list = samplesRef.current;
    if (list.length < MIN_SAMPLES) return;
    const r = offsetFromSamples(list);
    onSave({ offset: r.offset, spread: r.spread, samples: list.length, at: Date.now() });
  };

  const press = async () => {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      const image = await capture();
      if (!image) {
        setMessage("No picture. Is the camera connected?");
        return;
      }
      const p = findMarker(image);
      if (p) {
        add({ x: p.x, y: p.y, w: image.width, h: image.height });
        setMessage("Found the target.");
      } else {
        setPending(image);
        setMessage("Couldn't find the pink target. Tap where the thing you pointed at is in the picture.");
      }
    } catch (err) {
      setMessage(String((err as Error).message ?? err));
    } finally {
      setBusy(false);
    }
  };

  useImperativeHandle(ref, () => ({
    press: () => void press(),
    undo: () => setSamples((prev) => prev.slice(0, -1)),
    save,
  }));

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" data-testid="calibration">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full p-5 grid md:grid-cols-2 gap-5">
        <div className="flex flex-col items-center justify-center gap-3">
          <svg viewBox="0 0 100 100" className="w-64 h-64" aria-label="Calibration target">
            <circle cx="50" cy="50" r="46" fill={MARKER_COLOR} />
            <circle cx="50" cy="50" r="6" fill="#fff" />
          </svg>
          <p className="text-sm text-gray-600 text-center">
            Point the ring at the centre of the pink target (or any object) and press the button.
          </p>
        </div>
        <div className="flex flex-col gap-3 text-sm">
          <h2 className="text-lg font-semibold">Calibrate aim · {title}</h2>
          <p className="text-gray-600">
            Do this {MIN_SAMPLES}–{MAX_SAMPLES} times. Qu learns where your pointing lands in the camera picture and
            moves the aim zone there. Saved separately for each camera and hand.
          </p>
          <div className="flex items-center gap-2" data-testid="calibration-count">
            {Array.from({ length: MAX_SAMPLES }, (_, i) => (
              <span
                key={i}
                className={`w-4 h-4 rounded-full ${i < samples.length ? "bg-green-500" : "bg-gray-200"}`}
              />
            ))}
            <span className="text-gray-500">{samples.length} done</span>
          </div>
          {pending && (
            <img
              src={pending.toDataURL("image/jpeg", 0.8)}
              alt="Last picture: tap the object you pointed at"
              className="w-full rounded-lg border border-amber-400 cursor-crosshair"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                add({
                  x: ((e.clientX - rect.left) / rect.width) * pending.width,
                  y: ((e.clientY - rect.top) / rect.height) * pending.height,
                  w: pending.width,
                  h: pending.height,
                });
                setMessage("Marked.");
              }}
            />
          )}
          {message && <p className="text-amber-700">{message}</p>}
          {samples.length > 0 && (
            <p className="text-gray-600" data-testid="calibration-result">
              Offset {Math.round(result.offset.dx * 100)}% right, {Math.round(result.offset.dy * 100)}% down · spread{" "}
              {Math.round(result.spread * 100)}%
              {result.spread > 0.12 ? " (aim varied a lot; take a few more)" : ""}
            </p>
          )}
          {current && (
            <p className="text-gray-400">
              Current: {Math.round(current.offset.dx * 100)}% right, {Math.round(current.offset.dy * 100)}% down (
              {current.samples} samples)
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-auto">
            <button
              onClick={() => void press()}
              disabled={busy}
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white disabled:opacity-50"
            >
              {busy ? "Taking picture…" : "Take picture (Space)"}
            </button>
            <button
              onClick={() => setSamples((prev) => prev.slice(0, -1))}
              disabled={samples.length === 0}
              className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-50"
            >
              Undo (D)
            </button>
            <button
              onClick={save}
              disabled={!canSave}
              data-testid="calibration-save"
              className="px-3 py-1.5 rounded-lg bg-green-600 text-white disabled:opacity-50"
            >
              Save (H)
            </button>
            <button
              onClick={onReset}
              className="px-3 py-1.5 rounded-lg border border-gray-200"
            >
              Reset to centre
            </button>
            <button onClick={onClose} className="px-3 py-1.5 rounded-lg border border-gray-200 ml-auto">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
