import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/tour", destination: "/app/patch", permanent: false },
      { source: "/tour/patch", destination: "/app/patch", permanent: false },
      { source: "/tour/minor", destination: "/app/minor", permanent: false },
      { source: "/tour/major", destination: "/app/major", permanent: false },
      { source: "/tour/blog", destination: "/app/blog", permanent: false },
      { source: "/tour/blog/new", destination: "/app/blog/new", permanent: false },
      {
        source: "/tour/blog/:postId/edit",
        destination: "/app/blog/:postId/edit",
        permanent: false,
      },
      { source: "/tour/blog/:postId", destination: "/p/:postId", permanent: false },
      { source: "/tour/:path*", destination: "/app/patch", permanent: false },
      { source: "/blog", destination: "/app/blog", permanent: false },
      { source: "/blog/:path*", destination: "/app/blog", permanent: false },
    ];
  },
};

export default nextConfig;
