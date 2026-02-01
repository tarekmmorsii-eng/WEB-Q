MIGRATION INSTRUCTIONS
======================

This folder contains the verified assets and code to restore the QPC V2 Mushaf in your clean backup.

1. DATA & FONTS:
   - Copy the contents of the 'public' folder inside this pack to your project's 'public' folder.
   - This places 'qpc_v2_mushaf.json' and 'fonts/v2' in the correct place.

2. COMPONENTS:
   - Copy files from 'components' folder to your project's 'src/components' (or 'components') folder.
   - Includes: QPCV2PageRenderer.tsx (The Logic) and SurahFrame.tsx (The Header Design).

3. STYLES:
   - Check 'index.css' in this pack. It contains the Font Imports (Amiri, Almarai, etc.).
   - Ensure your project's index.css has these imports.

Good luck!