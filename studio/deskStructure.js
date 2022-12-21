import S from '@sanity/desk-tool/structure-builder'

export default () =>
  S.list()
    .title('Nastavení')
    .items([
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
                        .child((datefilter) =>
                          S.documentTypeList('menu')
                            .title('Meníčka Listopad')
                            .filter(
                              '_type == "menu" && releaseDate > "2022-10-31" && releaseDate < "2022-12-01"',
                            )
                            .params({ datefilter }),
                        ),
                      S.listItem()
                        .title('Prosinec')
                        .schemaType('menu')
                        .child((datefilter) =>
                          S.documentTypeList('menu')
                            .title('Meníčka Prosinec')
                            .filter(
                              '_type == "menu" && releaseDate > "2022-11-30" && releaseDate < "2023-01-01"',
                            )
                            .params({ datefilter }),
                        ),
                    ]),
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
                        .child((datefilter) =>
                          S.documentTypeList('menu')
                            .title('Meníčka Leden')
                            .filter(
                              '_type == "menu" && releaseDate > "2022-12-31" && releaseDate < "2023-02-01"',
                            )
                            .params({ datefilter }),
                        ),
                      S.listItem()
                        .title('Únor')
                        .schemaType('menu')
                        .child((datefilter) =>
                          S.documentTypeList('menu')
                            .title('Meníčka Únor')
                            .filter(
                              '_type == "menu" && releaseDate > "2023-01-31" && releaseDate < "2023-03-01"',
                            )
                            .params({ datefilter }),
                        ),
                      S.listItem()
                        .title('Březen')
                        .schemaType('menu')
                        .child((datefilter) =>
                          S.documentTypeList('menu')
                            .title('Meníčka Březen')
                            .filter(
                              '_type == "menu" && releaseDate > "2023-02-28" && releaseDate < "2023-04-01"',
                            )
                            .params({ datefilter }),
                        ),
                      S.listItem()
                        .title('Duben')
                        .schemaType('menu')
                        .child((datefilter) =>
                          S.documentTypeList('menu')
                            .title('Meníčka Duben')
                            .filter(
                              '_type == "menu" && releaseDate > "2023-03-31" && releaseDate < "2023-05-01"',
                            )
                            .params({ datefilter }),
                        ),
                      S.listItem()
                        .title('Květen')
                        .schemaType('menu')
                        .child((datefilter) =>
                          S.documentTypeList('menu')
                            .title('Meníčka Květen')
                            .filter(
                              '_type == "menu" && releaseDate > "2023-04-30" && releaseDate < "2023-06-01"',
                            )
                            .params({ datefilter }),
                        ),
                      S.listItem()
                        .title('Červen')
                        .schemaType('menu')
                        .child((datefilter) =>
                          S.documentTypeList('menu')
                            .title('Meníčka Červen')
                            .filter(
                              '_type == "menu" && releaseDate > "2023-05-31" && releaseDate < "2023-07-01"',
                            )
                            .params({ datefilter }),
                        ),
                      S.listItem()
                        .title('Červenec')
                        .schemaType('menu')
                        .child((datefilter) =>
                          S.documentTypeList('menu')
                            .title('Meníčka Červenec')
                            .filter(
                              '_type == "menu" && releaseDate > "2023-06-30" && releaseDate < "2023-08-01"',
                            )
                            .params({ datefilter }),
                        ),
                      S.listItem()
                        .title('Srpen')
                        .schemaType('menu')
                        .child((datefilter) =>
                          S.documentTypeList('menu')
                            .title('Meníčka Srpen')
                            .filter(
                              '_type == "menu" && releaseDate > "2023-07-31" && releaseDate < "2023-09-01"',
                            )
                            .params({ datefilter }),
                        ),
                      S.listItem()
                        .title('Září')
                        .schemaType('menu')
                        .child((datefilter) =>
                          S.documentTypeList('menu')
                            .title('Meníčka Září')
                            .filter(
                              '_type == "menu" && releaseDate > "2023-08-31" && releaseDate < "2023-10-01"',
                            )
                            .params({ datefilter }),
                        ),
                      S.listItem()
                        .title('Říjen')
                        .schemaType('menu')
                        .child((datefilter) =>
                          S.documentTypeList('menu')
                            .title('Meníčka Říjen')
                            .filter(
                              '_type == "menu" && releaseDate > "2023-09-30" && releaseDate < "2023-11-01"',
                            )
                            .params({ datefilter }),
                        ),
                      S.listItem()
                        .title('Listopad')
                        .schemaType('menu')
                        .child((datefilter) =>
                          S.documentTypeList('menu')
                            .title('Meníčka Listopad')
                            .filter(
                              '_type == "menu" && releaseDate > "2023-10-31" && releaseDate < "2023-12-01"',
                            )
                            .params({ datefilter }),
                        ),
                      S.listItem()
                        .title('Prosinec')
                        .schemaType('menu')
                        .child((datefilter) =>
                          S.documentTypeList('menu')
                            .title('Meníčka Prosinec')
                            .filter(
                              '_type == "menu" && releaseDate > "2023-11-30" && releaseDate < "2024-01-01"',
                            )
                            .params({ datefilter }),
                        ),
                    ]),
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
                        .child((datefilter) =>
                          S.documentTypeList('menu')
                            .title('Meníčka Leden')
                            .filter(
                              '_type == "menu" && releaseDate > "2023-12-31" && releaseDate < "2024-02-01"',
                            )
                            .params({ datefilter }),
                        ),
                      S.listItem()
                        .title('Únor')
                        .schemaType('menu')
                        .child((datefilter) =>
                          S.documentTypeList('menu')
                            .title('Meníčka Únor')
                            .filter(
                              '_type == "menu" && releaseDate > "2024-01-31" && releaseDate < "2024-03-01"',
                            )
                            .params({ datefilter }),
                        ),
                      S.listItem()
                        .title('Březen')
                        .schemaType('menu')
                        .child((datefilter) =>
                          S.documentTypeList('menu')
                            .title('Meníčka Březen')
                            .filter(
                              '_type == "menu" && releaseDate > "2024-02-28" && releaseDate < "2024-04-01"',
                            )
                            .params({ datefilter }),
                        ),
                      S.listItem()
                        .title('Duben')
                        .schemaType('menu')
                        .child((datefilter) =>
                          S.documentTypeList('menu')
                            .title('Meníčka Duben')
                            .filter(
                              '_type == "menu" && releaseDate > "2024-03-31" && releaseDate < "2024-05-01"',
                            )
                            .params({ datefilter }),
                        ),
                      S.listItem()
                        .title('Květen')
                        .schemaType('menu')
                        .child((datefilter) =>
                          S.documentTypeList('menu')
                            .title('Meníčka Květen')
                            .filter(
                              '_type == "menu" && releaseDate > "2024-04-30" && releaseDate < "2024-06-01"',
                            )
                            .params({ datefilter }),
                        ),
                      S.listItem()
                        .title('Červen')
                        .schemaType('menu')
                        .child((datefilter) =>
                          S.documentTypeList('menu')
                            .title('Meníčka Červen')
                            .filter(
                              '_type == "menu" && releaseDate > "2024-05-31" && releaseDate < "2024-07-01"',
                            )
                            .params({ datefilter }),
                        ),
                      S.listItem()
                        .title('Červenec')
                        .schemaType('menu')
                        .child((datefilter) =>
                          S.documentTypeList('menu')
                            .title('Meníčka Červenec')
                            .filter(
                              '_type == "menu" && releaseDate > "2024-06-30" && releaseDate < "2024-08-01"',
                            )
                            .params({ datefilter }),
                        ),
                      S.listItem()
                        .title('Srpen')
                        .schemaType('menu')
                        .child((datefilter) =>
                          S.documentTypeList('menu')
                            .title('Meníčka Srpen')
                            .filter(
                              '_type == "menu" && releaseDate > "2024-07-31" && releaseDate < "2024-09-01"',
                            )
                            .params({ datefilter }),
                        ),
                      S.listItem()
                        .title('Září')
                        .schemaType('menu')
                        .child((datefilter) =>
                          S.documentTypeList('menu')
                            .title('Meníčka Září')
                            .filter(
                              '_type == "menu" && releaseDate > "2024-08-31" && releaseDate < "2024-10-01"',
                            )
                            .params({ datefilter }),
                        ),
                      S.listItem()
                        .title('Říjen')
                        .schemaType('menu')
                        .child((datefilter) =>
                          S.documentTypeList('menu')
                            .title('Meníčka Říjen')
                            .filter(
                              '_type == "menu" && releaseDate > "2024-09-30" && releaseDate < "2024-11-01"',
                            )
                            .params({ datefilter }),
                        ),
                      S.listItem()
                        .title('Listopad')
                        .schemaType('menu')
                        .child((datefilter) =>
                          S.documentTypeList('menu')
                            .title('Meníčka Listopad')
                            .filter(
                              '_type == "menu" && releaseDate > "2024-10-31" && releaseDate < "2024-12-01"',
                            )
                            .params({ datefilter }),
                        ),
                      S.listItem()
                        .title('Prosinec')
                        .schemaType('menu')
                        .child((datefilter) =>
                          S.documentTypeList('menu')
                            .title('Meníčka Prosinec')
                            .filter(
                              '_type == "menu" && releaseDate > "2024-11-30" && releaseDate < "2025-01-01"',
                            )
                            .params({ datefilter }),
                        ),
                    ]),
                ),
            ]),
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
                        .child((datefilter) =>
                          S.documentTypeList('aktuality')
                            .title('Aktuality')
                            .filter('_type == "aktuality"')
                            .params({ datefilter }),
                        ),
                    ]),
                ),
            ]),
        ),
   S.listItem()
        .title('Objednávky')
        .child(
          S.list()
            .title('Roky')
            .items([
              S.listItem()
                .title('2023')
                .child(
                  S.list()
                    .title('Měsíce')
                    .items([
                      S.listItem()
                        .title('Leden')
                        .schemaType('order')
                        .child((datefilter) =>
                          S.documentTypeList('order')
                            .title('Objednávky - Leden')
                            /* .filter(
                              '_type == "order" && releaseDate > "2022-12-01" && releaseDate < "2023-02-01"', //zde změnit
                            )
                            .params({ datefilter }) */,
                        ),
                      S.listItem()
                        .title('Únor')
                        .schemaType('order')
                        .child((datefilter) =>
                          S.documentTypeList('order')
                            .title('Objednávky - Únor')
                            .filter(
                              '_type == "order" && releaseDate > "2023-01-31" && releaseDate < "2023-03-01"',
                            )
                            .params({ datefilter }),
                        ),
                      S.listItem()
                        .title('Březen')
                        .schemaType('order')
                        .child((datefilter) =>
                          S.documentTypeList('order')
                            .title('Objednávky Březen')
                            .filter(
                              '_type == "order" && releaseDate > "2023-02-28" && releaseDate < "2023-04-01"',
                            )
                            .params({ datefilter }),
                        ),
                      S.listItem()
                        .title('Duben')
                        .schemaType('order')
                        .child((datefilter) =>
                          S.documentTypeList('menorderu')
                            .title('Objednávky Duben')
                            .filter(
                              '_type == "order" && releaseDate > "2023-03-31" && releaseDate < "2023-05-01"',
                            )
                            .params({ datefilter }),
                        ),
                      S.listItem()
                        .title('Květen')
                        .schemaType('order')
                        .child((datefilter) =>
                          S.documentTypeList('order')
                            .title('Objednávky Květen')
                            .filter(
                              '_type == "order" && releaseDate > "2023-04-30" && releaseDate < "2023-06-01"',
                            )
                            .params({ datefilter }),
                        ),
                      S.listItem()
                        .title('Červen')
                        .schemaType('order')
                        .child((datefilter) =>
                          S.documentTypeList('order')
                            .title('Objednávky Červen')
                            .filter(
                              '_type == "order" && releaseDate > "2023-05-31" && releaseDate < "2023-07-01"',
                            )
                            .params({ datefilter }),
                        ),
                      S.listItem()
                        .title('Červenec')
                        .schemaType('order')
                        .child((datefilter) =>
                          S.documentTypeList('order')
                            .title('Objednávky Červenec')
                            .filter(
                              '_type == "order" && releaseDate > "2023-06-30" && releaseDate < "2023-08-01"',
                            )
                            .params({ datefilter }),
                        ),
                      S.listItem()
                        .title('Srpen')
                        .schemaType('order')
                        .child((datefilter) =>
                          S.documentTypeList('order')
                            .title('Objednávky Srpen')
                            .filter(
                              '_type == "order" && releaseDate > "2023-07-31" && releaseDate < "2023-09-01"',
                            )
                            .params({ datefilter }),
                        ),
                      S.listItem()
                        .title('Září')
                        .schemaType('order')
                        .child((datefilter) =>
                          S.documentTypeList('order')
                            .title('Objednávky Září')
                            .filter(
                              '_type == "order" && releaseDate > "2023-08-31" && releaseDate < "2023-10-01"',
                            )
                            .params({ datefilter }),
                        ),
                      S.listItem()
                        .title('Říjen')
                        .schemaType('order')
                        .child((datefilter) =>
                          S.documentTypeList('order')
                            .title('Objednávky Říjen')
                            .filter(
                              '_type == "menu" && releaseDate > "2023-09-30" && releaseDate < "2023-11-01"',
                            )
                            .params({ datefilter }),
                        ),
                      S.listItem()
                        .title('Listopad')
                        .schemaType('order')
                        .child((datefilter) =>
                          S.documentTypeList('order')
                            .title('Objednávky Listopad')
                            .filter(
                              '_type == "order" && releaseDate > "2023-10-31" && releaseDate < "2023-12-01"',
                            )
                            .params({ datefilter }),
                        ),
                      S.listItem()
                        .title('Prosinec')
                        .schemaType('order')
                        .child((datefilter) =>
                          S.documentTypeList('order')
                            .title('Objednávky Prosinec')
                            .filter(
                              '_type == "order" && releaseDate > "2023-11-30" && releaseDate < "2024-01-01"',
                            )
                            .params({ datefilter }),
                        ),
                    ]),
                ),
            ]),
        ),
    ])
