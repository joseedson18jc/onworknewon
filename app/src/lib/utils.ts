import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, locale: string = 'pt-BR', currency: string = 'BRL') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
}

export function formatNumber(value: number, locale: string = 'pt-BR') {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatCompact(value: number, locale: string = 'pt-BR') {
  return new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

// Strips diacritics so "itau" finds "Itaú Unibanco" and "sao paulo" finds "São Paulo".
export function normalizeForSearch(value: unknown): string {
  if (value == null) return '';
  return String(value)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}
