import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'SIMAE TB',
  description: 'Skrining Mandiri Tuberculosis',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}