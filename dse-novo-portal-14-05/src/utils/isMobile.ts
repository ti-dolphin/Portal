var userAgent = typeof navigator === 'undefined' ? 'SSR' : navigator.userAgent;

export const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);