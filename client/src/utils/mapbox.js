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
        // types: ['district', 'place', 'region'],
        types: [
          "address",
          "poi",
          "neighborhood",
          "locality",
          "place",
          "district",
          "region",
        ],
        countries: ["in"],
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

export const reverseGeocode = async (coordinates) => {
  try {
    const res = await geocodingClient
      .reverseGeocode({
        query: coordinates,
        limit: 1,
        types: [
          "address",
          "poi",
          "neighborhood",
          "locality",
          "place",
          "district",
          "region",
        ],
        countries: ["in"],
      })
      .send();

    if (res.body.features.length > 0) {
      return {
        place_name: res.body.features[0].place_name,
        coordinates: res.body.features[0].center,
      };
    }
    return null;
  } catch (err) {
    console.error("Mapbox reverse geocoding error:", err);
    return null;
  }
};
