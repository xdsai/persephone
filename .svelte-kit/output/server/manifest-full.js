export const manifest = {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["200.html","_redirects","assets/persephone-run.json","blog/images/portal.jpg","story.json"]),
	mimeTypes: {".html":"text/html",".json":"application/json",".jpg":"image/jpeg"},
	_: {
		client: {"start":{"file":"_app/immutable/entry/start.e0a85b2e.js","imports":["_app/immutable/entry/start.e0a85b2e.js","_app/immutable/chunks/index.0cd60f9d.js","_app/immutable/chunks/singletons.25e6d677.js"],"stylesheets":[],"fonts":[]},"app":{"file":"_app/immutable/entry/app.29fdbe0f.js","imports":["_app/immutable/entry/app.29fdbe0f.js","_app/immutable/chunks/index.0cd60f9d.js"],"stylesheets":[],"fonts":[]}},
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
