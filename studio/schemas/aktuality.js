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
      
     /*  {
        title: 'Název menu',
        name: 'title',
        type: 'string',
        icon: MdOutlineFastfood,
        validation: Rule => Rule.required()
      }, */
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
      {
        title: 'Název',
        name: 'title',
        type: 'string',             
      },
      {
        title: 'Popis',
        name: 'description',
        type: 'text',
      },     
    ],
    orderings: [
      {
        title: 'Dle datumu',
        name: 'releaseDate',
        by: [
          {field: 'releaseDate', direction: 'desc'}
        ]
      }],  
      preview: {
        select: {
          date: 'title',
          title: 'releaseDate' // zde se prohazuje název a datum, aby datum byl na prvním místě v přehledu meníček
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