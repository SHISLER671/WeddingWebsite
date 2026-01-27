"use client"
import { useState, useEffect, useCallback } from "react"
import { Search, Download, CheckCircle, AlertTriangle, Edit, Users, PlusCircle, Flag, Copy } from "lucide-react"
import JSZip from "jszip"
import NextImage from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

const MAX_TABLE_CAPACITY = 11 // Maximum 11 people per table
const MIN_TABLE_OCCUPANCY = 7 // Try not to leave too many empty seats (11-4=7)
const MAX_TABLES = 25 // 25 tables available for guests including entourage
const UNASSIGNED_TABLE = 0 // Table 0 is for guests who haven't RSVP'd or declined

interface SeatingAssignment {
  id: string
  guest_name: string
  email: string | null
  table_number: number
  plus_one_name: string | null
  dietary_notes: string | null
  special_notes: string | null
  actual_guest_count?: number // From RSVP
  allowed_party_size?: number
  dietary_restrictions?: string | null
  special_message?: string | null // From RSVP
  rsvp_status?: string
  is_entourage?: boolean
  has_rsvpd?: boolean
}

interface TableCapacity {
  [tableNumber: number]: number
}

export default function AdminPage() {
  const router = useRouter()
  const [assignments, setAssignments] = useState<SeatingAssignment[]>([])
  const [tableCapacities, setTableCapacities] = useState<TableCapacity>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [needsAdminAuth, setNeedsAdminAuth] = useState(false)
  const [adminPassword, setAdminPassword] = useState("")
  const [adminLoggingIn, setAdminLoggingIn] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<SeatingAssignment>>({})

  const [isBulkGenerating, setIsBulkGenerating] = useState(false)
  const [bulkProgress, setBulkProgress] = useState("")
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [rsvpStats, setRsvpStats] = useState<{ yes: number; no: number; total: number } | null>(null)

  // New invited guest (admin-created; remember to add to MASTER before next CSV sync)
  const [isCreateGuestOpen, setIsCreateGuestOpen] = useState(false)
  const [creatingGuest, setCreatingGuest] = useState(false)
  const [lastCreatedGuest, setLastCreatedGuest] = useState<null | {
    guest_name: string
    email: string
    allowed_party_size: number
  }>(null)
  const [isCsvHelperOpen, setIsCsvHelperOpen] = useState(false)
  const [createGuestForm, setCreateGuestForm] = useState<{
    guest_name: string
    email: string
    allowed_party_size: number
    is_entourage: boolean
    open_invite_after_create: boolean
  }>({
    guest_name: "",
    email: "",
    allowed_party_size: 1,
    is_entourage: false,
    open_invite_after_create: true,
  })

  // Guest stats state
  const [guestStats, setGuestStats] = useState<{
    total: number
    entourage: number
    attending: number
    pending: number
    declined: number
    seated: number
  } | null>(null)

  const [isAutoAssigning, setIsAutoAssigning] = useState(false)

  const handleAutoAssign = async () => {
    if (
      !confirm(
        "This will automatically assign all RSVP'd guests to tables optimally.\n\nEntourage gets priority seating and tables will be filled efficiently.\n\nExisting entourage table assignments will be preserved.\n\nProceed?",
      )
    ) {
      return
    }

    setIsAutoAssigning(true)
    setMessage("⏳ Running automatic seat assignment...")

    try {
      console.log("[v0] Admin: Starting auto-assign process...")
      const response = await fetch("/api/admin/auto-assign-seats", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const contentType = response.headers.get("content-type")
      const isJson = contentType?.includes("application/json")

      if (!response.ok) {
        let errorMsg = `HTTP ${response.status}: ${response.statusText}`

        if (isJson) {
          try {
            const json = await response.json()
            errorMsg = json.error || errorMsg
          } catch {
            errorMsg = "Failed to parse error response"
          }
        } else {
          const text = await response.text()
          if (response.status === 429 || text.includes("Too Many") || text.includes("Rate limit")) {
            errorMsg = "⚠️ Rate limit exceeded. Please wait 30 seconds and try again."
          } else {
            errorMsg = text.substring(0, 200) || errorMsg
          }
        }

        setMessage(`❌ Auto-assign failed: ${errorMsg}`)
        return
      }

      if (!isJson) {
        setMessage(`❌ Auto-assign failed: Server returned non-JSON response`)
        return
      }

      const result = await response.json()

      if (result.success && result.stats) {
        setMessage(
          `✅ Auto-assigned ${result.stats.assigned} guests across ${result.stats.tables} tables! (${result.stats.totalPeople} total people)`,
        )

        console.log("[v0] Admin: Waiting 8 seconds before refreshing guest list...")
        await new Promise((resolve) => setTimeout(resolve, 8000))

        console.log("[v0] Admin: Refreshing guest assignments...")
        await loadAssignments(true)

        await new Promise((resolve) => setTimeout(resolve, 3000))
        await loadRsvpStats()
      } else {
        setMessage(`❌ Auto-assign failed: ${result.error || "Unknown error"}`)
      }
    } catch (error: any) {
      console.error("[v0] Auto-assign error:", error)
      setMessage(`❌ Error: ${error.message || "Unknown error occurred"}`)
    } finally {
      setIsAutoAssigning(false)
    }
  }

  const loadRsvpStats = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/rsvp-stats", {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (response.status === 401) {
        setNeedsAdminAuth(true)
        return
      }

      if (response.status === 429) {
        console.warn("[Admin] Rate limit hit for RSVP stats - will retry later")
        return
      }

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setRsvpStats(result.data)
        }
      }
    } catch (error) {
      console.error("[Admin] Error loading RSVP stats:", error)
    }
  }, [])

  // Load assignments on mount
  useEffect(() => {
    loadAssignments()
    loadRsvpStats()
  }, [])

  // Auto-refresh RSVP stats every 4 hours
  useEffect(() => {
    const interval = setInterval(() => {
      loadRsvpStats()
    }, 14400000) // Refresh every 4 hours (4 * 60 * 60 * 1000)

    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [loadRsvpStats])

  const loadAssignments = async (forceRefresh = false) => {
    setLoading(true)
    try {
      // Generate a unique cache-busting parameter that changes on each call
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(7)
      const sessionId =
        typeof window !== "undefined"
          ? window.sessionStorage.getItem("admin_session_id") || Math.random().toString(36).substring(7)
          : Math.random().toString(36).substring(7)

      if (typeof window !== "undefined" && !window.sessionStorage.getItem("admin_session_id")) {
        window.sessionStorage.setItem("admin_session_id", sessionId)
      }

      // Force a new session ID on explicit refresh
      if (forceRefresh && typeof window !== "undefined") {
        const newSessionId = Math.random().toString(36).substring(7)
        window.sessionStorage.setItem("admin_session_id", newSessionId)
      }

      const finalSessionId =
        typeof window !== "undefined" ? window.sessionStorage.getItem("admin_session_id") : sessionId

      // Use new endpoint that reads from invited_guests (synced from MASTERGUESTLIST.csv)
      const response = await fetch(
        `/api/admin/guests?t=${timestamp}&r=${randomId}&s=${finalSessionId}&v=${forceRefresh ? "1" : "0"}`,
        {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
            Pragma: "no-cache",
            Expires: "0",
            "X-Requested-With": "XMLHttpRequest",
          },
        },
      )

      const contentType = response.headers.get("content-type")
      const isJson = contentType?.includes("application/json")

      if (response.status === 429) {
        setMessage("⚠️ Rate limit exceeded. Please wait 30 seconds and try again.")
        return
      }

      if (response.status === 401) {
        setNeedsAdminAuth(true)
        setMessage("🔒 Admin login required.")
        return
      }

      if (!response.ok) {
        let errorMsg = `HTTP ${response.status}: ${response.statusText}`

        if (isJson) {
          try {
            const json = await response.json()
            errorMsg = json.error || errorMsg
          } catch {
            errorMsg = "Failed to parse error response"
          }
        } else {
          const text = await response.text()
          if (text.includes("Too Many") || text.includes("Rate limit")) {
            errorMsg = "Rate limit exceeded. Please wait 30 seconds and try again."
          } else {
            errorMsg = text.substring(0, 200) || errorMsg
          }
        }

        throw new Error(errorMsg)
      }

      const result = isJson ? await response.json() : { success: false, error: "Invalid response format" }

      if (result.success) {
        console.log(
          "[v1] Admin page: Received",
          result.data.length,
          "guests from invited_guests",
          forceRefresh ? "(FORCE REFRESH)" : "",
        )
        const sortedData = result.data.sort((a: any, b: any) => {
          const nameA = (a.guest_name || "").toLowerCase()
          const nameB = (b.guest_name || "").toLowerCase()
          return nameA.localeCompare(nameB)
        })
        setAssignments(sortedData)
        if (result.tableCapacities) {
          setTableCapacities(result.tableCapacities)
        }
        if (result.stats) {
          setGuestStats(result.stats)
        }
        setMessage(`✅ Loaded ${result.data.length} guests from MASTERGUESTLIST`)
      } else {
        setMessage(`❌ Error: ${result.error}`)
      }
    } catch (error) {
      console.error("[v0] Admin page: Load error:", error)
      setMessage(`❌ Error loading assignments: ${error}`)
    } finally {
      setLoading(false)
    }

    await new Promise((resolve) => setTimeout(resolve, 2000))
    await loadRsvpStats()
  }

  const loginAdmin = async () => {
    setAdminLoggingIn(true)
    setMessage("")
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword }),
      })

      const text = await res.text()
      let json: any
      try {
        json = JSON.parse(text)
      } catch {
        json = { success: false, error: text }
      }

      if (!res.ok || !json.success) {
        setMessage(`❌ Admin login failed: ${json.error || "Unknown error"}`)
        return
      }

      setNeedsAdminAuth(false)
      setAdminPassword("")
      setMessage("✅ Logged in.")
      await loadAssignments(true)
      await loadRsvpStats()
    } catch (e: any) {
      setMessage(`❌ Admin login failed: ${e?.message || "Unknown error"}`)
    } finally {
      setAdminLoggingIn(false)
    }
  }

  const getMasterCsvLineForGuest = (guest: { guest_name: string; email: string; allowed_party_size: number }) => {
    // Number will be corrected by renumber script; use 0 as placeholder
    // Header: Number,Full Name,Notes,Headcount,RSVP Status,KIDENTOURAGE
    const number = "0"
    const fullName = guest.guest_name
    const notes = guest.email && guest.email.includes("@") ? guest.email : ""
    const headcount = String(guest.allowed_party_size || 1)
    const rsvpStatus = ""
    const kidEntourage = ""
    return `${number},${fullName},${notes},${headcount},${rsvpStatus},${kidEntourage}`
  }

  const copyMasterCsvLine = async () => {
    if (!lastCreatedGuest) return
    const line = getMasterCsvLineForGuest(lastCreatedGuest)
    try {
      await navigator.clipboard.writeText(line)
      setMessage((prev) => `${prev}\n\n📋 Copied MASTER CSV row to clipboard.`.trim())
    } catch (e: any) {
      setMessage((prev) => `${prev}\n\n❌ Could not copy to clipboard: ${e?.message || "Unknown error"}`.trim())
    }
  }

  const createInvitedGuest = async () => {
    const name = createGuestForm.guest_name.trim()
    if (!name) {
      setMessage("❌ Please enter a guest name")
      return
    }

    const allowed = Number(createGuestForm.allowed_party_size)
    if (!Number.isInteger(allowed) || allowed < 1) {
      setMessage("❌ Guest count must be at least 1")
      return
    }

    setCreatingGuest(true)
    setMessage("")
    try {
      const res = await fetch("/api/admin/invited-guests", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guest_name: name,
          email: createGuestForm.email.trim(),
          allowed_party_size: allowed,
          is_entourage: createGuestForm.is_entourage,
        }),
      })

      const text = await res.text()
      let json: any
      try {
        json = JSON.parse(text)
      } catch {
        json = { success: false, error: text }
      }

      if (!res.ok || !json.success) {
        setMessage(`❌ Error creating guest: ${json.error || "Unknown error"}`)
        return
      }

      const createdName = json?.data?.guest_name || name
      const createdAllowed = Number(json?.data?.allowed_party_size ?? allowed) || allowed
      const createdEmail = (json?.data?.email ?? createGuestForm.email ?? "").toString()
      setMessage(
        `✅ Created invited guest: ${createdName}\n\n⚠️ Reminder: add this guest to MASTERGUESTLIST.csv before the next CSV sync, or it will be removed.`,
      )
      setIsCreateGuestOpen(false)
      const shouldOpenInvite = createGuestForm.open_invite_after_create
      setLastCreatedGuest({
        guest_name: createdName,
        email: createdEmail,
        allowed_party_size: createdAllowed,
      })
      setIsCsvHelperOpen(true)
      setCreateGuestForm({
        guest_name: "",
        email: "",
        allowed_party_size: 1,
        is_entourage: false,
        open_invite_after_create: true,
      })
      setSearchTerm(createdName)
      await loadAssignments(true)

      if (shouldOpenInvite) {
        const guestParam = encodeURIComponent(createdName)
        window.open(`/admin/invitations?guest=${guestParam}`, "_blank", "noopener,noreferrer")
      }
    } catch (e: any) {
      setMessage(`❌ Error creating guest: ${e?.message || "Unknown error"}`)
    } finally {
      setCreatingGuest(false)
    }
  }

  const searchAssignments = () => {
    if (!searchTerm.trim()) {
      loadAssignments()
      return
    }

    const filtered = assignments.filter(
      (assignment) =>
        assignment.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.plus_one_name?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    const sortedFiltered = filtered.sort((a, b) => {
      const nameA = (a.guest_name || "").toLowerCase()
      const nameB = (b.guest_name || "").toLowerCase()
      return nameA.localeCompare(nameB)
    })
    setAssignments(sortedFiltered)
    setMessage(`🔍 Found ${filtered.length} matching assignments`)
  }

  const exportToCSV = () => {
    const csvHeader = "guest_name,email,table_number,plus_one_name,dietary_notes,special_notes"
    const csvRows = assignments.map((assignment) =>
      [
        assignment.guest_name,
        assignment.email || "",
        assignment.table_number,
        assignment.plus_one_name || "",
        assignment.dietary_notes || "",
        assignment.special_notes || "",
      ]
        .map((field) => `"${field}"`)
        .join(","),
    )

    const csvContent = [csvHeader, ...csvRows].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `seating-assignments-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    setMessage(`📤 Exported ${assignments.length} assignments to CSV`)
  }

  const validateAssignments = () => {
    const issues: string[] = []
    const tableCounts: { [key: number]: number } = {}
    const tableGuestCounts: { [key: number]: number } = {}

    // Calculate actual guest counts per table
    assignments.forEach((assignment) => {
      if (assignment.table_number > 0) {
        const tableNum = assignment.table_number
        tableCounts[tableNum] = (tableCounts[tableNum] || 0) + 1
        const guestCount = assignment.actual_guest_count || 1
        tableGuestCounts[tableNum] = (tableGuestCounts[tableNum] || 0) + guestCount
      }
    })

    // Check for capacity issues (assuming 8-10 people per table is ideal)
    Object.keys(tableGuestCounts).forEach((tableNumStr) => {
      const tableNum = Number.parseInt(tableNumStr, 10)
      const guestCount = tableGuestCounts[tableNum]
      if (guestCount > MAX_TABLE_CAPACITY) {
        issues.push(`Table ${tableNum}: ${guestCount} people (over capacity - max ${MAX_TABLE_CAPACITY} recommended)`)
      } else if (guestCount < MIN_TABLE_OCCUPANCY && guestCount > 0) {
        issues.push(`Table ${tableNum}: ${guestCount} people (under capacity - consider combining)`)
      }
    })

    if (issues.length === 0) {
      const capacityInfo = Object.keys(tableGuestCounts)
        .map((tableNumStr) => {
          const tableNum = Number.parseInt(tableNumStr, 10)
          return `Table ${tableNum}: ${tableGuestCounts[tableNum]} people`
        })
        .join("\n")
      setMessage(`✅ All seating assignments are valid!\n\n📊 Table Capacities:\n${capacityInfo}`)
    } else {
      setMessage(
        `⚠️ Found ${issues.length} capacity issues:\n${issues.join("\n")}\n\n📊 Current Table Capacities:\n${Object.keys(
          tableGuestCounts,
        )
          .map((tableNumStr) => {
            const tableNum = Number.parseInt(tableNumStr, 10)
            return `Table ${tableNum}: ${tableGuestCounts[tableNum]} people`
          })
          .join("\n")}`,
      )
    }
  }

  const startEdit = (assignment: SeatingAssignment) => {
    setEditingId(assignment.id)
    setEditForm(assignment)
  }

  const isEntourage = (assignment: SeatingAssignment): boolean => {
    return assignment.special_notes?.toUpperCase().includes("ENTOURAGE") || false
  }

  const getEntourageAtTable = (assignments: SeatingAssignment[], tableNumber: number): SeatingAssignment[] => {
    // IMPORTANT: Only get entourage at THIS specific table, not all entourage across all tables
    // Entourage is spread across multiple tables (40+ people total), so we only move the group
    // that's currently at the same table as the guest being moved
    return assignments.filter(
      (a) => a.table_number === tableNumber && isEntourage(a) && tableNumber > 0, // Only assigned tables (not unassigned)
    )
  }

  const calculateRebalance = (
    currentAssignments: SeatingAssignment[],
    movedGuestId: string,
    newTable: number,
    oldTable: number,
    guestCount: number,
  ) => {
    const movedGuest = currentAssignments.find((a) => a.id === movedGuestId)
    const isMovingEntourage = movedGuest ? isEntourage(movedGuest) : false

    // If moving entourage, find all entourage at the OLD TABLE ONLY and move them together
    // Note: Entourage is spread across multiple tables, so we only move the group at this table
    let assignmentsToMove: SeatingAssignment[] = []
    if (isMovingEntourage) {
      const entourageAtOldTable = getEntourageAtTable(currentAssignments, oldTable)
      assignmentsToMove = entourageAtOldTable.length > 0 ? entourageAtOldTable : [movedGuest!]
    } else {
      assignmentsToMove = [movedGuest!]
    }

    // Create a working copy with all moves applied
    const workingAssignments = currentAssignments.map((a) => {
      const shouldMove = assignmentsToMove.some((m) => m.id === a.id)
      return shouldMove ? { ...a, table_number: newTable } : a
    })

    // Calculate current capacities after the move
    const capacities: { [table: number]: number } = {}
    workingAssignments.forEach((a) => {
      if (a.table_number > 0) {
        capacities[a.table_number] = (capacities[a.table_number] || 0) + (a.actual_guest_count || 1)
      }
    })

    const rebalanceMoves: Array<{
      assignmentId: string
      guestName: string
      fromTable: number
      toTable: number
      guestCount: number
    }> = []
    const processed = new Set<string>()

    // Keep rebalancing until stable or max iterations
    let iterations = 0
    const maxIterations = 20

    while (iterations < maxIterations) {
      iterations++
      let madeChange = false

      // Find tables that need rebalancing
      const overCapacityTables: number[] = []
      const underCapacityTables: number[] = []

      Object.keys(capacities).forEach((tableStr) => {
        const table = Number.parseInt(tableStr, 10)
        const capacity = capacities[table]
        if (capacity > MAX_TABLE_CAPACITY) overCapacityTables.push(table)
        if (capacity < MIN_TABLE_OCCUPANCY && capacity > 0) underCapacityTables.push(table)
      })

      // If no issues, we're done
      if (overCapacityTables.length === 0 && underCapacityTables.length === 0) {
        break
      }

      // Try to move from over-capacity to under-capacity tables
      for (const overTable of overCapacityTables) {
        if (underCapacityTables.length === 0) break

        // Find smallest NON-ENTOURAGE party at over-capacity table (not already moved)
        // Never split entourage - they stay together
        const candidates = workingAssignments
          .filter(
            (a) => a.table_number === overTable && !processed.has(a.id) && !isEntourage(a), // Never move entourage individually
          )
          .sort((a, b) => (a.actual_guest_count || 1) - (b.actual_guest_count || 1))

        if (candidates.length === 0) continue

        const candidate = candidates[0]
        const candidateCount = candidate.actual_guest_count || 1

        // Find best under-capacity table to move to
        for (const underTable of underCapacityTables) {
          const newCapacity = capacities[underTable] + candidateCount
          if (newCapacity <= MAX_TABLE_CAPACITY) {
            // This move works!
            rebalanceMoves.push({
              assignmentId: candidate.id,
              guestName: candidate.guest_name,
              fromTable: overTable,
              toTable: underTable,
              guestCount: candidateCount,
            })

            // Update working state
            candidate.table_number = underTable
            processed.add(candidate.id)
            capacities[overTable] -= candidateCount
            capacities[underTable] += candidateCount
            madeChange = true
            break
          }
        }
      }

      // If no change was made, try moving smallest NON-ENTOURAGE parties from over-capacity to any available space
      if (!madeChange && overCapacityTables.length > 0) {
        for (const overTable of overCapacityTables) {
          const candidates = workingAssignments
            .filter(
              (a) => a.table_number === overTable && !processed.has(a.id) && !isEntourage(a), // Never move entourage individually
            )
            .sort((a, b) => (a.actual_guest_count || 1) - (b.actual_guest_count || 1))

          if (candidates.length === 0) continue

          const candidate = candidates[0]
          const candidateCount = candidate.actual_guest_count || 1

          // Find any table with space (including creating new table if needed)
          const availableTables = Object.keys(capacities)
            .map((t) => Number.parseInt(t, 10))
            .filter((t) => capacities[t] + candidateCount <= MAX_TABLE_CAPACITY && t !== overTable)
            .sort((a, b) => capacities[a] - capacities[b]) // Prefer tables with more space

          if (availableTables.length > 0) {
            const targetTable = availableTables[0]
            rebalanceMoves.push({
              assignmentId: candidate.id,
              guestName: candidate.guest_name,
              fromTable: overTable,
              toTable: targetTable,
              guestCount: candidateCount,
            })

            candidate.table_number = targetTable
            processed.add(candidate.id)
            capacities[overTable] -= candidateCount
            capacities[targetTable] += candidateCount
            madeChange = true
            break
          }
        }
      }

      if (!madeChange) break // No more moves possible
    }

    return rebalanceMoves
  }

  const saveEdit = async () => {
    if (!editingId) {
      setMessage("❌ Error: No assignment selected for editing")
      return
    }

    // Check capacity impact if table number is being changed
    const currentAssignment = assignments.find((a) => a.id === editingId)
    if (currentAssignment && editForm.table_number && editForm.table_number !== currentAssignment.table_number) {
      const guestCount = currentAssignment.actual_guest_count || 1
      const oldTable = currentAssignment.table_number
      const newTable = editForm.table_number

      // Check if this is entourage - if so, we need to move the whole group
      const isMovingEntourage = isEntourage(currentAssignment)
      let entourageToMove: SeatingAssignment[] = []
      let totalEntourageCount = guestCount

      if (isMovingEntourage) {
        // Find all entourage at the CURRENT TABLE ONLY (not all entourage everywhere)
        // Entourage is spread across multiple tables, so we only move the group at this table
        entourageToMove = getEntourageAtTable(assignments, oldTable)
        totalEntourageCount = entourageToMove.reduce((sum, a) => sum + (a.actual_guest_count || 1), 0)

        if (entourageToMove.length === 0) {
          // Shouldn't happen, but safety check
          entourageToMove = [currentAssignment]
          totalEntourageCount = guestCount
        }
      }

      // Calculate new capacities
      const oldTableCapacity = (tableCapacities[oldTable] || 0) - totalEntourageCount
      const newTableCapacity = (tableCapacities[newTable] || 0) + totalEntourageCount

      // Calculate auto-rebalance moves
      const rebalanceMoves = calculateRebalance(assignments, editingId, newTable, oldTable, guestCount)

      // Show preview and ask for confirmation
      let message = ""
      if (isMovingEntourage && entourageToMove.length > 1) {
        message = `Moving ENTOURAGE group (${entourageToMove.length} members, ${totalEntourageCount} total people) from Table ${oldTable} to Table ${newTable}:\n`
        message += `  Members: ${entourageToMove.map((a) => a.guest_name).join(", ")}\n\n`
      } else {
        message = `Moving ${currentAssignment.guest_name} (${guestCount} ${guestCount === 1 ? "person" : "people"}) from Table ${oldTable} to Table ${newTable}:\n\n`
      }
      message += `After move:\n`
      message += `  Table ${oldTable}: ${oldTableCapacity} people\n`
      message += `  Table ${newTable}: ${newTableCapacity} people\n\n`

      if (rebalanceMoves.length > 0) {
        message += `Auto-rebalance will make ${rebalanceMoves.length} additional move(s):\n`
        rebalanceMoves.forEach((move, idx) => {
          message += `  ${idx + 1}. Move ${move.guestName} (${move.guestCount} ${move.guestCount === 1 ? "person" : "people"}) from Table ${move.fromTable} to Table ${move.toTable}\n`
        })
        message += `\nApply all changes?`
      } else if (newTableCapacity > MAX_TABLE_CAPACITY || oldTableCapacity < MIN_TABLE_OCCUPANCY) {
        message += `⚠️ Warning: This will create capacity issues. No auto-rebalance moves found.\n\nProceed anyway?`
      } else {
        message += `✅ This move looks good!\n\nProceed?`
      }

      const proceed = confirm(message)
      if (!proceed) return

      const allMoves: Array<{
        email: string | null
        guest_name: string
        table_number: number
      }> = []

      // If moving entourage, move all entourage members together
      if (isMovingEntourage && entourageToMove.length > 0) {
        entourageToMove.forEach((entourageMember) => {
          allMoves.push({
            email: entourageMember.email || null,
            guest_name: entourageMember.guest_name,
            table_number: newTable,
          })
        })
      } else {
        // Single guest move
        allMoves.push({
          email: currentAssignment.email || null,
          guest_name: currentAssignment.guest_name,
          table_number: newTable,
        })
      }

      // Add rebalance moves (these will never include entourage)
      rebalanceMoves.forEach((move) => {
        const guest = assignments.find((a) => a.id === move.assignmentId)
        if (guest) {
          allMoves.push({
            email: guest.email || null,
            guest_name: guest.guest_name,
            table_number: move.toTable,
          })
        }
      })

      setLoading(true)
      setMessage("")

      try {
        console.log("[v0] Applying", allMoves.length, "table assignment moves")

        // Apply all moves in parallel
        const updatePromises = allMoves.map((move) =>
          fetch("/api/admin/seating", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(move),
          }),
        )

        const results = await Promise.all(updatePromises)
        const errors = []

        for (let i = 0; i < results.length; i++) {
          const response = results[i]
          if (!response.ok) {
            const errorText = await response.text()
            errors.push(`Failed to update ${allMoves[i].guest_name}: ${errorText}`)
          }
        }

        if (errors.length > 0) {
          setMessage(`❌ Some updates failed:\n${errors.join("\n")}`)
        } else {
          setMessage(`✅ Successfully moved ${allMoves.length} assignment(s)!`)
          setEditingId(null)
          setEditForm({})
          await loadAssignments(true)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        setMessage(`❌ Error updating assignments: ${errorMessage}`)
        console.error("[v0] Error in table assignment update:", error)
      } finally {
        setLoading(false)
      }
      return
    }

    setLoading(true)
    setMessage("")

    try {
      // Track effective identity values (may be updated via admin endpoint)
      let effectiveGuestName = currentAssignment?.guest_name
      let effectiveEmail = currentAssignment?.email || null

      const normalizeEmailForCompare = (value: unknown): string => {
        return String(value ?? "").trim()
      }

      // If user edited guest name / email, persist it to invited_guests (and linked rsvps if present).
      const nameChanged =
        !!currentAssignment && !!editForm.guest_name?.trim() && editForm.guest_name.trim() !== currentAssignment.guest_name

      const currentEmailStr = normalizeEmailForCompare(currentAssignment?.email)
      const editEmailStr =
        editForm.email !== undefined ? normalizeEmailForCompare(editForm.email) : normalizeEmailForCompare(currentAssignment?.email)
      const emailChanged = !!currentAssignment && editForm.email !== undefined && editEmailStr !== currentEmailStr

      const identityChanged =
        !!currentAssignment &&
        (nameChanged || emailChanged)

      if (identityChanged) {
        const requestBody: any = {
          invited_guest_id: currentAssignment.id,
          guest_name: (editForm.guest_name || currentAssignment.guest_name).trim(),
          previous_guest_name: currentAssignment.guest_name,
          previous_email: currentAssignment.email ?? "",
        }
        // Important: if only the name changed, do NOT touch email (avoids unique-email collisions).
        if (emailChanged) {
          requestBody.email = editEmailStr
        }

        const identityResponse = await fetch("/api/admin/guest-identity", {
          method: "PUT",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        })

        const identityText = await identityResponse.text()
        let identityResult: any
        try {
          identityResult = JSON.parse(identityText)
        } catch {
          identityResult = { success: false, error: identityText }
        }

        if (!identityResponse.ok || !identityResult.success) {
          const errorMsg = identityResult.error || identityText || "Unknown error"
          setMessage(`❌ Error updating guest name/email: ${errorMsg}`)
          return
        }

        effectiveGuestName = identityResult?.data?.invited_guest?.guest_name || effectiveGuestName
        effectiveEmail = identityResult?.data?.invited_guest?.email || effectiveEmail

        // Optimistically update the row in the UI immediately (so it reflects even before reload completes)
        setAssignments((prev) => {
          const updated = prev.map((a) =>
            a.id === currentAssignment.id
              ? {
                  ...a,
                  guest_name: effectiveGuestName || a.guest_name,
                  email: effectiveEmail ?? a.email,
                }
              : a,
          )
          return updated.sort((a: any, b: any) => {
            const nameA = (a.guest_name || "").toLowerCase()
            const nameB = (b.guest_name || "").toLowerCase()
            return nameA.localeCompare(nameB)
          })
        })
      }

      // Update guest count if it was changed
      if (
        currentAssignment &&
        editForm.actual_guest_count !== undefined &&
        editForm.actual_guest_count !== currentAssignment.actual_guest_count
      ) {
        console.log("[v0] Admin: Updating guest count:", {
          guest_name: currentAssignment.guest_name,
          email: currentAssignment.email,
          old_count: currentAssignment.actual_guest_count,
          new_count: editForm.actual_guest_count,
        })

        const guestCountResponse = await fetch("/api/admin/guest-count", {
          method: "PUT",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            guest_name: effectiveGuestName,
            email: effectiveEmail,
            guest_count: editForm.actual_guest_count,
          }),
        })

        const guestCountText = await guestCountResponse.text()
        let guestCountResult
        try {
          guestCountResult = JSON.parse(guestCountText)
        } catch {
          guestCountResult = { success: false, error: guestCountText }
        }

        if (!guestCountResponse.ok || !guestCountResult.success) {
          const errorMsg = guestCountResult.error || guestCountText || "Unknown error"
          console.error("[v0] Admin: Guest count update failed:", errorMsg)
          setMessage(`❌ Error updating guest count: ${errorMsg}`)
          setLoading(false)
          return
        }

        console.log("[v0] Admin: Guest count updated successfully:", guestCountResult)
      }

      // Update RSVP status if it was changed (admin override for guests who can't use the website)
      if (
        currentAssignment &&
        editForm.rsvp_status &&
        editForm.rsvp_status !== currentAssignment.rsvp_status &&
        (editForm.rsvp_status === "yes" || editForm.rsvp_status === "no")
      ) {
        const attendance = editForm.rsvp_status

        console.log("[v0] Admin: Updating RSVP status from dashboard:", {
          guest_name: effectiveGuestName,
          email: effectiveEmail,
          old_status: currentAssignment.rsvp_status,
          new_status: attendance,
        })

        const rsvpBody = {
          guest_name: effectiveGuestName,
          email: effectiveEmail || "",
          attendance,
          guest_count:
            editForm.actual_guest_count ??
            currentAssignment.actual_guest_count ??
            currentAssignment.allowed_party_size ??
            1,
          dietary_restrictions: currentAssignment.dietary_restrictions || null,
          special_message: null,
          wallet_address: null,
        }

        const rsvpResponse = await fetch("/api/rsvp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rsvpBody),
        })

        const rsvpText = await rsvpResponse.text()
        let rsvpResult: any
        try {
          rsvpResult = JSON.parse(rsvpText)
        } catch {
          rsvpResult = { success: false, error: rsvpText }
        }

        if (!rsvpResponse.ok || !rsvpResult.success) {
          const errorMsg = rsvpResult.error || rsvpText || "Unknown error"
          console.error("[v0] Admin: RSVP status update failed:", errorMsg)
          setMessage(`❌ Error updating RSVP status: ${errorMsg}`)
          setLoading(false)
          return
        }

        console.log("[v0] Admin: RSVP status updated successfully:", rsvpResult)
      }

      // IMPORTANT:
      // /api/admin/seating (PUT) requires an RSVP to exist; calling it for a non-RSVP guest will fail.
      // Table changes are handled in the earlier branch. For identity/guest_count/rsvp_status updates,
      // we can finish successfully without touching seating.
      setMessage("✅ Guest updated successfully")
      setEditingId(null)
      setEditForm({})
      // Force refresh so the table reflects server-side state after edits (and avoids stale cache)
      await loadAssignments(true)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      setMessage(`❌ Error updating assignment: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const calculateFontSize = (name: string, imageWidth: number): number => {
    const SAFE_ZONE_HEIGHT = imageWidth * 0.13 // 13% of canvas height for safe zone
    const charCount = name.length

    // Split long names at 28+ characters
    if (charCount >= 28) {
      // Two-line sizing: ensure total height fits in safe zone
      const maxTwoLineFontSize = SAFE_ZONE_HEIGHT / 2.6 // Account for 2 lines + spacing
      const widthBasedSize = (imageWidth * 0.9) / (Math.max(name.length / 2, 15) * 0.6)
      return Math.floor(Math.min(maxTwoLineFontSize, widthBasedSize, 70))
    }

    // Single-line sizing: ensure it fits width and height
    const maxSingleLineFontSize = SAFE_ZONE_HEIGHT / 1.5
    const widthBasedSize = (imageWidth * 0.9) / (charCount * 0.6)

    return Math.floor(Math.min(maxSingleLineFontSize, widthBasedSize, 90))
  }

  const splitName = (name: string): { line1: string; line2: string; shouldSplit: boolean } => {
    if (name.length < 26) {
      return { line1: name, line2: "", shouldSplit: false }
    }

    // Try natural break points BEFORE conjunctions
    const patterns = [
      { regex: / & /, splitBefore: true },
      { regex: / and /i, splitBefore: true },
      { regex: /, /, splitBefore: false },
    ]

    for (const { regex, splitBefore } of patterns) {
      const match = name.match(regex)
      if (match && match.index !== undefined) {
        const splitIndex = splitBefore ? match.index : match.index + match[0].length
        const line1 = name.substring(0, splitIndex).trim()
        const line2 = name.substring(splitIndex).trim()
        if (line1.length > 5 && line2.length > 5) {
          return { line1, line2, shouldSplit: true }
        }
      }
    }

    // Word-based split
    const words = name.split(/\s+/)
    if (words.length >= 2) {
      const midPoint = Math.ceil(words.length / 2)
      const line1 = words.slice(0, midPoint).join(" ")
      const line2 = words.slice(midPoint).join(" ")
      return { line1, line2, shouldSplit: true }
    }

    return { line1: name, line2: "", shouldSplit: false }
  }

  const generateInvitationCanvas = (guestName: string, templateImage: HTMLImageElement): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Canvas context not available")

      canvas.width = templateImage.width
      canvas.height = templateImage.height
      ctx.drawImage(templateImage, 0, 0)

      const textX = templateImage.width / 2
      const fontSize = calculateFontSize(guestName, templateImage.width)
      const nameSplit = splitName(guestName)

      const SAFE_ZONE_START = templateImage.height * 0.03 // 3% from top
      const SAFE_ZONE_END = templateImage.height * 0.14 // 14% from top
      const SAFE_ZONE_HEIGHT = SAFE_ZONE_END - SAFE_ZONE_START

      let baseY: number

      if (nameSplit.shouldSplit) {
        // Two lines: calculate total height and center in safe zone
        const lineHeight = fontSize * 1.15
        const totalHeight = fontSize + lineHeight
        baseY = SAFE_ZONE_START + (SAFE_ZONE_HEIGHT - totalHeight) / 2
      } else {
        // Single line: center in safe zone
        baseY = SAFE_ZONE_START + (SAFE_ZONE_HEIGHT - fontSize) / 2
      }

      // Use elegant serif font stack
      ctx.font = `${fontSize}px "Didot", "Bodoni MT", "Garamond", "Palatino Linotype", "Book Antiqua", Georgia, "Times New Roman", Times, serif`
      ctx.fillStyle = "#7B4B7A"
      ctx.textAlign = "center"
      ctx.textBaseline = "hanging"

      ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
      ctx.shadowBlur = 10
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2

      if (nameSplit.shouldSplit) {
        // Render two lines with proper spacing
        const lineHeight = fontSize * 1.15
        ctx.fillText(nameSplit.line1, textX, baseY)
        ctx.fillText(nameSplit.line2, textX, baseY + lineHeight)
      } else {
        // Render single line
        ctx.fillText(guestName, textX, baseY)
      }

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
        },
        "image/jpeg",
        0.95,
      )
    })
  }

  const handleBulkGenerate = async () => {
    setIsBulkGenerating(true)
    setBulkProgress("Loading guest list...")

    try {
      let csvText: string

      if (csvFile) {
        // Use uploaded CSV file
        csvText = await csvFile.text()
      } else {
        // Try to fetch default MASTERGUESTLIST.csv from public folder
        const response = await fetch("/MASTERGUESTLIST.csv")
        if (!response.ok) {
          throw new Error("Please upload a CSV file with guest names")
        }
        csvText = await response.text()
      }

      const lines = csvText.split("\n").filter((line) => line.trim())

      if (lines.length < 2) {
        throw new Error("CSV file is empty or invalid")
      }

      // Parse headers with proper trimming and quote removal
      const headers = lines[0].split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""))

      console.log("[v0] CSV headers found:", headers)

      const nameIndex = headers.findIndex(
        (h) => h === "Full Name" || h === "FullName" || h.toLowerCase() === "full name",
      )

      if (nameIndex === -1) {
        throw new Error(`CSV must have a "Full Name" or "FullName" column. Found columns: ${headers.join(", ")}`)
      }

      const guestNames = lines
        .slice(1)
        .map((line) => {
          const cols = line.split(",")
          return cols[nameIndex]?.trim().replace(/^["']|["']$/g, "")
        })
        .filter(Boolean)

      if (guestNames.length === 0) {
        throw new Error("No guest names found in CSV")
      }

      setBulkProgress(`Found ${guestNames.length} guests. Loading template...`)

      const img = new window.Image()
      img.crossOrigin = "anonymous"
      img.src = "/25th.jpg"

      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = () => reject(new Error("Failed to load invitation template"))
      })

      setBulkProgress("Generating invitations...")

      const zip = new JSZip()

      for (let i = 0; i < guestNames.length; i++) {
        const name = guestNames[i]
        setBulkProgress(`Generating ${i + 1}/${guestNames.length}: ${name}`)

        const blob = await generateInvitationCanvas(name, img)
        const filename = `invitation-${name.replace(/[^a-zA-Z0-9\- ]/g, "_")}.jpg`
        zip.file(filename, blob)

        // Small delay every 10 invitations to prevent blocking UI
        if (i % 10 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 10))
        }
      }

      setBulkProgress("Creating ZIP file...")
      const zipBlob = await zip.generateAsync({ type: "blob" })

      const url = URL.createObjectURL(zipBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = "personalized-wedding-invitations.zip"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setBulkProgress(`✅ Successfully generated ${guestNames.length} invitations!`)
      setTimeout(() => {
        setBulkProgress("")
        setCsvFile(null) // Reset file input
      }, 3000)
    } catch (error) {
      console.error("[v0] Bulk generation error:", error)
      setBulkProgress(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`)
      setTimeout(() => setBulkProgress(""), 5000)
    } finally {
      setIsBulkGenerating(false)
    }
  }

  const getRsvpBadge = (assignment: SeatingAssignment) => {
    if (assignment.is_entourage) {
      return (
        <span className="rounded-full bg-fuchsia-100 px-2 py-1 text-xs font-medium text-fuchsia-700">👥 Entourage</span>
      )
    }

    switch (assignment.rsvp_status) {
      case "yes":
        return (
          <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">✓ Attending</span>
        )
      case "no":
        return <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">✗ Declined</span>
      default:
        return (
          <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">⏳ Pending</span>
        )
    }
  }

  return (
    <div className="min-h-screen relative p-4">
      <div className="absolute inset-0 z-0">
        <NextImage src="/inthecar.jpg" alt="Background" fill className="object-cover object-center" priority />
      </div>

      <div className="relative z-20 mx-auto max-w-6xl space-y-6">
        {needsAdminAuth && (
          <Card className="border-2 border-gold/20 bg-white/95 p-6 shadow-xl backdrop-blur">
            <h2 className="mb-2 font-serif text-2xl font-bold text-jewel-burgundy">Admin Login</h2>
            <p className="mb-4 text-sm text-gray-600">Enter the admin password to continue.</p>
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
                <Input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="border-jewel-burgundy/30"
                />
              </div>
              <Button
                onClick={loginAdmin}
                disabled={adminLoggingIn || !adminPassword}
                className="bg-jewel-burgundy hover:bg-jewel-crimson text-white"
              >
                {adminLoggingIn ? "Logging in..." : "Login"}
              </Button>
            </div>
          </Card>
        )}

        <div className="text-center">
          <h1 className="mb-2 font-serif text-4xl font-bold text-blue-600">Admin Dashboard</h1>
          <p className="text-white/90">Manage seating assignments for Pia & Ryan&apos;s Wedding</p>
        </div>

        {rsvpStats && (
          <div className="rounded-xl border-2 border-white/20 bg-white/95 p-8 shadow-2xl backdrop-blur-md">
            <h2 className="mb-6 font-serif text-3xl font-semibold text-jewel-burgundy">RSVP Statistics</h2>

            {/* Only show Attending and Declined */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-md border border-green-200">
                <p className="text-sm font-semibold uppercase tracking-wide text-green-700 mb-2">Guests Attending</p>
                <p className="text-5xl font-bold text-green-900">{rsvpStats.yes}</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-red-50 to-rose-50 p-6 shadow-md border border-red-200">
                <p className="text-sm font-semibold uppercase tracking-wide text-red-700 mb-2">Guests Declined</p>
                <p className="text-5xl font-bold text-red-900">{rsvpStats.no}</p>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Invitation Generation */}
        <Card className="border-2 border-gold/20 bg-white/95 p-6 shadow-xl backdrop-blur">
          <h2 className="mb-4 font-serif text-2xl font-bold text-jewel-burgundy">Bulk Invitation Generation</h2>
          <p className="mb-4 text-sm text-gray-600">
            Generate personalized invitations for all guests. Upload a CSV file with a "Full Name" column, or use the
            default master guest list.
          </p>

          <div className="mb-4 space-y-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Guest List CSV (Optional)</label>
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                disabled={isBulkGenerating}
                className="border-jewel-burgundy/30"
              />
              <p className="mt-1 text-xs text-gray-500">
                {csvFile ? `Selected: ${csvFile.name}` : "Leave empty to use default MASTERGUESTLIST.csv"}
              </p>
            </div>

            <Button
              onClick={handleBulkGenerate}
              disabled={isBulkGenerating}
              className="w-full bg-gradient-to-r from-jewel-burgundy to-jewel-crimson text-white hover:from-jewel-crimson hover:to-jewel-burgundy disabled:opacity-50"
            >
              {isBulkGenerating ? "Generating..." : "Generate All Invitations"}
            </Button>

            {bulkProgress && (
              <div className="rounded-lg bg-gradient-to-r from-fuchsia-50 to-purple-50 p-4 text-center">
                <p className="font-medium text-jewel-burgundy">{bulkProgress}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Seating Assignments */}
        <Card className="border-2 border-gold/20 bg-white/95 p-6 shadow-xl backdrop-blur">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-serif text-jewel-burgundy mb-2">
                Seating Assignments ({assignments.length})
              </h2>
              <p className="text-jewel-burgundy/70">Manage guest seating here</p>
            </div>
            {guestStats && (
              <div className="text-right">
                <p className="text-sm font-semibold uppercase tracking-wide text-amber-700 mb-1">Pending RSVP</p>
                <p className="text-4xl font-bold text-amber-600">{guestStats.pending}</p>
              </div>
            )}
          </div>

          <div className="mb-6 flex gap-4">
            <div className="flex-1">
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search guests by name or email..."
                className="border border-jewel-burgundy/30 rounded-lg focus:ring-2 focus:ring-jewel-crimson focus:border-jewel-crimson"
              />
            </div>
            <Button
              onClick={searchAssignments}
              className="bg-jewel-burgundy hover:bg-jewel-crimson text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </Button>
          </div>

          <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-4">
            <Button
              onClick={() => loadAssignments(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 justify-center"
            >
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Reload</span>
            </Button>

            <Button
              onClick={exportToCSV}
              disabled={assignments.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              <span className="font-semibold">Export CSV</span>
            </Button>

            <Button
              onClick={() => setIsCreateGuestOpen((v) => !v)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 justify-center"
            >
              <PlusCircle className="w-5 h-5" />
              <span className="font-semibold">New Guest</span>
            </Button>

            <Button
              onClick={() => router.push("/admin/seating-chart")}
              className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-3 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 justify-center"
            >
              <Users className="w-5 h-5" />
              <span className="font-semibold">Seating Chart</span>
            </Button>

            <Button
              onClick={validateAssignments}
              disabled={assignments.length === 0}
              className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-3 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold">Validate</span>
            </Button>
          </div>

          {isCreateGuestOpen && (
            <div className="mb-6 rounded-lg border border-jewel-burgundy/20 bg-white/90 p-4 shadow-lg">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold text-jewel-burgundy">Add New Invited Guest</p>
                <Button
                  onClick={() => setIsCreateGuestOpen(false)}
                  variant="outline"
                  className="border-jewel-burgundy/30 text-jewel-burgundy hover:bg-jewel-burgundy/5"
                >
                  Cancel
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Guest Name</label>
                  <Input
                    value={createGuestForm.guest_name}
                    onChange={(e) => setCreateGuestForm((p) => ({ ...p, guest_name: e.target.value }))}
                    placeholder='e.g. "Kevin Camacho" or "John & Jane Doe"'
                    className="border-jewel-burgundy/30"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Guest Count</label>
                  <Input
                    type="number"
                    min={1}
                    value={createGuestForm.allowed_party_size}
                    onChange={(e) =>
                      setCreateGuestForm((p) => ({ ...p, allowed_party_size: parseInt(e.target.value || "1", 10) || 1 }))
                    }
                    className="border-jewel-burgundy/30"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Email (optional)</label>
                  <Input
                    value={createGuestForm.email}
                    onChange={(e) => setCreateGuestForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="example@email.com"
                    className="border-jewel-burgundy/30"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={createGuestForm.is_entourage}
                      onChange={(e) => setCreateGuestForm((p) => ({ ...p, is_entourage: e.target.checked }))}
                    />
                    Entourage
                  </label>
                </div>
                <div className="md:col-span-3">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={createGuestForm.open_invite_after_create}
                      onChange={(e) => setCreateGuestForm((p) => ({ ...p, open_invite_after_create: e.target.checked }))}
                    />
                    Open invite generator after create
                  </label>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  onClick={createInvitedGuest}
                  disabled={creatingGuest}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  {creatingGuest
                    ? "Creating..."
                    : createGuestForm.open_invite_after_create
                      ? "Create & Generate Invite"
                      : "Create Guest"}
                </Button>
              </div>
            </div>
          )}

          {lastCreatedGuest && (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50/70 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-amber-900">MASTER CSV helper</p>
                  <p className="text-sm text-amber-800">
                    Click the flag to view/copy the CSV row to paste into `MASTERGUESTLIST.csv` (renumber later).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setIsCsvHelperOpen((v) => !v)}
                    variant="outline"
                    className="border-amber-300 text-amber-900 hover:bg-amber-100 flex items-center gap-2"
                  >
                    <Flag className="h-4 w-4" />
                    {isCsvHelperOpen ? "Hide" : "Show"}
                  </Button>
                  <Button
                    onClick={copyMasterCsvLine}
                    variant="outline"
                    className="border-amber-300 text-amber-900 hover:bg-amber-100 flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </div>

              {isCsvHelperOpen && (
                <div className="mt-3 rounded-md border border-amber-200 bg-white p-3">
                  <p className="mb-2 text-xs text-gray-600">
                    Header: `Number,Full Name,Notes,Headcount,RSVP Status,KIDENTOURAGE`
                  </p>
                  <pre className="whitespace-pre-wrap break-all text-sm text-gray-900">
                    {getMasterCsvLineForGuest(lastCreatedGuest)}
                  </pre>
                </div>
              )}
            </div>
          )}

          <div className="mb-6">
            <Button
              onClick={handleAutoAssign}
              disabled={isAutoAssigning || loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-4 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-3 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-2xl">🎯</span>
              <span className="text-lg font-bold">
                {isAutoAssigning ? "⏳ Assigning Seats..." : "Auto-Assign Seats"}
              </span>
            </Button>
          </div>

          {/* Message */}
          {message && (
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 mb-6">
              <pre className="text-sm whitespace-pre-wrap">{message}</pre>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-jewel-burgundy/30">
                  <th className="text-left py-4 px-4 font-semibold text-jewel-burgundy">Guest</th>
                  <th className="text-left py-4 px-4 font-semibold text-jewel-burgundy">Email</th>
                  <th className="text-left py-4 px-4 font-semibold text-jewel-burgundy">Guest Count</th>
                  <th className="text-left py-4 px-4 font-semibold text-jewel-burgundy">Table</th>
                  <th className="text-left py-4 px-4 font-semibold text-jewel-burgundy">Additional Guest</th>
                  <th className="text-left py-4 px-4 font-semibold text-jewel-burgundy">Dietary</th>
                  <th className="text-left py-4 px-4 font-semibold text-jewel-burgundy">RSVP Notes</th>
                  <th className="text-left py-4 px-4 font-semibold text-jewel-burgundy">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jewel-burgundy mx-auto"></div>
                      <p className="text-jewel-burgundy/70 mt-2">Loading assignments...</p>
                    </td>
                  </tr>
                ) : (
                  assignments.map((assignment) => (
                    <tr key={assignment.id} className="border-b border-jewel-burgundy/10 hover:bg-jewel-burgundy/5">
                      <td className="py-4 px-4">
                        {editingId === assignment.id ? (
                          <div className="flex flex-col gap-2">
                            <Input
                              type="text"
                              value={editForm.guest_name || ""}
                              onChange={(e) => setEditForm({ ...editForm, guest_name: e.target.value })}
                              className="w-full px-2 py-1 border border-jewel-burgundy/30 rounded"
                            />
                            <select
                              value={editForm.rsvp_status ?? assignment.rsvp_status ?? "pending"}
                              onChange={(e) => setEditForm({ ...editForm, rsvp_status: e.target.value })}
                              className="w-full px-2 py-1 border border-jewel-burgundy/30 rounded text-sm bg-white"
                            >
                              <option value="pending">⏳ Pending</option>
                              <option value="yes">✓ Attending</option>
                              <option value="no">✗ Declined</option>
                            </select>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-burgundy-900">{assignment.guest_name}</span>
                            {getRsvpBadge(assignment)}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {editingId === assignment.id ? (
                          <Input
                            type="email"
                            value={editForm.email || ""}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            className="w-full px-2 py-1 border border-jewel-burgundy/30 rounded"
                          />
                        ) : (
                          <div className="text-sm text-jewel-burgundy/70">{assignment.email || "Not provided"}</div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {editingId === assignment.id ? (
                          <Input
                            type="number"
                            min="1"
                            step="1"
                            value={editForm.actual_guest_count ?? assignment.actual_guest_count ?? 1}
                            onChange={(e) => {
                              const val = Number.parseInt(e.target.value, 10)
                              if (!isNaN(val) && val >= 1) {
                                setEditForm({ ...editForm, actual_guest_count: val })
                              }
                            }}
                            className="w-24 px-2 py-1 border-2 border-jewel-burgundy/50 rounded focus:ring-2 focus:ring-jewel-crimson"
                            placeholder="Count"
                          />
                        ) : (
                          <div className="text-sm font-medium text-jewel-sapphire">
                            {(assignment.actual_guest_count ?? assignment.allowed_party_size ?? 1) + " "}
                            {(assignment.actual_guest_count ?? assignment.allowed_party_size ?? 1) === 1 ? "person" : "people"}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {editingId === assignment.id ? (
                          <Input
                            type="number"
                            value={editForm.table_number || ""}
                            onChange={(e) =>
                              setEditForm({ ...editForm, table_number: Number.parseInt(e.target.value) })
                            }
                            className="w-20 px-2 py-1 border border-jewel-burgundy/30 rounded"
                          />
                        ) : (
                          <div className="font-semibold text-jewel-burgundy">Table {assignment.table_number}</div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {editingId === assignment.id ? (
                          <Input
                            type="text"
                            value={editForm.plus_one_name || ""}
                            onChange={(e) => setEditForm({ ...editForm, plus_one_name: e.target.value })}
                            placeholder="Additional guest name"
                            className="w-full px-2 py-1 border border-jewel-burgundy/30 rounded text-sm"
                          />
                        ) : (
                          <div className="text-sm">
                            {assignment.plus_one_name ? (
                              <div className="font-medium">{assignment.plus_one_name}</div>
                            ) : (
                              <div className="text-jewel-burgundy/50">None</div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {editingId === assignment.id ? (
                          <Input
                            type="text"
                            value={editForm.dietary_notes || ""}
                            onChange={(e) => setEditForm({ ...editForm, dietary_notes: e.target.value })}
                            placeholder="Dietary notes"
                            className="w-full px-2 py-1 border border-jewel-burgundy/30 rounded text-sm"
                          />
                        ) : (
                          <div className="text-sm text-jewel-burgundy/70">{assignment.dietary_notes || "None"}</div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm space-y-1 max-w-xs">
                          {assignment.dietary_restrictions && (
                            <div className="flex items-start gap-1">
                              <span className="text-orange-600 font-medium shrink-0">🍽️</span>
                              <span className="text-orange-700">{assignment.dietary_restrictions}</span>
                            </div>
                          )}
                          {assignment.special_message && (
                            <div className="flex items-start gap-1">
                              <span className="text-purple-600 font-medium shrink-0">💬</span>
                              <span className="text-purple-700 italic">{assignment.special_message}</span>
                            </div>
                          )}
                          {!assignment.dietary_restrictions && !assignment.special_message && (
                            <span className="text-jewel-burgundy/40">—</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {editingId === assignment.id ? (
                          <div className="flex gap-2">
                            <Button
                              onClick={saveEdit}
                              className="bg-jewel-emerald hover:bg-jewel-emerald/90 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              Save
                            </Button>
                            <Button
                              onClick={cancelEdit}
                              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => startEdit(assignment)}
                              className="bg-jewel-burgundy hover:bg-jewel-crimson text-white px-3 py-1 rounded text-sm transition-colors flex items-center gap-1"
                            >
                              <Edit className="w-3 h-3" />
                              Edit
                            </Button>
                            <Button
                              onClick={() => {
                                const guestName = encodeURIComponent(assignment.guest_name)
                                window.location.href = `/admin/invitations?guest=${guestName}`
                              }}
                              className="bg-jewel-gold hover:bg-jewel-gold/90 text-white px-3 py-1 rounded text-sm transition-colors flex items-center gap-1"
                            >
                              Create Invite
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
