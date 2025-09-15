import '../globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { BGMProvider } from '../contexts/BGMContext'
import { ThemeProvider } from '../contexts/ThemeContext'
 
export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Connect4Plus - 次世代型立体四目並べ</title>
        <meta name="description" content="Connect4Plusは次世代型立体四目並べゲームです。オンライン対戦、AI対戦、オフライン対戦が楽しめます。" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </Head>
      <ThemeProvider>
        <BGMProvider>
          <Component {...pageProps} />
        </BGMProvider>
      </ThemeProvider>
    </>
  )
} 