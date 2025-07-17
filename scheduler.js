export default {
  async fetch(request, env, ctx) {
    if (!env.DUNE_API_KEY || !env.DUNE_QUERY_ID) {
      return new Response('DUNE_API_KEY or DUNE_QUERY_ID secret not found.', { status: 500 });
    }

    try {
      const executeResponse = await fetch(`https://api.dune.com/api/v1/query/${env.DUNE_QUERY_ID}/execute`, {
        method: 'POST',
        headers: {
          'X-Dune-API-Key': env.DUNE_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query_parameters: {
            sns_address: '0x5f3bd0ce4445e96f2d7dcc4bba883378ead8e10f',
            seed_address: '0x30093266E34a816a53e302bE3e59a93B52792FD4',
            scr_address: '0x30093266E34a816a53e302bE3e59a93B52792FD4'
          }
        })
      });

      if (!executeResponse.ok) {
        const errorText = await executeResponse.text();
        return new Response(`Error executing Dune query: ${errorText}`, { status: executeResponse.status });
      }

      const executeResult = await executeResponse.json();
      const execution_id = executeResult.execution_id;

      return new Response('Successfully triggered Dune query execution', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });

    } catch (error) {
      return new Response(`Error refreshing Dune query: ${error.message}`, { status: 500 });
    }
  },
};
