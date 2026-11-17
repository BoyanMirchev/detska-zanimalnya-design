import { SectionHeading } from "@/components/sections"
import { PriceDisplay } from "@/components/pricing/price-display"
import { getPriceGroup } from "@/lib/pricing/db"

export const PRICES_UNAVAILABLE =
  "Цените временно не могат да бъдат заредени. Моля, свържете се с нас за актуална информация."

/**
 * Renders one centrally managed price group. Never falls back to hardcoded
 * amounts: if the data cannot be loaded, a neutral message is shown instead.
 */
export async function PricingTable({
  groupKey,
  showHeading = true,
  className = "",
}: {
  groupKey: string
  showHeading?: boolean
  className?: string
}) {
  let data: Awaited<ReturnType<typeof getPriceGroup>>
  try {
    data = await getPriceGroup(groupKey)
  } catch (error) {
    console.error("[pricing] failed to load group", groupKey, error)
    return (
      <div className={className}>
        <p role="status" className="rounded-[30px] border border-brand/15 bg-paper px-6 py-5 text-center font-bold text-ink/60">
          {PRICES_UNAVAILABLE}
        </p>
      </div>
    )
  }
  if (!data || data.prices.length === 0) return null
  const { group, prices } = data

  return (
    <div className={className}>
      {showHeading && <SectionHeading align="center" eyebrow="Цени" title={group.title || "Цени и записване"} />}
      <div className={`${showHeading ? "mt-10 " : ""}overflow-hidden rounded-[30px] border border-brand/15 bg-paper`}>
        {prices.map((row, i) => (
          <div
            key={row.key}
            className={`flex items-center justify-between gap-4 px-6 py-5 sm:px-8 ${i % 2 === 1 ? "bg-cream" : "bg-paper"}`}
          >
            <div>
              <p className="font-extrabold text-ink">{row.label}</p>
              {row.note && <p className="mt-1 text-sm font-semibold text-ink/55">{row.note}</p>}
            </div>
            <PriceDisplay price={row} />
          </div>
        ))}
      </div>
      {group.note && <p className="mt-4 text-center text-sm font-semibold text-ink/50">{group.note}</p>}
    </div>
  )
}
