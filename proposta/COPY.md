# Copy e roteiro: proposta Gabriela Guenka

Roteiro e texto. Não mexi em código. Onde falta dado dela, marquei **[confirmar]**. Onde a ideia depende de viabilidade técnica, marquei **[viabilidade]**.

Princípios desta versão (vêm da mudança de direção):

1. **Cada capítulo é um problema do dia dela**, dito na voz dela, seguido de como se resolve, com um exemplo que se vê na tela.
2. **Quem aparece é a solução, não o nome da tecnologia.** Nenhum título, legenda ou cartão usa "CRM", "embeddings", "CMS", "Conversions API", "OCR", "SEO" como protagonista. Esses termos podem ficar num rodapé técnico do fechamento.
3. **Relatório não é preencher o formulário dela.** O pedido real foi "um modelo de relatório para poder exportar". A proposta entrega mais que isso: ela **pede** o modelo (atendimento, alta, laudo, internação, outro que inventar) e a Donna **monta e preenche** um documento bonito, pronto para exportar ou enviar. A tabela de flexões, os campos do Word e o SimplesVet saem do primeiro plano.
4. **Proposta, não comercial.** Fala dela e do projeto ("no seu atendimento", "nesta fase entregamos"), sem slogan, sem métrica inventada.

---

## 0. Nova estrutura de capítulos

| nº | Problema (na voz dela) | Cena (o que a câmera mostra) | Interação "Sua vez" | Capítulos atuais que absorve |
|---|---|---|---|---|
| 00 | Abertura | Peças soltas do sistema no canvas; o Trovão aparece em todas | "Começar" (e aviso do microfone) | `abertura` |
| 01 | "Estou com a mão no cavalo. O registro fica para a noite, e o relatório para depois." | Celular **bloqueado** no bolso do colete → toque no atalho da tela de bloqueio → gravação abre sem desbloquear → o atendimento cai no sistema → a Donna monta o relatório num modelo bonito | 1) Gravar um atendimento. 2) **Pedir outro modelo** (alta, laudo de imagem, internação ou "do meu jeito") | `prontuario` (núcleo), aba Documento do `estudio`, tela de bloqueio do `financeiro` (`LockScreen.tsx`, reaproveitada) |
| 02 | "Boleto chega no WhatsApp, eu lanço à noite numa planilha, e um sempre vence sem eu ver." | Planilha digitada → foto do boleto → conta lançada → a **mesma tela de bloqueio** do cap. 01 mostra o aviso na véspera | Enviar a foto de um boleto ou recibo (ou escolher um dos 3 exemplos) | `financeiro` |
| 03 | "Cliente, aluno e haras me chamam no mesmo WhatsApp. Tudo depende de mim, e mensagem se perde." | WhatsApp lotado (Ricardo, Haras Boa Vista, aluno perguntando preço, grupo da internação) → conversas organizadas por cliente, aluno e internação → a Donna sugere a resposta → o retorno do Trovão entra na agenda | Responder o Ricardo por áudio: "pode ser quinta às 9h no haras, marca pra mim" → ela aprova a resposta e o compromisso | `agenda` (inteira), parte do `leads` (conversas chegando), relatório de internação (lacuna do PDF) |
| 04 | "Pago anúncio todo mês e não sei qual traz aluno que compra, nem de onde vêm os meus bons clientes." | Pessoas chegando de todo lado → painel simples com três números por origem → a Donna responde em uma frase → o anúncio passa a aprender com quem comprou | Escolher uma pergunta para a Donna ("De onde vêm os alunos que compram?") e, depois, ligar "ensinar o anúncio com quem comprou" | `leads` + `atribuicao` (fundidos) |
| 05 *(extra)* | "Em cada venda de curso, a plataforma fica com 9,9% + R$ 2,49." | Painel de vendas atual → simulador → a mesma venda na plataforma dela | Simulador (faturamento, ticket, parcelado) | `cursos` (só a parte do simulador e da área de membros) |
| 06 *(extra)* | "Sei o que ensinar e o que postar. Não tenho tempo de editar aula, escrever post e fazer arte." | Gravação bruta da aula sendo cortada → aula publicada → post do site sobre o mesmo caso → arte da nova turma | Um pedido para a Donna, com abas: Aula · Post · Arte · Slides | `cursos` (editor de aula), `cms`, `estudio` (abas Arte e Slides) |
| 07 | Proposta | Câmera recua: as seis soluções no canvas → proposta (escopo, fases, investimento, aceite) | Revisar e aceitar | `fechamento` |

**O que sai:** o capítulo `busca` deixa de ser capítulo. O problema dele ("achar um caso antigo") é real, mas é o mesmo problema do cap. 01 visto de outro ângulo e tem a explicação mais técnica da proposta. Vira **um item do fechamento** ("Também entra: perguntar sobre seus casos em português, ex.: 'cavalos que infiltrei no tarso, como voltaram?'") e, se o time quiser, uma terceira pergunta-exemplo no cap. 04. A nuvem de pontos (`busca/Mapa.tsx`) pode ilustrar esse item no fechamento.

**Por que os dois extras ficam no fim:** o usuário deu a espinha (registro → contas → conversas → números). Cursos e conteúdo são problemas reais dela, mas são da frente de ensino; depois do cap. 04 ("de onde vêm os alunos"), eles respondem à pergunta seguinte: "e como vendo e produzo mais sem perder margem nem tempo". Se o tempo da peça apertar, os dois podem virar só cartões no fechamento.

**Fases batem com a ordem:** Fase 1 = 01, 02, 03 (rotina da clínica). Fase 2 = 04, 05 (números e cursos). Fase 3 = 06 (conteúdo). A pessoa lê a proposta na ordem em que vai receber o sistema.

**Seis capítulos, não nove.** A abertura passa a dizer "seis".

---

## 1. Arco e fio condutor

### Diagnóstico da versão atual

- **Não há fio declarado.** O Trovão aparece em quase tudo (exame, boleto do ferrador, retorno, aula, post, termo, busca), mas nenhuma tela diz que estamos seguindo um caso. Cada capítulo recomeça do zero, com corte seco.
- **Fórmula repetida.** Três capítulos seguidos abrem com "Hoje, …" (01, 02, 03) e dois viram com uma pergunta "E se…?" (02, 03).
- **O mesmo assunto em pontas opostas.** Leads (05) e Venda real (09) tratam do mesmo problema (anúncio → venda), separados por três capítulos.
- **Três capítulos seguidos de "a Donna escreve algo"** (cursos, CMS, estúdio): mesma sensação, ritmo cai no meio.
- **Técnica no primeiro plano.** A tela-chave do cap. 01 é a ficha com a tabela MTE/MTD; o cap. 08 explica embedding e banco vetorial; o cap. 09 cita Conversions API, Data Manager API, SHA-256 e `ctwa_clid`.
- **Promessas sem prova.** "Custo por venda cai para R$ 205" (atribuição), "Sete posts, o último em junho" (CMS, contradiz os dados, cujo último post é de 12 set), "8 semanas, com casos reais da clínica" (arte), nomes de cursos inventados (Biomecânica Equina Aplicada, Workshop · Claudicação, Mentoria · turma 4), "37 lançamentos digitados este mês". Em tela, tudo isso precisa ser exemplo marcado ou dado dela.
- **Captions de 3 linhas** (regra é 2): cursos l.114, cms l.81 e l.95.

### O fio: "O Trovão, do haras até a aula"

O Trovão (Quarto de Milha de tambor, 8 anos, claudicação no posterior esquerdo, **paciente fictício**) é o caso que atravessa a semana. O tutor é o Ricardo Alves, do Haras Santa Fé. Cada capítulo pega o caso onde o anterior deixou:

