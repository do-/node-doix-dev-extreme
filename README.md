![workflow](https://github.com/do-/node-doix-devextreme/actions/workflows/main.yml/badge.svg)
![Jest coverage](./badges/coverage-jest%20coverage.svg)

`doix-devextreme` is a [DevExtreme](https://www.devexpress.com) adapter for the [doix](https://github.com/do-/node-doix) server platform.

As of this writing, it contains only a basic a translator of [AJAX requests](https://js.devexpress.com/jQuery/Documentation/ApiReference/Data_Layer/CustomStore/LoadOptions/) coming from `dxDataGrid` into [DbQuery](https://github.com/do-/node-doix-db/wiki/DbQuery) instances.

# Installation
```
npm install doix-devextreme
```

# Initialization
`doix-devextreme` is a plug in for database clients, such as [DbClientPg](https://github.com/do-/node-doix-db-postgresql/wiki/DbClientPg). It can be attached to any database connection pool by calling the `plugInto` method:

```js
const {DbPoolPg}   = require ('doix-db-postgresql')
const dx = require ('doix-devextreme')

const db = new DbPoolPg ({
  db: conf.db,
  logger: createLogger (conf, 'db'),
})

dx.plugInto (db)
```

After that, each `db` instance injected into a [Job](https://github.com/do-/node-doix/wiki/Job) will have the `dxQuery` method described in the next section.

# Using in application code
With `doix-devextreme` plugged in, the `db` resource provides the `dxQuery` method having the same parameters as [DbModel.createQuery](https://github.com/do-/node-doix-db/wiki/DbModel#createquery):

```js
select_users:    
  async function () {
    const {db} = this
    const query = db.dxQuery ([['users']], {order: ['label']})
    const list = await db.getArray (query)
    return {
      all: list, 
      cnt: list [Symbol.for ('count')], 
      portion: query.options.limit
    }
  }
```

In fact, this is the `db.model.createQuery` call, but with some additions from `this.request.loadOptions`:
* the `limit` and `offset` options are overridden with `take` and `skip` respectively;
* the `order` list is replaced with the translated `sort`, if any (so the `order` passed in argument acts as a default value);
* the 1st query table `filter` option is appended with the translated `filter`.

# Limitations

To date, `IS NULL` predicates are never generated.
