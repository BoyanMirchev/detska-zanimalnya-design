"use client"

import Image from "next/image"
import { useActionState, useState } from "react"
import { CheckCircle2, ImageUp, Loader2, Save, TriangleAlert } from "lucide-react"
import { createWorkshop, updateWorkshop, type WorkshopEditorState } from "@/app/actions/workshops-admin"
import { isProxiedImage, type Workshop } from "@/lib/workshops/types"

const inputClass =
  "w-full rounded-2xl border-2 border-[#17324D]/10 bg-[#F7FAFC] px-4 py-2.5 font-semibold text-[#17324D] outline-none transition focus:border-[#9ED9CA]"
const labelClass = "mb-1.5 block text-sm font-extrabold text-[#17324D]"
const hintClass = "mt-1 text-xs font-bold text-[#17324D]/50"

function Field({ label, hint, children, wide }: { label: string; hint?: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <label className={`block ${wide ? "sm:col-span-2" : ""}`}>
      <span className={labelClass}>{label}</span>
      {children}
      {hint && <span className={`block ${hintClass}`}>{hint}</span>}
    </label>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[28px] bg-white p-6 shadow-sm sm:p-8">
      <h2 className="mb-5 text-xl font-extrabold text-[#17324D]">{title}</h2>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  )
}

