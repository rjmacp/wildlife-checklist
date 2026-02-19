import { describe, it, expect } from 'vitest';
import { rarityColor, sizeColor, conservationColor, conservationClass, rarityClass } from '../../utils/colors';

describe('rarityColor', () => {
  it('returns green for Common', () => {
    expect(rarityColor('Common')).toBe('#6B8F3C');
  });
  it('returns gold for Uncommon', () => {
    expect(rarityColor('Uncommon')).toBe('#C4A86A');
  });
  it('returns orange for Rare', () => {
    expect(rarityColor('Rare')).toBe('#BF6A3D');
  });
});

describe('sizeColor', () => {
  it('returns a color for each size', () => {
    expect(sizeColor('Small')).toBeTruthy();
    expect(sizeColor('Medium')).toBeTruthy();
    expect(sizeColor('Large')).toBeTruthy();
    expect(sizeColor('Very Large')).toBeTruthy();
  });
});

describe('conservationColor', () => {
  it('returns a color for each status', () => {
    expect(conservationColor('Least Concern')).toBeTruthy();
    expect(conservationColor('Endangered')).toBeTruthy();
    expect(conservationColor('Critically Endangered')).toBeTruthy();
  });
});

describe('conservationClass', () => {
  it('returns correct CSS class abbreviation', () => {
    expect(conservationClass('Least Concern')).toBe('lc');
    expect(conservationClass('Endangered')).toBe('en');
    expect(conservationClass('Critically Endangered')).toBe('cr');
    expect(conservationClass('Data Deficient')).toBe('dd');
  });
  it('returns dd for undefined', () => {
    expect(conservationClass(undefined)).toBe('dd');
  });
});

describe('rarityClass', () => {
  it('returns correct CSS class', () => {
    expect(rarityClass('Common')).toBe('rC');
    expect(rarityClass('Uncommon')).toBe('rU');
    expect(rarityClass('Rare')).toBe('rR');
  });
});
