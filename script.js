// ==================== VARIÁVEIS GLOBAIS ====================
let nomeJogador = "";
let personagemEscolhido = "";
let floresColetadas = 0;
let jogoAbelhaAtivo = false;
let abelhaX = 80, abelhaY = 200;
let florX, florY;
let animacaoId = null;
let fogoY, fumaçaY;
let canvas, ctx;
let setaCima = false, setaBaixo = false;
let pontosCompostagem = 0;
let itensCompostagem = [];
let itensProcessados = 0;
let acertosCompostagem = 0;
let mudasPlantadas = { tomate: false, alface: false, milho: false };

// Materiais para compostagem
const materiaisComp = [
    { nome: "🍌 Casca de banana", tipo: "organico", valor: 10 },
    { nome: "🍎 Casca de maçã", tipo: "organico", valor: 10 },
    { nome: "🍂 Folhas secas", tipo: "organico", valor: 10 },
    { nome: "🥬 Restos de verduras", tipo: "organico", valor: 10 },
    { nome: "🥫 Lata", tipo: "rejeito", valor: -5 },
    { nome: "🧴 Plástico", tipo: "rejeito", valor: -5 },
    { nome: "🔋 Pilha", tipo: "rejeito", valor: -5 }
];

// ==================== INICIALIZAÇÃO ====================
document.addEventListener("DOMContentLoaded", () => {
    const fases = document.querySelectorAll(".fase");
    function showFase(id) {
        fases.forEach(f => f.classList.remove("active"));
        const proxima = document.getElementById(id);
        if (proxima) proxima.classList.add("active");
        // Rola para o topo da página
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Acessibilidade: aumento/diminuição de fonte
    let fontSize = 100;
    document.getElementById("fontIncreaseBtn").onclick = () => {
        if (fontSize < 130) {
            fontSize += 10;
            document.body.style.fontSize = fontSize + "%";
        }
    };
    document.getElementById("fontDecreaseBtn").onclick = () => {
        if (fontSize > 70) {
            fontSize -= 10;
            document.body.style.fontSize = fontSize + "%";
        }
    };
    // Modo escuro
    const darkToggle = document.getElementById("darkModeToggle");
    const appContainer = document.getElementById("appContainer");
    darkToggle.onclick = () => {
        appContainer.classList.toggle("dark-mode");
        darkToggle.textContent = appContainer.classList.contains("dark-mode") ? "☀️" : "🌙";
    };

    // ========== FASE 0 -> 1 ==========
    document.getElementById("confirmarNome").onclick = () => {
        const input = document.getElementById("nomeJogador");
        if (!input.value.trim()) {
            alert("Por favor, digite seu nome!");
            return;
        }
        nomeJogador = input.value.trim();
        document.querySelectorAll(".nome-destaque").forEach(el => el.textContent = nomeJogador);
        showFase("fase1");
    };

    // ========== FASE 1 -> Escolha personagem ==========
    document.querySelectorAll(".btn-escolher").forEach(btn => {
        btn.onclick = (e) => {
            const card = btn.closest(".card-personagem");
            personagemEscolhido = (card.dataset.personagem === "menino") ? "👦 Lucas" : "👧 Sofia";
            showFase("fase2");
            const paragrafo = document.querySelector("#fase2 .fala p:first-child");
            if (paragrafo) {
                paragrafo.innerHTML = `${nomeJogador}, você escolheu ${personagemEscolhido}! Agora vamos proteger os polinizadores. Use as setas.`;
            }
        };
    });

    // ========== JOGO DA ABELHA (Canvas) ==========
    let teclasAtivas = false;
    function iniciarMiniGameAbelha() {
        if (animacaoId) cancelAnimationFrame(animacaoId);
        canvas = document.getElementById("gameCanvas");
        ctx = canvas.getContext("2d");
        floresColetadas = 0;
        document.getElementById("floresColetadas").innerText = floresColetadas;
        abelhaX = 80;
        abelhaY = canvas.height / 2;
        fogoY = canvas.height - 30;
        fumaçaY = 30;
        jogoAbelhaAtivo = true;

        // Posição inicial da flor
        reposicionarFlor();

        // Eventos de teclado (remover anteriores para evitar duplicação)
        if (teclasAtivas) {
            window.removeEventListener("keydown", keyDownHandler);
            window.removeEventListener("keyup", keyUpHandler);
        }
        function keyDownHandler(e) {
            if (e.key === "ArrowUp") { setaCima = true; e.preventDefault(); }
            if (e.key === "ArrowDown") { setaBaixo = true; e.preventDefault(); }
        }
        function keyUpHandler(e) {
            if (e.key === "ArrowUp") setaCima = false;
            if (e.key === "ArrowDown") setaBaixo = false;
        }
        window.addEventListener("keydown", keyDownHandler);
        window.addEventListener("keyup", keyUpHandler);
        teclasAtivas = true;

        function reposicionarFlor() {
            florX = Math.random() * (canvas.width - 60) + 30;
            florY = Math.random() * (canvas.height - 60) + 30;
        }

        function desenhar() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Céu
            ctx.fillStyle = "#87CEEB";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Fogo (baixo)
            ctx.fillStyle = "#ff5722";
            ctx.fillRect(0, fogoY, canvas.width, 30);
            ctx.fillStyle = "#ff8a65";
            ctx.fillRect(0, fogoY + 10, canvas.width, 20);
            // Fumaça (cima)
            ctx.fillStyle = "#b0bec5";
            ctx.fillRect(0, fumaçaY - 20, canvas.width, 35);
            // Flor
            ctx.fillStyle = "#ffd54f";
            ctx.beginPath();
            ctx.arc(florX, florY, 12, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = "#ffb300";
            ctx.beginPath();
            ctx.arc(florX, florY, 6, 0, 2 * Math.PI);
            ctx.fill();
            // Abelha
            ctx.fillStyle = "#fbc02d";
            ctx.beginPath();
            ctx.ellipse(abelhaX, abelhaY, 12, 9, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = "#000";
            ctx.fillRect(abelhaX + 8, abelhaY - 3, 8, 3);
            ctx.fillRect(abelhaX - 8, abelhaY - 2, 6, 2);
        }

        function atualizarJogo() {
            if (!jogoAbelhaAtivo) return;

            // Movimento
            if (setaCima && abelhaY > 25) abelhaY -= 5;
            if (setaBaixo && abelhaY < canvas.height - 35) abelhaY += 5;

            // Colisão com perigo
            const colidiuFogo = (abelhaY + 15 > fogoY);
            const colidiuFumaca = (abelhaY - 15 < fumaçaY + 10);
            if (colidiuFogo || colidiuFumaca) {
                alert("💨 Você colidiu com fogo/fumaça! Recomeçando missão...");
                floresColetadas = 0;
                document.getElementById("floresColetadas").innerText = floresColetadas;
                abelhaY = canvas.height / 2;
                reposicionarFlor();
                desenhar();
                requestAnimationFrame(atualizarJogo);
                return;
            }

            // Colisão com flor
            const dist = Math.hypot(abelhaX - florX, abelhaY - florY);
            if (dist < 25) {
                floresColetadas++;
                document.getElementById("floresColetadas").innerText = floresColetadas;
                if (floresColetadas >= 10) {
                    // Vitória
                    jogoAbelhaAtivo = false;
                    window.removeEventListener("keydown", keyDownHandler);
                    window.removeEventListener("keyup", keyUpHandler);
                    teclasAtivas = false;
                    cancelAnimationFrame(animacaoId);
                    const msgDiv = document.getElementById("msgParabensAbelha");
                    msgDiv.innerHTML = `Muito bem, ${nomeJogador}!<br>Você ajudou a proteger os polinizadores.<br>Graças às abelhas, muitas culturas agrícolas conseguem produzir alimentos.<br>Quando protegemos os polinizadores, fortalecemos toda a cadeia alimentar.`;
                    showFase("fase4");
                    return;
                }
                reposicionarFlor();
            }
            desenhar();
            animacaoId = requestAnimationFrame(atualizarJogo);
        }

        desenhar();
        atualizarJogo();
    }

    document.getElementById("iniciarJogoAbelha").onclick = () => {
        showFase("fase3");
        setTimeout(() => iniciarMiniGameAbelha(), 100);
    };
    document.getElementById("reiniciarAbelha").onclick = () => {
        if (animacaoId) cancelAnimationFrame(animacaoId);
        iniciarMiniGameAbelha();
    };

    // ========== COMPOSTAGEM ==========
    document.getElementById("proxCompostagem").onclick = () => {
        showFase("fase5");
        document.getElementById("falaCompostagem").innerHTML = `${nomeJogador}, agora vamos aprender sobre compostagem.<br>Nem todo lixo precisa ser descartado.<br>Restos de frutas, verduras e folhas podem virar adubo natural.<br>A compostagem reduz a quantidade de resíduos e melhora o solo.<br>Vamos separar corretamente.`;
    };

    function carregarJogoCompostagem() {
        const divMateriais = document.getElementById("materiaisLista");
        divMateriais.innerHTML = "";
        pontosCompostagem = 0;
        itensProcessados = 0;
        acertosCompostagem = 0;
        document.getElementById("pontosCompostagem").innerText = "0";
        document.getElementById("itensComposteira").innerHTML = "";
        document.getElementById("finalizarCompostagem").disabled = true;
        document.getElementById("feedbackCompostagem").innerHTML = "";
        itensCompostagem = [...materiaisComp];

        itensCompostagem.forEach((item, idx) => {
            const el = document.createElement("div");
            el.className = "item-material";
            el.setAttribute("draggable", "true");
            el.setAttribute("data-idx", idx);
            el.setAttribute("data-tipo", item.tipo);
            el.textContent = item.nome;
            el.addEventListener("dragstart", (e) => {
                e.dataTransfer.setData("text/plain", idx);
                e.target.style.opacity = "0.5";
            });
            el.addEventListener("dragend", (e) => e.target.style.opacity = "1");
            divMateriais.appendChild(el);
        });

        const composteira = document.getElementById("composteiraDrop");
        // Remove listener antigo para evitar duplicação
        composteira.removeEventListener("dragover", allowDrop);
        composteira.removeEventListener("drop", handleDrop);
        composteira.addEventListener("dragover", allowDrop);
        composteira.addEventListener("drop", handleDrop);
    }

    function allowDrop(e) { e.preventDefault(); }

    function handleDrop(e) {
        e.preventDefault();
        const idx = e.dataTransfer.getData("text/plain");
        if (!idx) return;
        const item = itensCompostagem[idx];
        if (!item) return;

        pontosCompostagem += item.valor;
        document.getElementById("pontosCompostagem").innerText = pontosCompostagem;
        if (item.valor > 0) acertosCompostagem++;
        itensProcessados++;

        const listaIten = document.getElementById("itensComposteira");
        const novoDiv = document.createElement("div");
        novoDiv.textContent = `${item.nome} ${item.valor > 0 ? "✔️" : "❌"}`;
        listaIten.appendChild(novoDiv);

        // Remove o item da lista de materiais
        const draggedElement = document.querySelector(`.item-material[data-idx='${idx}']`);
        if (draggedElement) draggedElement.remove();
        itensCompostagem[idx] = null;

        if (itensProcessados === materiaisComp.length) {
            document.getElementById("feedbackCompostagem").innerHTML = `✅ Compostagem finalizada! Acertos: ${acertosCompostagem} de 4 orgânicos. Pontuação final: ${pontosCompostagem}`;
            document.getElementById("finalizarCompostagem").disabled = false;
        }
    }

    document.getElementById("iniciarCompostagem").onclick = () => {
        carregarJogoCompostagem();
        showFase("fase6");
    };
    document.getElementById("finalizarCompostagem").onclick = () => {
        showFase("fase7");
        document.getElementById("msgMestreCompost").innerHTML = `Excelente trabalho, ${nomeJogador}!<br>Você transformou resíduos orgânicos em adubo natural.<br>Esse adubo ajuda as plantas a crescerem saudáveis.<br>Assim produzimos alimentos sem prejudicar o meio ambiente.`;
    };

    // ========== PLANTIO ==========
    document.getElementById("proxPlantio").onclick = () => {
        showFase("fase8");
        document.getElementById("falaPlantio").innerHTML = `${nomeJogador}, graças às abelhas e à compostagem, agora podemos produzir alimentos de forma sustentável.<br>Os polinizadores ajudaram as plantas.<br>O adubo fortaleceu o solo.<br>Agora vamos plantar!`;
    };

    let plantioSetup = false;
    function setupPlantio() {
        if (plantioSetup) return;
        plantioSetup = true;
        mudasPlantadas = { tomate: false, alface: false, milho: false };
        const mudas = document.querySelectorAll(".muda");
        const canteiros = document.querySelectorAll(".canteiro");

        mudas.forEach(m => {
            m.removeEventListener("dragstart", mudaDragStart);
            m.addEventListener("dragstart", mudaDragStart);
        });
        function mudaDragStart(e) {
            e.dataTransfer.setData("text/plain", e.target.dataset.tipo);
        }

        canteiros.forEach(c => {
            c.removeEventListener("dragover", allowDropPlantio);
            c.removeEventListener("drop", dropPlantio);
            c.addEventListener("dragover", allowDropPlantio);
            c.addEventListener("drop", dropPlantio);
        });
        function allowDropPlantio(e) { e.preventDefault(); }
        function dropPlantio(e) {
            e.preventDefault();
            const tipo = e.dataTransfer.getData("text/plain");
            const cultura = e.target.closest(".canteiro").dataset.cultura;
            if (tipo === cultura && !mudasPlantadas[tipo]) {
                mudasPlantadas[tipo] = true;
                const plantaSpan = e.target.closest(".canteiro").querySelector(".planta-emoji");
                plantaSpan.innerHTML = "🌱";
                document.getElementById("feedbackPlantio").innerHTML = `🌱 Muda de ${tipo} plantada!`;
            } else {
                document.getElementById("feedbackPlantio").innerHTML = "❌ Local incorreto ou já plantado!";
            }
            if (mudasPlantadas.tomate && mudasPlantadas.alface && mudasPlantadas.milho) {
                document.getElementById("finalizarPlantio").disabled = false;
            }
        }
        document.getElementById("finalizarPlantio").disabled = true;
    }

    document.getElementById("iniciarPlantio").onclick = () => {
        setupPlantio();
        // Reseta visual dos canteiros
        document.querySelectorAll(".planta-emoji").forEach(el => el.innerHTML = "⬜");
        mudasPlantadas = { tomate: false, alface: false, milho: false };
        document.getElementById("finalizarPlantio").disabled = true;
        document.getElementById("feedbackPlantio").innerHTML = "";
        document.getElementById("regarPlantas").disabled = false;
        showFase("fase9");
    };

    document.getElementById("regarPlantas").onclick = () => {
        if (!mudasPlantadas.tomate || !mudasPlantadas.alface || !mudasPlantadas.milho) {
            alert("🌱 Plante todas as mudas antes de regar!");
            return;
        }
        const plantas = document.querySelectorAll(".planta-emoji");
        let etapa = 0;
        const crescimento = ["🌱", "🌿", "🍅", "🥬", "🌽"];
        const intervaloCresc = setInterval(() => {
            if (etapa < 2) {
                plantas.forEach(p => p.innerHTML = crescimento[etapa]);
                etapa++;
            } else if (etapa === 2) {
                document.querySelector(".canteiro[data-cultura='tomate'] .planta-emoji").innerHTML = "🍅";
                document.querySelector(".canteiro[data-cultura='alface'] .planta-emoji").innerHTML = "🥬";
                document.querySelector(".canteiro[data-cultura='milho'] .planta-emoji").innerHTML = "🌽";
                etapa++;
            } else {
                clearInterval(intervaloCresc);
                document.getElementById("feedbackPlantio").innerHTML = "🌻 Colheita realizada com sucesso!";
                document.getElementById("finalizarPlantio").disabled = false;
                document.getElementById("regarPlantas").disabled = true;
            }
        }, 800);
    };

    document.getElementById("finalizarPlantio").onclick = () => {
        showFase("fase10");
        document.getElementById("msgAgricultor").innerHTML = `Parabéns, ${nomeJogador}!<br>Você ajudou a proteger os polinizadores.<br>Produziu adubo natural.<br>E cultivou alimentos de forma sustentável.<br>Esse é o caminho para um Agro Forte e Futuro Sustentável.`;
    };

    // ========== QUIZ ==========
    document.getElementById("proxQuiz").onclick = () => showFase("fase11");

    document.getElementById("verificarQuiz").onclick = () => {
        const q1 = document.querySelector('input[name="q1"]:checked');
        const q2 = document.querySelector('input[name="q2"]:checked');
        const q3 = document.querySelector('input[name="q3"]:checked');
        let acertos = 0;
        if (q1 && q1.value === "b") acertos++;
        if (q2 && q2.value === "c") acertos++;
        if (q3 && q3.value === "c") acertos++;
        const feedback = document.getElementById("feedbackQuiz");
        if (acertos === 3) {
            feedback.innerHTML = "✅ Excelente! Você aprendeu os principais conceitos do Agro Forte.";
            document.getElementById("proxCertificado").style.display = "inline-block";
        } else {
            feedback.innerHTML = `⚠️ Você acertou ${acertos} de 3. Tente novamente!`;
            document.getElementById("proxCertificado").style.display = "none";
        }
    };

    document.getElementById("proxCertificado").onclick = () => {
        document.getElementById("certNome").innerText = nomeJogador;
        const hoje = new Date();
        const dataFormatada = hoje.toLocaleDateString("pt-BR");
        document.getElementById("dataCertificado").innerText = dataFormatada;
        showFase("fase12");
    };

    document.getElementById("reiniciarJogo").onclick = () => location.reload();
});
