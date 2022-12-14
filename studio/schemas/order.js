import { MdFoodBank, MdOutlineFastfood } from 'react-icons/md'

export default {
  title: 'Objednávky',
  name: 'order',
  type: 'document',
  icon: MdFoodBank,
  fields: [
    {
      name: 'order_number',
      title: 'Číslo objednávky',
      type: 'string',
    },
    {
      name: 'note',
      title: 'Poznámka',
      type: 'string',
    },    
  ],
}
