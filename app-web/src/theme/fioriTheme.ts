import { theme } from 'antd'

const fioriTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#0A6ED1',
    colorSuccess: '#107E3E',
    colorWarning: '#E9730C',
    colorError: '#BB0000',
    colorInfo: '#0A6ED1',
    colorBgBase: '#FFFFFF',
    colorBgContainer: '#FFFFFF',
    colorBgElevated: '#FFFFFF',
    colorBgLayout: '#F5F6F7',
    borderRadius: 4,
    borderRadiusLG: 6,
    borderRadiusSM: 2,
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeSM: 12,
    fontFamily: '72, 72full, Arial, Helvetica, sans-serif',
    lineHeight: 1.4,
  },
  components: {
    Button: {
      borderRadius: 4,
      controlHeight: 32,
      controlHeightLG: 40,
      controlHeightSM: 28,
    },
    Card: {
      borderRadiusLG: 6,
    },
    Input: {
      borderRadius: 4,
      controlHeight: 32,
      controlHeightLG: 40,
      controlHeightSM: 28,
    },
    Table: {
      borderRadius: 4,
    },
  },
}

export default fioriTheme
