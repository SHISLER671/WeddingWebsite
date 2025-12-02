"use client"

import { Suspense } from "react"
import LivePreviewForm from "./LivePreviewForm"

export const dynamic = "force-dynamic"

export default function InvitationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-jewel-burgundy to-jewel-crimson py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-playfair text-jewel-burgundy text-center mb-10">
          Personalized Wedding Invitations
        </h1>

        <Suspense fallback={<div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-8">Loading...</div>}>
          <LivePreviewForm />
        </Suspense>
      </div>
    </div>
  )
}
