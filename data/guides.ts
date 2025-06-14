export interface GuideSection {
  id: string
  type: 'text' | 'code' | 'path'
  content: string
}

export interface Guide {
  id: string
  title: string
  description: string
  category: string
  operatingSystem: string[]
  difficulty: 'Anfänger' | 'Fortgeschritten' | 'Experte'
  readTime: string
  slug: string
  tags: string[]
  publishedAt: string
  updatedAt: string
  author: string
  authorRole?: string
  authorImage?: string
  sections?: GuideSection[]
}

export const guides: Guide[] = [
  // Alle Guides werden jetzt dynamisch aus Vercel Blob geladen
]

export const categories = [
  'Alle',
  'Virtualisierung',
  'Netzwerk',
  'Server Administration',
  'Docker',
  'Kubernetes',
  'Sicherheit',
  'Monitoring'
]

export const operatingSystems = [
  'Alle',
  'Debian',
  'Ubuntu',
  'CentOS',
  'RHEL',
  'Proxmox VE',
  'Windows Server',
  'FreeBSD'
]

export const difficulties = [
  'Alle',
  'Anfänger',
  'Fortgeschritten',
  'Experte'
]

export function getGuideBySlug(slug: string): Guide | undefined {
  return guides.find(guide => guide.slug === slug)
}