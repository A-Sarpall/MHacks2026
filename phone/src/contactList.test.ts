import { describe, expect, it } from 'vitest';
import { filterCandidates, hubHttpUrl, toCandidates } from './contactList';

describe('toCandidates', () => {
  it('makes one row per number, sorted by name', () => {
    const list = toCandidates([
      { givenName: 'Zed', familyName: 'Last', phones: [{ number: '(734) 555-0101', label: 'mobile' }] },
      { givenName: 'Ann', familyName: 'Lee', phones: [{ number: '+1 954 555 0102', label: 'home' }, { number: '954-555-0103' }] },
    ]);
    expect(list.map((c) => `${c.name} ${c.number}`)).toEqual(['Ann Lee +1 954 555 0102', 'Ann Lee 954-555-0103', 'Zed Last (734) 555-0101']);
    expect(list[0].label).toBe('home');
  });
  it('drops numbers that are too short and the same number in two formats', () => {
    const list = toCandidates([
      { givenName: 'A', phones: [{ number: '911' }, { number: '12345' }] },
      { givenName: 'B', phones: [{ number: '(954) 555-0100' }] },
      { givenName: 'B again', phones: [{ number: '+1 954 555 0100' }] },
    ]);
    expect(list.map((c) => c.name)).toEqual(['B']);
  });
  it('copes with missing names, phones and nulls', () => {
    const list = toCandidates([{ phones: [{ number: '734 555 0111', label: null }] }, { givenName: 'No phones' }, { givenName: 'X', phones: null }]);
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe('No name');
    expect(list[0].label).toBe('');
  });
});

describe('filterCandidates', () => {
  const list = toCandidates([
    { givenName: 'Maya', familyName: 'Rao', phones: [{ number: '(954) 555-0100' }] },
    { givenName: 'Sam', familyName: 'Ito', phones: [{ number: '(734) 555-0199' }] },
  ]);
  it('matches by name, case-insensitively', () => expect(filterCandidates(list, 'MAY').map((c) => c.name)).toEqual(['Maya Rao']));
  it('matches by digits in the number, ignoring punctuation', () => expect(filterCandidates(list, '734-555').map((c) => c.name)).toEqual(['Sam Ito']));
  it('does not match a number on one or two digits', () => expect(filterCandidates(list, '5')).toHaveLength(0));
  it('returns everything for an empty query', () => expect(filterCandidates(list, '  ')).toHaveLength(2));
});

describe('hubHttpUrl', () => {
  it('turns the phone address into the hub address', () => {
    expect(hubHttpUrl('wss://abc.lhr.life/phone')).toBe('https://abc.lhr.life');
    expect(hubHttpUrl('ws://192.168.1.10:8787/phone/')).toBe('http://192.168.1.10:8787');
    expect(hubHttpUrl('  WSS://x.y/phone ')).toBe('https://x.y');
  });
});
