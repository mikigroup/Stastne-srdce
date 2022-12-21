/* import unitedStates from './unitedStates' */

export default {
  name: 'leden2023',
  title: 'Leden 2023',
  type: 'document',
    fields: [
      {
            name: 'tydny',
            type: 'document',
            title: 'Týdny',
            fieldsets: [
              {name: 'dny'/* , title: 'Dny' */}],
            fields: [
              /* 		{
                    title: 'Directors',
                    name: 'directors',
                    type: 'array',
                    of: [{ type: 'string' }]
                  }, */

              {
                name: 'tyden1',
                type: 'document',
                title: '1. týden',
                rows: '5',
                fieldset: 'dny',
                fields: [ 
                  {name: 'date1', type: 'date', title: 'Den', options: {dateFormat: 'DD-MMM-YYYY'}},
                  { name: 'dateManual1', type: 'text', title: 'Datum', rows: '1' },
                  { name: 'menu1', type: 'text', title: 'Menu 1' },
                  { name: 'menu2', type: 'text', title: 'Menu 2' },
                  { name: 'menu3', type: 'text', title: 'Menu 3' },

                  {name: 'date2', type: 'date', title: 'Den', options: {dateFormat: 'DD-MMM-YYYY'}},
                  { name: 'menu4', type: 'text', title: 'Menu 1' },
                  { name: 'menu5', type: 'text', title: 'Menu 2' },
                  { name: 'menu6', type: 'text', title: 'Menu 3' },

                  {name: 'date3', type: 'date', title: 'Den', options: {dateFormat: 'DD-MMM-YYYY'}},
                  { name: 'menu7', type: 'text', title: 'Menu 1' },
                  { name: 'menu8', type: 'text', title: 'Menu 2' },
                  { name: 'menu9', type: 'text', title: 'Menu 3' },

                  {name: 'date4', type: 'date', title: 'Den', options: {dateFormat: 'DD-MMM-YYYY'}},
                  { name: 'menu10', type: 'text', title: 'Menu 1' },
                  { name: 'menu11', type: 'text', title: 'Menu 2' },
                  { name: 'menu12', type: 'text', title: 'Menu 3' },

                  {name: 'date5', type: 'date', title: 'Den', options: {dateFormat: 'DD-MMM-YYYY'}},
                  { name: 'menu13', type: 'text', title: 'Menu 1' },
                  { name: 'menu14', type: 'text', title: 'Menu 2' },
                  { name: 'menu15', type: 'text', title: 'Menu 3' },
                ]
              },
              {
                name: 'tyden2',
                type: 'document',
                title: '2. týden',
                rows: '5',
                fieldset: 'dny',
                fields: [
                  { name: 'date6', type: 'date', title: 'Den', options: { dateFormat: 'DD-MMM-YYYY' } },
                  { name: 'menu1', type: 'text', title: 'Menu 1' },
                  { name: 'menu2', type: 'text', title: 'Menu 2' },
                  { name: 'menu3', type: 'text', title: 'Menu 3' },

                  { name: 'date7', type: 'date', title: 'Den', options: { dateFormat: 'DD-MMM-YYYY' } },
                  { name: 'menu4', type: 'text', title: 'Menu 1' },
                  { name: 'menu5', type: 'text', title: 'Menu 2' },
                  { name: 'menu6', type: 'text', title: 'Menu 3' },

                  { name: 'date8', type: 'date', title: 'Den', options: { dateFormat: 'DD-MMM-YYYY' } },
                  { name: 'menu7', type: 'text', title: 'Menu 1' },
                  { name: 'menu8', type: 'text', title: 'Menu 2' },
                  { name: 'menu9', type: 'text', title: 'Menu 3' },

                  { name: 'date9', type: 'date', title: 'Den', options: { dateFormat: 'DD-MMM-YYYY' } },
                  { name: 'menu10', type: 'text', title: 'Menu 1' },
                  { name: 'menu11', type: 'text', title: 'Menu 2' },
                  { name: 'menu12', type: 'text', title: 'Menu 3' },

                  { name: 'date10', type: 'date', title: 'Den', options: { dateFormat: 'DD-MMM-YYYY' } },
                  { name: 'menu13', type: 'text', title: 'Menu 1' },
                  { name: 'menu14', type: 'text', title: 'Menu 2 ' },
                  { name: 'menu15', type: 'text', title: 'Menu 3' },
                ]
              },
              {
                name: 'tyden3',
                type: 'document',
                title: '3. týden',
                rows: '5',
                fieldset: 'dny',
                fields: [
                  { name: 'date11', type: 'date', title: 'Den', options: { dateFormat: 'DD-MMM-YYYY' } },
                  { name: 'menu1', type: 'text', title: 'Menu1' },
                  { name: 'menu2', type: 'text', title: 'Menu2' },
                  { name: 'menu3', type: 'text', title: 'Menu3' },

                  { name: 'date12', type: 'date', title: 'Den', options: { dateFormat: 'DD-MMM-YYYY' } },
                  { name: 'menu4', type: 'text', title: 'Menu1' },
                  { name: 'menu5', type: 'text', title: 'Menu2' },
                  { name: 'menu6', type: 'text', title: 'Menu3' },

                  { name: 'date13', type: 'date', title: 'Den', options: { dateFormat: 'DD-MMM-YYYY' } },
                  { name: 'menu7', type: 'text', title: 'Menu1' },
                  { name: 'menu8', type: 'text', title: 'Menu2' },
                  { name: 'menu9', type: 'text', title: 'Menu3' },

                  { name: 'date14', type: 'date', title: 'Den', options: { dateFormat: 'DD-MMM-YYYY' } },
                  { name: 'menu10', type: 'text', title: 'Menu1' },
                  { name: 'menu11', type: 'text', title: 'Menu2' },
                  { name: 'menu12', type: 'text', title: 'Menu3' },

                  { name: 'date15', type: 'date', title: 'Den', options: { dateFormat: 'DD-MMM-YYYY' } },
                  { name: 'menu13', type: 'text', title: 'Menu1' },
                  { name: 'menu14', type: 'text', title: 'Menu2' },
                  { name: 'menu15', type: 'text', title: 'Menu3' },
                ]
              },
              {
                name: 'tyden4',
                type: 'document',
                title: '4. týden',
                rows: '5',
                fieldset: 'dny',
                fields: [
                  { name: 'date16', type: 'date', title: 'Den', options: { dateFormat: 'DD-MMM-YYYY' } },
                  { name: 'menu1', type: 'text', title: 'Menu1' },
                  { name: 'menu2', type: 'text', title: 'Menu2' },
                  { name: 'menu3', type: 'text', title: 'Menu3' },

                  { name: 'date17', type: 'date', title: 'Den', options: { dateFormat: 'DD-MMM-YYYY' } },
                  { name: 'menu4', type: 'text', title: 'Menu1' },
                  { name: 'menu5', type: 'text', title: 'Menu2' },
                  { name: 'menu6', type: 'text', title: 'Menu3' },

                  { name: 'date18', type: 'date', title: 'Den', options: { dateFormat: 'DD-MMM-YYYY' } },
                  { name: 'menu7', type: 'text', title: 'Menu1' },
                  { name: 'menu8', type: 'text', title: 'Menu2' },
                  { name: 'menu9', type: 'text', title: 'Menu3' },

                  { name: 'date19', type: 'date', title: 'Den', options: { dateFormat: 'DD-MMM-YYYY' } },
                  { name: 'menu10', type: 'text', title: 'Menu1' },
                  { name: 'menu11', type: 'text', title: 'Menu2' },
                  { name: 'menu12', type: 'text', title: 'Menu3' },

                  { name: 'date20', type: 'date', title: 'Den', options: { dateFormat: 'DD-MMM-YYYY' } },
                  { name: 'menu13', type: 'text', title: 'Menu1' },
                  { name: 'menu14', type: 'text', title: 'Menu2' },
                  { name: 'menu15', type: 'text', title: 'Menu3' },
                ]
              },
              {
                name: 'tyden5',
                type: 'document',
                title: '5. týden',
                rows: '5',
                fieldset: 'dny',
                fields: [
                  { name: 'date21', type: 'date', title: 'Den', options: { dateFormat: 'DD-MMM-YYYY' } },
                  { name: 'menu1', type: 'text', title: 'Menu1' },
                  { name: 'menu2', type: 'text', title: 'Menu2' },
                  { name: 'menu3', type: 'text', title: 'Menu3' },

                  { name: 'date22', type: 'date', title: 'Den', options: { dateFormat: 'DD-MMM-YYYY' } },
                  { name: 'menu4', type: 'text', title: 'Menu1' },
                  { name: 'menu5', type: 'text', title: 'Menu2' },
                  { name: 'menu6', type: 'text', title: 'Menu3' } 
                ]
              }

            ]       
      }
    ]
}