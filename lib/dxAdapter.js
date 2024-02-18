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

	switch (op) {

		case 'and':
		case  'or':

			const a = [k, v].map (i => toQP (i, table)).filter (i => i !== null)

			switch (a.length) {

				case 0: return null

				case 1: return a [0]

				default: return new (BIN_OP.get (op)) (a)

			}
		
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

			return table.createColumnComparison (k, op, v)
			
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

		const qp = toQP (filter, root)

		if (qp !== null) root.filters.push (qp)

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