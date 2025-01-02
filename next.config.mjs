/** @type {import('next').NextConfig} */
const nextConfig = {
  
    async headers() {
      return [
        {
          // Apply these headers to all routes
          source: "/(.*)",
          headers: [
            {
              key: "Cross-Origin-Opener-Policy",
              value: "same-origin allow-popups",
            },
          ],
        },
      ];
    },
  };
  
  export default nextConfig;