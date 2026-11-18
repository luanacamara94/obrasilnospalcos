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
    time: "",
    price: "A anunciar",
    idade: "A anunciar",
    selo: "",
    type: "Festival",
    src: "Coala Festival",
    url: "",
    estado: "Ingressos em breve",
    homenageado: "",
    demo: false,
    sinopse: "O festival nascido em São Paulo chega à quarta edição portuguesa, de novo no Hipódromo Manuel Possolo, em Cascais, juntando música do Brasil, de Portugal e da África lusófona. Os primeiros confirmados são Zeca Pagodinho, Alcione e Jorge Aragão, que fazem em Cascais a estreia portuguesa de O Maior Encontro do Samba. A venda de ingressos ainda não abriu.",
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
  }
];