| Cap. | O que acontece com o Trovão | Como passa a bola (botão `nextLabel` do ScopeCard, prop que já existe) |
|---|---|---|
| 00 | Ele aparece nas peças soltas: relatório, boleto, retorno, aula | "Começar pelo atendimento" |
| 01 | Segunda, no haras: atendimento gravado da tela bloqueada, relatório para o Ricardo, orientações de alta pedidas na hora | "Próximo: as contas da semana" |
| 02 | Segunda à noite: o ferrador mandou a cobrança do Trovão e de mais três animais; foto, lançado, aviso na véspera | "Próximo: o Ricardo mandou mensagem" |
| 03 | Terça: o Ricardo pergunta no WhatsApp quando é a reavaliação; ela responde por áudio, a Donna marca quinta 9h | "Próximo: o que os números dizem" |
| 04 | O Ricardo chegou por indicação, como a maioria dos bons clientes; o mesmo vale para os alunos | "Próximo: vender o curso sem a taxa" |
| 05 | O caso dele vai virar aula; antes, quanto fica em cada venda | "Próximo: a aula, o post e a arte" |
| 06 | A aula sobre o caso dele é editada, vira post para outros proprietários e arte da nova turma | "Ver a proposta" |
| 07 | Câmera recua: tudo o que o caso tocou | — |

Além do botão, a **primeira linha do subtítulo** de cada capítulo retoma o anterior ("Na mesma noite…", "Na terça, o Ricardo…"). Isso amarra sem mexer no kit. (Uma faixa de transição entre capítulos com essa frase seria melhor, mas é mudança no `engine/Proposal.tsx`; fica como sugestão para depois.)

### Tom: a solução primeiro

Cada capítulo abre com o que a Donna e o sistema fazem por ela ("Fale no haras. A Donna escreve.", "Uma foto e a conta está lançada."). A situação de hoje só aparece quando a história precisa, como fato curto e neutro, nunca como crítica. O ganho é tempo e dinheiro. Os "Problema" abaixo são notas de briefing na voz dela, não texto de tela.

### Ritmo

- 01 é o capítulo mais longo e o mais importante: duas pausas (gravar, pedir outro modelo). A conferência no WhatsApp deixa de ser uma terceira pausa e vira um botão dentro do cartão ao vivo ("Aprovar e enviar ao Ricardo").
- 02 e 03 são curtos, uma pausa cada.
- 04 tem uma pausa com dois toques (pergunta, depois o interruptor).
- 05 não tem agente (simulador determinístico), o que dá respiro antes do 06.
- 06 tem uma pausa com abas; a resposta da Donna varia por aba.
- Tempo total: hoje a abertura diz "uns 12 minutos". Com seis capítulos, medir no QA **[confirmar]**.

### Vocabulário (trocas para a peça toda)

| Evitar no texto visível | Usar |
|---|---|
| tutor | **cliente** (palavra dela no PDF) ou o nome: **Ricardo** |
| prontuário / registro estruturado | **atendimento**, **relatório** |
| CRM, funil, lead | **conversas**, **quem chegou**, **quem comprou** |
| CMS, SEO, tráfego orgânico | **site**, **post**, **aparecer no Google**, **visitas** |
| embeddings, busca semântica | **perguntar em português** |
| Conversions API, conversão offline, hash SHA-256 | **o anúncio aprende com quem comprou**, **dados protegidos** |
| OCR, conciliação | **ler a foto**, **conferir com o extrato do banco** |
| "com a sua marca" (repetido 6×) | uma vez por capítulo, no máximo |
| "processado e descartado" (3×) | uma frase só, igual em todas as pausas: "O áudio/A imagem é usada só nesta demonstração e apagada." |
| Variações de "Sem agente conectado agora…" (4×) | uma frase só: "Agente ao vivo desligado nesta sessão. Esta é a resposta de exemplo." |

Travessões: a copy atual tem mais de 20. Nesta versão quase todos viraram ponto ou vírgula.

---

## 2. Copy por capítulo

Cada capítulo traz: problema, cena, "Sua vez", Donna, cartão de escopo e uma tabela **onde | atual | novo | por quê**. As referências "arquivo:linha" apontam para o código de hoje. Quando o capítulo muda de pasta ou de número, o novo texto vai para o capítulo novo.

### Índice (`src/chapters/index.ts:16–26`)

| nº | id (sugestão) | Título | Resumo |
|---|---|---|---|
| 00 | abertura | Abertura | Um caso, do haras à aula |
| 01 | atendimento | Atendimento | Grave sem desbloquear, receba o relatório pronto |
| 02 | contas | Contas | A foto do boleto vira conta lançada |
| 03 | conversas | Conversas | Clientes e alunos respondidos sem perder mensagem |
| 04 | numeros | Números | De onde vêm os bons clientes e alunos |
| 05 | cursos | Cursos | A mesma venda, sem a taxa da plataforma |
| 06 | conteudo | Conteúdo | Aula, post e arte sem parar a clínica |
| 07 | proposta | Proposta | Escopo, fases e investimento |

Por quê: o resumo diz o resultado que ela vê, não a tecnologia. Hoje há resumos como "Ache casos parecidos" e "O anúncio aprende com quem compra", que só fazem sentido depois de assistir.

---

### 00 · Abertura

**Cena:** igual (peças soltas, câmera passeia e recua). As peças passam a mostrar os seis capítulos novos, todas com o Trovão.

| onde | texto atual | texto novo | por quê |
|---|---|---|---|
| `abertura/Chapter.tsx:44` (card) | Prontuário · Trovão | Relatório de atendimento · Trovão | Termo do novo cap. 01 |
| `:47` | Claudicação posterior esquerdo | Claudicação no posterior esquerdo | Gramática |
| `:51–52` chips | AAEP 3/5 · tarso | Pronto para exportar · PDF | Tira o técnico da primeira tela; mostra o resultado |
| `:55` | Estruturado a partir de um áudio de 1min12s | Montado a partir de um áudio de 1min12s | "Estruturado" é jargão |
| `:64` | Ração Premium Equi · R$ 2.340,00 | Ferrador Silva · R$ 680,00 | Hoje o fornecedor não existe no cap. 02. O ferrador atende o Trovão, o que liga as peças |
| `:65` | Energia — haras | Energia elétrica | Igual ao cap. 02 |
| `:78` | Custo por venda real | De onde vêm os alunos que compram | Pergunta do cap. 04, sem jargão |
| `:96` | casos parecidos com o do Trovão | Ricardo: "Quando reavalia o Trovão?" (card de WhatsApp) | Busca sai; entra o cap. 03 |
| `:103–104` | Retorno · Trovão · 12 nov | Reavaliação · Trovão · qui, 9h | A data fixa contradiz a `LockScreen` (26/11) e a agenda, que calcula "próxima quinta" |
| `:111` | Arte para o Instagram, com a sua marca | Aula 3 · o caso do Trovão | Liga ao cap. 06 |
| `:132` eyebrow | Proposta · Plataforma Gabriela Guenka | Proposta para a Dra. Gabriela Guenka | Fala com ela, não com um produto sem nome |
| `:135–136` título | Uma proposta para você ver / o projeto funcionando. | Um caso seu, do haras<br>até a aula. (37 car.) | O título atual fala da proposta, não dela. O novo promete o fio |
| `:139` sub | São 9 capítulos, cada um com uma parte da sua rotina. Em alguns, você grava um áudio ou envia um arquivo, e o agente responde na hora. | Seis problemas da sua semana, seguidos num paciente de exemplo, o Trovão. Em cada um você testa: grava, envia uma foto ou pede, e a Donna responde. | Conta 6, apresenta o Trovão como fictício, nomeia a Donna |
| `:142` botão | Começar | Começar pelo atendimento | Já passa a bola |
| `:145` | espaço pausa · ← → capítulos · leva uns 12 minutos | espaço pausa · ← → capítulos · cerca de [N] minutos | Tempo muda com 6 capítulos **[confirmar no QA]** |

---

### 01 · Atendimento (absorve `prontuario` + aba Documento do `estudio` + `LockScreen`)

**Problema (voz dela):** "Estou com a mão no cavalo. O registro fica para a noite, no iPad, e o relatório para o cliente para depois."

