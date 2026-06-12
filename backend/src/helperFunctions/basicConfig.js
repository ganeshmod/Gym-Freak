const isProduction = process.env.NODE_ENV === "production";

// Set base URL depending on environment
const BASE_API_URL = isProduction
    ? "https://www.gymfreak.store"
    : "http://localhost:3000";

export default BASE_API_URL;
