export default function ConfirmationLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <div className="text-center space-y-4">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 border-4 border-jewel-burgundy/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-jewel-burgundy border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-jewel-burgundy font-serif text-lg">Loading your confirmation...</p>
      </div>
    </div>
  )
}
