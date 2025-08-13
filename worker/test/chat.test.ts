import { describe, it, expect } from 'vitest';
import { ChatSession } from '../src/ChatSession';

describe('ChatSession', () => {
  it('echoes messages', async () => {
    const cs = new ChatSession({} as any, {} as any);
    // @ts-ignore testing private method
    const result = await cs.generate('hello');
    expect(result).toBe('You said: hello');
  });
});
