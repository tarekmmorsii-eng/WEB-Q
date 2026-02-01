
// Map of Surah Number to Unicode PUA character for "surah_names" font family.
// Standard QCF / Quran.com font mapping V1 often starts at 0xE901 (59649) for Al-Fatiha.
// Some versions might be different, but this is the most common PUA range.
// 0xE901 = Surah 1
// 0xE902 = Surah 2
// ...
// 0xE972 (114) = Surah 114

export const getSurahNameGlyph = (surahNumber: number): string => {
    // 0xE900 is often empty or a special char. 
    // We start offset at 0xE900 so 1 -> E901.
    const startCode = 0xE900;
    return String.fromCharCode(startCode + surahNumber);
};
