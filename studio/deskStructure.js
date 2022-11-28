/* import S from '@sanity/desk-tool/structure-builder'


export default () =>
  S.list()
    .title('Nastavení')
    .items(
      S.documentTypeListItems()
    )

 */

import S from '@sanity/desk-tool/structure-builder'

export default () =>
  S.list()
    .title('Nastavení')
    .items([

   /*    S.listItem()
        .title('Settings')
        .child(
          S.document()
            .schemaType('menu')
            .documentId('menu')
        ), */

      S.listItem()
        .title('Zadávání meníček')
        .child(          
          S.list()
            .title('Roky')
              .items([
                S.listItem()
                  .title('2022')
                  .child(
                    S.list()
                      .title('Měsíce')
                      .items([                                                                                                                    
                        S.listItem()
                          .title('Listopad')
                          .schemaType('menu')
                          .child(datefilter =>
                            S.documentTypeList('menu')
                            .title('Meníčka Listopad')
                            .filter('_type == "menu" && releaseDate > "2022-10-31" && releaseDate < "2022-12-01"')
                            .params({ datefilter })
                            ),         
                        S.listItem()
                          .title('Prosinec')
                          .schemaType('menu')
                          .child(datefilter =>
                            S.documentTypeList('menu')
                            .title('Meníčka Prosinec')
                            .filter('_type == "menu" && releaseDate > "2022-11-30" && releaseDate < "2023-01-01"')
                            .params({ datefilter })
                            ),                                   
                      ])  
                ),
                S.listItem()
                .title('2023')
                .child(
                    S.list()
                      .title('Měsíce')
                      .items([
                        S.listItem()
                          .title('Leden')
                          .schemaType('menu')
                          .child(datefilter =>
                            S.documentTypeList('menu')
                            .title('Meníčka Leden')
                            .filter('_type == "menu" && releaseDate > "2022-12-31" && releaseDate < "2023-02-01"')
                            .params({ datefilter })
                            ),
                        S.listItem()
                          .title('Únor')
                          .schemaType('menu')
                          .child(datefilter =>
                          S.documentTypeList('menu')
                          .title('Meníčka Únor')
                          .filter('_type == "menu" && releaseDate > "2023-01-31" && releaseDate < "2023-03-01"')
                          .params({ datefilter })
                          ),                                                                       
                        S.listItem()
                          .title('Březen')
                          .schemaType('menu')
                          .child(datefilter =>
                            S.documentTypeList('menu')
                            .title('Meníčka Březen')
                            .filter('_type == "menu" && releaseDate > "2023-02-28" && releaseDate < "2023-04-01"')
                            .params({ datefilter })
                            ),              
                        S.listItem()
                          .title('Duben')
                          .schemaType('menu')
                          .child(datefilter =>
                            S.documentTypeList('menu')
                            .title('Meníčka Duben')
                            .filter('_type == "menu" && releaseDate > "2023-03-31" && releaseDate < "2023-05-01"')
                            .params({ datefilter })
                            ),         
                        S.listItem()
                          .title('Květen')
                          .schemaType('menu')
                          .child(datefilter =>
                            S.documentTypeList('menu')
                            .title('Meníčka Květen')
                            .filter('_type == "menu" && releaseDate > "2023-04-30" && releaseDate < "2023-06-01"')
                            .params({ datefilter })
                            ),
                         S.listItem()
                          .title('Červen')
                          .schemaType('menu')
                          .child(datefilter =>
                            S.documentTypeList('menu')
                            .title('Meníčka Červen')
                            .filter('_type == "menu" && releaseDate > "2023-05-31" && releaseDate < "2023-07-01"')
                            .params({ datefilter })
                            ),
                          S.listItem()
                          .title('Červenec')
                          .schemaType('menu')
                          .child(datefilter =>
                            S.documentTypeList('menu')
                            .title('Meníčka Červenec')
                            .filter('_type == "menu" && releaseDate > "2023-06-30" && releaseDate < "2023-08-01"')
                            .params({ datefilter })
                            ),
                          S.listItem()
                          .title('Srpen')
                          .schemaType('menu')
                          .child(datefilter =>
                            S.documentTypeList('menu')
                            .title('Meníčka Srpen')
                            .filter('_type == "menu" && releaseDate > "2023-07-31" && releaseDate < "2023-09-01"')
                            .params({ datefilter })
                            ),
                          S.listItem()
                          .title('Září')
                          .schemaType('menu')
                          .child(datefilter =>
                            S.documentTypeList('menu')
                            .title('Meníčka Září')
                            .filter('_type == "menu" && releaseDate > "2023-08-31" && releaseDate < "2023-10-01"')
                            .params({ datefilter })
                            ),                            
                          S.listItem()
                          .title('Říjen')
                          .schemaType('menu')
                          .child(datefilter =>
                            S.documentTypeList('menu')
                            .title('Meníčka Říjen')
                            .filter('_type == "menu" && releaseDate > "2023-09-30" && releaseDate < "2023-11-01"')
                            .params({ datefilter })
                            ),
                          S.listItem()
                          .title('Listopad')
                          .schemaType('menu')
                          .child(datefilter =>
                            S.documentTypeList('menu')
                            .title('Meníčka Listopad')
                            .filter('_type == "menu" && releaseDate > "2023-10-31" && releaseDate < "2023-12-01"')
                            .params({ datefilter })
                            ),
                          S.listItem()
                          .title('Prosinec')
                          .schemaType('menu')
                          .child(datefilter =>
                            S.documentTypeList('menu')
                            .title('Meníčka Prosinec')
                            .filter('_type == "menu" && releaseDate > "2023-11-30" && releaseDate < "2024-01-01"')                            
                            .params({ datefilter })
                            ),     
                      ])  
                ),
                S.listItem()
                .title('2024')
                .child(
                    S.list()
                      .title('Měsíce')
                      .items([
                        S.listItem()
                          .title('Leden')
                          .schemaType('menu')
                          .child(datefilter =>
                            S.documentTypeList('menu')
                            .title('Meníčka Leden')
                            .filter('_type == "menu" && releaseDate > "2023-12-31" && releaseDate < "2024-02-01"')
                            .params({ datefilter })
                            ),
                        S.listItem()
                          .title('Únor')
                          .schemaType('menu')
                          .child(datefilter =>
                          S.documentTypeList('menu')
                          .title('Meníčka Únor')
                          .filter('_type == "menu" && releaseDate > "2024-01-31" && releaseDate < "2024-03-01"')
                          .params({ datefilter })
                          ),                                                                       
                        S.listItem()
                          .title('Březen')
                          .schemaType('menu')
                          .child(datefilter =>
                            S.documentTypeList('menu')
                            .title('Meníčka Březen')
                            .filter('_type == "menu" && releaseDate > "2024-02-28" && releaseDate < "2024-04-01"')
                            .params({ datefilter })
                            ),              
                        S.listItem()
                          .title('Duben')
                          .schemaType('menu')
                          .child(datefilter =>
                            S.documentTypeList('menu')
                            .title('Meníčka Duben')
                            .filter('_type == "menu" && releaseDate > "2024-03-31" && releaseDate < "2024-05-01"')
                            .params({ datefilter })
                            ),         
                        S.listItem()
                          .title('Květen')
                          .schemaType('menu')
                          .child(datefilter =>
                            S.documentTypeList('menu')
                            .title('Meníčka Květen')
                            .filter('_type == "menu" && releaseDate > "2024-04-30" && releaseDate < "2024-06-01"')
                            .params({ datefilter })
                            ),
                         S.listItem()
                          .title('Červen')
                          .schemaType('menu')
                          .child(datefilter =>
                            S.documentTypeList('menu')
                            .title('Meníčka Červen')
                            .filter('_type == "menu" && releaseDate > "2024-05-31" && releaseDate < "2024-07-01"')
                            .params({ datefilter })
                            ),
                          S.listItem()
                          .title('Červenec')
                          .schemaType('menu')
                          .child(datefilter =>
                            S.documentTypeList('menu')
                            .title('Meníčka Červenec')
                            .filter('_type == "menu" && releaseDate > "2024-06-30" && releaseDate < "2024-08-01"')
                            .params({ datefilter })
                            ),
                          S.listItem()
                          .title('Srpen')
                          .schemaType('menu')
                          .child(datefilter =>
                            S.documentTypeList('menu')
                            .title('Meníčka Srpen')
                            .filter('_type == "menu" && releaseDate > "2024-07-31" && releaseDate < "2024-09-01"')
                            .params({ datefilter })
                            ),
                          S.listItem()
                          .title('Září')
                          .schemaType('menu')
                          .child(datefilter =>
                            S.documentTypeList('menu')
                            .title('Meníčka Září')
                            .filter('_type == "menu" && releaseDate > "2024-08-31" && releaseDate < "2024-10-01"')
                            .params({ datefilter })
                            ),                            
                          S.listItem()
                          .title('Říjen')
                          .schemaType('menu')
                          .child(datefilter =>
                            S.documentTypeList('menu')
                            .title('Meníčka Říjen')
                            .filter('_type == "menu" && releaseDate > "2024-09-30" && releaseDate < "2024-11-01"')
                            .params({ datefilter })
                            ),
                          S.listItem()
                          .title('Listopad')
                          .schemaType('menu')
                          .child(datefilter =>
                            S.documentTypeList('menu')
                            .title('Meníčka Listopad')
                            .filter('_type == "menu" && releaseDate > "2024-10-31" && releaseDate < "2024-12-01"')
                            .params({ datefilter })
                            ),
                          S.listItem()
                          .title('Prosinec')
                          .schemaType('menu')
                          .child(datefilter =>
                            S.documentTypeList('menu')
                            .title('Meníčka Prosinec')
                            .filter('_type == "menu" && releaseDate > "2024-11-30" && releaseDate < "2025-01-01"')                            
                            .params({ datefilter })
                            ),     
                      ])  
                ),                                
              ]),
              

              
           /*  .items([
              
              // Add the first list item
              S.listItem()
                .title('Leden')
                // This automatically gives it properties from the project type
                .schemaType('menu')
                // When you open this list item, list out the documents
                // of the type “project"
                .child(S.documentTypeList('menu').title('Meníčka')),
              
                // Add a second list item
              S.listItem()
                .title('Categories')
                .schemaType('menu')
                // When you open this list item, list out the documents
                // of the type “category"
                .child(S.documentTypeList('menu').title('Categories')) 
            ]) */


        ),
        S.listItem()
        .title('Texty')
        .child(          
          S.list()
            .title('Stránky')
              .items([
                S.listItem()
                  .title('Hlavní strana')
                  .child(
                    S.list()
                      .title('Části')
                      .items([
                        S.listItem()
                          .title('Aktuality')
                          .schemaType('aktuality')
                          .child(datefilter =>
                            S.documentTypeList('aktuality')
                            .title('Aktuality')
                            .filter('_type == "aktuality"')
                            .params({ datefilter })
                            ),                                                                                                                                                                                                                   
                      ])  
                )                             
              ])

              
           /*  .items([
              
              // Add the first list item
              S.listItem()
                .title('Leden')
                // This automatically gives it properties from the project type
                .schemaType('menu')
                // When you open this list item, list out the documents
                // of the type “project"
                .child(S.documentTypeList('menu').title('Meníčka')),
              
                // Add a second list item
              S.listItem()
                .title('Categories')
                .schemaType('menu')
                // When you open this list item, list out the documents
                // of the type “category"
                .child(S.documentTypeList('menu').title('Categories')) 
            ]) */


        ), 
        

     /*  S.listItem()
        .title('Persons')
        .schemaType('menu')
        .child(S.documentTypeList('menu').title('Persons')),
      ...S.documentTypeListItems().filter(
        listItem =>
          !['siteSettings', 'sampleProject', 'category', 'person'].includes(
            listItem.getId()
          )
      )  */
    ])





/* export default () =>
  S.list()
    .title('Nastavení')
    .items([
      S.listItem()
        .title('Jídelníček 2023')
        .child(
          S.list()
            .title('Měsíce')
            .items([
              S.listItem()
                .title('Leden')
                .child(
                 S.document()
                  .title('Leden')
                    .schemaType('leden2023')
                    .documentId('leden2023')
                 ),
              S.listItem()
                .title('Únor')
                .child(
                 S.document()
                  .title('Únor')
                    .schemaType('unor2023')
                    .documentId('anotherSiteSettings')
                 ),
              S.listItem()
                .title('Jídlo')
                .child(
                  S.document()
                    .title('Jídlo')
                    .schemaType('jidelnicek')
                 ),
            ])
        ),
   
      S.divider(),


      
     
    ]) */

     // List out the rest of the document types, but filter out the config type
/*    ...S.documentTypeListItems()
     .filter(listItem => ![''].includes(listItem.getId())) */



