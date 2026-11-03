import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const ITEMS = [
  { id: 1, name: "React Book", category: "Education" },
  { id: 2, name: "Tailwind UI Kit", category: "Design" },
  { id: 3, name: "Mechanical Keyboard", category: "Hardware" },
  { id: 4, name: "Wireless Mouse", category: "Hardware" },
]

function Home() {
  const [dimension, setDimension] = useState("2d")
  const [zoom, setZoom] = useState(10.12)
  const [pitch, setPitch] = useState(0)
  const mapRef = useRef()
  const [isShowList, setIsShowList] = useState(false)
  const [query, setQuery] = useState("")
  const mapContainerRef = useRef()

  const filteredItems = ITEMS.filter((item) => {
    const matchesQuery = item.name
      .toLowerCase()
      .includes(query.toLowerCase())
    return matchesQuery
  })

  async function getLocation() {
    await Geolocation.requestPermissions()
    const coordinates = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    })

    return [coordinates.coords.longitude, coordinates.coords.latitude]
  }

  function changeDimension(d) {
    if (d == "2d") {
      setDimension("2d")
      setZoom(10.12)
      setPitch(0)
    } else if (d == "3d") {
      setDimension("3d")
      setZoom(15.45)
      setPitch(45)
    }
  }

  useEffect(() => {
    function initMap(lng, lat) {
      mapRef.current = new mapboxgl.Map({
        accessToken: import.meta.env.VITE_ACCESS_TOKEN,
        container: "map",
        center: [lng, lat],
        zoom: zoom,
        pitch: pitch,
      })

      new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .addTo(mapRef.current)
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords
          initMap(longitude, latitude)
        },
        (error) => {
          alert("Location not found")
          initMap(106.827139, -6.175389)
        }
      )
    } else {
      initMap(106.827139, -6.175389)
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
      }
    }
  }, [zoom, pitch])

  return (
    <div className="h-screen">
      {/* Search */}
      <div className="max-w-md mx-auto p-4 space-y-4 fixed z-10 w-full">
        <input type="text" placeholder="Search items..." onFocus={() => setIsShowList(true)} onBlur={() => setIsShowList(false)} value={query} onChange={(e) => setQuery(e.target.value)} className="w-full px-4 py-2 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        {
          isShowList ? <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <li key={item.id} className="p-3 flex justify-between items-center bg-white hover:bg-gray-50">
                <span className="font-medium text-gray-800">{item.name}</span>
              </li>
            ))
          ) : (
            <li className="p-4 text-center text-gray-500">No items found</li>
          )}
        </ul> : null
        }
      </div>

      {/* Dimension map */}
      <div className="fixed bg-white z-30 flex flex-col right-5 bottom-5 rounded justify-between">
        <button className={`${dimension == "2d" ? "bg-gray-200 rounded-t" : ""} font-medium text-xl text-gray-700 p-3 outline-0 cursor-pointer`} onClick={() => changeDimension("2d")}>2D</button>
        <button className={`${dimension == "3d" ? "bg-gray-200 rounded-b" : ""} font-medium text-xl text-gray-700 p-3 outline-0 cursor-pointer`} onClick={() => changeDimension("3d")}>3D</button>
      </div>

      {/* Map */}
      <div id="map" ref={mapContainerRef} className="h-full" />
    </div>
  )
}

export default Home
