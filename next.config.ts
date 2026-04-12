/** @type {import('next').NextConfig} */
const dynamicOrigins = (process.env.NEXT_DEV_ORIGINS || "")
	.split(",")
	.map((o) => o.trim())
	.filter(Boolean);

const nextConfig = {
	allowedDevOrigins: [
		"http://localhost:3000",
		"http://127.0.0.1:3000",
		"http://clinica.iesgo.edu.br:9003",
		"https://clinica.iesgo.edu.br:9003",
		"http://72.60.142.42:9003/",
		"https://72.60.142.42:9003/",
		...dynamicOrigins,
	],
};

module.exports = nextConfig;
