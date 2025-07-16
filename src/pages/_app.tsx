import '../globals.css'
import type { AppProps } from 'next/app'
import { BGMProvider } from '../contexts/BGMContext'
 
export default function App({ Component, pageProps }: AppProps) {
  return (
    <BGMProvider>
      <Component {...pageProps} />
    </BGMProvider>
  )
} 