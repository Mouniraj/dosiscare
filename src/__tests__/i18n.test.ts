/// <reference types="jest" />
import { makeTranslator } from '../i18n';
import { en } from '../i18n/translations/en';
import { es } from '../i18n/translations/es';
import { pt } from '../i18n/translations/pt';

describe('i18n dictionaries', () => {
  it('en and pt mirror every key in es', () => {
    const esKeys = Object.keys(es).sort();
    expect(Object.keys(en).sort()).toEqual(esKeys);
    expect(Object.keys(pt).sort()).toEqual(esKeys);
  });

  it('has no empty translations', () => {
    for (const dict of [es, en, pt]) {
      for (const value of Object.values(dict)) {
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
      }
    }
  });
});

describe('makeTranslator', () => {
  it('returns strings in the requested language', () => {
    expect(makeTranslator('es')('tabs.home')).toBe('Inicio');
    expect(makeTranslator('en')('tabs.home')).toBe('Home');
    expect(makeTranslator('pt')('tabs.home')).toBe('Início');
  });

  it('interpolates {params}', () => {
    expect(makeTranslator('es')('auth.welcomeName', { name: 'Ana' })).toBe('¡Bienvenido, Ana!');
    expect(makeTranslator('en')('schedule.every', { h: 8 })).toBe('every 8 h');
  });
});
