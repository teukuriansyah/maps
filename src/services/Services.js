import { sessionToken } from "../utils/SessionToken.js"
import axios from "axios"

const api = axios.create({
  baseURL:"https://api.mapbox.com/search/searchbox/v1"
})

export async function getSearchList(q,token) {
  const { data } = await api.get("/suggest",{
    params:{
      q:q,
      session_token:sessionToken(),
      access_token:token,
      country:"id"
    }
  })
  return data.suggestions
}

export async function getPlace(id,token) {
  const { data } = await api.get(`/retrieve/${id}`,{
    params:{
      session_token:sessionToken(),
      access_token:token,
    }
  })
  const lng = data.features[0].geometry.coordinates[0]
  const lat = data.features[0].geometry.coordinates[1]
  return [lng,lat]
}