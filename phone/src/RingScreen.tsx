import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import type { QuickPhrase } from '../../src/data/profiles';
import { profileSentences } from '../../src/lib/profileCompose';
import { bytesToBase64 } from './base64';
import { hubHttpUrl } from './contactList';
import { parseDetected, type Detected } from './detected';
import { NetworkLine } from './NetworkLine';
import { probe } from './probe';
import { startRelay, type Link, type PressAction, type RelayState } from './ringRelay';
import { SayPanel } from './SayPanel';
import { logSaid, react, reportPain, say } from './speech';

// The user's screen. The ring's camera and button reach the laptop through this phone; the laptop recognises
// what the ring saw and sends it back; the user picks what to say here and the phone speaks it.
//   ring (Wi-Fi "Qu-Ring") --> this phone --USB cable--> hub --> web app on the laptop (recognition, ?ui=phone)
//   ring button: click = take a picture (laptop) · double = "Yes!" (here) · hold = say the first sentence (here)

const BUZZ: Record<string, () => Promise<void>> = {
  'on-target': () => Haptics.selectionAsync(),
  captured: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  highlight: () => Haptics.selectionAsync(),
  select: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
};

const dotColor = (l: Link) => (l === 'live' ? '#2F8A4A' : l === 'idle' ? '#8A8F99' : '#E0A200');
const word = (l: Link, what: string) => (l === 'live' ? `${what} connected` : l === 'retrying' ? `${what} reconnecting…` : `${what} connecting…`);

interface Props {
  ringUrl: string;
  hubUrl: string;
  onChange: () => void;
  onContacts: () => void;
}

