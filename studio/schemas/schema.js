import createSchema from 'part:@sanity/base/schema-creator'
import schemaTypes from 'all:part:@sanity/base/schema-type'
import aktuality from './aktuality' 
import menu from './menu'
import order from './order'

// Then we give our schema to the builder and provide the result to Sanity
export default createSchema({
  name: 'default',
  types: schemaTypes.concat([
    menu,
    aktuality,
    order,
  ]),
})
