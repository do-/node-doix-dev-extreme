const {plugInto, dxQuery} = require ('../lib/dxAdapter.js')

test ('basic', () => {

	const pool = {shared: new Set ()}
	
	plugInto (pool)
	
	expect (pool.dxQuery).toBe (dxQuery)
	expect (pool.shared.has ('dxQuery')).toBe (true)

})