**Cena (3 tomadas):**
1. *Antes.* Haras, o celular no bolso. Ao lado, o iPad com o arquivo de 7 páginas e a pasta do Drive. Os nomes de arquivo bagunçados ficam ("Copy of Copy of…"), porque contam a dor sem jargão. Some a menção ao SimplesVet.
2. *A virada.* Celular **bloqueado** (relógio, data). Embaixo, os dois atalhos da tela de bloqueio; no lugar da lanterna, o atalho "Gravar atendimento". Um toque e a gravação abre **sem desbloquear**. Onda de áudio e "Trovão · gravando 01:12".
3. *O resultado.* O relatório do Trovão surge **num documento bonito**: cabeçalho com a marca dela (arquivo oficial ou espaço reservado), resumo em linguagem de cliente, achados, o que foi feito, próximos passos, botão "Exportar PDF". Os dados técnicos (flexões, projeções) ficam numa faixa recolhida "Dados do exame".

**[viabilidade]** Gravar da tela bloqueada exige **app nativo**. No iPhone (iOS 18+), um *controle* na tela de bloqueio ou no botão de Ação abre a gravação. No Android, atalho na tela de bloqueio ou bloco nas configurações rápidas. Um site ou PWA não faz isso. Confirmar com o time antes de mostrar como promessa.

**Sua vez 1:** step `grave um atendimento`. Título: **"Fale como falaria no haras."** Texto: "Diga qual é o animal, o que você viu e o que fez. Uns 30 segundos bastam. O áudio é usado só nesta demonstração e apagado." Botão: **Gravar**. Microfone negado: "Sem microfone. Seguimos com o áudio de exemplo do Trovão."

**Donna (demo):** "Montei o relatório de atendimento do Trovão. Deixei em branco o CPF e o endereço do Ricardo, que não apareceram no áudio."
(Mostra que ela não inventa: no exemplo, `documento`, `endereco` e `contato` estão mesmo vazios.)

**Sua vez 2 (nova):** step `peça outro modelo`. Título: **"Precisa de outro relatório?"** Texto: "Peça o modelo que quiser. A Donna monta e preenche com este atendimento." Opções (chips):
- Orientações de alta, com prescrições
- Laudo de raio-x
- Atualização semanal da internação
- *Do meu jeito:* campo livre, placeholder "Ex.: relatório para o treinador, sem termos técnicos"

Botão: **Montar o modelo**.

**Donna (demo, por opção):**
- Alta: "Fiz as orientações de alta do Trovão. As prescrições estão marcadas para você conferir dose e tempo antes de enviar."
- Laudo RX: "Montei o laudo das quatro projeções do tarso esquerdo com os achados que você falou. A conclusão fica para você assinar."
- Internação: "Montei o modelo da atualização semanal. Na internação, ele junta as fotos e notas da semana para você conferir na quinta."
- Do meu jeito: "Criei o modelo '[nome]' e guardei. Da próxima vez é só pedir por esse nome."

**Conferência (sem pausa nova):** no cartão ao vivo, status "Em conferência · no seu WhatsApp" e um botão **Aprovar e enviar ao Ricardo**. Depois: "Enviado ao Ricardo pelo WhatsApp, em PDF."

**Cartão "Isso entra no projeto":** título **Atendimento e relatórios**
- App no celular, com atalho na tela de bloqueio para gravar o atendimento
- A Donna monta o relatório a partir do que você falou
- Modelos de atendimento, alta, laudo de imagem e internação, e novos modelos quando você pedir
- Exportar em PDF ou enviar pelo WhatsApp
- Nada sai sem a sua conferência: em conferência, aprovado, enviado ao cliente
- Cadastro de clientes e animais trazido do sistema atual

Fase 1 · Como medimos: **Tempo entre o fim do atendimento e o relatório enviado** (hoje: [confirmar]) · Botão: **Próximo: as contas da semana**

| onde | texto atual | texto novo | por quê |
|---|---|---|---|
| `prontuario/Chapter.tsx:111` eyebrow | 01 · Prontuário | 01 · Atendimento | Palavra do dia dela |
| `:112` título | Hoje, o exame vive num / Word de 7 páginas. | Fale no haras.<br>A Donna escreve. (30 car.) | Abre pelo que a Donna faz por ela |
| `:113` sub | O modelo é preenchido à mão no iPad, salvo no Drive, e o SimplesVet fica ao lado. Quando precisa achar um caso, começa a busca. | Você atende com o cavalo na guia, como sempre. O registro e o relatório ficam com a Donna, e a sua noite fica livre. | Uma cena, sem nomear sistemas; o ganho é tempo |
| `atendimento/Chapter.tsx:198` galeria, "Seu modelo de hoje" | Em inglês, tudo em caixa-alta | Em inglês, como você já envia | Descreve o modelo dela sem julgar |
| `:43–48` arquivos do Drive | (mantém) | mantém; tirar a nota "modelo de 7 páginas" | Os nomes já contam a dor |
| `:147` título 2 | Grava enquanto / examina. | Um toque na<br>tela de bloqueio. (31 car.) | A cena nova |
| `:148` sub 2 | No app, um toque. A Donna escuta e preenche o seu modelo de exame locomotor — sem tirar a mão do cavalo. | Sem desbloquear o celular. Você fala o que está vendo, e o atendimento cai no registro do Trovão. | Sai "modelo de exame locomotor" |
| nova Caption 3 (tomada "sistema") | — | O relatório sai<br>pronto para o Ricardo. (37 car.) · sub: "A Donna organiza o que você falou num modelo bonito, pronto para exportar. Se precisar de outro formato, é só pedir." | Prepara a pausa 2 |
| `:164` PauseCard | step "grave um exame" · "Descreva um exame em voz alta, como faria no haras." | step "grave um atendimento" · "Fale como falaria no haras." | Mais curto |
| `:166` | Fale como no seu modelo: animal, histórico, casco, inspeção dinâmica, flexões, imagem e procedimentos. Uns 30 segundos bastam. O áudio é processado e descartado. | Diga qual é o animal, o que você viu e o que fez. Uns 30 segundos bastam. O áudio é usado só nesta demonstração e apagado. | Sai a lista de campos técnicos |
| `:170` botão | Gravar áudio | Gravar | Ação, uma palavra |
| `:174` | Sem microfone — seguimos com um áudio de exemplo. | Sem microfone. Seguimos com o áudio de exemplo do Trovão. | Sem travessão; nomeia o caso |
| `:66–69` atividade | Usando o áudio de exemplo / Modelo Exame Locomotor preenchido / Preenchendo o seu modelo… / Relatório enviado para sua conferência / Relatório enviado ao tutor | Áudio de exemplo / Relatório montado / Montando o relatório… / No seu WhatsApp para conferência / Enviado ao Ricardo | Sem nome de formulário; "tutor" vira o nome |
| `:194–200` 2ª pausa | "O relatório chegou no seu WhatsApp para conferência." + botão | vira botão no cartão ao vivo: **Aprovar e enviar ao Ricardo** | A pausa 2 passa a ser "peça outro modelo"; três pausas pesam |
| `:196` | Status "Em conferência": nada vai ao cliente antes do seu ok. Ao aprovar, o relatório segue direto para o WhatsApp do tutor. | Em conferência. Nada vai ao Ricardo sem o seu ok. | "Tutor" vira o nome; mais curto |
| `prontuario/agent.ts:98` Donna | Prontuário preenchido no seu modelo. Mandei para você conferir no WhatsApp antes de ir ao tutor. | Montei o relatório de atendimento do Trovão. Deixei em branco o CPF e o endereço do Ricardo, que não apareceram no áudio. | Prova que não inventa; tira "prontuário" |
| `prontuario/agent.ts:38–42` system | preenche o modelo de prontuário… | Novo papel: **dois passos**. (1) Extrai o atendimento (o schema atual pode continuar por baixo). (2) Monta um **documento** num modelo pedido (`montar_relatorio { modelo, titulo, secoes[], pendencias[] }`). Nota para o time de agente | O pedido real é "modelo de relatório para exportar" |
| `Record.tsx` (tela) | Ficha com Informações pessoais, Flexões MTE/MTD×articulações, Ultrassonografia, Check-list… | Documento A4 com cabeçalho, "Resumo para o cliente", "O que encontramos", "O que fizemos", "Próximos passos"; técnico numa faixa recolhida "Dados do exame" | Técnico fora do primeiro plano |
| `Record.tsx:148–150` status | Em andamento · A Donna preenche o modelo / Em conferência · Vai para o seu WhatsApp / Aprovado · Segue direto para o WhatsApp do cliente | Em andamento · A Donna monta o relatório / Em conferência · No seu WhatsApp / Aprovado · Enviado ao cliente | Os três status que ela pediu, em palavras dela |
| `Record.tsx:200` | Relatório de atendimento do Trovão em PDF, com o resumo e as orientações. | mantém | Já está bom |
| `Record.tsx:201` | Relatório do Trovão pronto para conferir. Responda "ok" para aprovar ou edite no app. | mantém | Já está bom |
| `:207–217` ScopeCard | Prontuário e relatórios; "App mobile…", "Seu modelo Exame Locomotor preenchido pela Donna", "Status: em conferência…→…", "Migração dos dados do SimplesVet e do Drive"; métrica "Tempo de registro por exame" | ver cartão acima | Linguagem simples; métrica com começo e fim claros |

