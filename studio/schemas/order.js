import { MdFoodBank, MdOutlineFastfood } from 'react-icons/md'

export default {
  title: 'Objednávky',
  name: 'order',
  type: 'document',
  icon: MdFoodBank,
  fields: [   
    {
      name: 'id',
      title: 'Objednávka:',
      type: 'string',
      readOnly: true,     
    },
    {
      name: 'note',
      title: 'Poznámka',
      type: 'string',
    },    
  ],
    /* initialValue: () => ({    
    releaseDate: (new Date()).toISOString()
  }) */
}
