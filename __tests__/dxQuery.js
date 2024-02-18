const {DbModel} = require ('doix-db')
const {dxQuery} = require ('../lib/dxAdapter.js')
const Path = require ('path')
const src = Path.join (__dirname, 'data', 'root1')

class Job {

	constructor (model, loadOptions) {
	
		this.rq = {loadOptions}
	
		this.db = {dxQuery, model}
		
		this.db.job = this
	
	}

}

const q = (l, o) => {

	jest.resetModules ()
	
	const m = new DbModel ({src})	

	m.loadModules ()

	return new Job (m, l).db.dxQuery (o)

}

const pq = (l, o) => {

	return q (l, o).toParamsSql ()

}


test ('basic', () => {

	expect (pq (
		{}, 
		[['users']]
	)).toStrictEqual (['SELECT "users"."uuid" AS "uuid","users"."label" AS "label","users"."is_actual" AS "is_actual","users"."id_role" AS "id_role" FROM "users" AS "users"'])

})

test ('limit', () => {

	expect (q (
		{
			take: 50,
			skip: 0,
		}, 
		[['users']]
	).options).toStrictEqual ({limit: 50, offset: 0})

})

test ('sort', () => {

	expect (pq (
		{
			sort: [{selector: 'label', desc: false}]
		}, 
		[['users']]
	)).toStrictEqual (['SELECT "users"."uuid" AS "uuid","users"."label" AS "label","users"."is_actual" AS "is_actual","users"."id_role" AS "id_role" FROM "users" AS "users" ORDER BY "users"."label"'])

})

test ('like', () => {

	expect (pq (
		{
			filter: ['label', 'contains', 'admin']
		}, 
		[['users']]
	)).toStrictEqual (['%admin%', 'SELECT "users"."uuid" AS "uuid","users"."label" AS "label","users"."is_actual" AS "is_actual","users"."id_role" AS "id_role" FROM "users" AS "users" WHERE UPPER("users"."label") LIKE UPPER(?)'])

	expect (pq (
		{
			filter: ['label', 'startswith', 'admin']
		}, 
		[['users']]
	)).toStrictEqual (['admin%', 'SELECT "users"."uuid" AS "uuid","users"."label" AS "label","users"."is_actual" AS "is_actual","users"."id_role" AS "id_role" FROM "users" AS "users" WHERE UPPER("users"."label") LIKE UPPER(?)'])	

	expect (pq (
		{
			filter: ['label', 'endswith', 'admin']
		}, 
		[['users']]
	)).toStrictEqual (['%admin', 'SELECT "users"."uuid" AS "uuid","users"."label" AS "label","users"."is_actual" AS "is_actual","users"."id_role" AS "id_role" FROM "users" AS "users" WHERE UPPER("users"."label") LIKE UPPER(?)'])	

	expect (pq (
		{
			filter: ['label', 'notcontains', 'admin']
		}, 
		[['users']]
	)).toStrictEqual (['%admin%', 'SELECT "users"."uuid" AS "uuid","users"."label" AS "label","users"."is_actual" AS "is_actual","users"."id_role" AS "id_role" FROM "users" AS "users" WHERE UPPER("users"."label") NOT LIKE UPPER(?)'])

})

test ('and not', () => {

	const _ = q (
		{
			filter: [[['label', '<>', 'admin'], 'and', ['not', ['label', '=', 'user']]], 'and', ['not', ['note', '=', 'WANTED']]]
		}, 
		[['users', {filters: [['is_actual', '=', true]]}]]
	)

	expect (_.toParamsSql ()).toStrictEqual ([true, 'admin', 'user', 'SELECT "users"."uuid" AS "uuid","users"."label" AS "label","users"."is_actual" AS "is_actual","users"."id_role" AS "id_role" FROM "users" AS "users" WHERE "users"."is_actual" = ? AND (("users"."label" <> ?) AND (NOT ("users"."label" = ?)))'])

	expect (_.tables[0].unknownColumnComparisons).toStrictEqual ([['note', '=', 'WANTED']])

})

test ('or', () => {

	expect (pq (
		{
			filter: [['label', '=', 'admin'], 'or', ['label', '=', 'user']]
		}, 
		[['users', {filters: [['is_actual', '=', true]]}]]
	)).toStrictEqual ([true, 'admin', 'user', 'SELECT "users"."uuid" AS "uuid","users"."label" AS "label","users"."is_actual" AS "is_actual","users"."id_role" AS "id_role" FROM "users" AS "users" WHERE "users"."is_actual" = ? AND (("users"."label" = ?) OR ("users"."label" = ?))'])

	expect (pq (
		{
			filter: [['one', '=', '1'], 'or', ['two', '=', '2']]
		}, 
		[['users', {filters: [['is_actual', '=', true]]}]]
	)).toStrictEqual ([true, 'SELECT "users"."uuid" AS "uuid","users"."label" AS "label","users"."is_actual" AS "is_actual","users"."id_role" AS "id_role" FROM "users" AS "users" WHERE "users"."is_actual" = ?'])

})

