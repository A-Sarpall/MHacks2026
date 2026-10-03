import { useEffect, useMemo, useRef, useState } from "react";
import type { InputAction } from "../lib/types";
import { InputHub, browserFeedback } from "./input/hub";
import { BleButtonInput, KeyboardInput, WsButtonInput } from "./input/inputs";
import type { ButtonInput } from "./input/types";
import { createSource } from "./sources";
import type { StatusInfo } from "./sources/types";
import type { SourceSettings } from "./settings";

export function useFrameSource(settings: SourceSettings, deviceId?: string) {
  const { kind, wsUrl, wsMode } = settings;
  const source = useMemo(
    () => createSource({ ...settings, kind, wsUrl, wsMode }, { deviceId }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [kind, wsUrl, wsMode, deviceId]
  );
  const [status, setStatus] = useState<StatusInfo>(source.status());
  useEffect(() => {
    setStatus(source.status());
    const off = source.onStatus(setStatus);
    source.start().catch((err: unknown) => console.error("[source]", err));
    return () => {
      off();
      source.stop();
    };
  }, [source]);
  return { source, status };
}

export function useButtonInputs(
  settings: SourceSettings,
  handler: (action: InputAction, from: string) => void,
  localFeedback: boolean
) {
  const hub = useMemo(() => new InputHub(), []);
  const keyboard = useMemo(() => new KeyboardInput(), []);
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  const url = settings.buttonUrl || settings.wsUrl;
  const ring = useMemo<ButtonInput | null>(() => {
    if (settings.buttonKind === "ws") return new WsButtonInput(url);
    if (settings.buttonKind === "ble") return new BleButtonInput();
    return null;
  }, [settings.buttonKind, url]);
  const [ringStatus, setRingStatus] = useState<StatusInfo | null>(null);

  useEffect(() => {
    hub.start((a, from) => handlerRef.current(a, from));
    return () => hub.stop();
  }, [hub]);

  useEffect(() => {
    hub.setInputs(ring ? [keyboard, ring] : [keyboard]);
    setRingStatus(ring?.status?.() ?? null);
    const off = ring?.onStatus?.(setRingStatus);
    return () => {
      off?.();
      hub.setInputs([keyboard]);
    };
  }, [hub, keyboard, ring]);

  useEffect(() => {
    hub.setLocalFeedback(localFeedback ? browserFeedback : null);
  }, [hub, localFeedback]);

  return { hub, ringStatus };
}
