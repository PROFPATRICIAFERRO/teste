// ==================== VARIÁVEIS GLOBAIS ====================
let nomeJogador = "";
let personagemEscolhido = "";
let floresColetadas = 0, jogoAtivo = false, animId = null;
let abelhaX = 80, abelhaY = 200, florX, florY, fogoY, fumaçaY;
let canvas, ctx;
let setaCima = false, setaBaixo = false;
let pontosComp = 0, itensProcessados = 0, acertosComp = 0, itensComp = [];
let mudasPlantadas = { tomate: false, alface: false, milho: false };
const materiais = [
    { nome: "🍌 Casca banana", tipo: "org", val: 10 },
    { nome: "🍎 Casca maçã", tipo: "org", val: 10 },
    { nome: "🍂 Folhas secas", tipo: "org", val: 10 },
    { nome: "🥬 Restos verduras", tipo: "org", val: 10 },
    { nome: "🥫 Lata", tipo: "rej", val: -5 },
    { nome: "🧴 Plástico", tipo: "rej", val: -5 },
    { nome: "🔋 Pilha", tipo: "rej", val: -5 }
];

// ==================== UTILITÁRIOS ====================
function showFase(id) {
    document.querySelectorAll(".fase").forEach(f => f.classList.remove("active"));
    document.getElementById(id).classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// ==================== ACESSIBILIDADE ====================
let fontSize = 100;
document.getElementById("fontIncreaseBtn").onclick = () => { if (fontSize<130) { fontSize+=10; document.body.style.fontSize=fontSize+"%"; } };
document.getElementById("fontDecreaseBtn").onclick = () => { if (fontSize>70) { fontSize-=10; document.body.style.fontSize=fontSize+"%"; } };
const container = document.getElementById("appContainer");
document.getElementById("darkModeToggle").onclick = () => {
    container.classList.toggle("dark-mode");
    document.getElementById("darkModeToggle").textContent = container.classList.contains("dark-mode") ? "☀️" : "🌙";
};

// ==================== FASE 0 e 1 ====================
document.getElementById("confirmarNome").onclick = () => {
    const input = document.getElementById("nomeJogador");
    if (!input.value.trim()) { alert("Digite seu nome!"); return; }
    nomeJogador = input.value.trim();
    document.querySelectorAll(".nome-destaque").forEach(el => el.textContent = nomeJogador);
    showFase("fase1");
};
document.querySelectorAll(".btn-escolher").forEach(btn => {
    btn.onclick = (e) => {
        const card = btn.closest(".card-personagem");
        personagemEscolhido = card.dataset.personagem === "menino" ? "👦 Lucas" : "👧 Sofia";
        const p = document.querySelector("#fase2 .fala p:first-child");
        if(p) p.innerHTML = `${nomeJogador}, você escolheu ${personagemEscolhido}! Vamos proteger as abelhas. Use setas ↑↓.`;
        showFase("fase2");
    };
});

// ==================== JOGO DA ABELHA (CANVAS) ====================
function iniciarAbelha() {
    if (animId) cancelAnimationFrame(animId);
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    floresColetadas = 0;
    document.getElementById("floresColetadas").innerText = floresColetadas;
    abelhaX = 80;
    abelhaY = canvas.height/2;
    fogoY = canvas.height-30;
    fumaçaY = 30;
    jogoAtivo = true;

    function reposFlor() { florX = 30+Math.random()*(canvas.width-60); florY = 30+Math.random()*(canvas.height-60); }
    reposFlor();

    function desenhar() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle="#87CEEB"; ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle="#ff5722"; ctx.fillRect(0,fogoY,canvas.width,30);
        ctx.fillStyle="#b0bec5"; ctx.fillRect(0,fumaçaY-20,canvas.width,35);
        ctx.fillStyle="#ffd54f"; ctx.beginPath(); ctx.arc(florX,florY,12,0,2*Math.PI); ctx.fill();
        ctx.fillStyle="#fbc02d"; ctx.beginPath(); ctx.ellipse(abelhaX,abelhaY,12,9,0,0,2*Math.PI); ctx.fill();
        ctx.fillStyle="black"; ctx.fillRect(abelhaX+8,abelhaY-3,8,3);
    }

    function atualizar() {
        if (!jogoAtivo) return;
        if (setaCima && abelhaY>25) abelhaY -= 5;
        if (setaBaixo && abelhaY<canvas.height-35) abelhaY += 5;
        if ((abelhaY+15>fogoY) || (abelhaY-15<fumaçaY+10)) {
            alert("💥 Colidiu com fogo/fumaça! Recomeçando...");
            floresColetadas=0; document.getElementById("floresColetadas").innerText=0;
            abelhaY=canvas.height/2; reposFlor();
            desenhar(); requestAnimationFrame(atualizar);
            return;
        }
        if (Math.hypot(abelhaX-florX, abelhaY-florY)<25) {
            floresColetadas++;
            document.getElementById("floresColetadas").innerText = floresColetadas;
            if (floresColetadas >= 10) {
                jogoAtivo = false;
                window.removeEventListener("keydown", keydownH);
                window.removeEventListener("keyup", keyupH);
                cancelAnimationFrame(animId);
                document.getElementById("msgParabensAbelha").innerHTML = `Muito bem, ${nomeJogador}!<br>Você ajudou a proteger os polinizadores.<br>Graças às abelhas, muitas culturas agrícolas produzem alimentos.<br>Proteger polinizadores fortalece a cadeia alimentar.`;
                showFase("fase4");
                return;
            }
            reposFlor();
        }
        desenhar();
        animId = requestAnimationFrame(atualizar);
    }

    function keydownH(e) { if(e.key==="ArrowUp"){ setaCima=true; e.preventDefault(); } if(e.key==="ArrowDown"){ setaBaixo=true; e.preventDefault(); } }
    function keyupH(e) { if(e.key==="ArrowUp") setaCima=false; if(e.key==="ArrowDown") setaBaixo=false; }
    window.removeEventListener("keydown", keydownH); window.removeEventListener("keyup", keyupH);
    window.addEventListener("keydown", keydownH); window.addEventListener("keyup", keyupH);
    desenhar();
    atualizar();
}
document.getElementById("iniciarJogoAbelha").onclick = () => { showFase("fase3"); setTimeout(iniciarAbelha, 100); };
document.getElementById("reiniciarAbelha").onclick = () => { if(animId) cancelAnimationFrame(animId); iniciarAbelha(); };

