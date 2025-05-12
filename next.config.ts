/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://192.168.15.10:3000", // coloque aqui o IP que você usa para acessar
  ],
};

module.exports = nextConfig;