---

### 02 · Contas (`financeiro`)

**Problema:** "Boleto chega no WhatsApp, eu lanço à noite numa planilha, e um sempre vence sem eu ver." **[confirmar se é ela ou a secretária quem lança]**

**Cena:** planilha digitada à mão (fica) → a foto da cobrança do Ferrador Silva (Trovão e mais três animais) com a linha da Donna lendo → contas a pagar → **a mesma tela de bloqueio do cap. 01**, agora com o aviso "2 contas vencem amanhã". Esse eco amarra os capítulos: o celular que grava é o celular que avisa.

**Sua vez:** "Envie a foto de um boleto, recibo ou PIX." Botão **Enviar foto**, ou um dos três exemplos.

**Donna:** ver tabela. Hoje a frase diz "te aviso às 8h", mas o aviso é 12/11 às 08:00, que é o "hoje" da cena. Nova frase: "Te aviso na véspera, às 8h."

**Cartão:** título **Contas**
- Foto do boleto, recibo ou PIX vira conta lançada
- Aviso no celular na véspera de cada vencimento
- Orçamentos aprovados e não aprovados; o aprovado vira conta a receber
- Contas a receber: quanto cada cliente deve e desde quando
- Contas a enviar [confirmar o que ela chama assim]
- Conferência com o extrato do banco e resumo do mês
- Histórico trazido do sistema atual

Fase 1 · Como medimos: **Contas lançadas sem digitar, por mês** (hoje: [confirmar quantas ela lança]) · Botão: **Próximo: o Ricardo mandou mensagem**

| onde | texto atual | texto novo | por quê |
|---|---|---|---|
| `financeiro/Chapter.tsx:131` | 02 · Financeiro | 02 · Contas | Palavra dela |
| `:132` | Hoje, cada boleto / vira digitação. | As contas em dia<br>e a noite livre. (33 car.) | Abre pelo ganho; a virada ("Uma foto e…") mostra como |
| `:133` | Fornecedor, vencimento, valor — uma célula de cada vez, à noite, depois do último atendimento. E um erro de digitação passa fácil. | Na mesma noite do atendimento, a cobrança do ferrador chega no WhatsApp. Fornecedor, vencimento e valor, que hoje vão para a planilha, a Donna lança por você. | Abre com o fio; a planilha é só um fato neutro |
| `:144` | E se o comprovante / virasse lançamento? | Uma foto e<br>a conta está lançada. (35 car.) | Afirmação, não pergunta |
| `:145` | Uma foto do boleto ou do recibo. A Donna lê, lança em contas a pagar e avisa antes de vencer. | Boleto, recibo ou cobrança por PIX. A Donna lê, lança e avisa você na véspera. | Mais curto |
| `:182` | step "envie um comprovante" · "Envie a foto de um comprovante, boleto ou recibo." | step "envie uma foto" · "Envie a foto de um boleto, recibo ou PIX." | Palavra comum primeiro |
| `:184` | Pode ser uma conta real do consultório. A imagem é processada e descartada — nada fica salvo. | Pode ser uma conta de verdade. A imagem é usada só nesta demonstração e apagada. | Frase padrão |
| `:192` | ou use um dos nossos exemplos | ou use um exemplo | Curto |
| `:120` erro | Não consegui abrir essa imagem (HEIC?). Tente JPG ou PNG — ou escolha um exemplo. | Não consegui abrir essa imagem. Tente JPG ou PNG, ou escolha um exemplo. | "HEIC?" é técnico |
| `:218` eyebrow | Comprovante enviado | Sua foto | Simples |
| `:235` | Sem o agente ao vivo nesta sessão: mostramos a leitura de um comprovante de exemplo. | Agente ao vivo desligado nesta sessão. Esta é a resposta de exemplo. | Frase padrão |
| `agent.ts:48` | Lancei o boleto da Casa do Cavalo em contas a pagar. Ele vence amanhã junto com a energia — te aviso às 8h. | Lancei o boleto da Casa do Cavalo, R$ 2.340,00. Vence dia 13, junto com a energia. Te aviso na véspera, às 8h. | Corrige o horário que já passou; dá o valor |
| `agent.ts:68` | Lancei a cobrança do Ferrador Silva (4 animais, PIX). Vence amanhã junto com a energia — te aviso às 8h. | Lancei a cobrança do Ferrador Silva: R$ 680,00 por PIX, Trovão e mais três. Vence dia 13. Te aviso na véspera, às 8h. | Puxa o fio |
| `agent.ts:88` | Lancei a fatura da VetLab e vinculei aos exames do Trovão. Vence amanhã junto com a energia — te aviso às 8h. | Lancei a fatura da VetLab e liguei aos exames do Trovão. Vence dia 13. Te aviso na véspera, às 8h. | Idem |
| `agent.ts:29` ordem dos exemplos | 1º Casa do Cavalo | 1º **Ferrador Silva** (exemplo padrão do "pular") | O padrão passa a ser o que fala do Trovão |
| `Sheet.tsx:149` | 37 lançamentos digitados este mês | [N] lançamentos digitados este mês · exemplo | Número inventado: marcar ou trocar pelo dela **[confirmar]** |
| `LockScreen.tsx:42` | Prontuário do Trovão salvo · Retorno marcado para 26/11 na agenda. | Relatório do Trovão enviado ao Ricardo | Data fixa contradiz a agenda; ecoa o cap. 01 |
| `:247–257` ScopeCard | Financeiro; "Orçamentos (aprovados e não aprovados), contas a pagar, a receber e a enviar", "Leitura de comprovantes…", "Alertas no app…", "Conciliação com o extrato e relatórios mensais", "Histórico financeiro migrado do SimplesVet" | ver cartão acima | "Conciliação" e "SimplesVet" saem; o orçamento ganha o caminho até a conta |

---

### 03 · Conversas (absorve `agenda`; nova tela de conversas)

**Problema:** "Cliente, aluno e haras me chamam no mesmo WhatsApp. Tudo depende de mim, e mensagem se perde."

