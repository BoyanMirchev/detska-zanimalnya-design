export const site = {
  name: "Хралупата",
  fullName: "Ученическа занималня Хралупата",
  phones: ["088 667 9774", "088 882 7634"],
  hours: "07:30 – 19:00",
  address: 'ул. „Княз Борис I“ № 127 А',
  logo: "/hralupata-logo.png",
}

export type ProgramSlug = "uchebna" | "preduchilishtna" | "junior" | "lyatna"

export const zanimalnyaLinks: { label: string; href: string }[] = [
  { label: "Учебна занималня 1–7 клас", href: "/zanimalnya/uchebna" },
  { label: "Предучилищна група 5–7 години", href: "/zanimalnya/preduchilishtna" },
  { label: "Занималня Junior 2–5 години", href: "/zanimalnya/junior" },
  { label: "Лятна занималня", href: "/zanimalnya/lyatna" },
]

export const navLinks = [
  { label: "Начало", href: "/" },
  {
    label: "Занималня",
    href: "/zanimalnya/uchebna",
    children: zanimalnyaLinks,
  },
  { label: "Курсове", href: "/kursove" },
  { label: "Полезно", href: "/polezno" },
  { label: "За нас", href: "/za-nas" },
]

// Real photos supplied by the client (hosted on Vercel Blob storage).
export const photos = {
  bannerWall: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-etouaVMOBNh1CHe8WTYJz9ZKHn2iSh.png",
  bannerDoor: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-wBGp43AxeDJZN9EqJ6Sa1xHQhZo53n.png",
  entrance: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-awzV3OyBgbPlIoQArn2zBemESOZzhF.png",
  entranceHall: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ghfInBSUU1dllPUB4meOjNl0aItv3S.png",
  ownBanner: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-QaDmlRhwQkBWAbsyGexmyz8wNNmojL.png",
  classroomGreen: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-9NvvSwOVBS1OvV7rFSBfqDfYE41110.png",
  classroomGreenWide: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AVfgdSTLcG3JOi0MwWiGqt5vrrpjBb.png",
  classroomExponent: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-6DYE1zqsnoS7sowl4Vq7eicVYRy8li.png",
  classroomBlue: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ryLzeT7gLsHpygBXPpy4vWnfTRxRp5.png",
  classroomBlueAlphabet: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-aprYFD93heQCH0Ex7STJPyN6MLyOzC.png",
  classroomBlueShark: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-FhahRm5fn5rL91my1fJ3zmmNtujJ2U.png",
  classroomWhite: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-OLiZDXITobxRu459WTD4nJxkLIJihQ.png",
  classroomSorry: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-VqUiUqU9OlJh9kAJj0wS1cMgVoXCGw.png",
  lounge: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-v7Y4aYrh33sgenjdIkGR4qWIl3RtC9.png",
  loungeWide: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-hk7gO6M9IlXLzci9fd3Ihfhdcti1Gw.png",
  loungeSofa: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-IrWUywpuv0NH2mCkdLTJWvwYj8LLFw.png",
  alphabetWall: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-vU91019fg2T4CooKZ8roXMCRPo21le.png",
  priceList: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/viber_image_2026-08-04_20-11-51-317-ytgOfnR4qIg8o4Qz50J8qDHmsv1QRX.jpg",
}
