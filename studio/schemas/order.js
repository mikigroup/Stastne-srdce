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
      readOnly: true,    
      options: {/* 
          source: (document, options) => {
                    const params = { ref: document.category._ref };
          const params2 = { ref: document.orderNumber[0] };                
          };
          return cattitle;
        },
        slugify: input => {
          return input
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]+/g, "");
        },
        isUnique: true */
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
  ],
    initialValue: () => ({
    orderNumber: false,
    releaseDate: (new Date()).toISOString()
  })
}
