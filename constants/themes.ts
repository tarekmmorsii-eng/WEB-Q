// Theme definitions - 16 professional color themes
export interface Theme {
    id: string;
    name: string;
    nameAr: string;
    isDark: boolean;
    colors: {
        background: string;
        text: string;
        primary: string;
        secondary: string;
        border: string;
        cardBg: string;
        accent: string; // لون فواصل الآيات (Ayah separators)
    };
}

export const THEMES: Theme[] = [
    // 1. المصحف الكلاسيكي (Day default)
    {
        id: 'classic-mushaf',
        name: 'Classic Mushaf',
        nameAr: 'المصحف الكلاسيكي',
        isDark: false,
        colors: { background: '#FDFBF7', text: '#1E293B', primary: '#ca8a04', secondary: '#f5f0e8', border: '#e8e0d4', cardBg: '#ffffff', accent: '#B45309' }
    },
    // 2. الورق القديم
    {
        id: 'antique-paper',
        name: 'Antique Paper',
        nameAr: 'الورق القديم',
        isDark: false,
        colors: { background: '#F4ECD8', text: '#2E220B', primary: '#8B7355', secondary: '#e8dcc8', border: '#d4c8b4', cardBg: '#faf4e8', accent: '#8B4513' }
    },
    // 3. الليلي الهادئ (Night default)
    {
        id: 'calm-night',
        name: 'Calm Night',
        nameAr: 'الليلي الهادئ',
        isDark: true,
        colors: { background: '#1A1A1B', text: '#E8E6E3', primary: '#90a4ae', secondary: '#2a2a2b', border: '#3a3a3b', cardBg: '#121213', accent: '#F59E0B' }
    },
    // 4. نمط الطبيعة
    {
        id: 'nature',
        name: 'Nature',
        nameAr: 'نمط الطبيعة',
        isDark: false,
        colors: { background: '#E8F5E9', text: '#1B5E20', primary: '#4caf50', secondary: '#c8e6c9', border: '#a5d6a7', cardBg: '#f1f8f2', accent: '#166534' }
    },
    // 5. ورق اللوز
    {
        id: 'almond-paper',
        name: 'Almond Paper',
        nameAr: 'ورق اللوز',
        isDark: false,
        colors: { background: '#F5F5DC', text: '#3C2F2F', primary: '#8d6e63', secondary: '#e6e6cc', border: '#d6d6bc', cardBg: '#faf9f0', accent: '#A0522D' }
    },
    // 6. ورق القمح
    {
        id: 'wheat-paper',
        name: 'Wheat Paper',
        nameAr: 'ورق القمح',
        isDark: false,
        colors: { background: '#F5DEB3', text: '#4A3C2C', primary: '#a1887f', secondary: '#e8d4a3', border: '#d8c493', cardBg: '#fff0d8', accent: '#D2691E' }
    },
    // 7. البردي
    {
        id: 'papyrus',
        name: 'Papyrus',
        nameAr: 'البردي',
        isDark: false,
        colors: { background: '#E9DCC9', text: '#332C28', primary: '#795548', secondary: '#d9ccb9', border: '#c9bca9', cardBg: '#f5ece0', accent: '#5D4037' }
    },
    // 8. السماء الصافية
    {
        id: 'clear-sky',
        name: 'Clear Sky',
        nameAr: 'السماء الصافية',
        isDark: false,
        colors: { background: '#E3F2FD', text: '#0D47A1', primary: '#2196f3', secondary: '#bbdefb', border: '#90caf9', cardBg: '#f5faff', accent: '#1E3A8A' }
    },
    // 9. الميدنايت
    {
        id: 'midnight',
        name: 'Midnight',
        nameAr: 'الميدنايت',
        isDark: true,
        colors: { background: '#101720', text: '#D1D9E1', primary: '#64b5f6', secondary: '#1a2530', border: '#2a3540', cardBg: '#0a1015', accent: '#FBBF24' }
    },
    // 10. بحيرة هادئة
    {
        id: 'calm-lake',
        name: 'Calm Lake',
        nameAr: 'بحيرة هادئة',
        isDark: true,
        colors: { background: '#002B36', text: '#93A1A1', primary: '#2aa198', secondary: '#073642', border: '#094652', cardBg: '#001b22', accent: '#2DD4BF' }
    },
    // 11. السحاب الفضي
    {
        id: 'silver-cloud',
        name: 'Silver Cloud',
        nameAr: 'السحاب الفضي',
        isDark: false,
        colors: { background: '#E8E8E8', text: '#212121', primary: '#757575', secondary: '#d8d8d8', border: '#c8c8c8', cardBg: '#f5f5f5', accent: '#4B5563' }
    },
    // 12. الفحم الهادئ
    {
        id: 'calm-charcoal',
        name: 'Calm Charcoal',
        nameAr: 'الفحم الهادئ',
        isDark: true,
        colors: { background: '#212121', text: '#E0E0E0', primary: '#9e9e9e', secondary: '#313131', border: '#414141', cardBg: '#1a1a1a', accent: '#9CA3AF' }
    },
    // 13. الرمادي الصخري
    {
        id: 'slate-gray',
        name: 'Slate Gray',
        nameAr: 'الرمادي الصخري',
        isDark: true,
        colors: { background: '#708090', text: '#FFFFFF', primary: '#b0c4de', secondary: '#607080', border: '#506070', cardBg: '#5a6a7a', accent: '#FDE047' }
    },
    // 14. اللافندر
    {
        id: 'lavender',
        name: 'Lavender',
        nameAr: 'اللافندر',
        isDark: false,
        colors: { background: '#F3E5F5', text: '#4A148C', primary: '#9c27b0', secondary: '#e1bee7', border: '#ce93d8', cardBg: '#faf0fc', accent: '#6B21A8' }
    },
    // 15. الخوخ الهادئ
    {
        id: 'calm-peach',
        name: 'Calm Peach',
        nameAr: 'الخوخ الهادئ',
        isDark: false,
        colors: { background: '#FFF3E0', text: '#5D4037', primary: '#ff9800', secondary: '#ffe0b2', border: '#ffcc80', cardBg: '#fff8f0', accent: '#EA580C' }
    },
    // 16. شمس الصباح
    {
        id: 'morning-sun',
        name: 'Morning Sun',
        nameAr: 'شمس الصباح',
        isDark: false,
        colors: { background: '#FDF6E3', text: '#657B83', primary: '#b58900', secondary: '#eee8d5', border: '#ddd6c5', cardBg: '#fefcf5', accent: '#0891B2' }
    }
];

// Day theme ID (المصحف الكلاسيكي)
export const DAY_THEME_ID = 'classic-mushaf';

// Night theme ID (الليلي الهادئ)
export const NIGHT_THEME_ID = 'calm-night';

export const getThemeById = (id: string): Theme => {
    return THEMES.find(t => t.id === id) || THEMES[0];
};
