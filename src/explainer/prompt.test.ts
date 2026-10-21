import { buildSystemPrompt, buildUserMessage } from './prompt';

describe('buildSystemPrompt', () => {
  it('asks for English explanations on English devices', () => {
    expect(buildSystemPrompt('en')).toContain('in English');
  });

  it('asks for Swiss German spelling on German devices', () => {
    expect(buildSystemPrompt('de')).toContain('German as written in Switzerland');
  });

  it('tells the model not to guess', () => {
    expect(buildSystemPrompt('en')).toMatch(/Never guess/);
  });
});

describe('buildUserMessage', () => {
  it('wraps the trimmed letter text in delimiters', () => {
    expect(buildUserMessage('  Sehr geehrte Frau Beispiel  \n')).toBe(
      'Letter text:\n"""\nSehr geehrte Frau Beispiel\n"""',
    );
  });
});
