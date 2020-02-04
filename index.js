import ShuntingYard, {Operator} from "shunting-yard.js";

// Currently very dumb, only supports a single data source
export default function query(query, data)
{
	const tokens = tokenize(query);

	data = filter_cols(tokens['cols'], data);
	data = filter_cond(tokens['cond'], data);
	return data;
}

export function tokenize(query)
{
	// SELECT <cols> FROM <who cares> WHERE <condition> AND/OR <condition>
	let idx_select = query.search("SELECT ");
	let idx_select_end = idx_select + "SELECT ".length;
	let idx_from = query.search("FROM ");
	let idx_from_end = idx_from + "FROM ".length;
	let idx_where = query.search("WHERE ");
	let idx_where_end = idx_where + "WHERE ".length;

	if (idx_from === -1) {
		return {
			cols: query.slice(idx_select_end, idx_where).split(',').map(x => x.trim()),
			srcs: [],
			cond: query.slice(idx_where_end).trim(),
		}
	} else {
		return {
			cols: query.slice(idx_select_end, idx_from).split(',').map(x => x.trim()),
			srcs: query.slice(idx_from_end, idx_where).split(',').map(x => x.trim()),
			cond: query.slice(idx_where_end).trim(),
		}
	}

}

export function filter_cols(cols, data)
{
	// Handle '*' special case
	if (cols.includes('*')) { return data; }

	let output = []
	data.forEach(d => {
		let x = {};
		cols.forEach(col => x[col] = d[col]);
		output.push(x);
	});
	return output;
}

export function filter_cond(cond, data)
{
	// AND has greater precendence than OR
	const sy = new ShuntingYard();
	let i = 0;
	sy.addOperator('AND', new Operator('AND', 2, 'left', 2, (a, b) => a && b));
	sy.addOperator('OR', new Operator('OR', 1, 'left', 2, (a, b) => a || b));

	// Operators
	sy.addOperator(
		'=', new Operator('=', 0, 'left', 2, (a, b) => {
			if (Object.keys(data[i]).includes(a)) { return data[i][a] === b; }
			else { return a === b; }
		})
	);

	return data.filter( (d, i_local) => {i = i_local; return !!sy.resolve(cond);});
}