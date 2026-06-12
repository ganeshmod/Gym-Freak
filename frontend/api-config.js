const isProduction = process.env.NODE_ENV === "production";

// Set base URL depending on environment
const BASE_API_URL = isProduction
    ? "https://api.gymfreak.store"
    : "http://localhost:8080";

export default BASE_API_URL;
