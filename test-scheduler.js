export default {
  async fetch(request, env, ctx) {
    // Create a mock request since we're testing the scheduler
    const mockRequest = new Request('http://localhost/', {
      method: 'GET'
    });

    // Import the scheduler
    const scheduler = await import('./scheduler.js');
    
    // Call the scheduler's fetch function
    const response = await scheduler.default.fetch(mockRequest, env, ctx);
    
    // Return the scheduler's response
    return response;
  }
};
