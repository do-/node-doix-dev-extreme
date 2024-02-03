const {dxQuery} = require ('../lib/dxAdapter.js')

class Job {

	constructor (loadOptions) {
	
		this.rq = {loadOptions}
	
		this.db = {
		
			dxQuery,
		
			model: {
				
				createQuery: (from, options) => ({from, options})
		
			}
		
		}
		
		this.db.job = this
	
	}

}

test ('basic', () => {

	expect (new Job ({
		}).db.dxQuery ([['users']])
	).toStrictEqual ({
		from: [['users']], 
		options: {}
	})

	expect (new Job ({
			take: 50,
			skip: 0,		
		}).db.dxQuery ([['users']])
	).toStrictEqual ({
		from: [['users']], 
		options: {offset: 0, limit: 50}
	})

})

test ('sort', () => {

	expect (new Job ({
			take: 50,
			skip: 0,		
			sort: [{selector: 'label', desc: false}]
		}).db.dxQuery ([['users']])
	).toStrictEqual ({
		from: [['users']], 
		options: {offset: 0, limit: 50, order: [['label', false]]}
	})

})

test ('like', () => {

	expect (new Job ({
			take: 50,
			skip: 0,		
			filter: ['label', 'contains', 'admin']
		}).db.dxQuery ([['users']])
	).toStrictEqual ({
		from: [['users', {filters: [['label', 'ILIKE', '%admin%']]}]],
		options: {offset: 0, limit: 50}
	})

	expect (new Job ({
		take: 50,
		skip: 0,		
		filter: ['label', 'startswith', 'admin']
	}).db.dxQuery ([['users']])
	).toStrictEqual ({
		from: [['users', {filters: [['label', 'ILIKE', 'admin%']]}]],
		options: {offset: 0, limit: 50}
	})

	expect (new Job ({
		take: 50,
		skip: 0,		
		filter: ['label', 'endswith', 'admin']
	}).db.dxQuery ([['users']])
	).toStrictEqual ({
		from: [['users', {filters: [['label', 'ILIKE', '%admin']]}]],
		options: {offset: 0, limit: 50}
	})

})

test ('search', () => {

	expect (new Job ({
			take: 50,
			skip: 0,		
			filter: ['label', '=', 'admin']
		}).db.dxQuery ([['users']])
	).toStrictEqual ({
		from: [['users', {filters: [['label', '=', 'admin']]}]], 
		options: {offset: 0, limit: 50}
	})

	expect (new Job ({
			take: 50,
			skip: 0,		
			filter: [['label', '=', 'admin'], 'and', ['is_deleted', '=', '0']]
		}).db.dxQuery ([['users']])
	).toStrictEqual ({
		from: [['users', {filters: [['label', '=', 'admin'], ['is_deleted', '=', '0']]}]], 
		options: {offset: 0, limit: 50}
	})

	expect (new Job ({
			take: 50,
			skip: 0,		
			filter: ['label', '=', 'admin']
		}).db.dxQuery ([['users', {as: 'u'}]])
	).toStrictEqual ({
		from: [['users', {as: 'u', filters: [['label', '=', 'admin']]}]], 
		options: {offset: 0, limit: 50}
	})
	
	expect (new Job ({
			take: 50,
			skip: 0,		
			filter: ['label', '=', 'admin']
		}).db.dxQuery ([['users', {as: 'u', filters: [['dt_fired', 'IS NULL']]}]])
	).toStrictEqual ({
		from: [['users', {as: 'u', filters: [['dt_fired', 'IS NULL'], ['label', '=', 'admin']]}]], 
		options: {offset: 0, limit: 50}
	})

})

