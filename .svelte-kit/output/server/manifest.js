export const manifest = {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["200.html","blog/images/portal.jpg"]),
	mimeTypes: {".html":"text/html",".jpg":"image/jpeg"},
	_: {
		client: {"start":{"file":"_app/immutable/entry/start.d66a341e.js","imports":["_app/immutable/entry/start.d66a341e.js","_app/immutable/chunks/index.17bb44e0.js","_app/immutable/chunks/singletons.30ff4405.js"],"stylesheets":[],"fonts":[]},"app":{"file":"_app/immutable/entry/app.199debd9.js","imports":["_app/immutable/entry/app.199debd9.js","_app/immutable/chunks/index.17bb44e0.js"],"stylesheets":[],"fonts":[]}},
		nodes: [
			() => import('./nodes/0.js'),
			() => import('./nodes/1.js'),
			() => import('./nodes/2.js'),
			() => import('./nodes/3.js'),
			() => import('./nodes/4.js')
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0], errors: [1], leaf: 2 },
				endpoint: null
			},
			{
				id: "/blog",
				pattern: /^\/blog\/?$/,
				params: [],
				page: { layouts: [0], errors: [1], leaf: 3 },
				endpoint: null
			},
			{
				id: "/blog/[slug]",
				pattern: /^\/blog\/([^/]+?)\/?$/,
				params: [{"name":"slug","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0], errors: [1], leaf: 4 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		}
	}
};
