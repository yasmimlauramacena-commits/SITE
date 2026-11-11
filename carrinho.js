document.addEventListener("DOMContentLoaded", () => {
    const chaveCarrinho = "luxenCarrinho";
    const itensCarrinho = document.getElementById("itensCarrinho");
    const totalCarrinho = document.getElementById("totalCarrinho");
    const contagemCarrinho = document.getElementById("contagemCarrinho");
    const botaoFinalizar = document.getElementById("finalizarCompra");
    const confirmacaoCompra = document.getElementById("confirmacaoCompra");

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

    let carrinho = lerCarrinhoSalvo();

    function salvarCarrinho() {
        try {
            localStorage.setItem(chaveCarrinho, JSON.stringify(carrinho));
        } catch (erro) {
            console.error("Não foi possível salvar o carrinho.", erro);
            alert("Não foi possível atualizar seu carrinho neste navegador.");
        }
    }

    function formatarPreco(valor) {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL"
        }).format(valor);
    }

    function renderizarCarrinho() {
        itensCarrinho.replaceChildren();
        let quantidadeTotal = 0;
        let valorTotal = 0;

        if (carrinho.length === 0) {
            const vazio = document.createElement("p");
            vazio.className = "carrinho-vazio";
            vazio.textContent =
                "Seu carrinho está vazio. Volte à coleção para escolher suas peças favoritas.";
            itensCarrinho.appendChild(vazio);
        }

        carrinho.forEach((item, indice) => {
            quantidadeTotal += item.quantidade;
            valorTotal += item.preco * item.quantidade;

            const linha = document.createElement("article");
            linha.className = "item-carrinho";

            const imagem = document.createElement("img");
            imagem.src = item.imagem || "";
            imagem.alt = "";

            const detalhes = document.createElement("div");
            detalhes.className = "detalhes-carrinho";

            const titulo = document.createElement("h3");
            titulo.textContent = item.nome;

            const preco = document.createElement("p");
            preco.textContent = `${formatarPreco(item.preco)} cada`;

            const controles = document.createElement("div");
            controles.className = "controles-quantidade";

            const menos = document.createElement("button");
            menos.type = "button";
            menos.textContent = "−";
            menos.setAttribute("aria-label", `Diminuir quantidade de ${item.nome}`);
            menos.addEventListener("click", () => {
                item.quantidade -= 1;
                if (item.quantidade === 0) {
                    carrinho.splice(indice, 1);
                }
                confirmacaoCompra.textContent = "";
                salvarCarrinho();
                renderizarCarrinho();
            });

            const quantidade = document.createElement("span");
            quantidade.textContent = String(item.quantidade);
            quantidade.setAttribute("aria-label", "Quantidade");

            const mais = document.createElement("button");
            mais.type = "button";
            mais.textContent = "+";
            mais.setAttribute("aria-label", `Aumentar quantidade de ${item.nome}`);
            mais.addEventListener("click", () => {
                item.quantidade += 1;
                confirmacaoCompra.textContent = "";
                salvarCarrinho();
                renderizarCarrinho();
            });

            controles.append(menos, quantidade, mais);
            detalhes.append(titulo, preco, controles);

            const subtotal = document.createElement("strong");
            subtotal.className = "subtotal-item";
            subtotal.textContent = formatarPreco(item.preco * item.quantidade);

            linha.append(imagem, detalhes, subtotal);
            itensCarrinho.appendChild(linha);
        });

        totalCarrinho.textContent = formatarPreco(valorTotal);
        contagemCarrinho.textContent = `(${quantidadeTotal})`;
        botaoFinalizar.disabled = quantidadeTotal === 0;
    }

    botaoFinalizar.addEventListener("click", () => {
        const metodo = document.querySelector('input[name="pagamento"]:checked').value;
        confirmacaoCompra.textContent =
            `Pedido demonstrativo: total de ${totalCarrinho.textContent}, ` +
            `com pagamento por ${metodo}. Nenhuma cobrança foi realizada.`;
    });

    window.addEventListener("storage", evento => {
        if (evento.key === chaveCarrinho) {
            carrinho = lerCarrinhoSalvo();
            confirmacaoCompra.textContent = "";
            renderizarCarrinho();
        }
    });

    renderizarCarrinho();
});
