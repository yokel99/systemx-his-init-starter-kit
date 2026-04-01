<template>
	<SdAppListAsync :search-enable="true" :limit="120" title="Apps" :user-state="userState" />
</template>

<script lang="ts" setup>
import { useConnectStateStore } from '~/stores/ConnectState';
// import { SdAppList } from 'sd-render';
import { defineAsyncComponent } from 'vue';
import LoadingContent from '~/components/layouts/LoadingContent.vue';
import EmptyContent from '~/components/layouts/EmptyContent.vue';

const SdAppListAsync = defineAsyncComponent({
	loader: () => import('sd-render').then((m) => m.SdAppList),
	loadingComponent: LoadingContent,
	delay: 100,
	errorComponent: EmptyContent,
	timeout: 10000,
});

const userState: any = useConnectStateStore();
</script>

<style lang="scss">
.listicon-item {
	.el-avatar {
		background-color: transparent;
	}
}
</style>
