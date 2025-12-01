"use client"
import { useState, useEffect } from "react"
import { Search, Download, CheckCircle, AlertTriangle, Edit } from "lucide-react"

interface SeatingAssignment {
  id: string
  guest_name: string
  email: string | null
  table_number: number
  plus_one_name: string | null
  dietary_notes: string | null
  special_notes: string | null
  actual_guest_count?: number // From RSVP
}

interface TableCapacity {
  [tableNumber: number]: number
}

export default function AdminPage() {
  const [assignments, setAssignments] = useState<SeatingAssignment[]>([])
  const [tableCapacities, setTableCapacities] = useState<TableCapacity>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<SeatingAssignment>>({})

  // Load assignments on mount
  useEffect(() => {
    loadAssignments()
  }, [])

  const loadAssignments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/seating')
      const result = await response.json()
      
      if (result.success) {
        setAssignments(result.data)
        if (result.tableCapacities) {
          setTableCapacities(result.tableCapacities)
        }
        setMessage(`✅ Loaded ${result.data.length} seating assignments`)
      } else {
        setMessage(`❌ Error: ${result.error}`)
      }
    } catch (error) {
      setMessage(`❌ Error loading assignments: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const searchAssignments = () => {
    if (!searchTerm.trim()) {
      loadAssignments()
      return
    }

    const filtered = assignments.filter(assignment =>
      assignment.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.plus_one_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setAssignments(filtered)
    setMessage(`🔍 Found ${filtered.length} matching assignments`)
  }

  const exportToCSV = () => {
    const csvHeader = 'guest_name,email,table_number,plus_one_name,dietary_notes,special_notes'
    const csvRows = assignments.map(assignment => [
      assignment.guest_name,
      assignment.email || '',
      assignment.table_number,
      assignment.plus_one_name || '',
      assignment.dietary_notes || '',
      assignment.special_notes || ''
    ].map(field => `"${field}"`).join(','))

    const csvContent = [csvHeader, ...csvRows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `seating-assignments-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    setMessage(`📤 Exported ${assignments.length} assignments to CSV`)
  }

  const validateAssignments = () => {
    const issues: string[] = []
    const tableCounts: { [key: number]: number } = {}
    const tableGuestCounts: { [key: number]: number } = {}

    // Calculate actual guest counts per table
    assignments.forEach(assignment => {
      if (assignment.table_number > 0) {
        const tableNum = assignment.table_number
        tableCounts[tableNum] = (tableCounts[tableNum] || 0) + 1
        const guestCount = assignment.actual_guest_count || 1
        tableGuestCounts[tableNum] = (tableGuestCounts[tableNum] || 0) + guestCount
      }
    })

    // Check for capacity issues (assuming 8-10 people per table is ideal)
    Object.keys(tableGuestCounts).forEach(tableNumStr => {
      const tableNum = parseInt(tableNumStr, 10)
      const guestCount = tableGuestCounts[tableNum]
      if (guestCount > 10) {
        issues.push(`Table ${tableNum}: ${guestCount} people (over capacity - max 10 recommended)`)
      } else if (guestCount < 6 && guestCount > 0) {
        issues.push(`Table ${tableNum}: ${guestCount} people (under capacity - consider combining)`)
      }
    })

    if (issues.length === 0) {
      const capacityInfo = Object.keys(tableGuestCounts).map(tableNumStr => {
        const tableNum = parseInt(tableNumStr, 10)
        return `Table ${tableNum}: ${tableGuestCounts[tableNum]} people`
      }).join('\n')
      setMessage(`✅ All seating assignments are valid!\n\n📊 Table Capacities:\n${capacityInfo}`)
    } else {
      setMessage(`⚠️ Found ${issues.length} capacity issues:\n${issues.join('\n')}\n\n📊 Current Table Capacities:\n${Object.keys(tableGuestCounts).map(tableNumStr => {
        const tableNum = parseInt(tableNumStr, 10)
        return `Table ${tableNum}: ${tableGuestCounts[tableNum]} people`
      }).join('\n')}`)
    }
  }

  const startEdit = (assignment: SeatingAssignment) => {
    setEditingId(assignment.id)
    setEditForm(assignment)
  }

  const isEntourage = (assignment: SeatingAssignment): boolean => {
    return assignment.special_notes?.toUpperCase().includes('ENTOURAGE') || false
  }

  const getEntourageAtTable = (assignments: SeatingAssignment[], tableNumber: number): SeatingAssignment[] => {
    // IMPORTANT: Only get entourage at THIS specific table, not all entourage across all tables
    // Entourage is spread across multiple tables (40+ people total), so we only move the group
    // that's currently at the same table as the guest being moved
    return assignments.filter(a => 
      a.table_number === tableNumber && 
      isEntourage(a) &&
      tableNumber > 0 // Only assigned tables (not unassigned)
    )
  }

  const calculateRebalance = (currentAssignments: SeatingAssignment[], movedGuestId: string, newTable: number, oldTable: number, guestCount: number) => {
    const movedGuest = currentAssignments.find(a => a.id === movedGuestId)
    const isMovingEntourage = movedGuest ? isEntourage(movedGuest) : false

    // If moving entourage, find all entourage at the OLD TABLE ONLY and move them together
    // Note: Entourage is spread across multiple tables, so we only move the group at this specific table
    let assignmentsToMove: SeatingAssignment[] = []
    if (isMovingEntourage) {
      const entourageAtOldTable = getEntourageAtTable(currentAssignments, oldTable)
      assignmentsToMove = entourageAtOldTable.length > 0 ? entourageAtOldTable : [movedGuest!]
    } else {
      assignmentsToMove = [movedGuest!]
    }

    // Create a working copy with all moves applied
    const workingAssignments = currentAssignments.map(a => {
      const shouldMove = assignmentsToMove.some(m => m.id === a.id)
      return shouldMove ? { ...a, table_number: newTable } : a
    })

    // Calculate current capacities after the move
    const capacities: { [table: number]: number } = {}
    workingAssignments.forEach(a => {
      if (a.table_number > 0) {
        capacities[a.table_number] = (capacities[a.table_number] || 0) + (a.actual_guest_count || 1)
      }
    })

    const rebalanceMoves: Array<{assignmentId: string, guestName: string, fromTable: number, toTable: number, guestCount: number}> = []
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

      Object.keys(capacities).forEach(tableStr => {
        const table = parseInt(tableStr, 10)
        const capacity = capacities[table]
        if (capacity > 10) overCapacityTables.push(table)
        if (capacity < 6 && capacity > 0) underCapacityTables.push(table)
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
          .filter(a => 
            a.table_number === overTable && 
            !processed.has(a.id) &&
            !isEntourage(a) // Never move entourage individually
          )
          .sort((a, b) => (a.actual_guest_count || 1) - (b.actual_guest_count || 1))

        if (candidates.length === 0) continue

        const candidate = candidates[0]
        const candidateCount = candidate.actual_guest_count || 1

        // Find best under-capacity table to move to
        for (const underTable of underCapacityTables) {
          const newCapacity = capacities[underTable] + candidateCount
          if (newCapacity <= 10) {
            // This move works!
            rebalanceMoves.push({
              assignmentId: candidate.id,
              guestName: candidate.guest_name,
              fromTable: overTable,
              toTable: underTable,
              guestCount: candidateCount
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
            .filter(a => 
              a.table_number === overTable && 
              !processed.has(a.id) &&
              !isEntourage(a) // Never move entourage individually
            )
            .sort((a, b) => (a.actual_guest_count || 1) - (b.actual_guest_count || 1))

          if (candidates.length === 0) continue

          const candidate = candidates[0]
          const candidateCount = candidate.actual_guest_count || 1

          // Find any table with space (including creating new table if needed)
          const availableTables = Object.keys(capacities)
            .map(t => parseInt(t, 10))
            .filter(t => capacities[t] + candidateCount <= 10 && t !== overTable)
            .sort((a, b) => capacities[a] - capacities[b]) // Prefer tables with more space

          if (availableTables.length > 0) {
            const targetTable = availableTables[0]
            rebalanceMoves.push({
              assignmentId: candidate.id,
              guestName: candidate.guest_name,
              fromTable: overTable,
              toTable: targetTable,
              guestCount: candidateCount
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
      setMessage('❌ Error: No assignment selected for editing')
      return
    }

    // Check capacity impact if table number is being changed
    const currentAssignment = assignments.find(a => a.id === editingId)
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
      let message = ''
      if (isMovingEntourage && entourageToMove.length > 1) {
        message = `Moving ENTOURAGE group (${entourageToMove.length} members, ${totalEntourageCount} total people) from Table ${oldTable} to Table ${newTable}:\n`
        message += `  Members: ${entourageToMove.map(a => a.guest_name).join(', ')}\n\n`
      } else {
        message = `Moving ${currentAssignment.guest_name} (${guestCount} ${guestCount === 1 ? 'person' : 'people'}) from Table ${oldTable} to Table ${newTable}:\n\n`
      }
      message += `After move:\n`
      message += `  Table ${oldTable}: ${oldTableCapacity} people\n`
      message += `  Table ${newTable}: ${newTableCapacity} people\n\n`

      if (rebalanceMoves.length > 0) {
        message += `Auto-rebalance will make ${rebalanceMoves.length} additional move(s):\n`
        rebalanceMoves.forEach((move, idx) => {
          message += `  ${idx + 1}. Move ${move.guestName} (${move.guestCount} ${move.guestCount === 1 ? 'person' : 'people'}) from Table ${move.fromTable} to Table ${move.toTable}\n`
        })
        message += `\nApply all changes?`
      } else if (newTableCapacity > 10 || oldTableCapacity < 6) {
        message += `⚠️ Warning: This will create capacity issues. No auto-rebalance moves found.\n\nProceed anyway?`
      } else {
        message += `✅ This move looks good!\n\nProceed?`
      }

      const proceed = confirm(message)
      if (!proceed) return

      // Apply the main move(s) and all rebalance moves
      const allMoves: Array<{id: string, table_number: number}> = []
      
      // If moving entourage, move all entourage members together
      if (isMovingEntourage && entourageToMove.length > 0) {
        entourageToMove.forEach(entourageMember => {
          allMoves.push({ id: entourageMember.id, table_number: newTable })
        })
      } else {
        allMoves.push({ id: editingId, table_number: newTable })
      }
      
      // Add rebalance moves (these will never include entourage)
      allMoves.push(...rebalanceMoves.map(move => ({ id: move.assignmentId, table_number: move.toTable })))

      setIsLoading(true)
      setMessage('')
      
      try {
        // Apply all moves in parallel
        const updatePromises = allMoves.map(move =>
          fetch('/api/admin/seating', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(move)
          })
        )

        const results = await Promise.all(updatePromises)
        const errors = []

        for (let i = 0; i < results.length; i++) {
          const response = results[i]
          if (!response.ok) {
            const errorText = await response.text()
            errors.push(`Failed to update ${allMoves[i].id}: ${errorText}`)
          }
        }

        if (errors.length > 0) {
          setMessage(`❌ Some updates failed:\n${errors.join('\n')}`)
        } else {
          setMessage(`✅ Successfully moved ${allMoves.length} assignment(s)!`)
          setEditingId(null)
          setEditForm({})
          loadAssignments()
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        setMessage(`❌ Error updating assignments: ${errorMessage}`)
      } finally {
        setIsLoading(false)
      }
      return
    }

    setIsLoading(true)
    setMessage('')
    
    try {
      const response = await fetch('/api/admin/seating', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...editForm })
      })
      
      // Check if response is ok and has content
      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        setMessage(`❌ Error: ${errorMessage}`)
        return
      }

      // Parse JSON response
      const text = await response.text()
      if (!text) {
        setMessage('❌ Error: Empty response from server')
        return
      }

      let result
      try {
        result = JSON.parse(text)
      } catch (parseError) {
        setMessage(`❌ Error: Invalid response from server: ${parseError}`)
        return
      }

      if (result.success) {
        setMessage('✅ Assignment updated successfully')
        setEditingId(null)
        setEditForm({})
        loadAssignments()
      } else {
        setMessage(`❌ Error: ${result.error || 'Unknown error'}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      setMessage(`❌ Error updating assignment: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-jewel-burgundy to-jewel-crimson p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif text-jewel-burgundy mb-2">Seating Admin Dashboard</h1>
              <p className="text-jewel-burgundy/70">Manage wedding seating assignments</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 mb-6">
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div className="md:col-span-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search guests by name, email, or plus-one..."
                  className="flex-1 px-4 py-3 border border-jewel-burgundy/30 rounded-lg focus:ring-2 focus:ring-jewel-crimson focus:border-jewel-crimson"
                />
                <button
                  onClick={searchAssignments}
                  className="bg-jewel-burgundy hover:bg-jewel-crimson text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
              </div>
            </div>
            
            <button
              onClick={loadAssignments}
              className="bg-jewel-emerald hover:bg-jewel-emerald/90 text-white px-4 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Refresh
            </button>
            
            <button
              onClick={exportToCSV}
              className="bg-jewel-gold hover:bg-jewel-gold/90 text-white px-4 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={validateAssignments}
              className="bg-jewel-sapphire hover:bg-jewel-sapphire/90 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Validate Assignments
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 mb-6">
            <pre className="text-sm whitespace-pre-wrap">{message}</pre>
          </div>
        )}

        {/* Assignments Table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6">
          <h2 className="text-2xl font-serif text-jewel-burgundy mb-4">
            Seating Assignments ({assignments.length})
          </h2>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jewel-burgundy mx-auto"></div>
              <p className="text-jewel-burgundy/70 mt-2">Loading assignments...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-jewel-burgundy/20">
                    <th className="text-left py-3 px-2 font-semibold text-jewel-burgundy">Guest</th>
                    <th className="text-left py-3 px-2 font-semibold text-jewel-burgundy">Email</th>
                    <th className="text-left py-3 px-2 font-semibold text-jewel-burgundy">Guest Count</th>
                    <th className="text-left py-3 px-2 font-semibold text-jewel-burgundy">Table</th>
                    <th className="text-left py-3 px-2 font-semibold text-jewel-burgundy">Plus One</th>
                    <th className="text-left py-3 px-2 font-semibold text-jewel-burgundy">Dietary</th>
                    <th className="text-left py-3 px-2 font-semibold text-jewel-burgundy">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assignment) => (
                    <tr key={assignment.id} className="border-b border-jewel-burgundy/10 hover:bg-jewel-burgundy/5">
                      <td className="py-3 px-2">
                        {editingId === assignment.id ? (
                          <input
                            type="text"
                            value={editForm.guest_name || ''}
                            onChange={(e) => setEditForm({...editForm, guest_name: e.target.value})}
                            className="w-full px-2 py-1 border border-jewel-burgundy/30 rounded"
                          />
                        ) : (
                          <div className="font-medium">{assignment.guest_name}</div>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        {editingId === assignment.id ? (
                          <input
                            type="email"
                            value={editForm.email || ''}
                            onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                            className="w-full px-2 py-1 border border-jewel-burgundy/30 rounded"
                          />
                        ) : (
                          <div className="text-sm text-jewel-burgundy/70">{assignment.email || 'Not provided'}</div>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <div className="text-sm font-medium text-jewel-sapphire">
                          {assignment.actual_guest_count || 1} {assignment.actual_guest_count === 1 ? 'person' : 'people'}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        {editingId === assignment.id ? (
                          <input
                            type="number"
                            value={editForm.table_number || ''}
                            onChange={(e) => setEditForm({...editForm, table_number: parseInt(e.target.value)})}
                            className="w-20 px-2 py-1 border border-jewel-burgundy/30 rounded"
                          />
                        ) : (
                          <div className="font-semibold text-jewel-burgundy">Table {assignment.table_number}</div>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        {editingId === assignment.id ? (
                          <input
                            type="text"
                            value={editForm.plus_one_name || ''}
                            onChange={(e) => setEditForm({...editForm, plus_one_name: e.target.value})}
                            placeholder="Plus one name"
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
                      <td className="py-3 px-2">
                        {editingId === assignment.id ? (
                          <input
                            type="text"
                            value={editForm.dietary_notes || ''}
                            onChange={(e) => setEditForm({...editForm, dietary_notes: e.target.value})}
                            placeholder="Dietary notes"
                            className="w-full px-2 py-1 border border-jewel-burgundy/30 rounded text-sm"
                          />
                        ) : (
                          <div className="text-sm text-jewel-burgundy/70">
                            {assignment.dietary_notes || 'None'}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        {editingId === assignment.id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={saveEdit}
                              className="bg-jewel-emerald hover:bg-jewel-emerald/90 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEdit(assignment)}
                              className="bg-jewel-burgundy hover:bg-jewel-crimson text-white px-3 py-1 rounded text-sm transition-colors flex items-center gap-1"
                            >
                              <Edit className="w-3 h-3" />
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                const guestName = encodeURIComponent(assignment.guest_name);
                                window.location.href = `/admin/invitations?guest=${guestName}`;
                              }}
                              className="bg-jewel-gold hover:bg-jewel-gold/90 text-white px-3 py-1 rounded text-sm transition-colors flex items-center gap-1"
                            >
                              Create Invite
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
