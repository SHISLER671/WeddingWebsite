#!/usr/bin/env node

/**
 * Read-only audit report:
 * - Fetch all rows from Supabase `invited_guests`
 * - Compare against `MASTERGUESTLIST.csv` (column: "Full Name")
 * - Print BOTH directions:
 *    - Supabase-only: in `invited_guests` but missing from the master CSV
 *    - Master-only: in the master CSV but missing from `invited_guests`
 * - Flag duplicates on either side (same canonicalized name repeated)
 * - Optional: export the full `invited_guests` table to CSV
 *
 * IMPORTANT: This script does NOT write to Supabase and does NOT modify the CSV.
 *
 * Usage:
 *   node scripts/report-invited-guests-not-in-master.js
 *   node scripts/report-invited-guests-not-in-master.js path/to/master.csv
 *
 *   # Also export invited_guests to a CSV file:
 *   node scripts/report-invited-guests-not-in-master.js --export invited_guests_export.csv
 *   node scripts/report-invited-guests-not-in-master.js path/to/master.csv --export invited_guests_export.csv
 */

const fs = require("fs")
const path = require("path")
const { createClient } = require("@supabase/supabase-js")
const Papa = require("papaparse")

// Load environment variables (expects local dev setup)
require("dotenv").config({ path: ".env.local" })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing Supabase credentials.")
  console.error("   Expected NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY in .env.local")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

function canonicalizeName(name) {
  if (!name) return ""
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/&amp;/g, " and ")
    .replace(/&/g, " and ")
    .replace(/\./g, "")
    .replace(/,/g, "")
    .replace(/\s+/g, " ")
}

function loadMasterNames(masterCsvPath) {
  const raw = fs.readFileSync(masterCsvPath, "utf8")
  const parsed = Papa.parse(raw, { header: true, skipEmptyLines: true })
  if (parsed.errors?.length) {
    console.warn("⚠️ CSV parse warnings:", parsed.errors.slice(0, 3))
  }

  const rows = parsed.data || []
  const names = new Set()
  const rawNames = new Set()
  const byCanonical = new Map()

  for (const row of rows) {
    const fullName = row["Full Name"]
    if (!fullName) continue
    const rawFullName = String(fullName).trim()
    const canon = canonicalizeName(rawFullName)
    rawNames.add(rawFullName)
    if (canon) names.add(canon)
    if (!canon) continue
    if (!byCanonical.has(canon)) byCanonical.set(canon, [])
    byCanonical.get(canon).push({
      number: row["Number"] || "",
      fullName: rawFullName,
      notes: row["Notes"] || "",
      headcount: row["Headcount"] || "",
      rsvpStatus: row["RSVP Status"] || "",
      kidEntourage: row["KIDENTOURAGE"] || "",
    })
  }

  return { canonicalNames: names, rawNames, byCanonical }
}

async function fetchAllInvitedGuests() {
  const pageSize = 1000
  let from = 0
  const all = []

  while (true) {
    const to = from + pageSize - 1
    const { data, error } = await supabase
      .from("invited_guests")
      // Keep this list aligned with the live table schema (avoid selecting columns
      // that may exist in migrations but not in the deployed database yet).
      .select("id, guest_name, email, allowed_party_size, source, created_at, updated_at")
      .order("guest_name", { ascending: true })
      .range(from, to)

    if (error) throw new Error(error.message)

    const batch = data || []
    all.push(...batch)

    if (batch.length < pageSize) break
    from += pageSize
  }

  return all
}

function groupByCanonicalName(items, getName) {
  const map = new Map()
  for (const item of items) {
    const canon = canonicalizeName(getName(item))
    if (!canon) continue
    if (!map.has(canon)) map.set(canon, [])
    map.get(canon).push(item)
  }
  return map
}

function printList(title, items) {
  console.log("")
  console.log(`=== ${title} (${items.length}) ===`)
  for (const item of items) {
    const email = item.email && item.email.includes("@") && !item.email.includes("wedding.invalid") ? item.email : ""
    const meta = [
      item.allowed_party_size ? `party=${item.allowed_party_size}` : null,
      item.source ? `source=${item.source}` : null,
      email ? `email=${email}` : null,
    ]
      .filter(Boolean)
      .join(" | ")

    console.log(`- ${item.guest_name}${meta ? ` (${meta})` : ""}`)
  }
}

function printMasterList(title, items) {
  console.log("")
  console.log(`=== ${title} (${items.length}) ===`)
  for (const item of items) {
    const meta = [
      item.number ? `#${item.number}` : null,
      item.headcount ? `party=${item.headcount}` : null,
      item.rsvpStatus ? `rsvp=${item.rsvpStatus}` : null,
      item.kidEntourage ? `kidentourage=${item.kidEntourage}` : null,
    ]
      .filter(Boolean)
      .join(" | ")
    console.log(`- ${item.fullName}${meta ? ` (${meta})` : ""}`)
  }
}

