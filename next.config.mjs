/** @type {import('next').NextConfig} */
const nextConfig = {
    rewrites: async () => {
        return [
          {
            source: "/api/py/:path*",
            destination:
              process.env.NODE_ENV === "development"
                ? "http://127.0.0.1:8000/backend/py/:path*"
                : "/backend/",
          },
        ]
    },
};

export default nextConfig;
// export default {
//     output: 'export',         // Enable static export mode
//   };
  