**Cena:**
1. *Antes.* Reaproveita `agenda/Scattered.tsx`, com mais mensagens: Ricardo ("Doutora, quando a gente reavalia o Trovão depois da infiltração?"), Haras Boa Vista ("Dra., consegue ver a Estrela segunda à tarde?"), um aluno ("Qual o valor do curso? Tem turma este mês?"), o grupo da internação ("Como ele passou a noite?"), duas ligações perdidas, post-it "Pérola qui".
2. *A virada.* As mesmas mensagens se organizam em três colunas: **Clientes**, **Alunos**, **Internação**. Cada conversa mostra o animal ou o curso ligado a ela. O aluno do preço já foi respondido pela Donna com o texto que a Dra. aprovou (selo "respondido pela Donna"). O Ricardo está em "aguarda você".
3. *Quinta da internação (beat sem interação).* No grupo da internação, a Donna junta as fotos e notas da semana do Zarco [paciente de exemplo] num relatório; status "para você conferir hoje"; legenda: "A conta vai no grupo na sexta."
4. A semana da agenda (`Week.tsx`), esperando o pedido.

**Sua vez:** step `responda por áudio`. Título: **"Responda o Ricardo sem digitar."** Texto: "Fale como falaria com a sua secretária: o que responder e o que marcar." Exemplo visível: "Responde que pode ser quinta às nove no haras, e marca pra mim com lembrete na véspera." Botão: **Gravar resposta**.

**Donna (demo):** mostra o rascunho da resposta no WhatsApp ("Oi, Ricardo! A Dra. Gabriela reavalia o Trovão na quinta, [dd/mm], às 9h, no Haras Santa Fé.") e o compromisso entrando na quinta. Fala: "Escrevi a resposta e marquei quinta às 9h no Haras Santa Fé. Envio para o Ricardo?" → botão **Enviar** → "Enviado. Te lembro na véspera."

**Cartão:** título **Conversas com clientes e alunos**
- O WhatsApp da clínica com as conversas separadas por cliente, aluno e internação
- Cada conversa ligada ao animal ou ao curso
- A Donna sugere a resposta; o que você liberar (preço, endereço, horários) ela responde sozinha
- Compromisso marcado direto da conversa, com lembrete para você e confirmação para o cliente
- Atualização semanal da internação no grupo: conferência na quinta, conta na sexta
- Agenda ligada ao Google Agenda

Fase 1 · Como medimos: **Mensagens sem resposta no fim do dia** e **tempo até a primeira resposta** (hoje: [confirmar]) · Botão: **Próximo: o que os números dizem**

**[viabilidade]** A API oficial do WhatsApp Business tem limites com **grupos**, e o fluxo de internação dela acontece num grupo. Confirmar o caminho técnico antes de prometer o envio automático no grupo. Alternativa honesta: a Donna prepara e ela envia com um toque.

| onde | texto atual | texto novo | por quê |
|---|---|---|---|
| `agenda/Chapter.tsx:82` | 03 · Agenda | 03 · Conversas | Problema maior, a agenda vira consequência |
| `:83` | Hoje, a agenda mora / em cinco lugares. | Todo mundo que chama<br>recebe resposta. (36 car.) | Abre pelo resultado; a virada mostra as conversas separadas |
| `:84` | Mensagens, ligações perdidas, post-it e memória. Marcar um retorno é abrir três aplicativos e torcer para não encavalar. | Na terça, o Ricardo pergunta do retorno do Trovão, um aluno quer saber o preço e o grupo da internação espera notícia. Cada um recebe a resposta certa, e a agenda não encavala. | Abre com o fio; mantém o "encavalar" |
| `:95` | E se bastasse pedir? | Cada conversa<br>no seu lugar. (26 car.) | Afirmação; descreve a tela |
| `:96` | Um áudio no carro, entre um haras e outro. A Donna entende o dia, o horário e o paciente — e o compromisso entra na agenda, com lembrete. | Clientes, alunos e internação separados. A Donna responde o que você liberou e prepara o resto para você aprovar. | Explica a solução |
| `Scattered.tsx:26` | Doutora, dá pra reavaliar o Trovão essa semana? Ele voltou a mancar. | Doutora, quando a gente reavalia o Trovão depois da infiltração? | "Voltou a mancar" contradiz a infiltração do dia anterior; agora puxa o cap. 01 |
| `Scattered.tsx:26` remetente | Ricardo · tutor do Trovão | Ricardo · Haras Santa Fé | Sem "tutor" |
| `:107` PauseCard | step "peça por áudio" · "Peça para a Donna marcar um compromisso." | step "responda por áudio" · "Responda o Ricardo sem digitar." | A resposta e a marcação juntas |
| `:109` | Fale como falaria com uma secretária: quem, onde, que dia e a que horas. O áudio é processado e descartado. | Fale como falaria com a sua secretária: o que responder e o que marcar. O áudio é usado só nesta demonstração e apagado. | Frase padrão |
| `agent.ts:17` exemplo | Marca pra mim uma visita ao Haras Santa Fé na quinta às nove da manhã para reavaliar o Trovão, e me lembra um dia antes | Responde que pode ser quinta às nove no haras, e marca pra mim a reavaliação do Trovão com lembrete na véspera | Inclui a resposta |
| `agent.ts:78` Donna | Marquei a reavaliação do Trovão no Haras Santa Fé, quinta-feira (dd/mm) às 9h. Te lembro na véspera. | Escrevi a resposta e marquei a reavaliação na quinta (dd/mm), às 9h, no Haras Santa Fé. Envio para o Ricardo? | Abre a confirmação para o cliente |
| `agent.ts` tools | `criar_evento` | + `responder_conversa { para, texto }` (nota para o time de agente) | Para o rascunho aparecer na tela |
| `Week.tsx:110` | Aguardando o seu pedido. | Esperando a sua resposta ao Ricardo. | Contexto |
| `:141–150` ScopeCard | Agenda; "Agenda integrada ao Google Agenda, nos dois sentidos", "Marcação por áudio no app e por mensagem no WhatsApp", "Lembretes para você e confirmação para o tutor", "Retornos do prontuário entram sozinhos na semana"; métrica "Compromissos marcados sem abrir o calendário" | ver cartão acima | Escopo cresce para conversas |

---

### 04 · Números (funde `leads` + `atribuicao`)

**Problema:** "Pago anúncio todo mês e não sei qual traz aluno que compra, nem de onde vêm os meus bons clientes."

**Cena:**
1. Pessoas chegando de todo lado (`leads/Board.tsx`), com o selo da origem: indicação, Instagram, site, anúncio A, anúncio B.
2. Um painel com **três números por origem, em palavras**: *chegaram*, *viraram aluno ou cliente*, *quanto custou cada um que comprou*. Sem "CPL", sem "qualificado/desqualificado" no título das colunas ("com perfil" e "sem perfil" no lugar).
3. Chip fixo: **Dados de exemplo**.

**Sua vez:** step `pergunte`. Título: **"O que você quer saber dos seus números?"** Chips:
- De onde vêm os alunos que compram?
- Qual anúncio só traz curioso?
- De onde vêm os meus melhores clientes da clínica? [dados de exemplo a criar]

Botão: **Perguntar à Donna**.

**Donna (demo, 1ª pergunta):** resumo em uma frase: "Indicação é o que mais vira aluno: 7 de 22 compraram, sem verba. Entre os anúncios, o B vendeu 7 com R$ 2.700; o A vendeu 4 com R$ 4.200." E a recomendação: "Sugiro passar parte da verba do A para o B por 30 dias e comparar. Quer que eu monte a divisão para você aprovar?"

**Segundo toque (ex-atribuição, em linguagem simples):** surge um interruptor: **"Ensinar o anúncio com quem comprou"**. Texto: "Ligado, o anúncio fica sabendo quem fechou a matrícula e passa a procurar gente parecida. A verba vai para quem tem mais chance de comprar." O gráfico de 12 semanas aparece com o selo **Simulação**. A frase de resultado sai em forma condicional: "Na simulação, com a mesma verba, o custo por aluno cai depois de umas três semanas de aprendizado." **Não** mostrar "R$ 205" nem "45% menor" como manchete.

**Cartão:** título **O que os números dizem**
- Toda conversa e toda venda guardam de onde a pessoa veio
- Um painel com quem chegou, quem comprou e quanto custou, por origem
- A Donna explica o que mudou na semana e sugere onde pôr a verba
- As vendas voltam para o Meta e o Google, e o anúncio passa a procurar quem compra
- Dados pessoais protegidos: saem criptografados, nunca abertos

