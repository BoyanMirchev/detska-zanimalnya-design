import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { WorkshopDetail } from "@/components/workshops/workshop-detail"
import { getPublishedWorkshop, getPublishedWorkshops } from "@/lib/workshops/db"
import { eventDateTimes, getAvailability, type Workshop } from "@/lib/workshops/types"
import { contact } from "@/lib/nav"

export const revalidate = 300

const BASE_URL = "https://www.хралупата.com"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const w = await getPublishedWorkshop(slug)
  if (!w) return { title: "Работилницата не е намерена", robots: { index: false } }
  const title = w.seo_title || w.title
  const description = w.seo_description || w.short_description
  const url = `/rabotilnici/${w.slug}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "bg_BG",
      siteName: "Хралупата",
      title: `${title} | Хралупата`,
      description,
      url,
      images: [{ url: w.image_url, alt: w.image_alt }],
    },
  }
}

function jsonLd(w: Workshop) {
  const url = `${BASE_URL}/rabotilnici/${w.slug}`
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Начало", item: `${BASE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Работилници", item: `${BASE_URL}/rabotilnici` },
      { "@type": "ListItem", position: 3, name: w.title, item: url },
    ],
  }
  const items: object[] = [breadcrumb]

  // Event data only when a real date and start time are configured.
  if (w.event_date && w.start_time) {
    const { start, end } = eventDateTimes(w.event_date, w.start_time, w.duration_minutes)
    const availability = getAvailability(w)
    items.push({
      "@context": "https://schema.org",
      "@type": "Event",
      name: w.title,
      description: w.short_description,
      startDate: start,
      ...(end ? { endDate: end } : {}),
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      image: [new URL(w.image_url, BASE_URL).toString()],
      url,
      location: { "@type": "Place", name: "Хралупата", address: contact.address },
      organizer: { "@type": "Organization", name: "Хралупата", url: BASE_URL },
      ...(w.price !== null
        ? {
            offers: {
              "@type": "Offer",
              price: w.price,
              priceCurrency: "EUR",
              url,
              availability:
                availability.state === "open" ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
            },
          }
        : {}),
    })
  }
  return items
}

export default async function WorkshopPage({ params }: Props) {
  const { slug } = await params
  const [workshop, all] = await Promise.all([getPublishedWorkshop(slug), getPublishedWorkshops()])
  if (!workshop) notFound()

  return (
    <main>
      {jsonLd(workshop).map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item).replace(/</g, "\\u003c") }}
        />
      ))}
      <WorkshopDetail workshop={workshop} all={all} />
    </main>
  )
}
