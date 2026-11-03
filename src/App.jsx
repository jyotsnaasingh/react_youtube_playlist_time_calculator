import { useState } from 'react'



function App() {
  const [url, setUrl] = useState("")
  const [speed, setSpeed] = useState(1)
  const [hoursPerDay, setHoursPerDay] = useState(1)
  const [totalSeconds, setTotalSeconds] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleFetch() {
    setError("")
    setTotalSeconds(null)

    // Parse playlist ID from URL
    let playlistId
    try {
      const parsed = new URL(url)
      playlistId = parsed.searchParams.get("list")
      if (!playlistId) {
        setError("No playlist ID found in the URL.")
        return
      }
    } catch {
      setError("Invalid URL. Please paste a valid YouTube playlist link.")
      return
    }

    setLoading(true)

    try {
      
const response = await fetch(
  "/.netlify/functions/playlist-duration",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ playlistId })
  }
)

const data = await response.json()

if (!response.ok) {
  setError("YouTube API error: " + data.error)
  return
}

setTotalSeconds(data.totalSeconds)

    } catch {
      setError("Something went wrong while fetching the playlist. Please try again..")
    } finally {
      setLoading(false)
    }
  }

  // Calculate adjusted time based on speed
  const adjustedSeconds = totalSeconds !== null ? Math.round(totalSeconds / speed) : null

  // Format seconds into Xh Ym Zs
  const timeFormatted = (() => {
    if (adjustedSeconds === null) return "--"
    const h = Math.floor(adjustedSeconds / 3600)
    const m = Math.floor((adjustedSeconds % 3600) / 60)
    const s = adjustedSeconds % 60
    return `${h}h ${m}m ${s}s`
  })()

  // Calculate days needed
  const daysRequired = adjustedSeconds !== null
    ? Math.ceil(adjustedSeconds / (hoursPerDay * 3600))
    : "--"

  return (
    <div className='min-h-screen bg-gray-900 flex items-center justify-center p-4'>
      <div className='w-full max-w-md bg-gray-700 shadow-md rounded-lg p-6 text-orange-500'>

        {/* URL Input */}
        <div className='flex rounded-lg overflow-hidden mb-6'>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube playlist link here"
            className='flex-1 px-3 py-2 text-white bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <button
            onClick={handleFetch}
            disabled={loading}
            className='bg-blue-700 text-white px-4 py-2 shrink-0 hover:bg-blue-600 disabled:opacity-50'
          >
            {loading ? "Loading..." : "Get Duration"}
          </button>
        </div>

        {/* Error */}
        {error && <p className='text-red-400 text-sm mb-4'>{error}</p>}

        {/* Speed Slider */}
        <div className='flex justify-between items-center mb-4'>
          <div className='flex items-center gap-2 w-2/3'>
            <label className='text-sm'>1x</label>
            <input
              type="range"
              min={1}
              max={2}
              step={0.05}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className='flex-1 cursor-pointer'
            />
            <label className='text-sm'>2x</label>
          </div>
          <span className='text-sm w-1/3 text-right'>Speed: {speed}x</span>
        </div>

        {/* Hours/day Slider */}
        <div className='flex justify-between items-center mb-6'>
          <div className='flex items-center gap-2 w-2/3'>
            <label className='text-sm'>1h</label>
            <input
              type="range"
              min={1}
              max={12}
              step={0.5}
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Number(e.target.value))}
              className='flex-1 cursor-pointer'
            />
            <label className='text-sm'>12h</label>
          </div>
          <span className='text-sm w-1/3 text-right'>Hours/day: {hoursPerDay}</span>
        </div>

        {/* Results */}
        <div className='flex justify-between text-sm border-t border-gray-600 pt-4'>
          <span>Time Required: <strong>{timeFormatted}</strong></span>
          <span>Days Required: <strong>{daysRequired}</strong></span>
        </div>

      </div>
    </div>
  )
}

export default App