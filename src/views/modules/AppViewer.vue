<template>
	<SdAppViewerAsync v-if="!!appId" :custom-components="components" :user-state="userState" />
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent, shallowRef } from 'vue';
import { useRoute } from 'vue-router';
import CustomComponents from '~/views/custom-widget/index';
import { useConnectStateStore } from '~/stores/ConnectState';
// import { SdAppViewer } from 'sd-render';
import LoadingContent from '~/components/layouts/LoadingContent.vue';
import EmptyContent from '~/components/layouts/EmptyContent.vue';

const SdAppViewerAsync = defineAsyncComponent({
	loader: () => import('sd-render').then((m) => m.SdAppViewer),
	loadingComponent: LoadingContent,
	delay: 100,
	errorComponent: EmptyContent,
	timeout: 10000,
});

export default defineComponent({
	name: 'AppViewer',
	components: { SdAppViewerAsync, LoadingContent, EmptyContent },
	props: {},
	data() {
		return {
			userState: useConnectStateStore() as any,
			route: useRoute(),
			appId: '' as any,
			tabId: '' as any,
		};
	},
	computed: {},
	created() {},
	mounted() {
		this.appId = !!this.route.query.appId ? this.route.query.appId : '';
		this.tabId = !!this.route.query.tab ? this.route.query.tab : '';
	},
	unmounted() {},
	setup(props, ctx) {
		const components = shallowRef(CustomComponents.component());

		return { components };
	},
	methods: {},
});
</script>

<style lang="scss">
.app_content {
	margin-bottom: 15px;
}
.app_title {
	.el-avatar {
		background-color: transparent;
	}
}
</style>
