import { trips } from "./itinerary.js"; 
import { hotels } from "./itinerary.js"; 

// 1. Descobrir qual viagem carregar 
const itineraryName = document.getElementById("dailyList"); 
const tripKey = itineraryName.dataset.trip; // ← "patagonia1", "uz", etc. 


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
// Render Hotels
// ----------------------------

const hotelsTBody= document.querySelector("#hotelsTable tbody");
const hotelsData = hotels[tripKey].hotels;

hotelsData.forEach((d, idx) => {
    hotelsTBody.innerHTML = ""; // limpa antes de preencher

    hotelsData.forEach(hotel => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
        <td><a class="hotel" href="${hotel.url}" target="_blank" rel="noopener">${hotel.hotel}</a></td>
        <td>${hotel.local}</td>
        <td>${hotel.noites}</td>
        <td>${hotel.regime}</td>
        <td class="right">${hotel.preco.toFixed(2).replace(".", ",")}&nbsp;€</td>
    `;

    hotelsTBody.appendChild(tr);
    });    
});

// ----------------------------
// Render Daily List
// ----------------------------
const root = document.getElementById('dailyList');
const daysData = trips[tripKey].days;

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


// ----------------------------
// Carregar o html para mobile para os voos
// ----------------------------

 // Aplica data-labels a todas as TD com base no texto dos TH
function applyDataLabels(table) {
if (!table) return;
const ths = Array.from(table.querySelectorAll('thead th'));
if (!ths.length) return;

// Extrai os textos dos TH (tratando espaços e quebras)
const headers = ths.map(th => (th.textContent || '').replace(/\s+/g, ' ').trim());

// Aplica em cada TD
table.querySelectorAll('tbody tr').forEach(tr => {
    Array.from(tr.children).forEach((td, i) => {
    const label = headers[i] || '';
    if (label) td.setAttribute('data-label', label);
    });
});
}

// Aplica aos seletores desejados
function makeStackedTables(...selectors) {
selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(applyDataLabels);
});
}

// Corre quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
makeStackedTables('#voos table', '#hoteis table');

// OPCIONAL: se a tua página renderiza/atualiza tabelas via JS depois do load
// ativa este observer para voltar a aplicar labels quando o tbody mudar
const observer = new MutationObserver(() => {
    makeStackedTables('#voos table', '#hoteis table');
});
document.querySelectorAll('#voos table tbody, #hoteis table tbody').forEach(tbody => {
    observer.observe(tbody, { childList: true, subtree: true });
});
});

async function runSearch(){
    if(!dateInput.value) { dateInput.focus(); return; }

    const isoDate = dateInput.value; // yyyy-mm-dd
    thead.innerHTML = "<tr><th>Voos</th><th>Data</th><th>Origem</th><th>Destino</th><th>Partida</th><th>Chegada</th><th>Tempo</th><th>Escala</th><th class='right'>Preço</th></tr>";

    // Loading state
    if(tbody){
    tbody.innerHTML = '<tr><td colspan="9">A procurar voos…</td></tr>';
    }

    try{

    const offers = await getAllOffers(isoDate, flights);

    if (offers.some(o => o.length === 0)) {
        tbody.innerHTML = '<tr><td colspan="9">Há pelo menos um dos trajetos para o qual não foi encontrado voo.</td></tr>';
        return;
    }

    // Map first up to 10 results onto the table schema
    const rows = offers.slice(0,10).map(o => {
        const itin0 = o.itineraries?.[0];
        const seg0 = itin0?.segments?.[0];
        const lastSeg = itin0?.segments?.[itin0.segments.length-1];
        const dep = seg0?.departure?.at?.substring(11,16) || '';
        const arr = lastSeg?.arrival?.at?.substring(11,16) || '';
        const depAirport = getAirportLabel(seg0?.departure.iataCode);
        const arrAirport = getAirportLabel(lastSeg?.arrival.iataCode);
        const stops = getStops(itin0);
        const duration = itin0?.duration?.replace('PT','').toLowerCase() || '';
        const code = o.validatingAirlineCodes?.[0] || (seg0?.carrierCode||'') + (seg0?.number||'');
        const price = o.price?.total || '';
        const datePretty = seg0?.departure.at.split("T")[0].split('-').reverse().join('-');
        const flightNumber = itin0.segments?.map(seg => seg.carrierCode + seg.number).join(" + ");
        
        return `
        <tr>
            <td>${flightNumber}</td>
            <td>${datePretty}</td>
            <td>${depAirport}</td>
            <td>${arrAirport}</td>
            <td>${dep}</td>
            <td>${arr}</td>
            <td>${duration}</td>
            <td>${stops === 0 ? '' : stops.toString()}</td>
            <td class="right">${price ? price + ' €' : ''}</td>
        </tr>`; 
    }).join('');
    tbody.innerHTML = rows;
    }catch(err){
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="9">Ocorreu um erro ao procurar voos.</td></tr>';
    }
}
const btn = document.getElementById('btnSearchFlights');
const dateInput = document.getElementById('departureDate');
const tbody = document.querySelector('#voos table tbody');
const thead = document.querySelector('#voos table thead');
          
if(btn){ btn.addEventListener('click', runSearch); }