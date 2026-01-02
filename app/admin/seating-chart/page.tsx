"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, Printer } from "lucide-react"
import { useRouter } from "next/navigation"

const MAX_PER_TABLE = 10
const TOTAL_TABLES = 26

interface Guest {
  guest_name: string
  email: string
  table_number: number
  guest_count: number
  rsvp_status: string
  is_entourage: boolean
}

interface TableGroup {
  table_number: number
  guests: Guest[]
  totalCount: number
}

export default function SeatingChartPage() {
  const router = useRouter()
  const [tables, setTables] = useState<TableGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSeatingChart()
  }, [])

  const loadSeatingChart = async (retryCount = 0) => {
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
          return loadSeatingChart(retryCount + 1)
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
          return loadSeatingChart(retryCount + 1)
        }

        console.error("[v0] Error loading seating chart: Invalid response format (not JSON):", text.substring(0, 100))
        throw new Error("Rate limit exceeded. Please wait a moment and try again.")
      }

      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to load guests")
      }

      const attendingGuests = data.data.filter((g: Guest) => g.rsvp_status === "yes" || g.is_entourage)

      const tableMap = new Map<number, Guest[]>()

      attendingGuests.forEach((guest: Guest) => {
        const tableNum = guest.table_number || 0
        if (tableNum === 0) return

        if (!tableMap.has(tableNum)) {
          tableMap.set(tableNum, [])
        }
        tableMap.get(tableNum)!.push(guest)
      })

      const tableGroups: TableGroup[] = []
      for (let i = 1; i <= TOTAL_TABLES; i++) {
        const guests = tableMap.get(i) || []
        const totalCount = guests.reduce((sum, g) => sum + (g.guest_count || 1), 0)
        tableGroups.push({
          table_number: i,
          guests,
          totalCount,
        })
      }

      setTables(tableGroups)
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
          <div className="grid gap-6 md:grid-cols-2 print:grid-cols-3 print:gap-4">
            {tables.map((table) => (
              <div
                key={table.table_number}
                className="rounded-lg border border-burgundy-200 bg-white p-6 shadow-sm print:break-inside-avoid print:p-4"
              >
                <div className="mb-4 flex items-center justify-between border-b border-burgundy-100 pb-3 print:pb-2">
                  <h2 className="font-serif text-2xl font-bold text-jewel-burgundy print:text-xl">
                    Table {table.table_number}
                  </h2>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-jewel-crimson" />
                    <span className="font-semibold text-jewel-burgundy">
                      {table.totalCount}/{MAX_PER_TABLE}
                    </span>
                  </div>
                </div>

                <ul className="space-y-2 print:space-y-1">
                  {table.guests.map((guest, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between rounded-md bg-purple-50/50 px-3 py-2 print:bg-transparent print:py-1"
                    >
                      <span className="font-medium text-jewel-burgundy print:text-sm">
                        {guest.guest_name}
                        {guest.is_entourage && (
                          <span className="ml-2 rounded-full bg-fuchsia-100 px-2 py-0.5 text-xs text-fuchsia-700 print:bg-transparent print:px-0 print:font-semibold">
                            (Entourage)
                          </span>
                        )}
                      </span>
                      <span className="text-sm text-jewel-burgundy/60 print:text-xs">
                        {guest.guest_count > 1 ? `+${guest.guest_count - 1}` : ""}
                      </span>
                    </li>
                  ))}

                  {/* Empty seat placeholders */}
                  {Array.from({ length: MAX_PER_TABLE - table.totalCount }).map((_, idx) => (
                    <li
                      key={`empty-${idx}`}
                      className="rounded-md border border-dashed border-burgundy-200 px-3 py-2 text-center text-sm text-jewel-burgundy/30 print:py-1 print:text-xs"
                    >
                      Empty Seat
                    </li>
                  ))}
                </ul>
              </div>
            ))}
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