Fase 2 · Como medimos: **Quanto custa cada aluno que comprou, por anúncio** (hoje: [confirmar verba e vendas reais]) · Botão: **Próximo: os cursos na sua plataforma**

| onde | texto atual | texto novo | por quê |
|---|---|---|---|
| `leads/Chapter.tsx:68` | 05 · Leads | 04 · Números | Sem jargão |
| `:69` | Lead chega de / todo lado. | Você sabe de onde<br>vem quem compra. (33 car.) | Abre pelo que ela ganha; sem "lead" |
| `:70` | WhatsApp, indicação, dois anúncios. Todos parecem iguais na hora em que chegam — a diferença aparece semanas depois, na venda. | O Ricardo chegou por indicação, como muitos clientes. Com os alunos, a Donna liga cada venda à origem e mostra na mesma semana o que traz quem compra. | Abre com o fio; o ganho é concreto |
| `:82` PauseCard | step "peça uma análise" · "Qual origem traz o aluno bom — e qual só parece barata?" | step "pergunte" · "O que você quer saber dos seus números?" | Abre para perguntas; chips dão o exemplo |
| `:84` | A Donna lê os {TOTAL_LEADS} leads dos últimos 30 dias, com origem, perfil e resultado, e diz onde está o dinheiro bem gasto. | A Donna lê as 326 pessoas que chegaram nos últimos 30 dias (dados de exemplo) e responde em português. | Marca exemplo; sem "lead" |
| `:88` botão | Pedir análise para a Donna | Perguntar à Donna | Curto |
| `:109` eyebrow | Análise da Donna | Resposta da Donna | Simples |
| `agent.ts:59` resumo | O Anúncio A traz mais da metade dos leads, mas 73% não têm perfil — quase 3× a taxa de desqualificados do Anúncio B. Por lead qualificado, ele é o mais caro. | O anúncio A traz mais da metade das pessoas, mas 3 em cada 4 não têm perfil para o curso. Por aluno que comprou, ele sai quase três vezes mais caro que o B. | Mesmos dados (A R$ 1.050 vs B R$ 386 por venda), em palavras |
| `agent.ts:62–64` insight 1 | Custo por lead baixo engana / A: R$ 23,33 por lead, mas R$ 85,71 por lead qualificado… / Comparar campanhas pelo custo por lead qualificado… | Barato por contato, caro por aluno / A: R$ 23 por contato, R$ 1.050 por aluno que comprou. B: R$ 45 e R$ 386. / Comparar os anúncios pelo custo de quem comprou. | Conta o que importa para ela |
| `agent.ts:68` | 3× mais leads desqualificados no A | O A traz mais curioso | Sem jargão |
| `agent.ts:53` Donna | Deixei o Anúncio A destacado no painel. Se quiser, preparo a nova divisão de verba para você aprovar. | Deixei o anúncio A destacado. Quer que eu monte a nova divisão da verba para você aprovar? | Pergunta, decisão dela |
| `leads/data.ts:16` | orgânico · perfil e site | Instagram, site e blog | Liga ao cap. 06 |
| `Panel.tsx:50,53` colunas | % qualificado · Custo/lead | Com perfil · Custo por aluno | Sem jargão |
| `atribuicao/Chapter.tsx:81` | Chega de medir lead / por clique no WhatsApp. | (vira o segundo toque) "Ensinar o anúncio com quem comprou" | "Chega de" é slogan |
| `:82` | Meça o lead que comprou. Hoje o anúncio aprende com quem abre a conversa; com o CRM ligado, ele passa a aprender com quem fechou a matrícula. | Ligado, o anúncio fica sabendo quem fechou a matrícula e passa a procurar gente parecida. A verba vai para quem tem mais chance de comprar. | Sem "CRM"; diz o ganho, sem "hoje" |
| `:110–111` opções | Otimizar por clique / Otimizar por venda real | Aprender com quem chama / Aprender com quem compra | Verbo comum |
| `:140` | Mesma verba: depois de ~3 semanas de aprendizado, o custo por venda cai para R$ 205 na semana 12. | Na simulação, com a mesma verba, o custo por aluno cai depois de umas três semanas de aprendizado. | Número ilustrativo não vira promessa |
| `:331–337` nós do fluxo | Meta · Conversions API · evento Purchase / Google · Data Manager API · ctwa_clid · gclid | Meta e Google · "fica sabendo quem comprou" | Nome da API só no rodapé técnico do fechamento |
| `:153–161` ScopeCard | Venda real no anúncio; "…Meta (Conversions API) e Google (Data Manager API)", "E-mail e telefone sempre em hash SHA-256…" | ver cartão acima | Linguagem simples |

---

### 05 · Cursos *(extra)* (`cursos`: simulador e área de membros)

**Problema:** "Em cada venda de curso, a plataforma fica com 9,9% + R$ 2,49." Em tela, vira economia: a mesma venda, mais para ela (≈ 6,5% e sem taxa fixa na plataforma própria).

**Cena:** painel de vendas atual → simulador → a área de membros com a marca dela (sem a edição de aula, que vai para o 06).

**Sua vez:** simulador. Título: **"Ajuste ao tamanho dos seus cursos."** Texto novo acima dos controles: "Os valores iniciais são exemplo. Com os seus números, a conta fica exata." Botão: **Ver a área de membros**.

**Sem Donna** (cálculo determinístico, como hoje). Fala de fecho no cartão: "Os alunos atuais mudam junto, sem perder acesso."

**Cartão:** título **Seus cursos na sua plataforma**
- Área de membros e página de venda no seu endereço
- Pagamento por cartão, parcelado e Pix, com taxa de gateway
- Alunos e cursos atuais trazidos da Hotmart, sem perder acesso
- Certificado e comunidade da turma

Fase 2 · Como medimos: **Quanto fica com você de cada venda** (hoje ≈ 90,1% − R$ 2,49 por venda; com os dados dela, o valor exato) · Botão: **Próximo: a aula, o post e a arte**

| onde | texto atual | texto novo | por quê |
|---|---|---|---|
| `cursos/Chapter.tsx:113` | 04 · Cursos | 05 · Cursos | Número |
| `:114` | Cada venda de curso / deixa uma parte / no caminho. (3 linhas) | A mesma venda,<br>mais para você. (29 car.) | Duas linhas; apresenta a economia, não a taxa |
| `:115` | Na plataforma atual, 9,9% + R$ 2,49 de cada venda ficam com ela. Em um ano de turmas, isso vira um valor que dá para medir. | Na Hotmart, a taxa é 9,9% + R$ 2,49 por venda [confirmar o plano dela]. Na sua plataforma, ≈ 6,5% e sem taxa fixa. Num ano de turmas, a diferença fica com você. | Os dois números lado a lado, como fato |
| `:126` | Com a plataforma / sendo sua. | Sua plataforma,<br>com a sua marca. (31 car.) | "A mesma venda" passou para a primeira legenda |
| `:127` | Mesmo checkout, mesma área de membros — com um gateway de pagamento direto e o custo da plataforma já na conta. | Página de venda, área de membros e alunos no seu endereço. O custo de manter a plataforma já entra na conta. | Sem "checkout/gateway" |
| `:150` | Plataforma própria · estimativa | Custo da sua plataforma · estimativa | Claro |
| `:164` botão | Ver a produção das aulas | Ver a área de membros | A produção vai para o 06 |
| `:171–213` pausa "nova aula" e ao vivo | — | **movem para o cap. 06**, aba Aula | Um problema por capítulo |
| `Sales.tsx:10–15` produtos | Biomecânica Equina Aplicada · Workshop · Claudicação · Mentoria clínica · turma 4 | nomes reais dos cursos dela [confirmar] ou "Curso A / Workshop" com selo de exemplo | Nome inventado parece real |
| `calc.ts:19` cenário padrão | faturamento 600 mil, ticket 997 | [confirmar com ela]. Alinhar com o cap. 04 (hoje a matrícula de exemplo lá é R$ 1.497) | Dois tickets diferentes na mesma proposta |
| `:220–229` ScopeCard | Plataforma de cursos própria; "Área de membros com a sua marca, no seu domínio", "Checkout e gateway próprios…", "Agente de produção…", "Migração…"; métrica "Taxa média por venda" | ver cartão acima | "Agente de produção" vai para o 06 |

