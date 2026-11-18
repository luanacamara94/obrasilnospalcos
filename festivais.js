/* Festivais — curadoria editorial (não é gerado pela agenda).
   Entra aqui: festival brasileiro, festival de raiz brasileira, ou festival geral com pelo menos
   uma atração brasileira confirmada. No line-up, só os nomes brasileiros.
   Mesmo formato dos eventos do events.js, com type "Festival" e ids a partir de 9000.
   lineup: grupos (titulo opcional, dia "AAAA-MM-DD" ou null, palco opcional) com artistas
   {nome, papel, resumo, redes:{instagram}} — redes só quando confirmadas. */
window.NP_FESTIVAIS = [
  {
    id: 9001,
    artist: "Coala Festival",
    title: "Coala Festival Portugal 2027",
    venue: "Hipódromo Manuel Possolo",
    bairro: "Cascais",
    city: "Lisboa",
    date: "2027-05-29",
    fim: "2027-05-30",
    sessoes: 2,
    time: "15:00",
    price: "99 – 209 €",
    idade: "M/6",
    selo: "",
    type: "Festival",
    src: "Fever",
    url: "https://feverup.com/m/826449",
    estado: "",
    homenageado: "",
    demo: false,
    imagem: "img/coala.jpg",
    foco: "50% 10%",
    ajuste: "cover",
    sinopse: "O festival nascido em São Paulo chega à quarta edição portuguesa, de novo no Hipódromo Manuel Possolo, em Cascais, juntando música do Brasil, de Portugal e da África lusófona. Os primeiros confirmados são Zeca Pagodinho, Alcione e Jorge Aragão, que fazem em Cascais a estreia portuguesa de O Maior Encontro do Samba. A curadoria é de Gabriel Andrade e Kalaf Epalanga. Abertura dos portões às 15h; ingressos para os dois dias, na grama ou na Tenda VIP com open bar.",
    lineup: [
      {
        titulo: "O Maior Encontro do Samba",
        dia: null,
        artistas: [
          { nome: "Zeca Pagodinho", resumo: "Cantor e compositor carioca, há mais de quatro décadas uma das principais referências do samba de raiz e do pagode." },
          { nome: "Alcione", resumo: "A Marrom, cantora maranhense com mais de 50 anos de carreira, voz de clássicos como Não Deixe o Samba Morrer e A Loba." },
          { nome: "Jorge Aragão", resumo: "Cantor e compositor carioca, integrante histórico do grupo Fundo de Quintal e autor de alguns dos sambas mais gravados do país." }
        ]
      }
    ],
    lineupNota: "Primeiros nomes anunciados em 10 de novembro de 2026. Mostramos só as atrações brasileiras confirmadas; novos nomes entram aqui assim que forem anunciados."
  },
  {
    id: 9002,
    artist: "PT-BR – Mostra de Teatro Brasil",
    title: "PT-BR – Mostra de Teatro Brasil 2026",
    venue: "Chapitô e Teatro Gil Vicente",
    bairro: "Costa do Castelo e Cascais",
    city: "Lisboa",
    date: "2026-10-29",
    fim: "2026-11-22",
    sessoes: null,
    time: "",
    price: "Ver na bilheteria",
    idade: "Varia por espetáculo",
    selo: "",
    type: "Festival",
    src: "Ticketline",
    url: "https://www.ticketline.pt/salas/sala/70",
    estado: "Última semana",
    homenageado: "",
    demo: false,
    sinopse: "Terceira edição da mostra que leva teatro brasileiro ao Chapitô, em Lisboa, e, pela primeira vez, ao Teatro Gil Vicente, em Cascais. São 16 espetáculos e mais de 80 artistas e técnicos vindos da Bahia, de São Paulo e do Rio de Janeiro, com direção-geral de Bruno Mariozz e curadoria dividida com Ricardo Rocha. Em Portugal, a programação vai até 22 de novembro; depois, a mostra segue para a Guiné-Bissau. Ingressos do Chapitô na Ticketline e do Teatro Gil Vicente na BOL.",
    dias: [
      { dia: "2026-11-20", txt: "Tybyra · Poço Inacabado" },
      { dia: "2026-11-21", txt: "Tybyra · Quando a Gente Ama" },
      { dia: "2026-11-22", txt: "Notícias em Cena · Mãe Preta" }
    ],
    lineup: [
      { titulo: null, dia: "2026-11-20", artistas: [
        { nome: "Tybyra – Uma Tragédia Indígena Brasileira", papel: "Chapitô · 21h · 16 anos", resumo: "Solo do artista potiguara Juão Nyn que imagina vida, desejo e prazer para Tybyra, Tupinambá executado em 1614 e lembrado só pela forma como morreu. Também no dia 21.", link: "https://www.ticketline.pt/salas/sala/70", linkTxt: "Ingressos na Ticketline" },
        { nome: "Poço Inacabado", papel: "Teatro Gil Vicente, Cascais · 20h · 16 anos", resumo: "Criação de artistas brasileiros que vivem em Portugal e dão aulas na Universidade de Évora, como Renato Machado e Vítor Lemos. Um menino sobrevive ao massacre dos pais escondido em um poço cavado pelo pai.", link: "https://teatrogilvicente.bol.pt/", linkTxt: "Ingressos na BOL" }
      ]},
      { titulo: null, dia: "2026-11-21", artistas: [
        { nome: "Quando a Gente Ama", papel: "Teatro Gil Vicente, Cascais", resumo: "Musical com dez histórias de amor contadas pelas canções de Arlindo Cruz, numa roda de samba em cena. Abriu a mostra e volta para uma nova sessão.", link: "https://teatrogilvicente.bol.pt/", linkTxt: "Ingressos na BOL" }
      ]},
      { titulo: null, dia: "2026-11-22", artistas: [
        { nome: "Notícias em Cena", papel: "Chapitô · 18h · 14 anos", resumo: "Resultado de uma residência em que artistas brasileiros e portugueses transformam notícias da semana em teatro.", link: "https://www.ticketline.pt/salas/sala/70", linkTxt: "Ingressos na Ticketline" },
        { nome: "Mãe Preta", papel: "Teatro Gil Vicente, Cascais · 20h · 12 anos", resumo: "Homenagem à pesquisadora e escritora Helena Theodoro. Última apresentação da mostra em Portugal.", link: "https://teatrogilvicente.bol.pt/", linkTxt: "Ingressos na BOL" }
      ]}
    ],
    lineupNota: "Mostramos a programação que ainda vai acontecer em Portugal. Horário de Quando a Gente Ama: confirme na BOL."
  }
];
