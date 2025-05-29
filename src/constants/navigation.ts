export type NavigationItem = {
	label: string;
	path: string;
};

export const NAV_ITEMS: NavigationItem[] = [
	{
		label: "Home",
		path: "/",
	},
	{
		label: "Blog",
		path: "/blog",
	},
	{
		label: "Over Mij",
		path: "/about",
	},
	{
		label: "Contact",
		path: "/contact",
	},
	{
		label: "Log in",
		path: "/admin",
	},
];
