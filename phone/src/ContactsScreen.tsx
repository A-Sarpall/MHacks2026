import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Contact, ContactField, requestPermissionsAsync } from 'expo-contacts';
import { filterCandidates, hubHttpUrl, toCandidates, type Candidate } from './contactList';

// Pick people from this phone's address book and add them to Qu on the hub (POST /messages/contacts).
// Only the rows you tick leave the phone; the rest of the address book is never uploaded.

type Load = 'asking' | 'loading' | 'ready' | 'denied' | 'error';
type Result = { ok: boolean; text: string };

const BLUE = '#2D5BD6';

export function ContactsScreen({ hubWsUrl, onClose }: { hubWsUrl: string; onClose: () => void }) {
  const [load, setLoad] = useState<Load>('asking');
  const [error, setError] = useState('');
  const [all, setAll] = useState<Candidate[]>([]);
  const [limited, setLimited] = useState(false);
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<Result[] | null>(null);
  const hub = hubHttpUrl(hubWsUrl);

  const read = useCallback(async () => {
    setLoad('asking');
    try {
      const perm = await requestPermissionsAsync();
      if (!perm.granted) return setLoad('denied');
      setLimited(perm.accessPrivileges === 'limited');
      setLoad('loading');
      const rows = await Contact.getAllDetails([ContactField.GIVEN_NAME, ContactField.FAMILY_NAME, ContactField.PHONES]);
      setAll(toCandidates(rows));
      setLoad('ready');
    } catch (e) {
      setError(String(e));
      setLoad('error');
    }
  }, []);

  useEffect(() => {
    void read();
  }, [read]);

  const shown = useMemo(() => filterCandidates(all, query), [all, query]);
  const toggle = (key: string) =>
    setPicked((p) => {
      const n = new Set(p);
      if (!n.delete(key)) n.add(key);
      return n;
    });

  const add = async () => {
    setBusy(true);
    const chosen = all.filter((c) => picked.has(c.key));
    const out: Result[] = [];
    for (const c of chosen) {
      try {
        const ctl = new AbortController();
        const t = setTimeout(() => ctl.abort(), 10000);
        const r = await fetch(`${hub}/messages/contacts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: c.name, phone: c.number }),
          signal: ctl.signal,
        });
        clearTimeout(t);
        const body = (await r.json().catch(() => ({}))) as { error?: string };
        out.push(r.ok ? { ok: true, text: `${c.name}: added` } : { ok: false, text: `${c.name}: ${body.error ?? `hub said ${r.status}`}` });
      } catch (e) {
        out.push({ ok: false, text: `${c.name}: couldn't reach the hub (${String(e).slice(0, 60)})` });
      }
    }
    setResults(out);
    setPicked(new Set());
    setBusy(false);
  };

  if (load === 'denied') {
    return (
      <View style={s.page}>
        <Text style={s.title}>Contacts are off</Text>
        <Text style={s.body}>Qu can't see your contacts. Turn on Contacts for this app in Settings, then come back.</Text>
        <Pressable style={s.primary} onPress={() => void Linking.openSettings()}><Text style={s.primaryText}>Open Settings</Text></Pressable>
        <Pressable style={s.ghost} onPress={() => void read()}><Text style={s.ghostText}>Try again</Text></Pressable>
        <Pressable style={s.ghost} onPress={onClose}><Text style={s.ghostText}>Back</Text></Pressable>
      </View>
    );
  }

  if (results) {
    const good = results.filter((r) => r.ok).length;
    return (
      <View style={s.page}>
        <Text style={s.title}>{good === results.length ? 'Contacts added' : `${good} of ${results.length} added`}</Text>
        {results.map((r, i) => (
          <Text key={i} style={[s.body, !r.ok && { color: '#9B2619' }]}>{r.ok ? '✓ ' : '✕ '}{r.text}</Text>
        ))}
        <Text style={s.note}>To send a text to someone, they must also be added as a user in your Photon project, and text its line once. Adding them here only puts them in Qu.</Text>
        <Pressable style={s.primary} onPress={() => setResults(null)}><Text style={s.primaryText}>Add more</Text></Pressable>
        <Pressable style={s.ghost} onPress={onClose}><Text style={s.ghostText}>Done</Text></Pressable>
      </View>
    );
  }

  return (
    <View style={s.page}>
      <View style={s.head}>
        <Pressable onPress={onClose} accessibilityLabel="Back" style={s.back}><Text style={s.backText}>‹ Back</Text></Pressable>
        <Text style={s.titleSm}>Add from contacts</Text>
      </View>
      <TextInput value={query} onChangeText={setQuery} placeholder="Search name or number" placeholderTextColor="#8A8F99" autoCorrect={false} style={s.input} />
      {limited && (
        <Pressable onPress={() => void Contact.presentAccessPicker().then(() => read())} style={s.limited}>
          <Text style={s.limitedText}>You shared only some contacts. Tap to choose more.</Text>
        </Pressable>
      )}
      {(load === 'asking' || load === 'loading') && <ActivityIndicator style={{ marginTop: 40 }} size="large" />}
      {load === 'error' && <Text style={[s.body, { color: '#9B2619' }]}>Couldn't read contacts: {error}</Text>}
      {load === 'ready' && all.length === 0 && <Text style={s.body}>No contacts with a phone number were found.</Text>}
      <FlatList
        data={shown}
        keyExtractor={(c) => c.key}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const on = picked.has(item.key);
          return (
            <Pressable onPress={() => toggle(item.key)} accessibilityRole="checkbox" accessibilityState={{ checked: on }} style={[s.row, on && s.rowOn]}>
              <View style={[s.box, on && s.boxOn]}>{on && <Text style={s.tick}>✓</Text>}</View>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{item.name}</Text>
                <Text style={s.num}>{item.number}{item.label ? `  ·  ${item.label}` : ''}</Text>
              </View>
            </Pressable>
          );
        }}
        contentContainerStyle={{ paddingBottom: 120 }}
      />
      <View style={s.footer}>
        <Text style={s.hint}>Only the people you tick are sent to your laptop.</Text>
        <Pressable disabled={picked.size === 0 || busy} onPress={() => void add()} style={[s.primary, (picked.size === 0 || busy) && { opacity: 0.45 }]}>
          <Text style={s.primaryText}>{busy ? 'Adding…' : picked.size ? `Add ${picked.size} to Qu` : 'Tick people to add'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F5F2EC', paddingTop: 64, paddingHorizontal: 16, gap: 12 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { height: 44, justifyContent: 'center', paddingRight: 8 },
  backText: { fontSize: 20, color: BLUE, fontWeight: '700' },
  title: { fontSize: 30, fontWeight: '800', color: '#15171C' },
  titleSm: { fontSize: 22, fontWeight: '800', color: '#15171C' },
  body: { fontSize: 17, lineHeight: 24, color: '#4A505B' },
  note: { fontSize: 14, lineHeight: 20, color: '#5B616D' },
  input: { height: 56, borderRadius: 16, borderWidth: 1.5, borderColor: '#D6CFC2', backgroundColor: '#fff', paddingHorizontal: 16, fontSize: 17 },
  limited: { padding: 12, borderRadius: 12, backgroundColor: '#FFF3D6' },
  limitedText: { fontSize: 15, color: '#6E5200', fontWeight: '600' },
  row: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E4DED3', marginBottom: 8 },
  rowOn: { borderColor: BLUE, backgroundColor: '#E4EBFB' },
  box: { width: 30, height: 30, borderRadius: 8, borderWidth: 2, borderColor: '#B8B2A5', alignItems: 'center', justifyContent: 'center' },
  boxOn: { backgroundColor: BLUE, borderColor: BLUE },
  tick: { color: '#fff', fontSize: 18, fontWeight: '800' },
  name: { fontSize: 19, fontWeight: '700', color: '#15171C' },
  num: { fontSize: 15, color: '#5B616D', marginTop: 2 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, paddingBottom: 34, gap: 8, backgroundColor: '#F5F2EC', borderTopWidth: 1, borderTopColor: '#E4DED3' },
  hint: { fontSize: 13, color: '#5B616D', textAlign: 'center' },
  primary: { height: 60, borderRadius: 18, backgroundColor: BLUE, alignItems: 'center', justifyContent: 'center' },
  primaryText: { fontSize: 19, fontWeight: '700', color: '#fff' },
  ghost: { height: 52, alignItems: 'center', justifyContent: 'center' },
  ghostText: { fontSize: 17, fontWeight: '700', color: BLUE },
});
