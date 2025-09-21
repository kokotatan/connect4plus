import '../globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { BGMProvider } from '../contexts/BGMContext'
import { ThemeProvider } from '../contexts/ThemeContext'
 
export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Connect4Plus - 次世代型立体四目並べ | 無料オンラインゲーム</title>
        <meta name="description" content="Connect4Plusは次世代型立体四目並べゲームです。オンライン対戦、AI対戦、オフライン対戦が楽しめます。無料でプレイ可能、スマホ・PC対応。" />
        <meta name="keywords" content="四目並べ,connect4,オンラインゲーム,AI対戦,無料ゲーム,パズルゲーム,対戦ゲーム,スマホゲーム" />
        <meta name="author" content="Kotaro Design Lab" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="ja" />
        <meta name="revisit-after" content="7 days" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://connect4plus.vercel.app/" />
        <meta property="og:title" content="Connect4Plus - 次世代型立体四目並べ" />
        <meta property="og:description" content="Connect4Plusは次世代型立体四目並べゲームです。オンライン対戦、AI対戦、オフライン対戦が楽しめます。" />
        <meta property="og:image" content="https://connect4plus.vercel.app/assets/photo/connect4pluslogo.png" />
        <meta property="og:image:width" content="1024" />
        <meta property="og:image:height" content="1024" />
        <meta property="og:site_name" content="Connect4Plus" />
        <meta property="og:locale" content="ja_JP" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://connect4plus.vercel.app/" />
        <meta name="twitter:title" content="Connect4Plus - 次世代型立体四目並べ" />
        <meta name="twitter:description" content="Connect4Plusは次世代型立体四目並べゲームです。オンライン対戦、AI対戦、オフライン対戦が楽しめます。" />
        <meta name="twitter:image" content="https://connect4plus.vercel.app/assets/photo/connect4pluslogo.png" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://connect4plus.vercel.app/" />
        
        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        
        {/* Theme Color */}
        <meta name="theme-color" content="#10b981" />
        <meta name="msapplication-TileColor" content="#10b981" />
        
        {/* Structured Data (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Connect4Plus",
              "description": "Connect4Plusは次世代型立体四目並べゲームです。オンライン対戦、AI対戦、オフライン対戦が楽しめます。",
              "url": "https://connect4plus.vercel.app/",
              "applicationCategory": "GameApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "JPY"
              },
              "author": {
                "@type": "Organization",
                "name": "Kotaro Design Lab"
              },
              "inLanguage": "ja",
              "isAccessibleForFree": true,
              "browserRequirements": "Requires JavaScript. Requires HTML5.",
              "softwareVersion": "1.0.0",
              "screenshot": "https://connect4plus.vercel.app/assets/photo/connect4pluslogo.png",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.5",
                "ratingCount": "100"
              }
            })
          }}
        />
      </Head>
      <ThemeProvider>
        <BGMProvider>
          <Component {...pageProps} />
        </BGMProvider>
      </ThemeProvider>
    </>
  )
} 