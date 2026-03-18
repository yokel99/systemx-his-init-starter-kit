import { type UploadUserFile } from 'element-plus';

export interface SdUserLogin {
	user_id: string;
	username: string;
	fname: string;
	lname: string;
	email: string;
	token: string;
	csrfToken: string;
	tel: string;
	avatar: Array<any>;
	position?: { code: string; name: string };
	certificate_code?: string;
	person_code?: string;
	roles: string[];
	notify_last_at?: string;
	site: { code: string; name: string };
	unit: { code: string; name: string };
	connectInfo?: { license_token: string; register_id: string };
	two_factor_enabled?: boolean;
}

export interface SdUserModel {
	user_id: string;
	username: string;
	password?: string;
	confirmPassword?: string;
	email: string;
	profile: {
		fname: string;
		lname: string;
		position?: { code: string; name: string };
		certificate_code?: string;
		person_code?: string;
		tel: string;
		avatar: UploadUserFile[];
	};
	notify_last_at?: string;
	roles?: string[];
	site?: { code: string; name: string };
	unit?: { code: string; name: string };
}

export interface UserState {
	user: SdUserLogin;
	host: string;
}
