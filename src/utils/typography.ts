export function getFontFamily(
  type: 'heading' | 'body' | 'mono',
  isDyslexic: boolean,
): string | undefined {
  if (isDyslexic) {
    return type === 'heading' ? 'OpenDyslexic-Bold' : 'OpenDyslexic-Regular';
  }

  if (type === 'heading') return 'Fraunces';
  if (type === 'mono') return 'SpaceMono';
  return undefined; // body falls back to system font
}

export function getFontStyle(
  baseStyle: 'normal' | 'italic',
  disableItalics: boolean,
): 'normal' | 'italic' {
  return disableItalics ? 'normal' : baseStyle;
}
