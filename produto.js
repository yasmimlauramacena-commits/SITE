document.addEventListener("DOMContentLoaded", () => {
    const parametros = new URLSearchParams(window.location.search);
    const nome = parametros.get("nome");
    const descricao = parametros.get("descricao");
    const imagem = parametros.get("imagem");
    const preco = Number(parametros.get("preco"));
    const precoOriginal = Number(parametros.get("precoOriginal"));
    const emOferta = parametros.get("oferta") === "true";
    const detalhe = document.getElementById("detalheProduto");
    const erro = document.getElementById("erroProduto");
    const contagemCarrinho = document.getElementById("contagemCarrinho");

    function lerCarrinho() {
        try {
            const itens = JSON.parse(localStorage.getItem("luxenCarrinho") || "[]");

            if (!Array.isArray(itens)) {
                throw new TypeError("Os dados salvos do carrinho são inválidos.");
            }

            return itens.filter(item =>
                item &&
                typeof item.nome === "string" &&
                Number.isFinite(item.preco) &&
                Number.isInteger(item.quantidade) &&
                item.quantidade > 0
            );
        } catch (erroLeitura) {
            console.error("Não foi possível carregar o carrinho salvo.", erroLeitura);
            return [];
        }
    }

    function atualizarContagem() {
        const quantidade = lerCarrinho()
            .reduce((total, item) => total + item.quantidade, 0);
        contagemCarrinho.textContent = `(${quantidade})`;
    }

    function formatarPreco(valor) {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL"
        }).format(valor);
    }

    let imagemValida = false;
    try {
        imagemValida = typeof imagem === "string" &&
            new URL(imagem, window.location.href).protocol === "https:";
    } catch (erroImagem) {
        console.error("O endereço da imagem do produto é inválido.", erroImagem);
    }
    const produtoValido = nome && descricao && imagemValida &&
        Number.isFinite(preco) && preco > 0 &&
        Number.isFinite(precoOriginal) && precoOriginal > 0;

    if (!produtoValido) {
        erro.hidden = false;
        detalhe.appendChild(erro);
        atualizarContagem();
        return;
    }

    const conteudo = document.createElement("div");
    conteudo.className = "detalhe-produto-conteudo";

    const imagemProduto = document.createElement("img");
    imagemProduto.className = "detalhe-produto-imagem";
    imagemProduto.src = imagem;
    imagemProduto.alt = nome;

    const informacoes = document.createElement("div");
    informacoes.className = "detalhe-produto-info";

    const trilha = document.createElement("p");
    trilha.className = "trilha-produto";
    trilha.textContent = "Luxen / Coleção / ";

    const nomeTrilha = document.createElement("span");
    nomeTrilha.textContent = nome;
    trilha.appendChild(nomeTrilha);

    if (emOferta) {
        const selo = document.createElement("span");
        selo.className = "selo-oferta detalhe-selo-oferta";
        selo.textContent = "OFERTA RELÂMPAGO · 15% OFF";
        informacoes.appendChild(selo);
    }

    const titulo = document.createElement("h1");
    titulo.textContent = nome;

    const descricaoProduto = document.createElement("p");
    descricaoProduto.className = "descricao-detalhada";
    descricaoProduto.textContent = descricao;

    const precoProduto = document.createElement("p");
    precoProduto.className = "preco-detalhado";

    if (emOferta && preco < precoOriginal) {
        const precoAntigo = document.createElement("span");
        precoAntigo.className = "preco-antigo";
        precoAntigo.textContent = `De ${formatarPreco(precoOriginal)}`;
        precoProduto.appendChild(precoAntigo);
    }

    const precoAtual = document.createElement("strong");
    precoAtual.textContent = formatarPreco(preco);
    precoProduto.appendChild(precoAtual);

    const disponibilidade = document.createElement("p");
    disponibilidade.className = "disponibilidade-produto";
    disponibilidade.textContent = "Peça selecionada da coleção Luxen.";

    const botoes = document.createElement("div");
    botoes.className = "acoes-detalhe-produto";

    const comprar = document.createElement("a");
    comprar.className = "botao";
    comprar.href = "carrinho.html";
    comprar.target = "luxenCarrinho";
    comprar.textContent = "ADICIONAR AO CARRINHO";
    comprar.addEventListener("click", evento => {
        try {
            const itens = lerCarrinho();
            const existente = itens.find(item => item.nome === nome);

            if (existente) {
                existente.quantidade += 1;
            } else {
                itens.push({
                    nome,
                    preco,
                    imagem,
                    quantidade: 1
                });
            }

            localStorage.setItem("luxenCarrinho", JSON.stringify(itens));
            atualizarContagem();
        } catch (erroSalvar) {
            console.error("Não foi possível salvar o carrinho.", erroSalvar);
            evento.preventDefault();
            alert("Não foi possível salvar seu carrinho neste navegador.");
        }
    });

    const voltar = document.createElement("a");
    voltar.className = "link-voltar-produto";
    voltar.href = "intex.html#colecao";
    voltar.textContent = "VOLTAR À COLEÇÃO";

    botoes.append(comprar, voltar);
    informacoes.prepend(trilha);
    informacoes.append(titulo, descricaoProduto, precoProduto, disponibilidade, botoes);
    conteudo.append(imagemProduto, informacoes);
    detalhe.appendChild(conteudo);

    atualizarContagem();
    window.addEventListener("storage", evento => {
        if (evento.key === "luxenCarrinho") {
            atualizarContagem();
        }
    });
});
