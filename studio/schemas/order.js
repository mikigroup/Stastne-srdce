import { MdFoodBank, MdOutlineFastfood } from 'react-icons/md'

export default {
    title: 'Objednávky',
    name: 'order',
    type: 'document',
    icon: MdFoodBank,
    fields: [
      {
        title: 'Datum',
        name: 'releaseDate',
        type: 'date',
        options: {
          dateFormat: 'DD-MM-YYYY',
          calendarTodayLabel: 'Today'
        },
        validation: Rule => Rule.required()
      },
    ],
    orderings: [
      {
        title: 'datumu sestupně',
        name: 'releaseDate',
        by: [
          {field: 'releaseDate', direction: 'desc'}
        ]
      },
      {
        title: ' datumu vzestupně',
        name: 'releaseDate',
        by: [
          {field: 'releaseDate', direction: 'asc'}
        ]
      }   
    ],  
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
        },
        }
      }
 