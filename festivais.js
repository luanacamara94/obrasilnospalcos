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
  }
];
