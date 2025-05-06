export function GET() {
  return new Response(
    JSON.stringify({ 
      status: "ok", 
      message: "Debug endpoint is working",
      timestamp: new Date().toISOString()
    }),
    {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      }
    }
  );
}
