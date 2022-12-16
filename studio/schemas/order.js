import { MdFoodBank, MdOutlineFastfood } from 'react-icons/md'

export default {
  title: 'Objednávky',
  name: 'order',
  type: 'document',
  icon: MdFoodBank,
  fields: [
    {
      name: 'orderNumber',
      title: 'Číslo objednávky',
      type: 'number',
    },
    {
      name: 'note',
      title: 'Poznámka',
      type: 'string',
    },    
  ],
}
