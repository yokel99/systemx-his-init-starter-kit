import SdGrid from '~/components/input3/SdGrid.vue'; import SdGrid from '~/components/input3/SdGrid.vue';

<template>
	<div class="mb-5">
		<SdGrid
			ref="refGrid"
			:data-provider="sdProvider"
			add-btn-label="Add User"
			icon-name="el-user"
			title-name="User Manage"
			popup-name="User Form"
			popup-width="50%"
			:user-state="userState"
			:update-before="handleUpdate"
			:insert-before="handleInsert"
			:view-before="handleView"
			:after-delete="afterDelete">
			<el-table-column fixed label="" width="180" align="center">
				<template #default="scope">
					<el-button
						v-if="!!scope.row['_id']"
						plain
						:type="scope.row.flags == 1 ? 'danger' : 'success'"
						size="small"
						title="Active"
						@click.prevent="handleActive(scope.row, scope.$index)">
						{{ scope.row.flags == 1 ? 'Block' : 'Active' }}
					</el-button>

					<el-button v-if="!!scope.row['_id']" plain :type="'warning'" size="small" title="Disable 2FA" @click.prevent="handle2Fa(scope.row, scope.$index)"> Disable 2FA </el-button>
				</template>
			</el-table-column>
			<!-- <el-table-column type="index" align="center" :index="(index: number) => index + Number(refGrid.rowStartLabel)" /> -->
			<SdGridColumnIndex :ref-sdgrid="refGrid" fixed />
			<el-table-column prop="username" label="UserName" width="200" fixed sortable />
			<el-table-column prop="email" label="E-Mail" min-width="200" fixed sortable />
			<el-table-column prop="profile.fname" label="First Name" width="180" sortable />
			<el-table-column prop="profile.lname" label="Last Name" width="180" sortable />

			<el-table-column
				prop="flags"
				column-key="flags"
				label="Active"
				width="100"
				align="center"
				:filters="[
					{ text: 'Active', value: '1' },
					{ text: 'Block', value: '0' },
				]">
				<template #default="scope">
					{{ scope.row.flags == 1 ? 'Active' : 'Block' }}
				</template>
			</el-table-column>
			<SdGridColumnDate />
			<SdGridColumnBy />
			<el-table-column label="System Roles" align="center">
				<el-table-column v-for="role in userState.systemRoles" :label="role" width="90" align="center">
					<template #default="scope">
						<template v-if="!!scope.row.roles && scope.row.roles.includes(role)">
							<el-button type="success" icon="Select" circle plain size="small" @click="removeRole(role, scope.row.roles, scope.row)"></el-button>
						</template>
						<template v-else>
							<el-button icon="CloseBold" circle plain size="small" @click="addRole(role, scope.row.roles, scope.row)"></el-button>
						</template>
					</template>
				</el-table-column>
			</el-table-column>

			<el-table-column label="Roles" align="center">
				<el-table-column v-for="roleApp in options.rolesList" :label="roleApp" width="110" align="center">
					<template #default="scope">
						<template v-if="!!scope.row.roles && scope.row.roles.includes(roleApp)">
							<el-button type="success" icon="Select" circle plain size="small" @click="removeRole(roleApp, scope.row.roles, scope.row)"></el-button>
						</template>
						<template v-else>
							<el-button icon="CloseBold" circle plain size="small" @click="addRole(roleApp, scope.row.roles, scope.row)"></el-button>
						</template>
					</template>
				</el-table-column>
			</el-table-column>

			<template #popup>
				<UserForm :user-model="options.userModel" :is-insert="options.isInsert" :is-register="false" :readonly="options.readonly" :disable-update-user="true" :after-save="afterSave">
					<template #action>
						<el-button
							@click="
								() => {
									if (!!refGrid) {
										refGrid.showPopupFlag = false;
									}
								}
							"
							>Cancel</el-button
						>
					</template>
				</UserForm>
			</template>
		</SdGrid>
	</div>
</template>

