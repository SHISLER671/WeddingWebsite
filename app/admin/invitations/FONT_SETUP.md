# Font Setup for Invitation Generator

## Font Files Needed

The invitation generator uses custom fonts for elegant text rendering. You need to download and place these fonts in the `public/fonts/` directory:

### Required Fonts:

1. **PlayfairDisplay-Regular.ttf**
   - Used as the default font
   - Can be downloaded from Google Fonts: https://fonts.google.com/specimen/Playfair+Display

2. **GreatVibes-Regular.ttf** (Recommended)
   - Beautiful script font perfect for names
   - Download from: https://fonts.google.com/specimen/Great+Vibes

### Installation Steps:

1. Download the font files (.ttf format)
2. Place them in: `public/fonts/`
3. The generator will reference them by name (e.g., "GreatVibes-Regular", "PlayfairDisplay-Regular")

### Font Usage:

- The generator uses the font name you specify in the form
- Default: `PlayfairDisplay-Regular`
- Recommended for names: `GreatVibes-Regular`

### Note:

For Sharp/SVG rendering, the fonts need to be available on the server where the images are generated. The font names in the SVG are matched against system fonts or fonts available to Sharp.

If fonts don't render correctly:
- Ensure font files are in `public/fonts/`
- Check that the font name matches exactly (case-sensitive)
- For production, ensure fonts are installed on the server or use embedded fonts

