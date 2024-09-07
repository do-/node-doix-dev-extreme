const {DbQueryAnd, DbQueryOr, DbQueryNot} = require ('doix-db')

const BIN_OP = new Map ([
	['and', DbQueryAnd],
	['or',  DbQueryOr],
])

const toQP = (filter, table) => {

	let [k, op, v] = filter

	if (k === 'not') {

		const qp = toQP (op, table)

		return qp === null ? null : new DbQueryNot (qp)

	}

	if (BIN_OP.has (op)) return BIN_OP.get (op).from ([k, v].map (i => toQP (i, table)))

	switch (op) {

		case "startswith":
			op = 'ILIKE'
			v += '%'
			break
	
		case "endswith":
			op = 'ILIKE'
			v = '%' + v
			break
	
		case "contains":
			op = 'ILIKE'
			v = '%' + v + '%'
			break
	
		case "notcontains":
			op = 'NOT ILIKE'
			v = '%' + v + '%'
			break
	
	}

	return table.createColumnComparison (k, op, v)
			
}

function dxQuery (from, options = {}) {

	const {request} = this.job, {filter, sort, take, skip} = request.loadOptions

	if (sort != null) options.order = sort.map (o => [o.selector, o.desc])

	if (take != null) options.limit  = take

	if (skip != null) options.offset = skip

	const query = this.model.createQuery (from, options)

	if (filter != null) {

		const {root} = query

		root.addFilter (toQP (filter, root))

	}

	return query

}

const plugInto = (db, name = 'dxQuery') => {

	db [name] = dxQuery
	
	db.shared.add (name)

}

module.exports = {
	dxQuery,
	plugInto,
}