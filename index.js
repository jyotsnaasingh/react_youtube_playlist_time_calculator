const url="https://www.youtube.com/playlist?list=PLfqMhTWNBTe137I_EPQd34TsgV6IO55pt"
const parsedurl=new URL(url)

const playlistId=parsedurl.searchParams.get("list");
const API_KEY="AIzaSyD339brQTFOWhn8qeU3cJLUjrvUmMaVsWo"

function isoDurationToSeconds(duration) {
  const match = duration.match(
    /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
  );

  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);

  return hours * 3600 + minutes * 60 + seconds;
}




async function getPlaylistVideos() {
  let url =
    `https://www.googleapis.com/youtube/v3/playlistItems` +
    `?part=snippet` +
    `&playlistId=${playlistId}` +
    `&maxResults=50` +
    `&key=${API_KEY}`;

  let response = await fetch(url);
  let data = await response.json();

  
  let videoIds = data.items.map(
  item => item.snippet.resourceId.videoId
);


let ids = videoIds.join(",");

let newResponse = await fetch(
  `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${ids}&key=${API_KEY}`
);
let newData = await newResponse.json();


let sum=0;
newData.items.map(items=>sum+=isoDurationToSeconds(items.contentDetails.duration));



while(data.nextPageToken){
  url= `https://www.googleapis.com/youtube/v3/playlistItems` +
    `?part=snippet` +
    `&playlistId=${playlistId}` +
    `&maxResults=50` +
    `&pageToken=${data.nextPageToken}`+
    `&key=${API_KEY}`;
     response = await fetch(url);
   data = await response.json();
   videoIds = data.items.map(
item => item.snippet.resourceId.videoId
 ); 
 
 ids = videoIds.join(",");

 newResponse = await fetch(
  `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${ids}&key=${API_KEY}`
);
 newData = await newResponse.json();

newData.items.map(items=>sum+=isoDurationToSeconds(items.contentDetails.duration));

 
}





}

getPlaylistVideos();

