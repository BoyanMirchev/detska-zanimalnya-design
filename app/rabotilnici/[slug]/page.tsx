import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { WorkshopDetail } from "@/components/workshops/workshop-detail"
import { getPublishedWorkshop, getPublishedWorkshops } from "@/lib/workshops/db"
import { eventDateTimes, getAvailability, type Workshop } from "@/lib/workshops/types"
import { contact } from "@/lib/nav"
import { getPrice, workshopPriceKey } from "@/lib/pricing/db"
import { getPromotionState, type PriceRecord } from "@/lib/pricing/types"

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

/** Offer amount for structured data: the currently effective EUR price, never a guessed value. */
function offerPrice(price: PriceRecord | null): string | null {
  if (!price || price.currency !== "EUR") return null
  if (price.display_mode === "free") return "0"
  if (price.display_mode !== "amount" || price.regular_price === null) return null
  return getPromotionState(price) === "active" && price.promotional_price !== null
    ? price.promotional_price
    : price.regular_price
}

async function loadWorkshopPrice(id: number): Promise<PriceRecord | null> {
  try {
    return await getPrice(workshopPriceKey(id))
  } catch (error) {
    console.error("[pricing] failed to load workshop price", id, error)
    return null
  }
}

function jsonLd(w: Workshop, price: PriceRecord | null) {
  const amount = offerPrice(price)
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
      ...(amount !== null
        ? {
            offers: {
              "@type": "Offer",
              price: amount,
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
  const price = await loadWorkshopPrice(workshop.id)

  return (
    <main>
      {jsonLd(workshop, price).map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item).replace(/</g, "\\u003c") }}
        />
      ))}
      <WorkshopDetail workshop={workshop} all={all} price={price} />
    </main>
  )
}
