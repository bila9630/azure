"use client"

import { MainNav } from '@/components/main-nav'
import { ModeToggle } from '@/components/dark-mode-toggle'
import React, { useEffect } from 'react'
import { useSetAtom } from 'jotai'
import { pdfDataAtom } from '@/store/pdf-atoms'

export default function InnerLayout({ children }: { children: React.ReactNode }) {
    const setPdfData = useSetAtom(pdfDataAtom)

    useEffect(() => {
        return () => {
          // Cleanup sessionStorage when leaving the app
          sessionStorage.removeItem('pdfViewerData')
        }
      }, [])

    return (
        <div className="flex flex-col min-h-screen">
            <div className="border-b">
                <div className="flex h-16 items-center px-4">
                    <MainNav className="mx-6" />
                    <div className="ml-auto flex items-center space-x-4">
                        <ModeToggle />
                    </div>
                </div>
            </div>
            <div className="flex-1">
                {children}
            </div>
        </div>
    )
}