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
  {
    id: '1',
    title: 'Installation von Proxmox VE auf einem Hetzner VPS Server mit LAN-Netzwerk',
    description: 'Lerne, wie du Proxmox Virtual Environment auf einem Hetzner VPS Server installierst und ein internes LAN-Netzwerk für deine virtuellen Maschinen einrichtest. Dieser umfassende Guide führt dich durch alle notwendigen Schritte.',
    category: 'Virtualisierung',
    operatingSystem: ['Debian', 'Proxmox VE'],
    difficulty: 'Fortgeschritten',
    readTime: '15 Min.',
    slug: 'proxmox-guide',
    tags: ['proxmox', 'virtualisierung', 'hetzner', 'vps', 'lan', 'netzwerk', 'dhcp', 'iptables'],
    publishedAt: '2024-01-15',
    updatedAt: '2024-01-15',
    author: 'Matsuda Béla',
    authorRole: 'System Administrator',
    authorImage: '/matsuda-béla-weiß.png'
  }
  // Hier können weitere Guides hinzugefügt werden
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