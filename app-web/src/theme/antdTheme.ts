import type { ThemeConfig } from 'antd';
import { semanticTokens } from './semanticTokens';

export const antdTheme: ThemeConfig = {
  token: {
    colorBgBase: semanticTokens.colorBg,
    colorBgContainer: semanticTokens.colorSurface,
    colorTextBase: semanticTokens.colorText,
    colorTextSecondary: semanticTokens.colorTextMuted,
    colorPrimary: semanticTokens.colorPrimary,
    colorBorder: semanticTokens.colorBorder,
    colorError: semanticTokens.colorDanger,
    borderRadius: semanticTokens.borderRadius,
  },
  components: {
    Button: {
      controlHeight: 36,
    },
    Card: {
      borderRadiusLG: semanticTokens.borderRadius,
    },
    Form: {
      verticalLabelPadding: '0 0 6px',
    },
  },
};
