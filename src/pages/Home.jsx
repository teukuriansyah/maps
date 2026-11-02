import { useRef, useEffect,useState } from 'react'
import { Geolocation } from '@capacitor/geolocation';
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css';

function Home() {
  const [dimension, setDimension] = useState("2d")
  const [zoom, setZoom] = useState(10.12)
  const [pitch, setPitch] = useState(0)
  const mapRef = useRef()
  const mapContainerRef = useRef()

  async function getLocation() {
    await Geolocation.requestPermissions();
    const coordinates = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    });

    return [coordinates.coords.longitude, coordinates.coords.latitude]
  }

  function changeDimension(d) {
    if(d == "2d") {
      setDimension("2d")
      setZoom(10.12)
      setPitch(0)
    }
    else if(d == "3d") {
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
        pitch: pitch
      });

      // Perbaikan di sini: gunakan mapRef.current
      new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .addTo(mapRef.current); 
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          initMap(longitude, latitude);
        },
        (error) => {
          alert("Location not found");
          // Opsional: berikan fallback jika izin lokasi ditolak
          initMap(106.827139, -6.175389);
        }
      );
    } else {
      initMap(106.827139, -6.175389);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [zoom, pitch]);  

  return (
    <div className="h-screen">
      <div className="fixed bg-white z-30 flex flex-col right-5 top-5 rounded justify-between">
        <button className={`${dimension == "2d" ? "bg-gray-200 rounded-t" : ""} font-medium text-xl text-gray-700 p-3 outline-0 cursor-pointer`} onClick={() => changeDimension("2d")}>2D</button>
        <button className={`${dimension == "3d" ? "bg-gray-200 rounded-b" : ""} font-medium text-xl text-gray-700 p-3 outline-0 cursor-pointer`} onClick={() => changeDimension("3d")}>3D</button>
      </div>
      <div id='map' ref={mapContainerRef} className="h-full" />
    </div>
  )
}

export default Home