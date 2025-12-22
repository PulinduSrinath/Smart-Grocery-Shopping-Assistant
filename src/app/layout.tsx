import type { Metadata } from 'next'
import './globals.css'
import groceryStoreImage from './images/grocery-store.jpg'

export const metadata: Metadata = {
  title: 'Smart Grocery Shopping Assistant',
  description: 'AI-powered grocery list manager with smart suggestions',
  icons: {
    icon: [],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ backgroundImage: `url(${groceryStoreImage.src})` }}>{children}</body>
    </html>
  )
}

