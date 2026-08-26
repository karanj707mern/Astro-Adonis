declare module 'astro:env/client' {
	export const PUBLIC_API_BASE_URL: string;	
	export const PUBLIC_SITE_URL: string;	
	export const PUBLIC_CLOUDINARY_CLOUD_NAME: string | undefined;	
	export const PUBLIC_GOOGLE_CLIENT_ID: string | undefined;	
}declare module 'astro:env/server' {
	export const PUBLIC_LOG_LEVEL: string | undefined;	
	export const PORT: number;	
}