import vyberMenu from './vyberMenu'
import { MdFoodBank, MdOutlineFastfood } from 'react-icons/md'

const _createdAt = new Date(Date.UTC(2012, 11, 20, 3, 0, 0));
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

export default {
    title: 'Text aktuality',
    name: 'aktuality',
    type: 'document',
    icon: MdFoodBank,
    fields: [
      
     {
        title: 'Kde:',
        name: 'where',
        type: 'string',
        icon: MdOutlineFastfood,
        readOnly: true,
      },
      /*  {
        title: 'Datum',
        name: 'releaseDate',
        type: 'date',
        options: {
          dateFormat: 'DD-MM-YYYY',
          calendarTodayLabel: 'Today'
        },
        validation: Rule => Rule.required()
      }, */  
  /*     {
        title: 'Název',
        name: 'title',
        type: 'string',             
      }, */
      {
        title: 'Nadpis',
        name: 'title',
        type: 'string',
      },
      {
      title: 'Content', 
      name: 'content',
      type: 'array', 
      of: [{type: 'block'}]
      },     
    ],  
      preview: {
        select: {          
          title: 'where' // zde se prohazuje název a datum, aby datum byl na prvním místě v přehledu meníček
        },
        prepare(selection) {
          const { date, title } = selection
          return {
            subtitle: date, // YYYY-MM-DD --> YYYY
            title: title
          }
        }
      },
  }