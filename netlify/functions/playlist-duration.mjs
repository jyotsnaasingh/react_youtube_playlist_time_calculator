
export default async (req) => {
  if (req.method !== "POST") {
    return Response.json(
      { error: "Method not allowed" },
      { status: 405 }
    )
  }

  try {
    const { playlistId } = await req.json()
    const apiKey = process.env.YOUTUBE_API_KEY

    if (!apiKey) {
      return Response.json(
        { error: "API key not configured" },
        { status: 500 }
      )
    }

    if (!playlistId || !/^[A-Za-z0-9_-]+$/.test(playlistId)) {
      return Response.json(
        { error: "Invalid playlist ID" },
        { status: 400 }
      )
    }

    let totalSeconds = 0
    let pageToken = ""

    do {
      const params = new URLSearchParams({
        part: "contentDetails",
        maxResults: "50",
        playlistId,
        key: apiKey
      })

      if (pageToken) {
        params.set("pageToken", pageToken)
      }

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?${params}`
      )

      const data = await response.json()

      if (!response.ok) {
        return Response.json(
          { error: data.error?.message || "YouTube API error" },
          { status: response.status }
        )
      }

      const videoIds = (data.items || [])
        .map(item => item.contentDetails.videoId)
        .join(",")

      if (videoIds) {
        const videoParams = new URLSearchParams({
          part: "contentDetails",
          id: videoIds,
          key: apiKey
        })

        const videoResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?${videoParams}`
        )

        const videoData = await videoResponse.json()

        if (!videoResponse.ok) {
          return Response.json(
            { error: "Could not fetch video durations" },
            { status: videoResponse.status }
          )
        }

        for (const video of videoData.items || []) {
          const match = video.contentDetails.duration.match(
            /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
          )

          if (match) {
            totalSeconds +=
              Number(match[1] || 0) * 3600 +
              Number(match[2] || 0) * 60 +
              Number(match[3] || 0)
          }
        }
      }

      pageToken = data.nextPageToken || ""

    } while (pageToken)

    return Response.json({ totalSeconds })

  } catch (error) {
    return Response.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
