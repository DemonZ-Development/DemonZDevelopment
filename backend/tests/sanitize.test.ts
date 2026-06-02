import { describe, it, expect } from 'vitest';
import { sanitize, isValidEmail } from '../src/lib/sanitize';

describe('sanitize', () => {
  it('escapes HTML special characters', () => {
    expect(sanitize('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;',
    );
  });

  it('escapes quotes and apostrophes', () => {
    expect(sanitize(`He said "hi" and 'bye'`)).toBe(
      'He said &quot;hi&quot; and &#39;bye&#39;',
    );
  });

  it('truncates to maxLength', () => {
    const input = 'a'.repeat(10);
    expect(sanitize(input, 5)).toBe('aaaaa');
  });

  it('uses default maxLength of 5000', () => {
    const input = 'x'.repeat(5001);
    expect(sanitize(input).length).toBe(5000);
  });

  it('passes plain text through unchanged', () => {
    expect(sanitize('hello world')).toBe('hello world');
  });
});

describe('isValidEmail', () => {
  it('accepts simple emails', () => {
    expect(isValidEmail('a@b.co')).toBe(true);
    expect(isValidEmail('user.name+tag@sub.example.com')).toBe(true);
  });

  it('rejects malformed emails', () => {
    expect(isValidEmail('foo')).toBe(false);
    expect(isValidEmail('foo@')).toBe(false);
    expect(isValidEmail('@bar.com')).toBe(false);
    expect(isValidEmail('foo@bar')).toBe(false);
    expect(isValidEmail('foo bar@baz.com')).toBe(false);
  });

  it('rejects emails longer than 254 characters', () => {
    const long = 'a'.repeat(250) + '@b.co';
    expect(isValidEmail(long)).toBe(false);
  });
});
