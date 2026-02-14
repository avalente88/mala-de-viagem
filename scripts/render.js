import { trips } from "./itinerary.js"; 

// 1. Descobrir qual viagem carregar 
const itineraryName = document.getElementById("dailyList"); 
const tripKey = itineraryName.dataset.trip; // ← "patagonia1", "uz", etc. 

const daysData = trips[tripKey].days;
// ----------------------------
// Helpers de UI
// ----------------------------
const colorByType = (type) => {
    // normaliza para classes existentes (mantém novas onde aplicável)
    if (type === "avião" || type === "voo") return "tag-voo";
    if (type === "comboio") return "tag-comboio";
    if (type === "tour") return "tag-tour";
    if (type === "autocarro") return "tag-autocarro";
    if (type === "ferry" || type === "barco") return "tag-ferry";
    return "tag-estrada"; // fallback
};

// ----------------------------
// Render
// ----------------------------
const root = document.getElementById('dailyList');

daysData.forEach((d, idx) => {
    // Linha simples
    const line = document.createElement('div');
    line.className = 'day-line';
    line.setAttribute('data-index', idx);

    const left = document.createElement('div');
    left.className = 'left';

    const date = document.createElement('div');
    date.className = 'date';
    date.textContent = d.date;

    const city = document.createElement('div');
    city.className = 'city';
    city.textContent = '— ' + d.city;

    left.appendChild(date);
    left.appendChild(city);

    // Tags de transporte
    if (d.transport && d.transport.length){
    d.transport.forEach(t => {
        const span = document.createElement('span');
        span.className = `tag ${colorByType(t.type)}`;
        // mostrar o tipo com eventual horário/texto
        const label = (t.type === 'voo') ? 'avião' : t.type;
        span.textContent = t.text ? `${label} ${t.text}` : label;
        left.appendChild(span);
    });
    }

    // Botão "Ver detalhes"
    const btn = document.createElement('button');
    btn.className = 'btn-tag';
    btn.type = 'button';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', `details-${idx}`);
    btn.textContent = 'Ver detalhes';

    // Wrapper da linha
    line.appendChild(left);
    line.appendChild(btn);

    // Bloco de detalhes (inicialmente fechado)
    const details = document.createElement('div');
    details.className = 'day-details';
    details.id = `details-${idx}`;

    (d.details || []).forEach(group => {
    const wrap = document.createElement('div');
    wrap.className = 'group';
    if (group.label){
        const h4 = document.createElement('h4');
        h4.textContent = group.label;
        wrap.appendChild(h4);
    }
    (group.items || []).forEach(it => {
        const p = document.createElement('div');
        p.className = 'bullet';
        p.textContent = '• ' + it;
        wrap.appendChild(p);
    });
    details.appendChild(wrap);
    });

    // Clique: abre/fecha
    btn.addEventListener('click', () => {
    const open = details.classList.contains('open');
    details.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(!open));
    btn.textContent = open ? 'Ver detalhes' : 'Ocultar';
    });

    // Anexa ao DOM
    root.appendChild(line);
    root.appendChild(details);
});

// ----------------------------
// Expandir / Ocultar todos
// ----------------------------
const expandAllBtn  = document.getElementById('expandAll');
const collapseAllBtn = document.getElementById('collapseAll');

expandAllBtn.addEventListener('click', () => {
    document.querySelectorAll('.day-details').forEach((el, i) => {
    el.classList.add('open');
    const btn = document.querySelector(`.day-line[data-index="${i}"] .btn-tag`);
    if(btn){ btn.setAttribute('aria-expanded','true'); btn.textContent = 'Ocultar'; }
    });
});

collapseAllBtn.addEventListener('click', () => {
    document.querySelectorAll('.day-details').forEach((el, i) => {
    el.classList.remove('open');
    const btn = document.querySelector(`.day-line[data-index="${i}"] .btn-tag`);
    if(btn){ btn.setAttribute('aria-expanded','false'); btn.textContent = 'Ver detalhes'; }
    });
});