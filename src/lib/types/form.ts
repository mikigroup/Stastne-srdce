export interface FormErrors {
	email?: string;
	tel?: string;
	name?: string;
	content?: string; // přejmenováno z message
	"g-recaptcha-response"?: string;
}

export interface FormStatus {
	// přejmenováno z FormMessage
	success: boolean;
	display: string;
}

export interface FormData {
	success?: boolean;
	errors?: FormErrors;
	status?: FormStatus; // přejmenováno z message
	email?: string;
	tel?: string;
	name?: string;
	content?: string; // přejmenováno z message
}
