'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
    // const { messages, input, handleInputChange, handleSubmit } = useChat({});

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-4">Welcome to Hackstreet Boys!</h1>
                <Link href="/start" passHref>
                    <Button>
                        Let&apos;s get started!
                    </Button>
                </Link>
            </div>
        </div>
    )
}