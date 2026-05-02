export type MockAppOS = 'iOS' | 'Android' | 'Cross-platform'
export type MockAppStatus = 'Active' | 'Archived' | 'Maintenance'
export type MockDocumentationStatus = 'Complete' | 'Missing'
export type MockBuildStatus = 'Success' | 'Failed' | 'Pending'
export type MockBuildEnvironment = 'Production' | 'Staging' | 'Internal'

export interface MockBuild {
  id: string
  buildNumber: string
  version: string
  platform: MockAppOS
  status: MockBuildStatus
  environment: MockBuildEnvironment
  date: string
  duration: string
  author: string
}

export interface MockApp {
  id: string
  slug: string
  name: string
  description: string
  version: string
  os: MockAppOS
  stack: string[]
  status: MockAppStatus
  documentationStatus: MockDocumentationStatus
  lastBuild: string
  technicalSpec?: {
    title: string
    url: string
    available: boolean
  }
  designSpec?: {
    title: string
    url: string
    available: boolean
  }
  sourceCodeUrl?: string
  testUrl?: string
  createdAt: string
  updatedAt: string
  logs: Array<{
    id: string
    action: string
    details: string
    date: string
  }>
  builds: MockBuild[]
}

export const mockApps: MockApp[] = [
  {
    id: '1',
    slug: 'clubber-mobile',
    name: 'Clubber Mobile',
    description: 'Application mobile pour la gestion de clubs et événements nocturnes avec réservation en temps réel.',
    version: '2.4.1',
    os: 'iOS',
    stack: ['React Native', 'TypeScript', 'Redux'],
    status: 'Active',
    documentationStatus: 'Complete',
    lastBuild: '2 hours ago',
    technicalSpec: {
      title: 'Technical Requirements v2.4',
      url: 'https://docs.google.com/document/d/abc123',
      available: true,
    },
    designSpec: {
      title: 'UI/UX Design System',
      url: 'https://figma.com/file/def456',
      available: true,
    },
    sourceCodeUrl: 'https://github.com/company/clubber-mobile',
    testUrl: 'https://testflight.apple.com/join/xyz789',
    createdAt: '2024-01-15',
    updatedAt: '2024-04-28',
    logs: [
      {
        id: '1',
        action: 'Version 2.4.1 released',
        details: 'Added real-time reservation feature',
        date: '2024-04-28',
      },
      {
        id: '2',
        action: 'Technical spec updated',
        details: 'Updated API documentation',
        date: '2024-04-25',
      },
      {
        id: '3',
        action: 'Design spec updated',
        details: 'New color palette',
        date: '2024-04-20',
      },
    ],
    builds: [
      {
        id: 'b1',
        buildNumber: '241',
        version: '2.4.1',
        platform: 'iOS',
        status: 'Success',
        environment: 'Production',
        date: '2024-04-28T14:30:00',
        duration: '5m 23s',
        author: 'John Doe',
      },
      {
        id: 'b2',
        buildNumber: '240',
        version: '2.4.0',
        platform: 'iOS',
        status: 'Success',
        environment: 'Staging',
        date: '2024-04-25T10:15:00',
        duration: '4m 45s',
        author: 'Jane Smith',
      },
      {
        id: 'b3',
        buildNumber: '239',
        version: '2.3.9',
        platform: 'iOS',
        status: 'Failed',
        environment: 'Internal',
        date: '2024-04-22T16:20:00',
        duration: '2m 10s',
        author: 'John Doe',
      },
    ],
  },
  {
    id: '2',
    slug: 'restofocus-admin',
    name: 'RestoFocus Admin',
    description: 'Panel d\'administration pour les restaurateurs : gestion des menus, commandes et analytics.',
    version: '1.8.0',
    os: 'Android',
    stack: ['Flutter', 'Dart', 'Firebase'],
    status: 'Active',
    documentationStatus: 'Complete',
    lastBuild: '5 hours ago',
    technicalSpec: {
      title: 'Admin Panel Architecture',
      url: 'https://docs.google.com/document/d/ghi789',
      available: true,
    },
    designSpec: {
      title: 'Admin Dashboard Design',
      url: 'https://figma.com/file/jkl012',
      available: true,
    },
    sourceCodeUrl: 'https://github.com/company/restofocus-admin',
    testUrl: 'https://play.google.com/store/apps/details?id=com.restofocus.admin',
    createdAt: '2024-02-01',
    updatedAt: '2024-04-27',
    logs: [
      {
        id: '1',
        action: 'Version 1.8.0 released',
        details: 'Performance improvements',
        date: '2024-04-27',
      },
      {
        id: '2',
        action: 'Firebase integration',
        details: 'Added real-time analytics',
        date: '2024-04-15',
      },
    ],
    builds: [
      {
        id: 'b4',
        buildNumber: '180',
        version: '1.8.0',
        platform: 'Android',
        status: 'Success',
        environment: 'Production',
        date: '2024-04-27T09:00:00',
        duration: '6m 12s',
        author: 'Mike Johnson',
      },
      {
        id: 'b5',
        buildNumber: '179',
        version: '1.7.9',
        platform: 'Android',
        status: 'Success',
        environment: 'Staging',
        date: '2024-04-20T14:45:00',
        duration: '5m 30s',
        author: 'Sarah Williams',
      },
    ],
  },
  {
    id: '3',
    slug: 'eventscan',
    name: 'EventScan',
    description: 'Application de scan de billets et contrôle d\'accès pour événements et festivals.',
    version: '3.1.2',
    os: 'Cross-platform',
    stack: ['React Native', 'Expo', 'Node.js'],
    status: 'Maintenance',
    documentationStatus: 'Missing',
    lastBuild: '1 day ago',
    technicalSpec: {
      title: 'Technical Requirements',
      url: '',
      available: false,
    },
    designSpec: {
      title: 'Design System',
      url: '',
      available: false,
    },
    sourceCodeUrl: 'https://github.com/company/eventscan',
    testUrl: 'https://eventscan-test.herokuapp.com',
    createdAt: '2023-11-20',
    updatedAt: '2024-04-26',
    logs: [
      {
        id: '1',
        action: 'Maintenance mode activated',
        details: 'Preparing for major refactor',
        date: '2024-04-26',
      },
      {
        id: '2',
        action: 'Version 3.1.2 released',
        details: 'Bug fixes for QR scanning',
        date: '2024-04-20',
      },
    ],
    builds: [
      {
        id: 'b6',
        buildNumber: '312',
        version: '3.1.2',
        platform: 'Cross-platform',
        status: 'Success',
        environment: 'Staging',
        date: '2024-04-26T11:30:00',
        duration: '7m 45s',
        author: 'Alex Brown',
      },
      {
        id: 'b7',
        buildNumber: '311',
        version: '3.1.1',
        platform: 'Cross-platform',
        status: 'Pending',
        environment: 'Internal',
        date: '2024-04-24T16:00:00',
        duration: '8m 20s',
        author: 'Alex Brown',
      },
    ],
  },
  {
    id: '4',
    slug: 'tabletrack',
    name: 'TableTrack',
    description: 'Système de gestion de tables et réservations pour restaurants avec tableaux interactifs.',
    version: '1.2.0',
    os: 'iOS',
    stack: ['Swift', 'SwiftUI', 'CoreData'],
    status: 'Archived',
    documentationStatus: 'Missing',
    lastBuild: '2 weeks ago',
    technicalSpec: {
      title: 'Technical Requirements',
      url: '',
      available: false,
    },
    designSpec: {
      title: 'Design System',
      url: '',
      available: false,
    },
    sourceCodeUrl: 'https://github.com/company/tabletrack',
    testUrl: '',
    createdAt: '2023-08-10',
    updatedAt: '2024-04-10',
    logs: [
      {
        id: '1',
        action: 'Application archived',
        details: 'Replaced by RestoFocus Admin',
        date: '2024-04-10',
      },
      {
        id: '2',
        action: 'Version 1.2.0 released',
        details: 'Final stable version',
        date: '2024-03-15',
      },
    ],
    builds: [
      {
        id: 'b8',
        buildNumber: '120',
        version: '1.2.0',
        platform: 'iOS',
        status: 'Success',
        environment: 'Production',
        date: '2024-03-15T08:00:00',
        duration: '4m 10s',
        author: 'Emily Davis',
      },
    ],
  },
]

export function getAppBySlug(slug: string): MockApp | undefined {
  return mockApps.find((app) => app.slug === slug)
}

export function getAppById(id: string): MockApp | undefined {
  return mockApps.find((app) => app.id === id)
}
