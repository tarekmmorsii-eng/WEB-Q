/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            screens: {
                'landscape': { 'raw': '(orientation: landscape)' },
                'portrait': { 'raw': '(orientation: portrait)' },
            },
        },
    },
    plugins: [
        function ({ addVariant }) {
            addVariant('landscape', '@media (orientation: landscape)');
            addVariant('portrait', '@media (orientation: portrait)');
        }
    ],
}
