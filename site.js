document.addEventListener("DOMContentLoaded", () => {

    // 1. ENTRADA SUAVE DO BANNER
    

    const bannerElementos = document.querySelectorAll(
        ".banner-conteudo > *"
    );

    bannerElementos.forEach((elemento, index) => {
        elemento.animate(
            [
                { opacity: 0, transform: "translateY(35px)" },
                { opacity: 1, transform: "translateY(0)" }
            ],
            {
                duration: 1100,
                delay: index * 200,
                easing: "ease-out",
                fill: "both"
            }
        );
    });


    
    // 2. ANIMAÇÃO AO ROLAR A PÁGINA
    

    const elementosScroll = document.querySelectorAll(
        ".beneficio, .produto, .sobre, .chamada"
    );

    const observador = new IntersectionObserver((entradas) => {

        entradas.forEach(entrada => {

            if (entrada.isIntersecting) {

                entrada.target.animate(
                    [
                        {
                            opacity: 0,
                            transform: "translateY(35px)"
                        },
                        {
                            opacity: 1,
                            transform: "translateY(0)"
                        }
                    ],
                    {
                        duration: 900,
                        easing: "ease-out",
                        fill: "forwards"
                    }
                );

                observador.unobserve(entrada.target);
            }
        });

    }, {
        threshold: 0.15
    });

    elementosScroll.forEach(elemento => {
        observador.observe(elemento);
    });


    // 3. EFEITO NOS PRODUTOS
    

    const produtos = document.querySelectorAll(".produto");

    produtos.forEach(produto => {

        produto.style.transition = "transform 0.4s, filter 0.4s";

        produto.addEventListener("mouseenter", () => {
            produto.style.transform = "translateY(-10px) scale(1.03)";
            produto.style.filter =
                "drop-shadow(0 8px 15px rgba(190, 150, 60, 0.35))";
        });

        produto.addEventListener("mouseleave", () => {
            produto.style.transform = "translateY(0) scale(1)";
            produto.style.filter = "none";
        });

    });

    
    // 4. OFERTAS E CARRINHO
   

    const formatarPreco = valor => new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(valor);

    const chaveCarrinho = "luxenCarrinho";
    const contagemCarrinho = document.getElementById("contagemCarrinho");

    function lerCarrinhoSalvo() {
        try {
            const itens = JSON.parse(localStorage.getItem(chaveCarrinho) || "[]");

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
        } catch (erro) {
            console.error("Não foi possível carregar o carrinho salvo.", erro);
            return [];
        }
    }

    const carrinho = new Map(
        lerCarrinhoSalvo().map(item => [item.nome, item])
    );

    function atualizarContagemCarrinho() {
        if (!contagemCarrinho) {
            return;
        }

        const quantidade = Array.from(carrinho.values())
            .reduce((total, item) => total + item.quantidade, 0);

        contagemCarrinho.textContent = `(${quantidade})`;
    }

    function salvarCarrinho() {
        try {
            localStorage.setItem(chaveCarrinho, JSON.stringify([...carrinho.values()]));
            atualizarContagemCarrinho();
            return true;
        } catch (erro) {
            console.error("Não foi possível salvar o carrinho.", erro);
            alert("Não foi possível salvar seu carrinho neste navegador.");
            return false;
        }
    }

    atualizarContagemCarrinho();

    window.addEventListener("storage", evento => {
        if (evento.key === chaveCarrinho) {
            carrinho.clear();
            lerCarrinhoSalvo().forEach(item => carrinho.set(item.nome, item));
            atualizarContagemCarrinho();
        }
    });

    produtos.forEach((produto, index) => {
        const nome = produto.querySelector("h3").textContent.trim();
        const precoElemento = produto.querySelector(".preco");
        const precoOriginal = Number(
            precoElemento.textContent.replace(/[^\d,]/g, "").replace(",", ".")
        );
        const imagem = produto.querySelector("img").getAttribute("src");
        const linkComprar = produto.querySelector("a.consultar");
        let botaoComprar = produto.querySelector(".produto-info button");

        if (linkComprar) {
            botaoComprar = document.createElement("button");
            botaoComprar.type = "button";
            botaoComprar.className = "consultar";
            linkComprar.replaceWith(botaoComprar);
        }

        const linkComprarCarrinho = document.createElement("a");
        linkComprarCarrinho.href = "carrinho.html";
        linkComprarCarrinho.target = "luxenCarrinho";
        linkComprarCarrinho.className = "consultar";
        linkComprarCarrinho.textContent = "COMPRAR";
        botaoComprar.replaceWith(linkComprarCarrinho);

        const emOferta = index < 4;
        const preco = emOferta
            ? Number((precoOriginal * 0.85).toFixed(2))
            : precoOriginal;
        const descricao = produto.querySelector("p").textContent.trim();

        const parametrosProduto = new URLSearchParams({
            nome,
            descricao,
            imagem,
            preco: String(preco),
            precoOriginal: String(precoOriginal),
            oferta: String(emOferta)
        });

        const linkDetalhes = document.createElement("a");
        linkDetalhes.className = "produto-detalhe-link";
        linkDetalhes.href = `produto.html?${parametrosProduto.toString()}`;
        linkDetalhes.setAttribute("aria-label", `Ver detalhes de ${nome}`);

        if (emOferta) {
            const selo = document.createElement("span");
            selo.className = "selo-oferta";
            selo.textContent = "OFERTA RELÂMPAGO · 15% OFF";
            produto.insertBefore(selo, produto.firstChild);
            precoElemento.innerHTML =
                `<span class="preco-antigo">De ${formatarPreco(precoOriginal)}</span>` +
                `<span class="preco-atual">Por ${formatarPreco(preco)}</span>`;
        }

        linkComprarCarrinho.addEventListener("click", evento => {
            const item = carrinho.get(nome);

            if (item) {
                item.quantidade += 1;
            } else {
                carrinho.set(nome, {
                    nome,
                    preco,
                    imagem,
                    quantidade: 1
                });
            }

            if (salvarCarrinho()) {
                atualizarContagemCarrinho();
            } else {
                evento.preventDefault();
            }
        });

        produto.appendChild(linkDetalhes);
    });


    // 5. BRILHO NOS BOTÕES
  

    const botoes = document.querySelectorAll(".botao, .consultar");

    botoes.forEach(botao => {

        botao.style.transition = "all 0.4s ease";

        botao.addEventListener("mouseenter", () => {
            botao.style.boxShadow =
                "0 0 18px rgba(212, 175, 55, 0.65)";
            botao.style.transform = "translateY(-3px)";
        });

        botao.addEventListener("mouseleave", () => {
            botao.style.boxShadow = "none";
            botao.style.transform = "translateY(0)";
        });

    });


    
    // 6. BARRA DE PESQUISA DE PRODUTOS
  

    const colecao = document.querySelector(".colecao");
    const grade = document.querySelector(".grade-produtos");

    const areaPesquisa = document.createElement("div");

    areaPesquisa.style.cssText = `
        max-width: 650px;
        margin: 30px auto;
        padding: 0 15px;
        text-align: center;
    `;

    areaPesquisa.innerHTML = `
        <input
            type="search"
            id="pesquisaProduto"
            placeholder="Pesquisar joias e acessórios..."
            aria-label="Pesquisar produtos"
            style="
                width: 100%;
                padding: 15px 20px;
                border: 1px solid #c5a45b;
                border-radius: 30px;
                outline: none;
                font-size: 15px;
                box-sizing: border-box;
                background: #fff;
                color: #333;
            "
        >

        <div id="filtrosProdutos"
            style="
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 10px;
                margin-top: 20px;
            ">
        </div>

        <p id="mensagemPesquisa"
            style="display:none; margin-top:20px;">
            Nenhum produto encontrado.
        </p>
    `;

    grade.parentNode.insertBefore(areaPesquisa, grade);

    const pesquisa = document.getElementById("pesquisaProduto");
    const filtros = document.getElementById("filtrosProdutos");
    const mensagem = document.getElementById("mensagemPesquisa");

    let categoriaSelecionada = "Todos";

    const categorias = [
        "Todos",
        ...Array.from(produtos).map(produto =>
            produto.querySelector("h3").textContent.trim()
        )
    ];

    // Criar botões de categorias
    categorias.forEach(categoria => {

        const botao = document.createElement("button");

        botao.textContent = categoria;

        botao.style.cssText = `
            padding: 9px 16px;
            border: 1px solid #c5a45b;
            background: #fff;
            color: #8b713b;
            border-radius: 20px;
            cursor: pointer;
            transition: 0.3s;
        `;

        botao.addEventListener("click", () => {

            categoriaSelecionada = categoria;

            atualizarFiltros();
            filtrarProdutos();

        });

        filtros.appendChild(botao);
    });


    // Destacar categoria selecionada
    function atualizarFiltros() {

        const botoesFiltro = filtros.querySelectorAll("button");

        botoesFiltro.forEach(botao => {

            const ativo = botao.textContent === categoriaSelecionada;

            botao.style.background = ativo ? "#b99a56" : "#fff";
            botao.style.color = ativo ? "#fff" : "#8b713b";

        });

    }


    // Pesquisar e filtrar produtos
    function normalizarTexto(texto) {
        return texto
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    }

    function filtrarProdutos() {

        const termo = normalizarTexto(pesquisa.value.trim());

        let encontrados = 0;

        produtos.forEach(produto => {

            const nome = normalizarTexto(
                produto.querySelector("h3").textContent
            );

            const descricao = normalizarTexto(
                produto.querySelector("p").textContent
            );
            const textoImagem = normalizarTexto(
                produto.querySelector("img").alt
            );

            const categoriaCorreta =
                normalizarTexto(categoriaSelecionada) === "todos" ||
                nome === normalizarTexto(categoriaSelecionada);

            const pesquisaCorreta =
                nome.includes(termo) ||
                descricao.includes(termo) ||
                textoImagem.includes(termo);

            if (categoriaCorreta && pesquisaCorreta) {

                produto.style.display = "";

                encontrados++;

            } else {

                produto.style.display = "none";

            }

        });

        mensagem.style.display =
            encontrados === 0 ? "block" : "none";

    }

    pesquisa.addEventListener("input", filtrarProdutos);

    document.querySelectorAll('a[href="#colecao"]').forEach(link => {
        link.addEventListener("click", () => {
            pesquisa.value = "";
            categoriaSelecionada = "Todos";
            atualizarFiltros();
            filtrarProdutos();
        });
    });

    atualizarFiltros();

});
