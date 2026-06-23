
const STOP_ID = '687'; 
const URL = `https://ttss.mpk.krakow.pl/internetservice/services/passageInfo/stopPassages/stop?stop=${STOP_ID}&mode=departure`;


const rozklad133 = {
    robocze: ["04:36", "05:09", "05:38", "06:09", "07:09", "07:39", "08:09", "08:39", "09:09", "09:39", "10:09", "10:39", "11:09", "11:39", "12:09", "12:39", "13:09", "13:39", "14:09", "14:39", "15:10", "15:40", "16:10", "16:40", "17:10", "17:40", "18:10", "18:40", "19:16", "19:56", "20:36", "21:16", "21:56", "22:36", "23:16"],
    sobota: ["04:36", "05:16", "05:56", "06:36", "07:16", "07:56", "08:36", "09:16", "09:56", "10:36", "11:16", "11:56", "12:36", "13:16", "13:56", "14:36", "15:16", "15:56", "16:36", "17:16", "17:56", "18:36", "19:16", "19:56", "20:36", "21:16", "21:56", "22:41", "23:21"],
    niedziela: ["04:36", "05:16", "05:56", "06:36", "07:16", "07:56", "08:36", "09:16", "09:56", "10:36", "11:16", "11:56", "12:36", "13:16", "13:56", "14:36", "15:16", "15:56", "16:36", "17:16", "17:56", "18:36", "19:16", "19:56", "20:36", "21:16", "21:56", "22:41", "23:21"],
};

async function pobierzOdjazdy() {
    try {
        const odpowiedz = await fetch(URL);
        const dane = await odpowiedz.json();
        
        let odjazdy = dane.actual || []; 
        const pojemnik = document.getElementById('odjazdy-lista');
        
        const czyJest133 = odjazdy.some(a => a.patternText === '133');
        
        if (!czyJest133) {
            const teraz = new Date();
            const dzien = teraz.getDay(); 
            
            let lista;
            if (dzien === 0) lista = rozklad133.niedziela;
            else if (dzien === 6) lista = rozklad133.sobota;
            else lista = rozklad133.robocze;
            
            
            const terazStr = teraz.getHours().toString().padStart(2, '0') + ":" + 
                             teraz.getMinutes().toString().padStart(2, '0');
            
            
            const nastepny = lista.find(g => g > terazStr) || lista[0];

            odjazdy.push({
                patternText: '133',
                direction: 'Łagiewniki',
                mixedTime: nastepny
            });
        }
        
        pojemnik.innerHTML = '';
        
        if (odjazdy.length === 0) {
            pojemnik.innerHTML = '<p style="text-align: center;">Brak odjazdów.</p>';
            return;
        }

        odjazdy.forEach(autobus => {
            const element = document.createElement('div');
            element.className = 'odjazd';
            
            let czystyCzas = (autobus.mixedTime || '')
                .replace(/unit/gi, '')
                .replace(/%/g, ' ')
                .replace(/_/g, ' ')
                .trim();
            
            element.innerHTML = `
                <span class="linia">${autobus.patternText}</span> 
                <span class="kierunek">${autobus.direction}</span> 
                <span class="czas">${czystyCzas}</span>
            `;
            
            pojemnik.appendChild(element);
        });

    } catch (blad) {
        console.error("Błąd połączenia:", blad);
        document.getElementById('odjazdy-lista').innerHTML = "Błąd połączenia z serwerem MPK";
    }
}

pobierzOdjazdy();
setInterval(pobierzOdjazdy, 30000);