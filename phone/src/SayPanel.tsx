import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { ACTIVE_PROFILE, type QuickPhrase } from '../../src/data/profiles';
import type { Detected } from './detected';

// The user's screen: quick phrases, what the ring saw, then intent -> sentence. The phrases, intents and
// sentences come from the same profile the web app uses (src/data/profiles), so both always match.

const BLUE = '#2D5BD6';

interface Props {
  item: Detected | null;
  label: string | null; // the object the sentences are about
  intent: string | null;
  sentences: string[];
  saying: string;
  onChoose: (label: string | null) => void;
  onIntent: (id: string | null) => void;
  onSay: (text: string) => void;
  onQuick: (p: QuickPhrase) => void;
  onTakePicture: () => void;
  canTakePicture: boolean;
}

export function SayPanel(p: Props) {
  const thumb = p.item?.options.find((o) => o.label === p.label)?.thumbnail ?? p.item?.options[0]?.thumbnail;
  return (
    <View style={s.wrap}>
      <View style={s.quickRow}>
        {ACTIVE_PROFILE.quickPhrases.map((q) => (
          <Pressable key={q.text} onPress={() => p.onQuick(q)} style={({ pressed }) => [s.quick, q.action === 'pain' && s.quickPain, pressed && s.pressed]}>
            <Text style={[s.quickText, q.action === 'pain' && s.quickPainText]}>{q.text}</Text>
          </Pressable>
        ))}
      </View>

      <View style={s.card}>
        <View style={s.itemRow}>
          {thumb && p.label ? <Image source={{ uri: thumb }} style={s.thumb} /> : <View style={[s.thumb, s.thumbEmpty]} />}
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={s.caption}>The ring sees</Text>
            <Text style={s.itemName} numberOfLines={2}>
              {p.label ?? (p.item?.status === 'unsure' ? 'Which one is it?' : p.item?.status === 'none' ? 'Not sure' : 'Nothing yet')}
            </Text>
            {p.item?.hint ? <Text style={s.hint}>{p.item.hint}</Text> : null}
            {!p.item ? <Text style={s.hint}>Point the ring at something and press its button.</Text> : null}
          </View>
        </View>

        {p.item && p.item.options.length > (p.item.status === 'named' ? 1 : 0) ? (
          <View style={s.chips}>
            {p.item.options.map((o) => (
              <Pressable key={o.label} onPress={() => p.onChoose(o.label)} style={({ pressed }) => [s.chip, o.label === p.label && s.chipOn, pressed && s.pressed]}>
                {o.thumbnail && p.item?.status === 'unsure' ? <Image source={{ uri: o.thumbnail }} style={s.chipThumb} /> : null}
                <Text style={[s.chipText, o.label === p.label && s.chipTextOn]}>{o.label}</Text>
              </Pressable>
            ))}
            {p.label ? (
              <Pressable onPress={() => p.onChoose(null)} style={({ pressed }) => [s.chip, pressed && s.pressed]}>
                <Text style={s.chipText}>None of these</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        <Pressable disabled={!p.canTakePicture} onPress={p.onTakePicture} style={({ pressed }) => [s.shoot, !p.canTakePicture && { opacity: 0.4 }, pressed && s.pressed]}>
          <Text style={s.shootText}>Take picture</Text>
        </Pressable>
      </View>

      <Text style={s.section}>What do you want to say?</Text>
      <View style={s.grid}>
        {ACTIVE_PROFILE.intents.map((i) => {
          const on = p.intent === i.id;
          return (
            <Pressable key={i.id} onPress={() => p.onIntent(on ? null : i.id)} style={({ pressed }) => [s.intent, on && s.intentOn, pressed && s.pressed]}>
              <Text style={[s.intentText, on && s.intentTextOn]}>{i.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {p.intent ? (
        <View style={{ gap: 8 }}>
          {p.sentences.length === 0 ? <Text style={s.hint}>No sentences for this yet.</Text> : null}
          {p.sentences.map((t) => (
            <Pressable key={t} onPress={() => p.onSay(t)} style={({ pressed }) => [s.sentence, p.saying === t && s.sentenceOn, pressed && s.pressed]}>
              <Text style={s.sentenceText}>{t}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 14 },
  pressed: { opacity: 0.7 },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quick: { minHeight: 52, flexGrow: 1, flexBasis: '30%', paddingHorizontal: 10, borderRadius: 14, backgroundColor: 'rgba(255,255,255,.1)', alignItems: 'center', justifyContent: 'center' },
  quickText: { color: '#fff', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  quickPain: { backgroundColor: '#5A1D1D' },
  quickPainText: { color: '#FFD9D4' },
  card: { borderRadius: 20, backgroundColor: 'rgba(255,255,255,.07)', padding: 14, gap: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  thumb: { width: 84, height: 84, borderRadius: 14, backgroundColor: '#000' },
  thumbEmpty: { borderWidth: 1, borderColor: 'rgba(255,255,255,.2)' },
  caption: { color: '#8A8F99', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  itemName: { color: '#fff', fontSize: 26, fontWeight: '800' },
  hint: { color: '#C5C9D2', fontSize: 15, lineHeight: 21 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, borderRadius: 24, borderWidth: 1.5, borderColor: 'rgba(255,255,255,.25)' },
  chipOn: { backgroundColor: BLUE, borderColor: BLUE },
  chipThumb: { width: 32, height: 32, borderRadius: 8 },
  chipText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  chipTextOn: { fontWeight: '800' },
  shoot: { height: 52, borderRadius: 16, borderWidth: 1.5, borderColor: BLUE, alignItems: 'center', justifyContent: 'center' },
  shootText: { color: '#A9BEF5', fontSize: 17, fontWeight: '700' },
  section: { color: '#8A8F99', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  intent: { flexBasis: '47%', flexGrow: 1, minHeight: 68, borderRadius: 18, backgroundColor: 'rgba(255,255,255,.1)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  intentOn: { backgroundColor: BLUE },
  intentText: { color: '#fff', fontSize: 21, fontWeight: '800' },
  intentTextOn: { color: '#fff' },
  sentence: { minHeight: 64, borderRadius: 18, backgroundColor: '#fff', paddingHorizontal: 18, paddingVertical: 14, justifyContent: 'center' },
  sentenceOn: { backgroundColor: '#E4EBFB' },
  sentenceText: { color: '#15171C', fontSize: 21, fontWeight: '700', lineHeight: 27 },
});