function printDuplicateGroups(title, groups, getLabel) {
  const dups = []
  for (const [canon, items] of groups.entries()) {
    if (items.length > 1) dups.push({ canon, items })
  }
  dups.sort((a, b) => a.canon.localeCompare(b.canon, "en", { sensitivity: "base" }))

  console.log("")
  console.log(`=== ${title} (${dups.length}) ===`)
  for (const g of dups) {
    console.log(`- ${g.canon} (${g.items.length})`)
    for (const item of g.items) {
      console.log(`  - ${getLabel(item)}`)
    }
  }
}

function exportInvitedGuestsCsv(rows, exportPath) {
  const outRows = rows.map((r) => ({
    id: r.id,
    guest_name: r.guest_name,
    email: r.email,
    allowed_party_size: r.allowed_party_size,
    source: r.source,
    created_at: r.created_at,
    updated_at: r.updated_at,
  }))
  const csv = Papa.unparse(outRows)
  fs.writeFileSync(exportPath, csv, "utf8")
}

async function main() {
  const args = process.argv.slice(2)

  const exportFlagIdx = args.indexOf("--export")
  const exportPath =
    exportFlagIdx >= 0 ? args[exportFlagIdx + 1] : null

  const masterArg = args.find((a, idx) => idx !== exportFlagIdx && idx !== exportFlagIdx + 1 && !a.startsWith("--"))
  const masterCsvPath = masterArg
    ? path.resolve(masterArg)
    : path.resolve(process.cwd(), "MASTERGUESTLIST.csv")

  if (!fs.existsSync(masterCsvPath)) {
    console.error(`❌ Master CSV not found at: ${masterCsvPath}`)
    process.exit(1)
  }

  console.log("📄 Master CSV:", masterCsvPath)
  const { canonicalNames: masterSet, byCanonical: masterByCanon } = loadMasterNames(masterCsvPath)
  console.log("✅ Loaded master names:", masterSet.size)

  console.log("")
  console.log("🔌 Fetching invited_guests from Supabase…")
  const dbGuests = await fetchAllInvitedGuests()
  console.log("✅ Fetched invited_guests rows:", dbGuests.length)

  if (exportPath) {
    const resolvedExport = path.resolve(exportPath)
    exportInvitedGuestsCsv(dbGuests, resolvedExport)
    console.log("")
    console.log("🧾 Exported invited_guests to CSV:", resolvedExport)
  }

  const dbByCanon = groupByCanonicalName(dbGuests, (g) => g.guest_name)

  const supabaseOnly = []
  const supabaseOnlyAdmin = []
  const masterOnly = []

  for (const g of dbGuests) {
    const canon = canonicalizeName(g.guest_name)
    if (!canon) continue
    if (!masterSet.has(canon)) {
      supabaseOnly.push(g)
      if (String(g.source || "").includes("@ADMIN")) {
        supabaseOnlyAdmin.push(g)
      }
    }
  }

  for (const [canon, masterRows] of masterByCanon.entries()) {
    if (!dbByCanon.has(canon)) {
      masterOnly.push(...masterRows)
    }
  }

  // Stable ordering for review
  const byName = (a, b) => String(a.guest_name || "").localeCompare(String(b.guest_name || ""), "en", { sensitivity: "base" })
  supabaseOnly.sort(byName)
  supabaseOnlyAdmin.sort(byName)
  masterOnly.sort((a, b) => String(a.fullName || "").localeCompare(String(b.fullName || ""), "en", { sensitivity: "base" }))

  console.log("")
  console.log("🧾 Report (no changes made):")
  console.log("- Invited guests in Supabase but not in MASTERGUESTLIST.csv:", supabaseOnly.length)
  console.log("- Of those, created via admin (source includes @ADMIN):", supabaseOnlyAdmin.length)
  console.log("- Guests in MASTERGUESTLIST.csv but missing from Supabase:", masterOnly.length)

  printList("Supabase-only (ALL sources)", supabaseOnly)
  printList("Supabase-only (source=@ADMIN)", supabaseOnlyAdmin)
  printMasterList("Master-only (missing from Supabase)", masterOnly)

  // Duplicate detection (canonical-name duplicates)
  printDuplicateGroups(
    "Duplicates in Supabase (same canonical name appears multiple times)",
    dbByCanon,
    (g) => `${g.guest_name} (id=${g.id}${g.email ? `, email=${g.email}` : ""})`
  )
  printDuplicateGroups(
    "Duplicates in MASTERGUESTLIST.csv (same canonical name appears multiple times)",
    masterByCanon,
    (r) => `${r.fullName}${r.number ? ` (#${r.number})` : ""}`
  )
}

main().catch((err) => {
  console.error("❌ Report failed:", err?.message || err)
  process.exit(1)
})
