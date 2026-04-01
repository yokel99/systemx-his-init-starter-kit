import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { visualizer } from 'rollup-plugin-visualizer';

import Unocss from 'unocss/vite';
import { presetAttributify, presetIcons, presetWind3, transformerDirectives, transformerVariantGroup } from 'unocss';
// https://vitejs.dev/config/
export default defineConfig({
	resolve: {
		alias: {
			'~': resolve(__dirname, 'src'),
			process: 'process/browser',
			stream: 'stream-browserify',
			zlib: 'browserify-zlib',
			util: 'util',
		},
		extensions: ['.js', '.vue', '.json', '.ts', 'jsx'],
	},
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: `@use "~/styles/element/index.scss" as *;`,
				silenceDeprecations: ['legacy-js-api'],
			},
		},
	},
	optimizeDeps: {
		exclude: ['XLSX', 'docx', 'dompurify'],
	},
	plugins: [
		vue(),
		// Icons({
		//   // experimental
		//   autoInstall: true,
		// }),
		visualizer({ open: true }),
		vueJsx({
			// options are passed on to @vue/babel-plugin-jsx
		}),

		createSvgIconsPlugin({
			// Specify the icon folder to be cached
			iconDirs: [resolve(process.cwd(), 'src/icons/svg')],
			// Specify symbolId format
			symbolId: 'icon-[dir]-[name]',
		}),
		Components({
			// allow auto load markdown components under `./src/components/`
			extensions: ['vue', 'md'],
			// allow auto import and register components used in markdown
			include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
			resolvers: [
				ElementPlusResolver({
					importStyle: 'sass',
				}),
			],
			dts: 'src/components.d.ts',
		}),
		// https://github.com/antfu/unocss
		// see unocss.config.ts for config
		Unocss({
			presets: [
				presetWind3(),
				presetAttributify(),
				presetIcons({
					scale: 1.2,
					warn: true,
				}),
			],
			transformers: [transformerDirectives(), transformerVariantGroup()],
			safelist: ['mb-0.5', 'ml-0.3', 'mr-1', 'mb-1', 'mb-2', 'mt-3', 'ml-1', 'ml-2', 'text-3', 'text-4', 'text-5', 'text-6', 'text-7'],
		}),
	],
	build: {
		target: ['es2022', 'chrome100', 'safari15'],
		chunkSizeWarningLimit: 2000,
		//minify: false,
		// commonjsOptions: {
		//   exclude: [
		//     'dist/sdform.umd.js'
		//   ],
		//   include: []
		//   //requireReturnsDefault: true
		// },
		rollupOptions: {
			plugins: [],
			input: {
				main: resolve(__dirname, 'index.html'),
			},

			output: {
				manualChunks(id: string) {
					if (id.includes('node_modules')) {
						const parts = id.split('node_modules/')[1]?.split('/');

						if (!!parts && parts.length > 0 && !!parts[0]) {
							const pkg = parts[0].startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0];
							// แยกเฉพาะ lib ใหญ่ ๆ ที่มีผลจริง
							if (
								[
									// 'dayjs',
									'ace-builds',
									// 'axios',
									'xlsx',
									'chart.js',
									'pdfmake',
									'@vue-flow/core',
									'docx',
									// 'dompurify',
									// 'html-to-pdfmake',
									// 'json-editor-vue',
									// 'vuedraggable',
									// 'vue-simple-acl',
									'sass',
									'slugify',
									'fs-extra',
									'fast-glob',
									// 'dagre',
									// 'crypto-ts',
									'vanilla-jsoneditor',
									'highlight.js',
									// 'lodash',
								].includes(pkg)
							)
								return pkg;

							if (id.includes('element-plus')) return 'element-plus';

							if (pkg === 'vue' || pkg === 'vue-router' || pkg === 'pinia' || id.includes('vue')) return 'vue-core';
							//@tiptap
							if (pkg.search('@tiptap') !== -1) return 'tiptap';

							if (id.includes('ajv/dist')) {
								return 'ajv';
							}

							if (id.includes('codemirror')) {
								return 'codemirror';
							}

							if (id.includes('prosemirror')) {
								return 'prosemirror';
							}

							if (id.includes('apexcharts')) {
								return 'apexcharts';
							}

							if (id.includes('sd-render')) {
								return 'sd-render';
							}

							return 'vendor';
						}

						return;
					} else {
						if (id.includes('font/')) {
							return 'font';
						}

						if (id.includes('icons/') || id.includes('svg-icons-register')) {
							return 'icons';
						}

						// if (id.includes('user/')) {
						// 	return 'sd-user';
						// }

						if (
							id.includes('core/') ||
							id.includes('user/') ||
							id.includes('sdform/') ||
							id.includes('modules/') ||
							id.includes('custom-widget') ||
							id.includes('types') ||
							id.includes('config') ||
							id.includes('core') ||
							id.includes('routers') ||
							id.includes('stores') ||
							id.includes('utils') ||
							id.includes('layouts')
						) {
							return 'sd-core';
						}

						return;
					}
				},
			},
		},
		outDir: 'dist',
	},
});
