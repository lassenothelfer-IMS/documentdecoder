import { useColorScheme } from 'react-native';

// Paper-and-ink palette: one dominant ink blue, one sharp vermilion reserved for deadlines.
const palette = {
  light: {
    paper: '#F4F1EA',
    sheet: '#FFFDF8',
    ink: '#1C2127',
    inkMuted: '#5E636B',
    hairline: '#DCD5C7',
    primary: '#1F3A5C',
    onPrimary: '#FFFFFF',
    primarySoft: '#E3E8EF',
    deadline: '#C2361B',
    deadlineSoft: '#F7E3DC',
  },
  dark: {
    paper: '#131518',
    sheet: '#1C1F23',
    ink: '#ECE7DD',
    inkMuted: '#A29D93',
    hairline: '#2D3136',
    primary: '#A9C1E3',
    onPrimary: '#0E1B2C',
    primarySoft: '#232D3A',
    deadline: '#FF7A5C',
    deadlineSoft: '#3A211B',
  },
} as const;

export type Colors = { [K in keyof typeof palette.light]: string };

export function useColors(): Colors {
  const scheme = useColorScheme();
  return palette[scheme === 'dark' ? 'dark' : 'light'];
}

export const splashBackground = palette.light.paper;
