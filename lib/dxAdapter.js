const {DbQueryTableColumnComparison, DbQueryAnd, DbQueryOr, DbQueryNot} = require ('doix-db')

const toQP = (filter, table) => {

	let [k, op, v] = filter

	if (k === 'not') return new DbQueryNot (toQP (op, table))

	switch (op) {

		case 'and': return new DbQueryAnd ([toQP (k, table), toQP (v, table)])
		
		case  'or': return new DbQueryOr  ([toQP (k, table), toQP (v, table)])
		
		default:

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

			return new DbQueryTableColumnComparison (table, k, op, v)

	}

}

function dxQuery (from, options = {}) {

	const {rq} = this.job, {filter, sort, take, skip} = rq.loadOptions

	if (sort != null) options.order = sort.map (o => [o.selector, o.desc])

	if (take != null) options.limit  = take

	if (skip != null) options.offset = skip

	const query = this.model.createQuery (from, options)

	if (filter != null) {

		const root = query.tables [0]

		root.filters.push (toQP (filter, root))

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