import { useRef, useEffect, useState } from 'react'
import { getSearchList, getPlace } from "../services/Services.js"
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

function Home() {
  const token = import.meta.env.VITE_ACCESS_TOKEN
  const [dimension, setDimension] = useState("2d")
  const [zoom, setZoom] = useState(10.12)
  const [pitch, setPitch] = useState(0)
  const [isShowList, setIsShowList] = useState(false)
  const [myLocation, setMyLocation] = useState()
  const [listSearch, setListSearch] = useState([])
  const [query, setQuery] = useState("")
  const mapRef = useRef()
  const mapContainerRef = useRef()

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

  async function getSelectedPlace(id) {
    const data = await getPlace(id,token)
    initMap(data,myLocation)
    setIsShowList(false)
  }

  async function getAllListSearch(e) {
    setQuery(e)
    const data = await getSearchList(e,token)
    setListSearch(data)
  }

  function initMap(map,location) {
    mapRef.current = new mapboxgl.Map({
      accessToken: token,
      container: "map",
      center: map,
      zoom: zoom,
      pitch: pitch,
    })

    new mapboxgl.Marker()
      .setLngLat(location)
      .addTo(mapRef.current)

    if(map !== location) {
      new mapboxgl.Marker({color:"red"})
       .setLngLat(map)
       .addTo(mapRef.current)
    }
  }

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords
          const lngLat = [longitude, latitude]
          setMyLocation(lngLat)
          initMap(lngLat,lngLat)
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
        <input type="text" placeholder="Search items..." onFocus={() => setIsShowList(true)} onBlur={() => setIsShowList(false)} value={query} onChange={(e) => getAllListSearch(e.target.value)} className="w-full px-4 py-2 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        {
          isShowList ? <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
          {listSearch.length > 0 ? (
            listSearch.map((item,i) => (
              <li key={i}>
                <button onMouseDown={e => e.preventDefault()} onClick={() => getSelectedPlace(item.mapbox_id)} className="w-full text-left p-3 flex flex-col bg-white hover:bg-gray-50">
                  <span className="font-medium text-gray-800">{item.name}</span>
                  <span className="text-gray-800 text-sm">{item.full_address}</span>
                </button>
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
