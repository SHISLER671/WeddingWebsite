export default function AdminLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-jewel-burgundy via-jewel-crimson to-jewel-fuchsia">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-4"></div>
        <p className="text-white text-lg font-medium">Loading admin panel...</p>
      </div>
    </div>
  )
}