---

### 06 · Conteúdo *(extra)* (funde editor de aula de `cursos` + `cms` + abas Arte e Slides de `estudio`)

**Problema:** "Sei o que ensinar e o que postar. Não tenho tempo de editar aula, escrever post e fazer arte."

**Cena:** a gravação bruta da aula sobre o caso do Trovão (42 min) na linha do tempo → cortes aparecem → aula publicada no Módulo 3 → o post do site sobre o mesmo assunto, para proprietários e treinadores → a arte da nova turma. Uma gravação, três peças.

**Sua vez:** step `peça à Donna`. Título: **"O que você quer pronto esta semana?"** Abas: **Aula · Post · Arte · Slides**, cada uma com o pedido de exemplo já escrito:
- Aula: "Aula sobre claudicação posterior: flexão, bloqueios e o caso do Trovão"
- Post: "Como perceber cedo que o cavalo está mancando de trás, para proprietários e treinadores"
- Arte: "Post anunciando a nova turma do curso [nome real]"
- Slides: "Aula 1: introdução à biomecânica do posterior"

Texto curto por aba ("Sai legendada e com capítulos, pronta para a área de membros." / "Sai escrito para aparecer no Google, com a sua revisão antes de ir ao ar." / "Sai no tamanho do feed, com camadas editáveis." / "Sai com as cores e o logo da sua identidade visual."). Botão: **Pedir à Donna**.

**Donna (demo, por aba):**
- Aula: "Tirei 11 dos 42 minutos (pausas e repetições), legendei e deixei a aula no Módulo 3. O caso do Trovão entrou sem os dados do Ricardo."
- Post: "Escrevi em formato de guia, com links para dois posts seus e para o curso. Está curto: os posts que mais trazem visita no seu blog têm de 1.500 a 2.500 palavras."
- Arte: "Arte no tamanho do feed. As camadas ficam editáveis se quiser trocar a foto."
- Slides: "Seis slides nas cores da sua identidade. Deixei espaço para o vídeo de marcha no slide 4."

**Cartão:** título **Conteúdo sem parar a clínica**
- Aula: cortes, legendas, capítulos e descrição, publicada na sua plataforma
- Post para o site, escrito para aparecer no Google
- Artes e apresentações com a sua identidade visual (arquivos oficiais da marca)
- Painel simples de visitas por post
- Nada vai ao ar sem a sua aprovação

Fase 3 · Como medimos: **Peças publicadas por mês** e **visitas vindas do Google** (hoje: [confirmar se há site e blog]) · Botão: **Ver a proposta**

| onde | texto atual | texto novo | por quê |
|---|---|---|---|
| `cms/Chapter.tsx:80` | 06 · Conteúdo e SEO | 06 · Conteúdo | Sem SEO no título |
| `cms:81` | O blog que você / não tem tempo / de escrever. (3 linhas) | Uma gravação,<br>três peças prontas. (33 car.) | Duas linhas; a ideia da fusão |
| `cms:82` | Sete posts publicados, o último em junho. Os que existem já trazem visita — falta constância, não assunto. | O caso do Trovão vira aula, post e arte da turma. Você grava uma vez e revisa o resto. | Abre com o fio. A frase atual contradiz os dados (último post 12 set) e o blog é hipotético **[confirmar se ela tem blog]** |
| `cms:95` | A pauta sai / do que já / funciona. (3 linhas) | A pauta sai do<br>que já traz visita. (33 car.) | Duas linhas |
| `cms:107` | Descreva um post que você gostaria de publicar — ou cole o link de uma página do seu site. | (aba Post) O que você quer pronto esta semana? | Uma pausa só para as quatro peças |
| `cms:150–151` | Link detectado. Nesta demonstração a Donna não abre a página… / Se colar um link, a Donna usa o endereço como pista de tema — … | Nesta demonstração, um link serve só de pista de tema. No projeto, a Donna lê a página. | Uma frase, sem travessão |
| `cms:189` | Depois da sua revisão, vai ao ar assim — com a sua marca. O painel orgânico passa a acompanhar o post. | Vai ao ar assim depois da sua revisão. O painel de visitas passa a acompanhar o post. | Sem "orgânico" |
| `cms/agent.ts:15` | …para tutores e treinadores de cavalos atletas. | …para proprietários e treinadores de cavalos atletas. | Sem "tutor" |
| `cms/agent.ts:65` Donna | Post pronto para revisão. Formato de guia, como os que mais trazem visita no seu blog. | ver "Donna (demo)" acima | Pelos dados, quem mais traz visita é "Caso clínico" (985), não "Guia" (900): a frase atual está errada |
| `estudio/Chapter.tsx:113–115` | 07 · Estúdio / Um pedido seu, / três especialistas. / A Donna entende o que você precisa e chama, na hora certa, quem escreve, quem desenha e quem diagrama — sempre com a sua marca. | absorvido pela Caption do 06 | "Três especialistas" é bastidor, não problema dela |
| `estudio:158` | Peça uma peça com a sua marca, do jeito que pediria a alguém da equipe. | (unificado) O que você quer pronto esta semana? | "Peça uma peça" |
| `estudio/agent.ts:165` arte | Do exame de marcha ao plano de treino: 8 semanas, com casos reais da clínica. | [duração real] · início em [data] [confirmar] | Detalhe de curso inventado |
| aba Documento do `estudio` | Termo de consentimento para infiltração articular | **vai para o cap. 01** como "outro modelo" (alta, laudo, internação, termo) | Documento clínico é relatório |
| `cursos/agent.ts:50` Donna aula | Cortei 11 minutos de pausas e repetições, gerei as legendas e deixei a aula pronta no Módulo 3. | ver "Donna (demo)" acima | Puxa o fio e mostra cuidado com dados do cliente |
| Selo "Em edição pela Donna" / "Donna · Editora" (`Editor.tsx:154, 306`) | mantém | mantém | Já é claro |
| ScopeCards de `cms` (`:196–204`) e `estudio` (`:221–229`) | dois cartões, com "Agente de pauta e SEO…", "Manual de marca…" | um cartão (acima) | Fusão |

---

### 07 · Proposta (`fechamento`)

