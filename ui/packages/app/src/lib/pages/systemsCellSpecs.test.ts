import { describe, it, expect } from 'vitest';
import { memberSpecs, candidateSpecs, staleSpecs, offerSpecs } from './systemsCellSpecs';

describe('systems CellSpecs are portable', () => {
  const groups = { memberSpecs, candidateSpecs, staleSpecs, offerSpecs };

  for (const [groupName, specs] of Object.entries(groups)) {
    for (const [key, spec] of Object.entries(specs)) {
      it(`${groupName}.${key} survives JSON.stringify/parse unchanged`, () => {
        const roundTripped = JSON.parse(JSON.stringify(spec));
        expect(roundTripped).toEqual(spec);
      });

      it(`${groupName}.${key} contains no functions`, () => {
        const stack: unknown[] = [spec];
        while (stack.length) {
          const v = stack.pop();
          expect(typeof v).not.toBe('function');
          if (v && typeof v === 'object') stack.push(...Object.values(v));
        }
      });
    }
  }
});
