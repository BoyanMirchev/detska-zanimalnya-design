"use client"

import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react"

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

function createEventId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `contact-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

type PhoneLinkProps = {
  href: string
  children: ReactNode
  className?: string
  /** Set to false for links that should keep `tel:` behaviour without firing a Contact event. */
  track?: boolean
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children" | "className" | "onClick">

/**
 * A `tel:` link that reports one deduplicated Meta `Contact` event per click:
 * the browser Pixel and the server Conversions API both receive the same event_id.
 * The default anchor navigation is never blocked, so the phone app still opens.
 */
export function PhoneLink({ href, children, className, track = true, onClick, ...rest }: PhoneLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event)

    if (!track) return

    // One id shared by both transports -> Meta collapses the browser + server copy.
    const eventId = createEventId()
    const eventSourceUrl = window.location.href

    try {
      window.fbq?.("track", "Contact", {}, { eventID: eventId })
    } catch {
      // Pixel problems must never break the phone link.
    }

    // keepalive lets the request finish even while the phone handler takes over.
    void fetch("/api/meta/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventName: "Contact", eventId, eventSourceUrl }),
      keepalive: true,
    }).catch(() => {
      // Server-side tracking is best-effort only.
    })
  }

  return (
    <a href={href} className={className} onClick={handleClick} {...rest}>
      {children}
    </a>
  )
}
