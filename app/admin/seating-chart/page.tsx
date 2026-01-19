"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, Printer } from "lucide-react"
import { useRouter } from "next/navigation"

interface Guest {
  guest_name: string
  email: string
  table_number: number
  rsvp_status: string
  is_entourage: boolean
  actual_guest_count?: number
  allowed_party_size?: number
}

type AlphabetGroup = {
  letter: string
  guests: Array<{
    guest_name: string
    table_number: number
    guest_count: number
    is_entourage: boolean
  }>
}

export default function SeatingChartPage() {
  const router = useRouter()
  const [groups, setGroups] = useState<AlphabetGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSeatingChart()

    // Auto-refresh once per day to catch manual edits
    const interval = setInterval(() => {
      loadSeatingChart()
    }, 86400000) // 24 hours (1 day)

    return () => clearInterval(interval)
  }, [])

  const extractLastName = (fullName: string): string => {
    const name = (fullName || "").trim().replace(/\s+/g, " ")
    if (!name) return ""

    // Format: "Last, First"
    const commaIdx = name.indexOf(",")
    if (commaIdx > 0) {
      return name.slice(0, commaIdx).trim()
    }

    // Drop common suffixes
    const suffixes = new Set(["jr", "sr", "ii", "iii", "iv", "v"])
    const parts = name.split(" ").filter(Boolean)
    while (parts.length > 1) {
      const last = parts[parts.length - 1].replace(/\./g, "").toLowerCase()
      if (suffixes.has(last)) {
        parts.pop()
        continue
      }
      break
    }

    return parts[parts.length - 1] || name
  }

  const letterBucket = (lastName: string): string => {
    const firstChar = (lastName || "").trim().charAt(0).toUpperCase()
    return /^[A-Z]$/.test(firstChar) ? firstChar : "#"
  }

  const loadSeatingChart = async (retryCount = 0): Promise<void> => {
    try {
      setLoading(true)
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(7)

      const res = await fetch(`/api/admin/guests?t=${timestamp}&r=${randomId}`, {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!res.ok) {
        if (res.status === 429 && retryCount < 3) {
          const waitTime = Math.pow(2, retryCount) * 2000 // 2s, 4s, 8s
          console.log(`[v0] Rate limit hit, retrying in ${waitTime / 1000}s... (attempt ${retryCount + 1}/3)`)
          await new Promise((resolve) => setTimeout(resolve, waitTime))
          await loadSeatingChart(retryCount + 1)
          return
        }

        if (res.status === 429) {
          console.error("[v0] Error loading seating chart: Rate limit exceeded. Please wait a moment and try again.")
          throw new Error("Rate limit exceeded. Please wait a moment and try again.")
        }
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }

      const contentType = res.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text()

        if ((text.includes("Too Many") || text.includes("Rate limit")) && retryCount < 3) {
          const waitTime = Math.pow(2, retryCount) * 2000
          console.log(`[v0] Rate limit detected (HTML response), retrying in ${waitTime / 1000}s...`)
          await new Promise((resolve) => setTimeout(resolve, waitTime))
          await loadSeatingChart(retryCount + 1)
          return
        }

        console.error("[v0] Error loading seating chart: Invalid response format (not JSON):", text.substring(0, 100))
        throw new Error("Rate limit exceeded. Please wait a moment and try again.")
      }

      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to load guests")
      }

      const attending = (data.data as Guest[])
        // RSVP "yes" (plus entourage) only, and only those with an assigned table
        .filter((g) => (g.rsvp_status === "yes" || g.is_entourage) && (g.table_number || 0) > 0)
        .map((g) => ({
          guest_name: g.guest_name,
          table_number: g.table_number || 0,
          guest_count: g.actual_guest_count || g.allowed_party_size || 1,
          is_entourage: g.is_entourage === true,
        }))

      // Group by last-name first letter (A-Z), sorted alphabetically
      const bucketMap = new Map<string, AlphabetGroup["guests"]>()

      for (const g of attending) {
        const last = extractLastName(g.guest_name)
        const letter = letterBucket(last)
        if (!bucketMap.has(letter)) bucketMap.set(letter, [])
        bucketMap.get(letter)!.push(g)
      }

      const letters = Array.from(bucketMap.keys()).sort((a, b) => {
        if (a === "#") return 1
        if (b === "#") return -1
        return a.localeCompare(b)
      })

      const nextGroups: AlphabetGroup[] = letters.map((letter) => {
        const guests = bucketMap.get(letter) || []
        guests.sort((a, b) => {
          const lastA = extractLastName(a.guest_name).toLowerCase()
          const lastB = extractLastName(b.guest_name).toLowerCase()
          if (lastA !== lastB) return lastA.localeCompare(lastB)
          return a.guest_name.toLowerCase().localeCompare(b.guest_name.toLowerCase())
        })
        return { letter, guests }
      })

      setGroups(nextGroups)
    } catch (error) {
      console.error("[v0] Error loading seating chart:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-pink-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="print:hidden flex items-center justify-between">
          <div>
            <h1 className="mb-2 font-serif text-4xl font-bold text-jewel-burgundy">Seating Chart</h1>
            <p className="text-jewel-crimson">Guest seating arrangements by table</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => loadSeatingChart()}
              disabled={loading}
              className="flex items-center gap-2 bg-jewel-gold hover:bg-jewel-gold/90"
            >
              <Users className="h-4 w-4" />
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
            <Button onClick={handlePrint} className="flex items-center gap-2 bg-jewel-fuchsia hover:bg-jewel-purple">
              <Printer className="h-4 w-4" />
              Print Chart
            </Button>
            <Button
              onClick={() => router.push("/admin")}
              className="flex items-center gap-2 bg-jewel-burgundy hover:bg-jewel-crimson"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </Button>
          </div>
        </div>

        <div className="hidden print:block text-center mb-8">
          <h1 className="font-serif text-5xl font-bold text-jewel-burgundy mb-2">Pia & Ryan's Wedding</h1>
          <h2 className="font-serif text-3xl text-jewel-crimson mb-1">Seating Chart</h2>
          <p className="text-jewel-burgundy/60">February 13, 2026</p>
        </div>

        {loading ? (
          <div className="rounded-lg bg-white p-12 text-center">
            <p className="text-jewel-burgundy">Loading seating chart...</p>
          </div>
        ) : (
          <div className="space-y-8 print:space-y-6">
            {groups.length === 0 ? (
              <div className="rounded-lg bg-white p-12 text-center">
                <p className="text-jewel-burgundy">No assigned “yes” RSVPs found.</p>
              </div>
            ) : (
              groups.map((group) => (
                <section
                  key={group.letter}
                  className="rounded-lg border border-burgundy-200 bg-white p-6 shadow-sm print:break-inside-avoid print:p-4"
                >
                  <div className="mb-4 border-b border-burgundy-100 pb-3 print:pb-2">
                    <h2 className="font-serif text-3xl font-bold text-jewel-burgundy print:text-xl">
                      {group.letter}
                    </h2>
                  </div>

                  <ul className="divide-y divide-burgundy-100">
                    {group.guests.map((g, idx) => (
                      <li
                        key={`${group.letter}-${idx}-${g.table_number}`}
                        className="flex items-center justify-between gap-4 py-3 print:py-2"
                      >
                        <div className="min-w-0">
                          <div className="truncate font-medium text-jewel-burgundy print:text-sm">
                            {g.guest_name}
                            {g.is_entourage && (
                              <span className="ml-2 rounded-full bg-fuchsia-100 px-2 py-0.5 text-xs text-fuchsia-700 print:bg-transparent print:px-0 print:font-semibold">
                                (Entourage)
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-jewel-burgundy/60 print:text-xs">
                            {g.guest_count > 1 ? `Party of ${g.guest_count}` : ""}
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <div className="inline-flex items-center gap-2 rounded-md bg-purple-50/60 px-3 py-1.5 text-sm font-semibold text-jewel-burgundy print:bg-transparent print:px-0 print:py-0">
                            <Users className="h-4 w-4 text-jewel-crimson print:hidden" />
                            Table {g.table_number}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ))
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 1cm;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:block {
            display: block !important;
          }
          
          .print\\:grid-cols-3 {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
          
          .print\\:gap-4 {
            gap: 1rem !important;
          }
          
          .print\\:break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          
          .print\\:p-4 {
            padding: 1rem !important;
          }
          
          .print\\:pb-2 {
            padding-bottom: 0.5rem !important;
          }
          
          .print\\:text-xl {
            font-size: 1.25rem !important;
          }
          
          .print\\:text-sm {
            font-size: 0.875rem !important;
          }
          
          .print\\:text-xs {
            font-size: 0.75rem !important;
          }
          
          .print\\:space-y-1 > * + * {
            margin-top: 0.25rem !important;
          }
          
          .print\\:py-1 {
            padding-top: 0.25rem !important;
            padding-bottom: 0.25rem !important;
          }
          
          .print\\:bg-transparent {
            background-color: transparent !important;
          }
          
          .print\\:px-0 {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          
          .print\\:font-semibold {
            font-weight: 600 !important;
          }
        }
      `}</style>
    </div>
  )
}
