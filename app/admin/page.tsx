"use client"
import { useState, useEffect } from "react"
import { Search, Download, CheckCircle, AlertTriangle, Edit, Plus, Trash2 } from "lucide-react"

interface SeatingAssignment {
  id: string
  guest_name: string
  email: string | null
  table_number: number
  seat_number: number
  plus_one_name: string | null
  plus_one_seat: number | null
  dietary_notes: string | null
  special_notes: string | null
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [assignments, setAssignments] = useState<SeatingAssignment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<SeatingAssignment>>({})

  // Simple password protection
  const ADMIN_PASSWORD = "wedding2026" // Change this to your preferred password

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      loadAssignments()
    } else {
      setMessage("❌ Incorrect password")
    }
  }

  const loadAssignments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/seating')
      const result = await response.json()
      
      if (result.success) {
        setAssignments(result.data)
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
    const csvHeader = 'guest_name,email,table_number,seat_number,plus_one_name,plus_one_seat,dietary_notes,special_notes'
    const csvRows = assignments.map(assignment => [
      assignment.guest_name,
      assignment.email || '',
      assignment.table_number,
      assignment.seat_number,
      assignment.plus_one_name || '',
      assignment.plus_one_seat || '',
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
    const issues = []
    const tableSeats: { [key: string]: Set<number> } = {}

    assignments.forEach(assignment => {
      const tableKey = `table_${assignment.table_number}`
      if (!tableSeats[tableKey]) {
        tableSeats[tableKey] = new Set()
      }

      if (tableSeats[tableKey].has(assignment.seat_number)) {
        issues.push(`❌ Duplicate seat: Table ${assignment.table_number}, Seat ${assignment.seat_number} (${assignment.guest_name})`)
      } else {
        tableSeats[tableKey].add(assignment.seat_number)
      }

      if (assignment.plus_one_name && !assignment.plus_one_seat) {
        issues.push(`⚠️ Plus-one name but no seat: ${assignment.guest_name}`)
      }

      if (assignment.plus_one_seat && !assignment.plus_one_name) {
        issues.push(`⚠️ Plus-one seat but no name: ${assignment.guest_name}`)
      }
    })

    if (issues.length === 0) {
      setMessage('✅ All seating assignments are valid!')
    } else {
      setMessage(`❌ Found ${issues.length} issues:\n${issues.join('\n')}`)
    }
  }

  const startEdit = (assignment: SeatingAssignment) => {
    setEditingId(assignment.id)
    setEditForm(assignment)
  }

  const saveEdit = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/seating', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...editForm })
      })
      
      const result = await response.json()
      if (result.success) {
        setMessage('✅ Assignment updated successfully')
        setEditingId(null)
        loadAssignments()
      } else {
        setMessage(`❌ Error: ${result.error}`)
      }
    } catch (error) {
      setMessage(`❌ Error updating assignment: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-jewel-burgundy to-jewel-crimson flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif text-jewel-burgundy mb-2">Admin Dashboard</h1>
            <p className="text-jewel-burgundy/70">Wedding Seating Management</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-jewel-burgundy mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-jewel-burgundy/30 rounded-lg focus:ring-2 focus:ring-jewel-crimson focus:border-jewel-crimson transition-colors"
                placeholder="Enter admin password"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-jewel-burgundy hover:bg-jewel-crimson text-white py-3 text-lg font-medium rounded-lg transition-colors duration-200"
            >
              Access Dashboard
            </button>
          </form>
          
          {message && (
            <div className="mt-4 p-3 bg-jewel-crimson/10 text-jewel-crimson rounded-lg text-sm">
              {message}
            </div>
          )}
        </div>
      </div>
    )
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
            <button
              onClick={() => setIsAuthenticated(false)}
              className="bg-jewel-crimson hover:bg-jewel-burgundy text-white px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
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
                    <th className="text-left py-3 px-2 font-semibold text-jewel-burgundy">Table</th>
                    <th className="text-left py-3 px-2 font-semibold text-jewel-burgundy">Seat</th>
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
                            type="number"
                            value={editForm.seat_number || ''}
                            onChange={(e) => setEditForm({...editForm, seat_number: parseInt(e.target.value)})}
                            className="w-20 px-2 py-1 border border-jewel-burgundy/30 rounded"
                          />
                        ) : (
                          <div className="font-semibold text-jewel-burgundy">Seat {assignment.seat_number}</div>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        {editingId === assignment.id ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={editForm.plus_one_name || ''}
                              onChange={(e) => setEditForm({...editForm, plus_one_name: e.target.value})}
                              placeholder="Plus one name"
                              className="w-full px-2 py-1 border border-jewel-burgundy/30 rounded text-sm"
                            />
                            <input
                              type="number"
                              value={editForm.plus_one_seat || ''}
                              onChange={(e) => setEditForm({...editForm, plus_one_seat: parseInt(e.target.value)})}
                              placeholder="Seat number"
                              className="w-20 px-2 py-1 border border-jewel-burgundy/30 rounded text-sm"
                            />
                          </div>
                        ) : (
                          <div className="text-sm">
                            {assignment.plus_one_name ? (
                              <div>
                                <div className="font-medium">{assignment.plus_one_name}</div>
                                <div className="text-jewel-burgundy/70">Seat {assignment.plus_one_seat}</div>
                              </div>
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
                          <button
                            onClick={() => startEdit(assignment)}
                            className="bg-jewel-burgundy hover:bg-jewel-crimson text-white px-3 py-1 rounded text-sm transition-colors flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </button>
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
