import { describe, expect, it } from 'vitest';
import { parseDetected } from './detected';

describe('parseDetected', () => {
  it('reads a confident result', () => {
    const d = parseDetected({ type: 'detected', id: 'd1', status: 'named', label: 'water bottle', options: [{ label: 'water bottle', score: 0.81, thumbnail: 'data:image/jpeg;base64,AA' }] });
    expect(d).toEqual({ id: 'd1', status: 'named', label: 'water bottle', options: [{ label: 'water bottle', score: 0.81, thumbnail: 'data:image/jpeg;base64,AA' }] });
  });
  it('falls back to the first option for a named result without a label', () => {
    expect(parseDetected({ type: 'detected', status: 'named', options: [{ label: 'mug', score: 0.7 }] })?.label).toBe('mug');
  });
  it('reads an unsure result as choices with no label', () => {
    const d = parseDetected({ type: 'detected', status: 'unsure', label: 'ignored', options: [{ label: 'mug', score: 0.3 }, { label: 'cup', score: 0.2 }] });
    expect(d?.label).toBeNull();
    expect(d?.options.map((o) => o.label)).toEqual(['mug', 'cup']);
  });
  it('reads nothing found with its hint', () => {
    expect(parseDetected({ type: 'detected', status: 'none', options: [], hint: 'Move closer' })).toMatchObject({ status: 'none', hint: 'Move closer', options: [] });
  });
  it('rejects other messages and broken ones', () => {
    expect(parseDetected({ type: 'feedback', kind: 'select' })).toBeNull();
    expect(parseDetected({ type: 'detected', status: 'maybe' })).toBeNull();
    expect(parseDetected({ type: 'detected', status: 'named', options: [] })).toBeNull();
  });
  it('drops junk options and anything that is not an image as a thumbnail', () => {
    const d = parseDetected({ type: 'detected', status: 'unsure', options: [null, 5, { label: '  ' }, { label: 'cup', thumbnail: 'javascript:alert(1)' }] });
    expect(d?.options).toEqual([{ label: 'cup', score: 0 }]);
  });
});