<script lang="ts" setup>
import { reactive, onMounted, ref } from 'vue';
import { deepClone } from '~/utils/Util';
import { ProviderType, type SdProvider } from '~/types/SdGridType';
import UserForm from './UserForm.vue';
import { useAppStateStore } from '~/stores/AppState';
import { useConnectStateStore } from '~/stores/ConnectState';
import { SdGrid, SdGridColumnBy, SdGridColumnDate, SdGridColumnIndex } from 'sd-render';

type OptionUser = {
	scrollerHeight: number;
	index: number;
	isInsert: boolean;
	readonly: boolean;
	userModel: any;
	rolesList: string[];
	popupWidth: string;
};

const userState = useConnectStateStore();
const appState = useAppStateStore();

const options = reactive<OptionUser>({
	scrollerHeight: 0,
	index: 0,
	isInsert: true,
	readonly: false,
	userModel: {},
	rolesList: [],
	popupWidth: '50%',
});

const refGrid = ref();

const sdProvider = reactive<SdProvider>({
	providerId: 'getuser-all',
	providerType: ProviderType.SYS,
	options: {
		limit: 30,
		search: ['username', 'email', `profile.fname`, `profile.lname`],
	},
});

function handleInsert(rowData: any, index: number) {
	options.isInsert = true;
	options.readonly = false;
	options.index = index;
	options.userModel = {
		username: null,
		password: null,
		confirmPassword: null,
		email: null,
		profile: {
			fname: null,
			lname: null,
			tel: null,
			avatar: [],
			position: { code: '00', name: 'none' },
			certificate_code: '00',
			person_code: '00',
		},
	};
}

function handleUpdate(rowData: any, index: number) {
	options.isInsert = false;
	options.readonly = false;
	options.index = index;
	options.userModel = deepClone(rowData);
	options.userModel.user_id = rowData._id;
}

function handleView(rowData: any, index: number) {
	options.isInsert = false;
	options.readonly = true;
	options.index = index;
	options.userModel = deepClone(rowData);
}

function handleActive(row: any, index: number) {
	const value = row.flags == 1 ? 0 : 1;
	refGrid.value?.handleEditField(row, index, { flags: value }, (rowData: any) => {
		rowData.flags = value;
	});
}

function handle2Fa(row: any, index: number) {
	refGrid.value?.handleEditField(row, index, { two_factor_enabled: false }, (rowData: any) => {
		rowData.two_factor_enabled = false;
	});
}

function afterSave(formData: any) {
	if (!!refGrid.value) {
		refGrid.value.showPopupFlag = false;
		if (options.isInsert) {
			refGrid.value.reloadData();
		} else {
			refGrid.value.rawData[options.index] = deepClone(formData);
		}
	}
}

function afterDelete(rowData: any, index: number) {
	if (!!rowData.profile.avatar) {
		userState.deleteAvatar(rowData.profile.avatar);
	}
}

function addRole(role: string, currentRoles: string[], row: any) {
	currentRoles.push(role);
	row.roles = currentRoles;

	const updateData = deepClone(row);
	updateData.user_id = updateData._id;

	userState.updateRoles(updateData, undefined, () => {
		const nowRoles = currentRoles.filter(function (value, index, arr) {
			return value !== role;
		});
		row.roles = nowRoles;
	});
}

function removeRole(role: string, currentRoles: string[], row: any) {
	const nowRoles = currentRoles.filter(function (value, index, arr) {
		return value !== role;
	});
	row.roles = nowRoles;

	const updateData = deepClone(row);
	updateData.user_id = updateData._id;

	userState.updateRoles(updateData, undefined, () => {
		currentRoles.push(role);
		row.roles = currentRoles;
	});
}

onMounted(() => {
	options.rolesList = deepClone(appState.roles);
});
</script>

<style lang="scss" scoped>
.page-hide-back.el-page-header {
	:deep(.el-page-header__header) {
		.el-page-header__back {
			display: none;
		}

		.el-divider {
			display: none;
		}
	}
}
</style>
