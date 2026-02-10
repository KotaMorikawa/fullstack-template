export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiRequest = {
	method: ApiMethod;
	path: string;
	headers?: Record<string, string>;
	body?: unknown;
};

export type ApiClientOptions = {
	baseUrl: string;
	fetcher: typeof fetch;
};

export function createApiClient(options: ApiClientOptions) {
	const request = async (input: ApiRequest): Promise<Response> => {
		const url = new URL(input.path, options.baseUrl).toString();
		const requestInit: RequestInit = {
			method: input.method,
			headers: {
				"Content-Type": "application/json",
				...input.headers,
			},
		};

		if (input.body !== undefined) {
			requestInit.body = JSON.stringify(input.body);
		}

		const response = await options.fetcher(url, requestInit);

		return response;
	};

	return { request };
}
