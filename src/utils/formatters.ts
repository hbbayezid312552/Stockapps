import { AppLanguage } from '../types';

const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBengaliNumber(num: number | string | undefined | null): string {
  if (num === undefined || num === null) return '০';
  const str = num.toString();
  return str.replace(/\d/g, d => bnDigits[parseInt(d, 10)]);
}

export function formatNumber(num: number, lang: AppLanguage = 'bn'): string {
  const formatted = num.toLocaleString('en-US');
  if (lang === 'bn') {
    return toBengaliNumber(formatted);
  }
  return formatted;
}

export function formatCurrency(amount: number, lang: AppLanguage = 'bn'): string {
  const rounded = Number((Math.round(amount * 100) / 100).toFixed(2));
  const parts = rounded.toFixed(2).split('.');
  const integerPart = parseInt(parts[0], 10).toLocaleString('en-US');
  const decimalPart = parts[1];
  
  if (lang === 'bn') {
    return `৳ ${toBengaliNumber(integerPart)}.${toBengaliNumber(decimalPart)}`;
  }
  return `৳ ${integerPart}.${decimalPart}`;
}

export function formatCartonPieceDisplay(totalPieces: number, piecesPerCarton: number, lang: AppLanguage = 'bn'): string {
  if (!piecesPerCarton || piecesPerCarton <= 0) piecesPerCarton = 1;
  const cartons = Math.floor(totalPieces / piecesPerCarton);
  const loosePieces = totalPieces % piecesPerCarton;
  
  if (lang === 'bn') {
    if (cartons > 0 && loosePieces > 0) {
      return `${toBengaliNumber(cartons)} কার্টুন + ${toBengaliNumber(loosePieces)} পিস`;
    } else if (cartons > 0) {
      return `${toBengaliNumber(cartons)} কার্টুন`;
    }
    return `${toBengaliNumber(loosePieces)} পিস`;
  }
  
  if (cartons > 0 && loosePieces > 0) {
    return `${cartons} Ctn + ${loosePieces} Pcs`;
  } else if (cartons > 0) {
    return `${cartons} Cartons`;
  }
  return `${loosePieces} Pieces`;
}

/**
 * Converts a number to Bengali in-words for invoices (টাকায় কথায়)
 */
export function numberToBengaliWords(num: number): string {
  const integer = Math.floor(Math.abs(num));
  if (integer === 0) return 'শূন্য টাকা মাত্র';

  const units = ['', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়',
    'দশ', 'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আঠারো', 'উনিশ',
    'বিশ', 'একুশ', 'বাইশ', 'তেইশ', 'চব্বিশ', 'পঁচিশ', 'ছাব্বিশ', 'সাতাশ', 'আটাশ', 'উনত্রিশ',
    'ত্রিশ', 'একত্রিশ', 'বত্রিশ', 'তেত্রিশ', 'চৌত্রিশ', 'পঁয়ত্রিশ', 'ছত্রিশ', 'সাঁয়ত্রিশ', 'আটত্রিশ', 'উনচল্লিশ',
    'চল্লিশ', 'একচল্লিশ', 'বিয়াল্লিশ', 'তেতাল্লিশ', 'চুয়াল্লিশ', 'পঁয়তাল্লিশ', 'ছেচল্লিশ', 'সাতচল্লিশ', 'আটচল্লিশ', 'উনপঞ্চাশ',
    'পঞ্চাশ', 'একান্ন', 'বায়ান্ন', 'তিপ্পান্ন', 'চুয়ান্ন', 'পঞ্চান্ন', 'ছাপ্পান্ন', 'সাতান্ন', 'আটান্ন', 'উনষাট',
    'ষাট', 'একষট্টি', 'বাষট্টি', 'তেষট্টি', 'চৌষট্টি', 'পঁয়ষট্টি', 'ছেষট্টি', 'সাতষট্টি', 'আটষট্টি', 'উনসত্তর',
    'সত্তর', 'একাত্তর', 'বাহাত্তর', 'তিয়াত্তর', 'চুয়াত্তর', 'পঁচাত্তর', 'ছিয়াত্তর', 'সাতাত্তর', 'আটাত্তর', 'উনআশি',
    'আশি', 'একাশি', 'বিরাশি', 'তিরাশি', 'চুরাশি', 'পঁচাশি', 'ছিয়াশি', 'সাতাশি', 'আটাশি', 'উননব্বই',
    'নব্বই', 'একানব্বই', 'বানব্বই', 'তিরানব্বই', 'চুরানব্বই', 'পঁচানব্বই', 'ছিয়ানব্বই', 'সাতানব্বই', 'আটানব্বই', 'নিরানব্বই'
  ];

  function convertSmall(n: number): string {
    let result = '';
    const crore = Math.floor(n / 10000000);
    n %= 10000000;
    const lakh = Math.floor(n / 100000);
    n %= 100000;
    const thousand = Math.floor(n / 1000);
    n %= 1000;
    const hundred = Math.floor(n / 100);
    const rest = n % 100;

    if (crore > 0) {
      result += `${convertSmall(crore)} কোটি `;
    }
    if (lakh > 0) {
      result += `${units[lakh]} লাখ `;
    }
    if (thousand > 0) {
      result += `${units[thousand]} হাজার `;
    }
    if (hundred > 0) {
      result += `${units[hundred]} শত `;
    }
    if (rest > 0) {
      result += `${units[rest]} `;
    }
    return result.trim();
  }

  const words = convertSmall(integer);
  return `${words} টাকা মাত্র`;
}

export function formatDate(dateString: string, lang: AppLanguage = 'bn'): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear().toString();
  
  const formatted = `${day}/${month}/${year}`;
  return lang === 'bn' ? toBengaliNumber(formatted) : formatted;
}