function Toggle({ name, label, defaultChecked }: { name: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-[#F7FAFC] px-4 py-3 font-bold text-[#17324D]">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-5 w-5 accent-[#1F6B5C]" />
      {label}
    </label>
  )
}

export function WorkshopEditor({ workshop }: { workshop?: Workshop }) {
  const action = workshop ? updateWorkshop.bind(null, workshop.id) : createWorkshop
  const [state, formAction, pending] = useActionState<WorkshopEditorState, FormData>(action, {})
  const [imageUrl, setImageUrl] = useState(workshop?.image_url ?? "")
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError("")
    try {
      const body = new FormData()
      body.append("file", file)
      const res = await fetch("/api/admin/workshops/upload", { method: "POST", body })
      const data = (await res.json()) as { url?: string; error?: string }
      if (!res.ok || !data.url) throw new Error(data.error || "Качването се провали.")
      setImageUrl(data.url)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Качването се провали.")
    } finally {
      setUploading(false)
      event.target.value = ""
    }
  }

  const w = workshop
  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.error && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl bg-[#FDE8E8] p-4 font-bold text-[#B42318]">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          {state.error}
        </div>
      )}
      {state.saved && (
        <div role="status" className="flex items-center gap-3 rounded-2xl bg-[#9ED9CA]/30 p-4 font-bold text-[#1F6B5C]">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          Промените са запазени.
        </div>
      )}

      <Card title="Дата, места и записване">
        <Field label="Дата" hint="Празно = „Очаквайте подробности“">
          <input type="date" name="event_date" defaultValue={w?.event_date ?? ""} className={inputClass} />
        </Field>
        <Field label="Начален час">
          <input type="time" name="start_time" defaultValue={w?.start_time?.slice(0, 5) ?? ""} className={inputClass} />
        </Field>
        <Field label="Продължителност (минути)">
          <input type="number" name="duration_minutes" min={1} defaultValue={w?.duration_minutes ?? ""} className={inputClass} />
        </Field>
        <Field label="Цена" hint="Цените се управляват централно">
          <p className="rounded-2xl bg-[#F2F7FB] px-4 py-3 text-sm font-bold text-[#17324D]/70">
            {w ? (
              <a href={`/admin/ceni?q=${encodeURIComponent(w.title)}`} className="text-[#1F6B5C] underline underline-offset-2">
                Редактирай цената в „Управление на цени“
              </a>
            ) : (
              "След създаването цената се задава в „Управление на цени“."
            )}
          </p>
        </Field>
        <Field label="Възраст от">
          <input type="number" name="age_min" min={0} max={18} defaultValue={w?.age_min ?? ""} className={inputClass} />
        </Field>
        <Field label="Възраст до">
          <input type="number" name="age_max" min={0} max={18} defaultValue={w?.age_max ?? ""} className={inputClass} />
        </Field>
        <Field label="Капацитет (брой места)" hint={w ? `Заети места в момента: ${w.reserved_count}` : "Празно = без ограничение"}>
          <input type="number" name="capacity" min={0} defaultValue={w?.capacity ?? ""} className={inputClass} />
        </Field>
        <Field label="Подредба" hint="По-малкото число се показва първо">
          <input type="number" name="sort_order" min={0} defaultValue={w?.sort_order ?? 0} className={inputClass} />
        </Field>
        <Toggle name="registration_enabled" label="Записването е активно" defaultChecked={w?.registration_enabled ?? false} />
        <Toggle name="published" label="Публикувана на сайта" defaultChecked={w?.published ?? false} />
        <Toggle name="requires_allergy_info" label="Питай за хранителни алергии" defaultChecked={w?.requires_allergy_info ?? false} />
      </Card>

      <Card title="Основно съдържание">
        {!w && (
          <Field label="Адрес (slug)" hint="Само латински малки букви, цифри и тирета, напр. koledni-medenki" wide>
            <input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" className={inputClass} />
          </Field>
        )}
        <Field label="Заглавие" wide>
          <input name="title" required defaultValue={w?.title ?? ""} className={inputClass} />
        </Field>
        <Field label="Сезон / група" hint="напр. Коледа">
          <input name="season" defaultValue={w?.season ?? "Коледа"} className={inputClass} />
        </Field>
        <Field label="Заглавие на материалите">
          <input name="materials_title" defaultValue={w?.materials_title ?? "С какво ще творим?"} className={inputClass} />
        </Field>
        <Field label="Кратко описание (за картата)" wide>
          <textarea name="short_description" rows={2} defaultValue={w?.short_description ?? ""} className={inputClass} />
        </Field>
        <Field label="Hero заглавие" wide>
          <input name="hero_title" defaultValue={w?.hero_title ?? ""} className={inputClass} />
        </Field>
        <Field label="Hero подзаглавие" wide>
          <textarea name="hero_subtitle" rows={2} defaultValue={w?.hero_subtitle ?? ""} className={inputClass} />
        </Field>
        <Field label="За работилницата" hint="Празен ред = нов абзац" wide>
          <textarea name="about" rows={6} defaultValue={w?.about ?? ""} className={inputClass} />
        </Field>
        <Field label="Какво ще правим?" hint="По една стъпка на ред: Заглавие | Описание" wide>
          <textarea
            name="activities"
            rows={6}
            defaultValue={w?.activities.map((a) => `${a.title} | ${a.text}`).join("\n") ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Материали" hint="По един на ред">
          <textarea name="materials" rows={6} defaultValue={w?.materials.join("\n") ?? ""} className={inputClass} />
        </Field>
        <Field label="Какво ще отнесат вкъщи" hint="По едно на ред">
          <textarea name="take_home" rows={6} defaultValue={w?.take_home.join("\n") ?? ""} className={inputClass} />
        </Field>
        <Field label="Важна информация" hint="По една на ред: Заглавие | Текст" wide>
          <textarea
            name="notices"
            rows={3}
            defaultValue={w?.notices.map((n) => `${n.title} | ${n.text}`).join("\n") ?? ""}
            className={inputClass}
          />
        </Field>
      </Card>

      <Card title="Изображение и SEO">
        <div className="sm:col-span-2 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative aspect-[4/3] w-full max-w-56 overflow-hidden rounded-2xl bg-[#F7FAFC]">
            {imageUrl && <Image src={imageUrl} alt="" fill sizes="224px" unoptimized={isProxiedImage(imageUrl)} className="object-cover" />}
          </div>
          <div className="flex flex-col gap-2">
            <input type="hidden" name="image_url" value={imageUrl} />
            <label className="inline-flex cursor-pointer items-center gap-2 self-start rounded-full bg-[#17324D] px-5 py-2.5 font-extrabold text-white transition hover:-translate-y-0.5">
              {uploading ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <ImageUp className="h-5 w-5" aria-hidden="true" />}
              {uploading ? "Качване..." : "Качи ново изображение"}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} disabled={uploading} className="sr-only" />
            </label>
            <span className={hintClass}>JPG, PNG или WebP до 8 MB</span>
            {uploadError && <span role="alert" className="text-sm font-bold text-[#B42318]">{uploadError}</span>}
          </div>
        </div>
        <Field label="Алтернативен текст на изображението" wide>
          <input name="image_alt" defaultValue={w?.image_alt ?? ""} className={inputClass} />
        </Field>
        <Field label="SEO заглавие" hint="Празно = заглавието на работилницата">
          <input name="seo_title" defaultValue={w?.seo_title ?? ""} className={inputClass} />
        </Field>
        <Field label="SEO описание" hint="Празно = краткото описание">
          <textarea name="seo_description" rows={2} defaultValue={w?.seo_description ?? ""} className={inputClass} />
        </Field>
      </Card>

      <button
        type="submit"
        disabled={pending || uploading}
        className="sticky bottom-4 inline-flex items-center justify-center gap-2 self-end rounded-full bg-[#1F6B5C] px-8 py-3.5 font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Save className="h-5 w-5" aria-hidden="true" />}
        {pending ? "Запазване..." : w ? "Запази промените" : "Създай работилница"}
      </button>
    </form>
  )
}
