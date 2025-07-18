export default {
  async fetch(request, env, ctx) {
    // Check for required Dune secrets
    if (!env.DUNE_API_KEY || !env.DUNE_QUERY_ID) {
      return new Response(
        "DUNE_API_KEY or DUNE_QUERY_ID secret not found.",
        { status: 500 }
      );
    }

    // Check cache first
    let cachedData;
    try {
      cachedData = await env.SEEDAO_TOKEN_HOLDERS_KV.get(
        "token_holders_data"
      );
    } catch (error) {
      console.log("KV not available, skipping cache check");
    }

    if (cachedData) {
      return new Response(cachedData, {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300", // Cache for 5 minutes
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    try {
      const response = await fetch(
        `https://api.dune.com/api/v1/query/${env.DUNE_QUERY_ID}/results`,
        {
          method: "GET",
          headers: {
            "X-Dune-API-Key": env.DUNE_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return new Response(
          `Error fetching from Dune: ${errorText}`,
          { status: response.status }
        );
      }

      const results = await response.json();
      const data = results.result?.rows?.[0];

      if (!data) {
        return new Response(
          "Could not extract holder counts from Dune response.",
          { status: 500 }
        );
      }

      // Cache the data for 5 minutes
      try {
        await env.SEEDAO_TOKEN_HOLDERS_KV.put(
          "token_holders_data",
          JSON.stringify({
            sns: {
              address:
                "0x5f3bd0ce4445e96f2d7dcc4bba883378ead8e10f",
              holders: data.sns_holders,
            },
            seed: {
              address:
                "0x30093266E34a816a53e302bE3e59a93B52792FD4",
              holders: data.seed_holders,
            },
            scr: {
              address:
                "0x30093266E34a816a53e302bE3e59a93B52792FD4",
              holders: data.scr_holders,
            },
          }),
          {
            expirationTtl: 43200, // Cache for 12 hours
          }
        );
      } catch (error) {
        console.log(
          "KV not available, skipping cache update"
        );
      }

      return new Response(
        JSON.stringify({
          sns: {
            address:
              "0x5f3bd0ce4445e96f2d7dcc4bba883378ead8e10f",
            holders: data.sns_holders,
          },
          seed: {
            address:
              "0x30093266E34a816a53e302bE3e59a93B52792FD4",
            holders: data.seed_holders,
          },
          scr: {
            address:
              "0x30093266E34a816a53e302bE3e59a93B52792FD4",
            holders: data.scr_holders,
          },
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    } catch (error) {
      return new Response(
        `Error fetching token data: ${error.message}`,
        { status: 500 }
      );
    }
  },
};
