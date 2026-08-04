"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { ArrowRight, Check, ImagePlus, Loader2, X } from "lucide-react"
import { submitContactRequest, type ContactFormState } from "@/app/actions/contact"

const initialState: ContactFormState = {}

type UploadedImage = {
  id: string
  name: string
  pathname: string
  previewUrl: string
}

const MAX_IMAGES = 6

export function ContactDialog() {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(submitContactRequest, initialState)

  const [images, setImages] = useState<UploadedImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploadError(null)

    const remaining = MAX_IMAGES - images.length
    if (remaining <= 0) {
      setUploadError(`Може да качите най-много ${MAX_IMAGES} снимки.`)
      return
    }

    const toUpload = Array.from(files).slice(0, remaining)
    setUploading(true)
    try {
      for (const file of toUpload) {
        const body = new FormData()
        body.append("file", file)
        const res = await fetch("/api/upload", { method: "POST", body })
        const data = await res.json()
        if (!res.ok) {
          setUploadError(data.error || "Качването се провали.")
          continue
        }
        setImages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            name: file.name,
            pathname: data.pathname,
            previewUrl: URL.createObjectURL(file),
          },
        ])
      }
    } catch {
      setUploadError("Възникна грешка при качването.")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  function removeImage(id: string) {
    setImages((prev) => {
      const target = prev.find((i) => i.id === id)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((i) => i.id !== id)
    })
  }

  // Clear uploaded images once the request is submitted successfully.
  useEffect(() => {
    if (state.success) {
      setImages((prev) => {
        prev.forEach((i) => URL.revokeObjectURL(i.previewUrl))
        return []
      })
    }
  }, [state.success])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-w-[240px] items-center justify-center gap-2 rounded-full bg-white px-7 py-4 font-extrabold text-[#3a2416] shadow-md transition hover:-translate-y-1"
      >
        Пиши ни съобщение
        <ArrowRight className="h-5 w-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#3a2416]/50 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-dialog-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
        >
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Затвори"
              className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#3a2416]/5 text-[#3a2416] transition hover:bg-[#3a2416]/10"
            >
              <X className="h-5 w-5" />
            </button>

            {state.success ? (
              <div className="flex flex-col items-center gap-4 px-8 py-14 text-center">
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#6b9e3f] text-[#3a2416]">
                  <Check className="h-8 w-8" />
                </span>
                <h2 className="text-2xl font-extrabold text-[#3a2416]">Благодарим ви!</h2>
                <p className="max-w-sm font-bold leading-7 text-[#3a2416]/65">
                  Получихме вашето съобщение и ще се свържем с вас възможно най-скоро.
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-2 inline-flex items-center justify-center rounded-full bg-[#3a2416] px-7 py-3 font-extrabold text-white transition hover:-translate-y-1"
                >
                  Затвори
                </button>
              </div>
            ) : (
              <div className="px-6 py-8 sm:px-8">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#f5a623]/20 px-4 py-1.5 text-sm font-extrabold text-[#3a2416]">
                  Свържете се с нас
                </span>
                <h2 id="contact-dialog-title" className="mt-4 text-2xl font-extrabold text-[#3a2416] sm:text-3xl">
                  Оставете ни съобщение
                </h2>
                <p className="mt-2 font-bold leading-7 text-[#3a2416]/60">
                  Попълнете формата и ние ще ви отговорим възможно най-бързо.
                </p>

                <form action={formAction} className="mt-6 flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="text-sm font-extrabold text-[#3a2416]">
                      Име и фамилия <span className="text-[#F27B6B]">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Мария Иванова"
                      className="rounded-2xl border-2 border-[#3a2416]/10 bg-[#fff6ec] px-4 py-3 font-bold text-[#3a2416] outline-none transition placeholder:text-[#3a2416]/35 focus:border-[#6b9e3f]"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="email" className="text-sm font-extrabold text-[#3a2416]">
                        Имейл <span className="text-[#F27B6B]">*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="mail@example.bg"
                        className="rounded-2xl border-2 border-[#3a2416]/10 bg-[#fff6ec] px-4 py-3 font-bold text-[#3a2416] outline-none transition placeholder:text-[#3a2416]/35 focus:border-[#6b9e3f]"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="phone" className="text-sm font-extrabold text-[#3a2416]">
                        Телефон
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="0888 123 456"
                        className="rounded-2xl border-2 border-[#3a2416]/10 bg-[#fff6ec] px-4 py-3 font-bold text-[#3a2416] outline-none transition placeholder:text-[#3a2416]/35 focus:border-[#6b9e3f]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="childAge" className="text-sm font-extrabold text-[#3a2416]">
                      Възраст на детето
                    </label>
                    <input
                      id="childAge"
                      name="childAge"
                      type="text"
                      placeholder="напр. 6 години / 1. клас"
                      className="rounded-2xl border-2 border-[#3a2416]/10 bg-[#fff6ec] px-4 py-3 font-bold text-[#3a2416] outline-none transition placeholder:text-[#3a2416]/35 focus:border-[#6b9e3f]"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="message" className="text-sm font-extrabold text-[#3a2416]">
                      Съобщение <span className="text-[#F27B6B]">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={4}
                      placeholder="Разкажете ни какво търсите..."
                      className="resize-none rounded-2xl border-2 border-[#3a2416]/10 bg-[#fff6ec] px-4 py-3 font-bold text-[#3a2416] outline-none transition placeholder:text-[#3a2416]/35 focus:border-[#6b9e3f]"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-extrabold text-[#3a2416]">Снимки на детето</label>
                    <p className="-mt-1 text-xs font-bold text-[#3a2416]/50">
                      По желание. До {MAX_IMAGES} изображения, макс. 8 MB всяко.
                    </p>

                    <input
                      ref={fileInputRef}
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={(e) => handleFiles(e.target.files)}
                    />

                    {images.length > 0 && (
                      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                        {images.map((img) => (
                          <div key={img.id} className="group relative aspect-square overflow-hidden rounded-2xl border-2 border-[#3a2416]/10 bg-[#fff6ec]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img.previewUrl || "/placeholder.svg"} alt={img.name} className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(img.id)}
                              aria-label={`Премахни ${img.name}`}
                              className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#3a2416] text-white transition hover:bg-[#F27B6B]"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {images.length < MAX_IMAGES && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#3a2416]/20 bg-[#fff6ec] px-4 py-4 font-extrabold text-[#3a2416] transition hover:border-[#6b9e3f] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Качване...
                          </>
                        ) : (
                          <>
                            <ImagePlus className="h-5 w-5" />
                            Добави снимки
                          </>
                        )}
                      </button>
                    )}

                    {uploadError && (
                      <p className="text-sm font-extrabold text-[#C7503F]">{uploadError}</p>
                    )}
                  </div>

                  <input type="hidden" name="imagePaths" value={JSON.stringify(images.map((i) => i.pathname))} />

                  {state.error && (
                    <p className="rounded-2xl bg-[#F27B6B]/15 px-4 py-3 text-sm font-extrabold text-[#C7503F]">
                      {state.error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={pending || uploading}
                    className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#3a2416] px-7 py-4 font-extrabold text-white transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {pending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Изпращане...
                      </>
                    ) : (
                      <>
                        Изпрати съобщение
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
