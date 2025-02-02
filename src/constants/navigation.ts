export type NavigationItem = {
    label: string;
    path: string;
};

export const NAV_ITEMS: NavigationItem[] = [
    {
        label: 'Home',
        path: '/',
    },
    {
        label: 'Blog',
        path: '/blog',
    },
    {
        label: 'About',
        path: '/about',
    },
    {
        label: 'Contact',
        path: '/contact',
    },
];