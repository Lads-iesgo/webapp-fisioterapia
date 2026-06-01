/** @type {import('next').NextConfig} */
const dynamicOrigins = (process.env.NEXT_DEV_ORIGINS || "")
	.split(",")
	.map((o) => o.trim())
	.filter(Boolean);

const nextConfig = {
	allowedDevOrigins: ["*", ...dynamicOrigins],
	turbopack: {
		root: __dirname,
	},
};

module.exports = nextConfig;
