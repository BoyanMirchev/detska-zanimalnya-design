import { resolvePrice, type PriceRecord } from "@/lib/pricing/types"

const PILL = "shrink-0 whitespace-nowrap rounded-full bg-brand/12 px-4 py-2 text-lg font-black text-brand-dark"

/** Price pill used in every pricing table; shows the struck-through regular price while a promotion runs. */
export function PriceDisplay({ price, className = PILL }: { price: PriceRecord; className?: string }) {
  const resolved = resolvePrice(price)
  if (resolved.kind === "text" || !resolved.promotional) {
    return <span className={className}>{resolved.text}</span>
  }
  return (
    <span className="flex shrink-0 flex-col items-end gap-1">
      <span className="inline-flex items-center gap-2">
        <span className="rounded-full bg-brand px-2.5 py-0.5 text-xs font-black uppercase tracking-wide text-paper">
          Промоция
        </span>
        <s className="whitespace-nowrap text-sm font-bold text-ink/45">
          <span className="sr-only">Редовна цена: </span>
          {resolved.originalText}
        </s>
      </span>
      <span className={className}>
        <span className="sr-only">Промоционална цена: </span>
        {resolved.text}
      </span>
    </span>
  )
}

/** Inline variant for compact facts (e.g. the workshop info list). */
export function InlinePrice({ price }: { price: PriceRecord }) {
  const resolved = resolvePrice(price)
  if (resolved.kind === "text" || !resolved.promotional) return <>{resolved.text}</>
  return (
    <>
      <s className="mr-2 font-bold text-ink/45">
        <span className="sr-only">Редовна цена: </span>
        {resolved.originalText}
      </s>
      <span className="text-brand-dark">
        <span className="sr-only">Промоционална цена: </span>
        {resolved.text}
      </span>
    </>
  )
}
