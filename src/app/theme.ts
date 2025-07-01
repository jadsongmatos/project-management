'use client';

import { createTheme } from '@mui/material/styles';
import { Roboto_Serif } from 'next/font/google';

const robotoSerif = Roboto_Serif({
  subsets: ['latin'],
  display: 'swap',
});

const theme = createTheme({
  colorSchemes: { light: true, dark: true },
  cssVariables: {
    colorSchemeSelector: 'class',
  },
  typography: {
    fontFamily: robotoSerif.style.fontFamily,
    //fontSize: 14
  },
  palette: {
  },
});

export default theme;