export function RingScreen({ ringUrl, hubUrl, onChange, onContacts }: Props) {
  const [st, setSt] = useState<RelayState>({ ring: 'connecting', hub: 'connecting', ringDetail: '', hubDetail: '', framesIn: 0, framesSent: 0, framesDropped: 0, lastButton: '' });
  const [preview, setPreview] = useState<string | null>(null);
  const [hubProbe, setHubProbe] = useState('');
  const [silent, setSilent] = useState(false); // ring connected, but no pictures for a while
  const [item, setItem] = useState<Detected | null>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [intent, setIntent] = useState<string | null>(null);
  const [saying, setSaying] = useState('');
  const [voiceNote, setVoiceNote] = useState('');
  const relay = useRef<ReturnType<typeof startRelay> | null>(null);

  const sentences = useMemo(() => (intent ? (profileSentences({ tiles: label ? [label] : [], intent }) ?? []) : []), [intent, label]);
  const hubHttp = st.hub === 'live' ? hubHttpUrl(hubUrl) : null;

  // The relay is created once per address pair; these refs give its callbacks the current screen state.
  const live = useRef({ sentences, hubHttp });
  live.current = { sentences, hubHttp };

  const speak = async (text: string) => {
    setSaying(text);
    const via = await say(text, live.current.hubHttp);
    setVoiceNote(via === 'hub' ? 'cloned voice' : "phone's voice (laptop not reachable)");
    logSaid(live.current.hubHttp, text);
  };

  useEffect(() => {
    const r = startRelay({
      ringUrl,
      hubUrl,
      onState: setSt,
      onFrame: (jpeg) => setPreview(`data:image/jpeg;base64,${bytesToBase64(jpeg)}`),
      onFeedback: (k) => void BUZZ[k]?.().catch(() => {}),
      onHubMessage: (m) => {
        const d = parseDetected(m);
        if (!d) return;
        setItem(d);
        setLabel(d.status === 'named' ? d.label : null);
        void (d.status === 'none' ? BUZZ.error() : Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)).catch(() => {});
      },
      // click goes to the laptop (take a picture); double and hold are answered here, on the phone
      handleRingButton: (a: PressAction) => {
        if (a === 'double') {
          setSaying('Yes!');
          void react('yes', 'Yes!', live.current.hubHttp).then((via) => setVoiceNote(via === 'hub' ? 'cloned voice' : "phone's voice"));
          logSaid(live.current.hubHttp, 'Yes!');
          return true;
        }
        if (a === 'hold') {
          const first = live.current.sentences[0];
          if (first) void speak(first);
          else void BUZZ.error().catch(() => {});
          return true;
        }
        return false;
      },
    });
    relay.current = r;
    return () => {
      r.stop();
      relay.current = null;
    };
    // speak only reads refs; recreating the relay on every render would drop the ring connection
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ringUrl, hubUrl]);

  useEffect(() => {
    if (st.ring !== 'live' || st.framesIn > 0) return void setSilent(false);
    const t = setTimeout(() => setSilent(true), 6000);
    return () => clearTimeout(t);
  }, [st.ring, st.framesIn]);

  // Explain a hub link that will not come up.
  useEffect(() => {
    if (st.hub === 'live') return void setHubProbe('');
    if (!st.hubDetail) return;
    let cancelled = false;
    void probe(hubUrl).then((r) => !cancelled && setHubProbe(r));
    return () => {
      cancelled = true;
    };
  }, [st.hub, st.hubDetail, hubUrl]);

  const onQuick = (q: QuickPhrase) => {
    if (q.action === 'pain') reportPain(live.current.hubHttp);
    void speak(q.text);
  };

  const takePicture = () => {
    if (relay.current?.press('click')) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    else void BUZZ.error().catch(() => {});
  };

  return (
    <View style={s.page}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.top}>
          <View style={{ gap: 6, flex: 1 }}>
            <View style={s.pill}>
              <View style={[s.dot, { backgroundColor: dotColor(st.ring) }]} />
              <Text style={s.pillText}>{word(st.ring, 'Ring')}</Text>
            </View>
            <View style={s.pill}>
              <View style={[s.dot, { backgroundColor: dotColor(st.hub) }]} />
              <Text style={s.pillText}>{word(st.hub, 'Laptop')}</Text>
            </View>
          </View>
          <View style={s.viewer}>
            {preview && st.ring === 'live' ? <Image source={{ uri: preview }} style={s.image} resizeMode="cover" /> : <Text style={s.viewerText}>{st.ring === 'live' ? 'waiting…' : 'no ring'}</Text>}
          </View>
        </View>
        <View style={s.topLinks}>
          <Pressable style={s.link} onPress={onContacts}><Text style={s.linkText}>Contacts</Text></Pressable>
          <Pressable style={s.link} onPress={onChange}><Text style={s.linkText}>Change</Text></Pressable>
        </View>

        {st.ring !== 'live' || st.hub !== 'live' ? <NetworkLine dark /> : null}
        {silent ? <Text style={s.detail}>Ring connected, but no pictures yet. Power-cycle the ring (off, 5 seconds, on), then Change → Connect.</Text> : null}
        {st.ring !== 'live' && st.ringDetail ? <Text style={s.detail}>Ring: {st.ringDetail}</Text> : null}
        {st.hub !== 'live' && st.hubDetail ? (
          <Text style={s.detail}>
            Laptop: {st.hubDetail}
            {hubProbe ? ` | ${hubProbe}` : ''}
          </Text>
        ) : null}

        <SayPanel
          item={item}
          label={label}
          intent={intent}
          sentences={sentences}
          saying={saying}
          onChoose={setLabel}
          onIntent={setIntent}
          onSay={(t) => void speak(t)}
          onQuick={onQuick}
          onTakePicture={takePicture}
          canTakePicture={st.hub === 'live'}
        />

        <Text style={s.stats}>
          {saying ? `Said: "${saying}"${voiceNote ? ` (${voiceNote})` : ''} · ` : ''}pictures {st.framesIn} in · {st.framesSent} sent{st.lastButton ? ` · ring: ${st.lastButton}` : ''}
        </Text>
        <Text style={s.stats}>Ring button: click = take picture · double = "Yes!" · hold = say the first sentence</Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#101114' },
  scroll: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 40, gap: 12 },
  top: { flexDirection: 'row', gap: 12, alignItems: 'stretch' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 38, paddingHorizontal: 12, borderRadius: 19, backgroundColor: 'rgba(255,255,255,.12)' },
  dot: { width: 10, height: 10, borderRadius: 5 },
  pillText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  viewer: { width: 120, height: 82, borderRadius: 14, backgroundColor: '#000', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  viewerText: { color: '#8A8F99', fontSize: 12 },
  topLinks: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  link: { height: 36, paddingHorizontal: 14, borderRadius: 18, backgroundColor: 'rgba(255,255,255,.08)', justifyContent: 'center' },
  linkText: { color: '#C5C9D2', fontSize: 14, fontWeight: '600' },
  detail: { color: '#FFD27A', fontSize: 13, textAlign: 'center' },
  stats: { color: '#8A8F99', fontSize: 12, textAlign: 'center' },
});