| onde | texto atual | texto novo | por quê |
|---|---|---|---|
| `fechamento/Chapter.tsx:31` | 10 · Proposta · Tudo o que você viu, num sistema só. | 07 · Proposta · Do haras à venda,<br>num sistema só. (34 car.) | Fecha o fio |
| `Proposta.tsx:66` | Proposta · Plataforma Gabriela Guenka | Proposta para a Dra. Gabriela Guenka | Igual à abertura |
| `Proposta.tsx:69` | Nove módulos, um sistema, em três fases. | Seis soluções, em três fases. | Fórmula de três batidas; número novo |
| Aba Escopo | 9 módulos | 6 módulos + bloco "Também entra": perguntar sobre seus casos em português (ex-busca); rodapé técnico (Google Agenda, API oficial do WhatsApp, Meta e Google, criptografia) | Onde a técnica pode morar |
| `escopo.ts` `MODULOS` | 9 itens com números 01–09 | 6 itens com os títulos e itens dos cartões acima | Uma só fonte |
| `escopo.ts:92` Fase 1 foco | Tirar a digitação do seu dia: prontuário, contas e agenda num só app, com a Donna. | Tirar a digitação do seu dia: atendimento, contas e conversas, com a Donna. | Novos capítulos |
| `:93` entrega | Você grava exames, lança contas por foto e marca compromissos por áudio. | Você grava o atendimento da tela bloqueada, lança contas por foto e responde clientes por áudio. | Idem |
| `:98–99` Fase 2 | Trazer os cursos para casa e ligar cada venda à origem do aluno. / Cursos na plataforma própria, leads no CRM e anúncios otimizados por venda. | Saber de onde vêm os bons clientes e alunos e vender os cursos sem a taxa. / Painel de números, anúncio que aprende com quem compra e cursos na sua plataforma. | Sem "CRM/leads" |
| `:104–105` Fase 3 | Transformar o que você já sabe em conteúdo, material e busca. / Blog publicado com SEO, estúdio com a sua marca e busca em todo o acervo. | Transformar o que você já sabe em aula, post e arte. / Aulas editadas, posts no site e peças com a sua identidade. | Idem |
| `Proposta.tsx:317` | Kickoff · Uma conversa para fechar detalhes e receber os seus modelos de prontuário. | Primeira conversa · Para fechar detalhes e ver os relatórios que você mais envia. | "Kickoff" e "prontuário" saem; o pedido é o modelo de relatório |
| `Proposta.tsx:318` | Ajuste do escopo da Fase 1 · Prontuário, financeiro e agenda no formato exato da sua rotina. | Ajuste da Fase 1 · Atendimento, contas e conversas no jeito da sua rotina. | Idem |
| Aceite (`Quero seguir com o projeto` / `Combinado.`) | mantém | mantém | Já está bom |
| Rodapé "Nós fabricamos emoções." | mantém só como assinatura | mantém | Marca da Khard, assinatura, não argumento |
| `Minis.tsx:48–50` | Trovão · AAEP 3/5 · tarso | Relatório · Trovão · enviado ao Ricardo | Técnico fora |
| `Minis.tsx:93` | Aula 7 · Biomecânica do tarso | Módulo 3 · Claudicação posterior: o caso do Trovão | Igual ao cap. 06 |
| `Minis.tsx:104–106` | Indicação 86 · Anúncio B 64 · Anúncio A 28 | Indicação 77 · Anúncio B 75 · Anúncio A 27 (% com perfil, de `leads/data.ts`) | Números diferentes do capítulo |
| `Minis.tsx:120` | Esparavão: sinais, diagnóstico e manejo | Claudicação posterior em cavalos: como identificar cedo | Igual ao post do cap. 06 |
| `Minis.tsx:153–154` | Estrela Dalva · 2025 0,91 · Zarco · 2024 0,87 | sai (busca vira item "Também entra") | "Zarco" não existe no acervo (é "Zorro") |

---

## 3. Lacunas: o que falta na história e onde entra

| Lacuna | De onde vem | Onde encaixar |
|---|---|---|
| **Relatório sob demanda e exportável** (o pedido real) | Mudança de direção | Cap. 01, pausa 2 "Precisa de outro relatório?" + botão "Exportar PDF". Precisa de nova tool `montar_relatorio` e de 3 a 4 layouts de documento |
| **Atualização semanal da internação** no grupo do WhatsApp (fotos e notas; conferência na quinta, conta na sexta) | PDF, "Relatórios" | Cap. 01 como opção de modelo **e** cap. 03 como beat da cena (grupo da internação). A conta de sexta pode aparecer na lista do cap. 02. **[viabilidade: grupos na API do WhatsApp]** |
| **Laudo de imagem (RX/US)** | PDF | Cap. 01, opção "Laudo de raio-x" (o áudio de exemplo já traz as 4 projeções do tarso) |
| **Relatório de alta com prescrições** | PDF | Cap. 01, opção "Orientações de alta"; as prescrições ficam marcadas para ela conferir. Conteúdo clínico (doses, repouso) **[validar com ela]**, nunca gerado como fato |
| **"Relatório camelos"** (modelo com todos os parâmetros e o histórico, do qual sai um relatório final) | PDF, "a confirmar" | Cap. 01, opção "Do meu jeito" com o exemplo "relatório final com todo o histórico do paciente". **[confirmar o que é; pode ser literal, de camelos]** |
| **Status do relatório** (em andamento → em conferência no WhatsApp dela → aprovado → cliente) | PDF | Já existe; fica no cap. 01 como botão no cartão ao vivo |
| **Orçamentos aprovados e não aprovados** | PDF, "Financeiro" | Cap. 02, cartão de escopo; idealmente um beat: "o que você fez no atendimento vira orçamento; aprovado, vira conta a receber" |
| **Contas a receber e "contas a enviar"** | PDF | Cap. 02, cartão. "Contas a enviar" **[confirmar o significado: cobranças a enviar aos clientes?]** |
| **Cadastro de clientes: nome, CPF, aniversário, animal, endereço** | PDF, "Clientes" | Cap. 01, cartão ("Cadastro de clientes e animais trazido do sistema atual"). O **aniversário** rende um item no cap. 03: "lembrete do aniversário do cliente, com mensagem para você aprovar" **[confirmar se ela quer]** |
| **Respostas automáticas liberadas por ela** (preço, endereço, horários) | Novo cap. 03 | Cap. 03, cena e cartão; ela define o que a Donna responde sozinha |
| **Perguntar sobre casos antigos** (ex-busca) | Cap. `busca` | Fechamento, "Também entra" |
| **Dados reais** para trocar os exemplos: modelos de relatório que ela envia, nomes dos cursos, ticket, faturamento, verba e vendas dos anúncios, se há blog, quantos lançamentos por mês | PLANO §7 | Kickoff; até lá, selo "exemplo" em toda tela com número |
| **Logo e identidade visual dela** (cabeçalho dos relatórios, arte, slides) | Regra de marca do CLAUDE.md | Espaço reservado explícito até chegar o arquivo oficial. Nada desenhado à mão |

## 4. Inconsistências de dado para corrigir na aplicação

1. Data do retorno do Trovão: abertura "12 nov", `LockScreen` "26/11", agenda "próxima quinta" (dinâmica). Usar só "qui, 9h" nas telas estáticas.
2. Fornecedor da abertura ("Ração Premium Equi") não existe no cap. 02.
3. "Te aviso às 8h" quando o aviso é às 08:00 do próprio "hoje" da cena (12/11).
4. CMS: "último post em junho", mas o último publicado nos dados é de 12 set. E "guia é o que mais traz visita", mas os dados dizem caso clínico.
5. Ticket do curso: R$ 997 (simulador, vendas) contra matrícula de R$ 1.497 (atribuição).
6. Verba de anúncio: R$ 6.900 em 30 dias (leads) contra R$ 3.000 por semana (atribuição). Na fusão do cap. 04, usar uma só base.
7. Fechamento: barras de "% com perfil" e nomes ("Zarco") diferentes dos capítulos.
8. Abertura conta "9 capítulos"; o índice tem 01–09 mais 10; a nova estrutura tem 6.
9. "Tutor" (código) contra "cliente" (PDF dela) contra "proprietário" (modelo dela). Padronizar: "cliente" na interface, "proprietário" dentro do relatório.

---

## Adendo (definições confirmadas pelo usuário)

- **"Relatório camelos"** = o modelo de relatório veterinário que ela usa hoje (ver
  `referencias/cliente/relatorio-atual-camelo-shanah.pdf`): caso real de uma camela de corrida no Qatar, em inglês.
  Ela quer **modelos de documento mais bonitos**. No cap. 01, a galeria de modelos parte do conteúdo desse relatório
  ("seu modelo de hoje") e a Donna gera 3–4 versões com acabamento editorial, todas com a marca dela, e oferece a
  versão **bilíngue PT/EN** (ela atende clientes internacionais). Nada de expor o formulário técnico como protagonista.
- **"Contas a enviar"** = **cobranças a enviar ao cliente**. No cap. 02, além de lançar o boleto que ela paga, a
  Donna prepara e envia a cobrança ao cliente (ex.: a conta da internação na sexta) com um toque.
