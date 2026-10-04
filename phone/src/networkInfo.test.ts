import { describe, expect, it } from 'vitest';
import { describeNetwork } from './networkInfo';

describe('describeNetwork', () => {
  it('recognises the ring Wi-Fi by its address', () => {
    const r = describeNetwork({ type: 'WIFI', ip: '192.168.4.2', internet: false });
    expect(r.onRing).toBe(true);
    expect(r.text).toContain('On the ring');
    expect(r.text).toContain('internet: no');
  });
  it('says so when on some other Wi-Fi', () => {
    const r = describeNetwork({ type: 'WIFI', ip: '10.1.2.3', internet: true });
    expect(r.onRing).toBe(false);
    expect(r.text).toContain('NOT on Qu-Ring');
  });
  it('does not mistake a similar address for the ring', () => {
    expect(describeNetwork({ type: 'WIFI', ip: '192.168.40.5', internet: true }).onRing).toBe(false);
    expect(describeNetwork({ type: 'WIFI', ip: '192.168.1.4', internet: true }).onRing).toBe(false);
  });
  it('explains cellular, no network and airplane mode', () => {
    expect(describeNetwork({ type: 'CELLULAR', ip: '100.64.0.9', internet: true }).text).toContain('cellular');
    expect(describeNetwork({ type: 'NONE', ip: '', internet: false }).text).toContain('No network');
    expect(describeNetwork({ type: 'CELLULAR', ip: '', internet: false, airplane: true }).text).toContain('Airplane');
  });
  it('copes with unknown internet state and a missing address', () => {
    expect(describeNetwork({ type: 'WIFI', ip: '', internet: undefined }).text).toContain('internet: ?');
  });
});
