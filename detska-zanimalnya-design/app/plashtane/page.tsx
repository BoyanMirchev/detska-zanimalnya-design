import type { Metadata } from "next"
import Image from "next/image"
import { Landmark, User, CreditCard, Pencil, Banknote, Wallet, Info } from "lucide-react"
import { PageHero, BottomCTA, SectionHeading } from "@/components/sections"
import { CopyField } from "@/components/copy-field"

export const metadata: Metadata = {
  title: "Плащане | Хралупата",
  description:
    "Начини на плащане на таксите в занималня Хралупата - плащане по банков път (Postbank) и плащане на място в брой или с карта.",
}

const bankRows = [
  { icon: Landmark, label: "Банка", value: "Postbank", copyable: false },
  { icon: User, label: "Име на получателя", value: "Би инк ЕООД", copyable: false },
  { icon: CreditCard, label: "IBAN", value: "BG14BPBI79391080673101", copyable: true },
  { icon: Pencil, label: "Основание", value: "Имената на детето", copyable: false },
]

export default function PlashtanePage() {
  return (
    <main className="overflow-hidden">
      <PageHero
        badge="Плащане"
        title="Плащане на таксите"
        highlight="лесно и сигурно"
        text="Изберете най-удобния за вас начин на плащане. Приемаме плащане по банков път, както и в брой или с карта на място в занималнята."
        image="/images/photo-toddlers-banner.png"
        imageAlt="Деца рисуват пред банера на Хралупата"
      />

      {/* Payment methods */}
      <section className="px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="Начини на плащане" title="Как да платите таксата." />

          <div className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            {/* Bank transfer */}
            <div className="rounded-[32px] border border-brand/12 bg-paper p-7 sm:p-9">
              <div className="flex items-center gap-3">
                <span className="grid h-14 w-14 place-items-center rounded-[18px] bg-brand text-white">
                  <Landmark className="h-7 w-7" />
                </span>
                <div>
                  <h3 className="text-2xl font-extrabold text-ink">Плащане по банков път</h3>
                  <p className="font-semibold text-ink/60">Преведете таксата по сметката ни</p>
                </div>
              </div>

              <div className="mt-7 overflow-hidden rounded-[24px] border border-brand/12">
                {bankRows.map((row, i) => {
                  const Icon = row.icon
                  return (
                    <div
                      key={row.label}
                      className={`flex items-center gap-4 px-5 py-4 sm:px-6 ${i % 2 === 1 ? "bg-cream" : "bg-paper"}`}
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-brand-soft text-brand-dark">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-ink/55">{row.label}</p>
                        <p className="truncate text-lg font-black text-ink">{row.value}</p>
                      </div>
                      {row.copyable && <CopyField value={row.value} label={row.label} />}
                    </div>
                  )
                })}
              </div>

              <p className="mt-5 flex items-start gap-2 rounded-2xl bg-sun/25 px-4 py-3 text-sm font-semibold text-ink/75">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-dark" />
                Важно: винаги посочвайте имената на детето като основание за плащане, за да разпознаем вноската.
              </p>
            </div>

            {/* On-site payment */}
            <div className="grid gap-6">
              <div className="rounded-[32px] bg-brand p-7 text-white sm:p-9">
                <span className="grid h-14 w-14 place-items-center rounded-[18px] bg-white/15">
                  <Banknote className="h-7 w-7" />
                </span>
                <h3 className="mt-5 text-2xl font-extrabold">Плащане на място</h3>
                <p className="mt-2 font-semibold leading-7 text-white/80">
                  Можете да заплатите таксата в брой или с карта директно в занималнята, в рамките на работното време.
                </p>
              </div>
              <div className="rounded-[32px] border border-brand/12 bg-paper p-7 sm:p-9">
                <span className="grid h-14 w-14 place-items-center rounded-[18px] bg-leaf/15 text-leaf-dark">
                  <Wallet className="h-7 w-7" />
                </span>
                <h3 className="mt-5 text-2xl font-extrabold text-ink">Гъвкави условия</h3>
                <p className="mt-2 font-semibold leading-7 text-ink/65">
                  Предлагаме месечни, седмични, дневни и почасови такси, както и 10% отстъпка за второ дете от
                  семейството.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Poster */}
      <section className="bg-paper px-5 pb-20 pt-4 sm:px-8 lg:pb-24">
        <div className="mx-auto max-w-lg">
          <SectionHeading align="center" eyebrow="За разпечатване" title="Данни за банков превод" />
          <figure className="mt-10 overflow-hidden rounded-[32px] border-[6px] border-white bg-cream soft-shadow">
            <Image
              src="/images/payment-bank-transfer.png"
              alt="Плащане по банков път - Банка Postbank, получател Би инк ЕООД, IBAN BG14BPBI79391080673101, основание имената на детето"
              width={1024}
              height={1536}
              className="h-auto w-full"
            />
          </figure>
        </div>
      </section>

      <BottomCTA />
    </main>
  )
}
