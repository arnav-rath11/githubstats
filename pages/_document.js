import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="Terminal-style GitHub profile analytics. Analyze any GitHub developer in seconds." />
        <meta name="theme-color" content="#040810" />
        <meta property="og:title" content="GitHubStats — Terminal Analytics" />
        <meta property="og:description" content="Analyze any GitHub profile instantly. AI-powered insights, repo health, language analytics." />
        <meta property="og:type" content="website" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23040810'/><text y='.9em' font-size='90' x='5'>⬛</text></svg>" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
