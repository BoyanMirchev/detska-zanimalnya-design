import type { Metadata, Viewport } from "next"
import Script from "next/script"
import "./globals.css"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { RegistrationSection } from "@/components/registration-section"
import { GoogleAnalytics } from "@next/third-parties/google"

export const metadata: Metadata = {
  metadataBase: new URL("https://www.хралупата.com"),

  title: {
    default: "Ученическа занималня в София | Хралупата",
    template: "%s | Хралупата",
  },

  description:
    "Ученическа занималня в центъра на София за деца от 1. до 7. клас. Учебна подготовка, малки групи, предучилищна и лятна занималня.",

  applicationName: "Хралупата",

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: "website",
    locale: "bg_BG",
    siteName: "Хралупата",
    title: "Ученическа занималня в София | Хралупата",
    description:
      "Ученическа занималня в центъра на София за деца от 1. до 7. клас. Учебна подготовка, малки групи и индивидуален подход.",
    url: "/",
  },
}

export const viewport: Viewport = {
  themeColor: "#dd5b26",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="bg" className="bg-cream" data-scroll-behavior="smooth">
      <body>
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '810139615489253');
fbq('track', 'PageView');`}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=810139615489253&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "y6u4y4y7d5");`}
        </Script>

        <SiteHeader />
        {children}
        <RegistrationSection />
        <SiteFooter />
      </body>

      <GoogleAnalytics gaId="G-WPHGCMLJ86" />
    </html>
  )
}
