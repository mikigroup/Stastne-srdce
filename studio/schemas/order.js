import { MdFoodBank, MdOutlineFastfood } from 'react-icons/md'

export default {
  title: 'Objednávky',
  name: 'order',
  icon: MdFoodBank,  
  type: 'document',
    /* initialValue:  {
    orderNumber: 1,
     }, */
  fields: [
    {
      name: 'orderNumber',
      title: 'Číslo objednávky',
      type: 'number',
      readOnly: true,    
      options: {
        
      }
      
      /* readOnly: ({currentUser}) => {
      return !(currentUser.roles.find(({name}) => name === 'administrator')) 
  }   */   
    },
    {
      name: 'note',
      title: 'Poznámka',
      type: 'string',
    },
      {
      name: 'tel',
      title: 'Tel',
      type: 'string',
    },
       
  ],    
}
