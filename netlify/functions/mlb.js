const MLB_ORIGIN = "https://statsapi.mlb.com";

exports.handler = async function handler(event) {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: { Allow: "GET" },
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  const endpoint = event.queryStringParameters?.endpoint || "";
  if (!endpoint.startsWith("/api/")) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "A valid MLB API endpoint is required." })
    };
  }

  try {
    const target = new URL(endpoint, MLB_ORIGIN);
    if (target.origin !== MLB_ORIGIN || !target.pathname.startsWith("/api/")) {
      throw new Error("Invalid endpoint");
    }

    const response = await fetch(target, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Baseball-Scorecard-Builder/7.0"
      }
    });
    const body = await response.text();

    return {
      statusCode: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=60, s-maxage=60",
        "Access-Control-Allow-Origin": "*"
      },
      body
    };
  } catch (error) {
    return {
      statusCode: 502,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Unable to retrieve baseball schedule data.", detail: error.message })
    };
  }
};
