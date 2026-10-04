import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text } from 'react-native';
import * as Network from 'expo-network';
import { describeNetwork } from './networkInfo';

// Shows what the phone says about its own network, so "Ring: connecting" can be told apart from "not on Qu-Ring".
export function NetworkLine({ dark }: { dark?: boolean }) {
  const [text, setText] = useState('checking the phone\'s network…');
  useEffect(() => {
    let on = true;
    const tick = async () => {
      try {
        // Each call on its own: the airplane-mode check exists only on Android and throws on iPhone,
        // and one missing call must not hide the rest.
        const ask = async <T,>(f: () => Promise<T>): Promise<T | undefined> => {
          try {
            return await f();
          } catch {
            return undefined;
          }
        };
        const [st, ip, airplane] = await Promise.all([
          ask(() => Network.getNetworkStateAsync()),
          ask(() => Network.getIpAddressAsync()),
          Platform.OS === 'android' ? ask(() => Network.isAirplaneModeEnabledAsync()) : Promise.resolve(undefined),
        ]);
        if (on) setText(describeNetwork({ type: String(st?.type ?? 'UNKNOWN'), ip: ip ?? '', internet: st?.isInternetReachable, airplane }).text);
      } catch (e) {
        if (on) setText(`couldn't read the network: ${String(e).slice(0, 60)}`);
      }
    };
    void tick();
    const t = setInterval(tick, 3000);
    return () => {
      on = false;
      clearInterval(t);
    };
  }, []);
  return <Text style={[s.line, dark && s.dark]}>Phone network: {text}</Text>;
}

const s = StyleSheet.create({
  line: { fontSize: 13, lineHeight: 18, color: '#5B616D' },
  dark: { color: '#C5C9D2', textAlign: 'center' },
});
