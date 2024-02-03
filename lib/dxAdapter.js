const addFilter = (list, filter) => {

	if (filter [1] === 'and') {

		list.push (filter [0])

		addFilter (list, filter [2])

	}
	else {

		switch (filter [1]) {

			case "startswith":
				filter [1] = 'ILIKE'
				filter [2] += '%'
				break

			case "endswith":
				filter [1] = 'ILIKE'
				filter [2] = '%' + filter [2]
				break

			case "contains":
				filter [1] = 'ILIKE'
				filter [2] = '%' + filter [2] + '%'
				break

		}

		list.push (filter)

	}

}

const setSearch = (from, filter) => {

	const part = from [0]
	
	if (part.length === 1) part.push ({})
	
	const options = part [1]
	
	if (!('filters' in options)) options.filters = []

	addFilter (options.filters, filter)

}

function dxQuery (from, options = {}) {

	const {rq} = this.job, {filter, sort, take, skip} = rq.loadOptions

	if (filter != null) setSearch (from, filter)

	if (sort != null) options.order = sort.map (o => [o.selector, o.desc])

	if (take != null) options.limit  = take

	if (skip != null) options.offset = skip

	const query = this.model.createQuery (from, options)

	return query

}

const plugInto = (db, name = 'dxQuery') => {

	db [name] = dxQuery
	
	db.shared.add (name)

}

module.exports = {
	addFilter,
	setSearch,
	dxQuery,
	plugInto,
}