import mbxGeoCoding from "@mapbox/mapbox-sdk/services/geocoding";
import { envVariables } from "../config";

const geocodingClient = mbxGeoCoding({
  accessToken: envVariables.MAPBOX_ACCESS_KEY,
});

export const forwardGeocode = async (place) => {
  try {
    const res = await geocodingClient
      .forwardGeocode({
        query: place,
        limit: 5,
        types: ['district', 'place', 'region'],
        countries: ['in'],
        autocomplete: true,
      })
      .send();

    return res.body.features.map((f) => ({
      place_name: f.place_name,
      coordinates: f.center, // [longitude, latitude]
    }));
  } catch (err) {
    console.error("Mapbox error:", err);
    return [];
  }
};
