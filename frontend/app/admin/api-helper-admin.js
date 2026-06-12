import axios from "axios";
import BASE_API_URL from "@/api-config";

export async function genericPostApi(endpoint, params) {
  console.log("apar", params)
  try {
    const { data } = await axios.post(`${BASE_API_URL}${endpoint}`, params, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.log("Getting error in Post request", error);
    if (error.response) {
      return error.response.data;
    }
    return { "success": false, "message": error, "data": null }
  }
}

export async function genericGetApi(endpoint, params) {
  try {
    const { data } = await axios.get(`${BASE_API_URL}${endpoint}`, {
      params: params,
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.log("Getting error in Get request");
    if (error.response) {
      return error.response.data;
    }
    return { "success": false, "message": error, "data": null }
  }
}

export async function genericDeleteApi(endpoint, params) {
  try {
    const { data } = await axios.delete(`${BASE_API_URL}${endpoint}`, {
      data: params,
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.log("Getting error in Delete request", error);
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: error, data: null };
  }
}
