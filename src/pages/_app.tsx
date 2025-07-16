import '../globals.css'
import type { AppProps } from 'next/app'
import { BGMProvider } from '../contexts/BGMContext'
import { ThemeProvider } from '../contexts/ThemeContext'
 
export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <BGMProvider>
        <Component {...pageProps} />
      </BGMProvider>
    </ThemeProvider>
  )
} 