// ==================== COMPOSTAGEM DRAG & DROP ====================
function carregarCompostagem() {
    const divM = document.getElementById("materiaisLista");
    divM.innerHTML = "";
    pontosComp=0; itensProcessados=0; acertosComp=0;
    document.getElementById("pontosCompostagem").innerText="0";
    document.getElementById("itensComposteira").innerHTML="";
    document.getElementById("finalizarCompostagem").disabled=true;
    document.getElementById("feedbackCompostagem").innerHTML="";
    itensComp = [...materiais];
    itensComp.forEach((item, idx) => {
        const el = document.createElement("div");
        el.className = "item-material";
        el.setAttribute("draggable","true");
        el.setAttribute("data-idx", idx);
        el.textContent = item.nome;
        el.addEventListener("dragstart", e => { e.dataTransfer.setData("text/plain", idx); e.target.style.opacity="0.5"; });
        el.addEventListener("dragend", e => e.target.style.opacity="1");
        divM.appendChild(el);
    });
    const comp = document.getElementById("composteiraDrop");
    comp.ondragover = e => e.preventDefault();
    comp.ondrop = e => {
        e.preventDefault();
        const idx = e.dataTransfer.getData("text/plain");
        if (!idx || !itensComp[idx]) return;
        const item = itensComp[idx];
        pontosComp += item.val;
        document.getElementById("pontosCompostagem").innerText = pontosComp;
        if(item.val>0) acertosComp++;
        itensProcessados++;
        document.getElementById("itensComposteira").innerHTML += `<div>${item.nome} ${item.val>0?"✔️":"❌"}</div>`;
        const dragged = document.querySelector(`.item-material[data-idx='${idx}']`);
        if(dragged) dragged.remove();
        itensComp[idx] = null;
        if(itensProcessados === materiais.length){
            document.getElementById("feedbackCompostagem").innerHTML = `✅ Finalizado! Acertos: ${acertosComp} de 4 orgânicos. Pontuação: ${pontosComp}`;
            document.getElementById("finalizarCompostagem").disabled = false;
        }
    };
}
document.getElementById("proxCompostagem").onclick = () => {
    showFase("fase5");
    document.getElementById("falaCompostagem").innerHTML = `${nomeJogador}, agora vamos aprender sobre compostagem.<br>Restos de frutas, verduras e folhas viram adubo.<br>Vamos separar corretamente.`;
};
document.getElementById("iniciarCompostagem").onclick = () => { carregarCompostagem(); showFase("fase6"); };
document.getElementById("finalizarCompostagem").onclick = () => {
    showFase("fase7");
    document.getElementById("msgMestreCompost").innerHTML = `Excelente, ${nomeJogador}!<br>Você transformou resíduos em adubo.<br>Esse adubo ajuda as plantas a crescer saudáveis.`;
};

