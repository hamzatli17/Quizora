import { Platform, type ViewStyle } from 'react-native';

export const theme = {
  colors: {
    background: '#F6F1E8',
    surface: '#FFFFFF',
    primary: '#4C1D95',
    primaryPressed: '#3B1478',
    info: '#E0F2FE',
    infoText: '#0C4A6E',
    text: '#374151',
    textMuted: '#6B7280',
    border: '#E6DFD4',
    success: '#047857',
    successSoft: '#D1FAE5',
    danger: '#B91C1C',
    dangerSoft: '#FEE2E2',
    white: '#FFFFFF',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    sm: 8,
    md: 16,
    lg: 24,
    pill: 999,
  },
  fontSize: {
    sm: 13,
    md: 16,
    lg: 18,
    xl: 24,
    display: 34,
  },
} as const;

export const cardShadow: ViewStyle = Platform.select({
  ios: {
    shadowColor: '#1F1633',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  default: {
    elevation: 3,
    shadowColor: '#1F1633',
  },
}) as ViewStyle;
