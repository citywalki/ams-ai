export type SemanticTokens = {
  colorBg: string;
  colorSurface: string;
  colorText: string;
  colorTextMuted: string;
  colorPrimary: string;
  colorBorder: string;
  colorDanger: string;
  borderRadius: number;
};

export const semanticTokens: SemanticTokens = {
  colorBg: '#f4f7fb',
  colorSurface: '#ffffff',
  colorText: '#1f2a37',
  colorTextMuted: '#637083',
  colorPrimary: '#1677ff',
  colorBorder: '#d9e3f0',
  colorDanger: '#ff4d4f',
  borderRadius: 8,
};

export const semanticCssVariables: Record<string, string> = {
  '--app-color-bg': semanticTokens.colorBg,
  '--app-color-surface': semanticTokens.colorSurface,
  '--app-color-text': semanticTokens.colorText,
  '--app-color-text-muted': semanticTokens.colorTextMuted,
  '--app-color-primary': semanticTokens.colorPrimary,
  '--app-color-border': semanticTokens.colorBorder,
  '--app-color-danger': semanticTokens.colorDanger,
  '--app-radius-base': `${semanticTokens.borderRadius}px`,
};

export function applySemanticTokensToRoot(): void {
  const root = document.documentElement;
  Object.entries(semanticCssVariables).forEach(([name, value]) => {
    root.style.setProperty(name, value);
  });
}