// ==================== PLANTIO ====================
document.getElementById("proxPlantio").onclick = () => {
    showFase("fase8");
    document.getElementById("falaPlantio").innerHTML = `${nomeJogador}, com abelhas e compostagem, agora vamos plantar!<br>Arraste mudas, regue e veja crescer.`;
};
let plantioReady = false;
function setupPlantio() {
    if(plantioReady) return;
    plantioReady = true;
    const mudas = document.querySelectorAll(".muda");
    mudas.forEach(m => {
        m.addEventListener("dragstart", e => e.dataTransfer.setData("text/plain", m.dataset.tipo));
    });
    const canteiros = document.querySelectorAll(".canteiro");
    canteiros.forEach(c => {
        c.addEventListener("dragover", e => e.preventDefault());
        c.addEventListener("drop", e => {
            e.preventDefault();
            const tipo = e.dataTransfer.getData("text/plain");
            const cultura = e.target.closest(".canteiro").dataset.cultura;
            if(tipo === cultura && !mudasPlantadas[tipo]){
                mudasPlantadas[tipo] = true;
                e.target.closest(".canteiro").querySelector(".planta-emoji").innerHTML = "🌱";
                document.getElementById("feedbackPlantio").innerHTML = `🌱 Muda de ${tipo} plantada!`;
            } else document.getElementById("feedbackPlantio").innerHTML = "❌ Local errado ou já plantado!";
            if(mudasPlantadas.tomate && mudasPlantadas.alface && mudasPlantadas.milho)
                document.getElementById("finalizarPlantio").disabled = false;
        });
    });
    document.getElementById("finalizarPlantio").disabled = true;
}
document.getElementById("iniciarPlantio").onclick = () => {
    setupPlantio();
    mudasPlantadas = { tomate:false, alface:false, milho:false };
    document.querySelectorAll(".planta-emoji").forEach(el => el.innerHTML = "⬜");
    document.getElementById("finalizarPlantio").disabled = true;
    document.getElementById("feedbackPlantio").innerHTML = "";
    document.getElementById("regarPlantas").disabled = false;
    showFase("fase9");
};
document.getElementById("regarPlantas").onclick = () => {
    if(!mudasPlantadas.tomate || !mudasPlantadas.alface || !mudasPlantadas.milho){
        alert("🌱 Plante todas as mudas primeiro!");
        return;
    }
    let etapa = 0;
    const interval = setInterval(() => {
        if(etapa === 0){
            document.querySelectorAll(".planta-emoji").forEach(p => p.innerHTML = "🌱");
            etapa++;
        } else if(etapa === 1){
            document.querySelectorAll(".planta-emoji").forEach(p => p.innerHTML = "🌿");
            etapa++;
        } else if(etapa === 2){
            document.querySelector(".canteiro[data-cultura='tomate'] .planta-emoji").innerHTML = "🍅";
            document.querySelector(".canteiro[data-cultura='alface'] .planta-emoji").innerHTML = "🥬";
            document.querySelector(".canteiro[data-cultura='milho'] .planta-emoji").innerHTML = "🌽";
            etapa++;
        } else {
            clearInterval(interval);
            document.getElementById("feedbackPlantio").innerHTML = "🌻 Colheita realizada! Missão concluída.";
            document.getElementById("finalizarPlantio").disabled = false;
            document.getElementById("regarPlantas").disabled = true;
        }
    }, 700);
};
document.getElementById("finalizarPlantio").onclick = () => {
    showFase("fase10");
    document.getElementById("msgAgricultor").innerHTML = `Parabéns, ${nomeJogador}!<br>Você protegeu polinizadores, fez adubo e cultivou alimentos.<br>Esse é o caminho para um Agro Forte e Futuro Sustentável.`;
};

// ==================== QUIZ FINAL ====================
document.getElementById("proxQuiz").onclick = () => showFase("fase11");
document.getElementById("verificarQuiz").onclick = () => {
    const q1 = document.querySelector('input[name="q1"]:checked');
    const q2 = document.querySelector('input[name="q2"]:checked');
    const q3 = document.querySelector('input[name="q3"]:checked');
    let acertos=0;
    if(q1 && q1.value==="b") acertos++;
    if(q2 && q2.value==="c") acertos++;
    if(q3 && q3.value==="c") acertos++;
    const fb = document.getElementById("feedbackQuiz");
    if(acertos===3){
        fb.innerHTML = "✅ Excelente! Você aprendeu os principais conceitos do Agro Forte.";
        document.getElementById("proxCertificado").style.display = "inline-block";
    } else {
        fb.innerHTML = `⚠️ Você acertou ${acertos} de 3. Tente novamente!`;
        document.getElementById("proxCertificado").style.display = "none";
    }
};
document.getElementById("proxCertificado").onclick = () => {
    document.getElementById("certNome").innerText = nomeJogador;
    document.getElementById("dataCertificado").innerText = new Date().toLocaleDateString("pt-BR");
    showFase("fase12");
};
document.getElementById("reiniciarJogo").onclick = () => location.reload();
