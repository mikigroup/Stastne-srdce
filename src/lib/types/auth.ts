export type AuthUser = {
	id: string;
	email?: string;
};

export type AuthSession = {
	user: AuthUser;
};

export type AuthResult = {
	session: AuthSession | null;
	user: AuthUser | null;
};
