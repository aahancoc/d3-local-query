import {tokenize, filter_cols, filter_cond} from "./src/main.js"
export default function local_query(query, data)
{
	const tokens = tokenize(query);

	data = filter_cols(tokens['cols'], data);
	data = filter_cond(tokens['cond'], data);
	return data;
}
