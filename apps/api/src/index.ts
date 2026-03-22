export interface Env {
    one_technology_erp_db: D1Database;
    ERP_CACHE: KVNamespace;
    one_technology_erp_files: R2Bucket;
  }
  
  export default {
    async fetch(request: Request, env: Env): Promise<Response> {
      const url = new URL(request.url);
  
      if (url.pathname === "/") {
        return new Response("One Technology ERP API is running.", {
          headers: { "content-type": "text/plain; charset=utf-8" },
        });
      }
  
      if (url.pathname === "/health") {
        return Response.json({
          ok: true,
          service: "one-technology-erp-api",
        });
      }
  
      if (url.pathname === "/debug/bindings") {
        return Response.json({
          hasD1: !!env.one_technology_erp_db,
          hasKV: !!env.ERP_CACHE,
          hasR2: !!env.one_technology_erp_files,
        });
      }
  
      return new Response("Not Found", {
        status: 404,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    },
  };