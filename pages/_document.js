import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Google Fonts - Poppins for body, Space Grotesk for headers */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />

        {/* Global animations and effects */}
        <style>{`
          @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
          }

          @keyframes pulse-glow {
            0%, 100% {
              box-shadow: 0 0 20px rgba(0, 237, 100, 0.4);
            }
            50% {
              box-shadow: 0 0 40px rgba(0, 237, 100, 0.8);
            }
          }

          @keyframes pulse-glow-sinner {
            0%, 100% {
              box-shadow: 0 0 20px rgba(255, 92, 147, 0.4);
            }
            50% {
              box-shadow: 0 0 40px rgba(255, 92, 147, 0.8);
            }
          }

          /* Smooth scrolling */
          html {
            scroll-behavior: smooth;
          }

          /* Custom scrollbar for webkit browsers */
          ::-webkit-scrollbar {
            width: 10px;
          }

          ::-webkit-scrollbar-track {
            background: rgba(11, 16, 26, 0.5);
          }

          ::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #00ED64 0%, #00FFB2 100%);
            border-radius: 5px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #00FFB2 0%, #00ED64 100%);
          }
        `}</style>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
