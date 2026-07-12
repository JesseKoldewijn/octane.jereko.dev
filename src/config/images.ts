export const avatarBanner = {
	src: '/images/avatar.webp',
	width: 400,
	height: 400,
} as const;

export const programmingBanner = {
	src: '/images/banner-programming.webp',
	width: 400,
	height: 400,
} as const;

export const themedAvatar = {
	dark: avatarBanner,
	light: avatarBanner,
} as const;

export const themedProgrammingBanner = {
	dark: programmingBanner,
	light: programmingBanner,
} as const;
