const URL = `http://localhost:3000/api/odjazdy`;

const opisyPogody = {
  0: 'Bezchmurnie',
  1: 'Przeważnie bezchmurnie',
  2: 'Częściowe zachmurzenie',
  3: 'Pochmurno',
  45: 'Mgła',
  48: 'Mgła osadzająca szadź',
  51: 'Lekka mżawka',
  53: 'Mżawka',
  55: 'Silna mżawka',
  61: 'Lekki deszcz',
  63: 'Deszcz',
  65: 'Silny deszcz',
  71: 'Lekki śnieg',
  73: 'Śnieg',
  75: 'Silny śnieg',
  80: 'Przelotny deszcz',
  81: 'Przelotne opady',
  82: 'Silne opady',
  95: 'Burza',
  96: 'Burza z gradem',
  99: 'Burza z gradem'
};

function aktualizujZegar() {
  const teraz = new Date();
  const czas = teraz.toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  const data = teraz.toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  document.getElementById('system-clock').textContent = czas;
  document.getElementById('system-date').textContent = data.charAt(0).toUpperCase() + data.slice(1);
}

async function pobierzPogode() {
  const temperatura = document.getElementById('weather-temperature');
  const opis = document.getElementById('weather-description');
  const odczuwalna = document.getElementById('weather-feels');

  try {
    const odpowiedz = await fetch('https://api.open-meteo.com/v1/forecast?latitude=50.0647&longitude=19.9450&current=temperature_2m,apparent_temperature,weather_code&timezone=Europe%2FWarsaw');
    if (!odpowiedz.ok) throw new Error('Nie udało się pobrać pogody');

    const dane = await odpowiedz.json();
    const aktualne = dane.current;
    temperatura.textContent = `${Math.round(aktualne.temperature_2m)}°`;
    opis.textContent = opisyPogody[aktualne.weather_code] || 'Aktualne warunki';
    odczuwalna.textContent = `Odczuwalna ${Math.round(aktualne.apparent_temperature)}°`;
  } catch (blad) {
    opis.textContent = 'Dane niedostępne';
  }
}

const rozklad133 = {
    robocze: ["04:36", "05:09", "05:38", "06:09", "07:09", "07:39", "08:09", "08:39", "09:09", "09:39", "10:09", "10:39", "11:09", "11:39", "12:09", "12:39", "13:09", "13:39", "14:09", "14:39", "15:10", "15:40", "16:10", "16:40", "17:10", "17:40", "18:10", "18:40", "19:16", "19:56", "20:36", "21:16", "21:56", "22:36", "23:16"],
    sobota: ["04:36", "05:16", "05:56", "06:36", "07:16", "07:56", "08:36", "09:16", "09:56", "10:36", "11:16", "11:56", "12:36", "13:16", "13:56", "14:36", "15:16", "15:56", "16:36", "17:16", "17:56", "18:36", "19:16", "19:56", "20:36", "21:16", "21:56", "22:41", "23:21"],
    niedziela: ["04:36", "05:16", "05:56", "06:36", "07:16", "07:56", "08:36", "09:16", "09:56", "10:36", "11:16", "11:56", "12:36", "13:16", "13:56", "14:36", "15:16", "15:56", "16:36", "17:16", "17:56", "18:36", "19:16", "19:56", "20:36", "21:16", "21:56", "22:41", "23:21"],
};

const rozklad133Biezanow = {
    robocze: ["04:48", "05:18", "05:48", "06:21", "06:51", "07:21", "07:51", "08:21", "08:51", "09:21", "09:51", "10:20", "10:50", "11:20", "11:50", "12:20", "12:50", "13:20", "13:50", "14:22", "14:52", "15:23", "15:53", "16:23", "16:53", "17:23", "17:53", "18:21", "18:51", "19:21", "20:01", "20:41", "21:21", "22:01", "22:39"],
    sobota: ["05:29", "06:09", "06:49", "07:29", "08:09", "08:49", "09:29", "10:09", "10:49", "11:29", "12:09", "12:49", "13:29", "14:09", "14:49", "15:29", "16:09", "16:49", "17:29", "18:09", "18:49", "19:29", "20:09", "20:49", "21:29", "22:09", "22:49"],
    niedziela: ["05:29", "06:09", "06:49", "07:29", "08:09", "08:49", "09:29", "10:09", "10:49", "11:29", "12:09", "12:49", "13:29", "14:09", "14:49", "15:29", "16:09", "16:49", "17:29", "18:09", "18:49", "19:29", "20:09", "20:49", "21:29", "22:09", "22:49"]
};

const rozklad169 = {
    kierunek: "Górka Narodowa P+R", 
    robocze: ["04:39", "05:18", "05:54", "06:34", "07:08", "07:38", "08:08", "08:38", "09:08", "09:37", "10:15", "10:55", "11:35", "12:15", "12:55", "13:35", "14:08", "14:38", "15:08", "15:38", "16:08", "16:38", "17:08", "17:38", "18:15", "18:56", "19:36", "20:17", "20:58", "21:38", "22:19"],
    sobota: ["04:22", "05:22", "06:22", "07:21", "08:19", "08:59", "09:39", "10:19", "10:59", "11:39", "12:19", "12:59", "13:39", "14:19", "14:59", "15:39", "16:19", "17:19", "18:19", "19:21", "20:21", "21:22", "22:22"],
    niedziela: ["04:22", "05:22", "06:22", "07:21", "08:19", "08:59", "09:39", "10:19", "10:59", "11:39", "12:19", "12:59", "13:39", "14:19", "14:59", "15:39", "16:19", "17:19", "18:19", "19:21", "20:21", "21:22", "22:22"]
};

const rozklad107 = {
    kierunek: "Zajezdnia Wola Duchacka",
    robocze: ["04:20", "04:55", "05:25", "05:45", "06:09", "06:29", "06:49", "07:09", "07:29", "07:49", "08:09", "08:29", "08:49", "09:09", "09:39", "10:09", "10:39", "11:09", "11:39", "12:09", "12:39", "13:09", "13:39", "14:09", "14:29", "14:49", "15:09", "15:29", "15:49", "16:09", "16:29", "16:49", "17:09", "17:29", "17:49", "18:09", "18:29", "18:49", "19:09", "19:29", "19:49", "20:09", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:35"],
    sobota: ["04:45", "05:55", "06:55", "07:25", "07:55", "08:25", "08:55", "09:25", "09:55", "10:25", "10:55", "11:25", "11:55", "12:25", "12:55", "13:25", "13:55", "14:25", "14:55", "15:25", "15:55", "16:25", "16:55", "17:25", "17:55", "18:25", "18:55", "19:25", "19:55", "20:25", "20:55", "21:25", "22:25", "23:35"],
    niedziela: ["04:45", "05:55", "06:55", "07:55", "08:55", "09:25", "09:55", "10:25", "10:55", "11:25", "11:55", "12:25", "12:55", "13:25", "13:55", "14:25", "14:55", "15:25", "15:55", "16:25", "16:55", "17:25", "17:55", "18:25", "18:55", "19:25", "19:55", "20:25", "21:25", "22:25", "23:35"]
};

async function pobierzOdjazdy() {
  try {
    const odpowiedz = await fetch(URL);

    if (!odpowiedz.ok) {
        throw new Error(`Błąd serwera lokalnego: ${odpowiedz.status} ${odpowiedz.statusText}`);
    }

    const dane = await odpowiedz.json();
    let odjazdy = dane.actual || [];

    odjazdy = odjazdy.map(a => {
        const dataOdjazdu = new Date(a.departureTime * 1000);
        const godziny = dataOdjazdu.getHours().toString().padStart(2, '0');
        const minuty = dataOdjazdu.getMinutes().toString().padStart(2, '0');

        return {
            patternText: a.patternText,
            direction: a.direction,
            mixedTime: `${godziny}:${minuty}`,
            opoznienieMinuty: a.delay,
            zrodlo: 'api'
        };
    });

    const pojemnik = document.getElementById('odjazdy-lista');
    const teraz = new Date();
    const dzien = teraz.getDay();
    const terazStr = teraz.getHours().toString().padStart(2, '0') + ":" + teraz.getMinutes().toString().padStart(2, '0');

    const dodajJeśliBrakWApi = (numerLinii, slowoKluczWApi, wyswietlanyKierunek, rozklad) => {
      const czyJestWApi = odjazdy.some(a =>
        a.patternText === numerLinii &&
        (a.direction || '').toLowerCase().includes(String(slowoKluczWApi).toLowerCase())
      );
      if (!czyJestWApi) {
        let lista = (dzien === 0) ? rozklad.niedziela : (dzien === 6) ? rozklad.sobota : rozklad.robocze;
        if (lista && lista.length > 0) {
          const nastepny = lista.find(g => g > terazStr) || lista[0];
          odjazdy.push({ patternText: numerLinii, direction: wyswietlanyKierunek, mixedTime: nastepny, zrodlo: 'local' });
        }
      }
    };

    if(rozklad133 && rozklad133.robocze) dodajJeśliBrakWApi('133', 'Łagiewniki', 'Łagiewniki', rozklad133);
    if(rozklad133Biezanow && rozklad133Biezanow.robocze) dodajJeśliBrakWApi('133', 'Bieżanów', 'Nowy Bieżanów P+R', rozklad133Biezanow);
    if(rozklad169 && rozklad169.robocze) dodajJeśliBrakWApi('169', rozklad169.kierunek, rozklad169.kierunek, rozklad169);
    if(rozklad107 && rozklad107.robocze) dodajJeśliBrakWApi('107', rozklad107.kierunek, rozklad107.kierunek, rozklad107);

    odjazdy.sort((a, b) => a.mixedTime.localeCompare(b.mixedTime));

    pojemnik.innerHTML = '';
    if (odjazdy.length === 0) {
      pojemnik.innerHTML = '<p style="text-align:center;">Brak odjazdów.</p>';
      return;
    }

    odjazdy.forEach(autobus => {
      const element = document.createElement('div');
      element.className = 'odjazd';

      let opoznienieHTML = '';
      if (autobus.opoznienieMinuty > 0) {
        opoznienieHTML = `<span class="opoznienie">Opóźniony o ${autobus.opoznienieMinuty} min</span>`;
      } else if (autobus.opoznienieMinuty < 0) {
          opoznienieHTML = `<span class="opoznienie" style="color: #4caf50;">Przyspieszony o ${Math.abs(autobus.opoznienieMinuty)} min</span>`;
      }

      const klasaKropki = autobus.zrodlo === 'api' ? 'kropka-api' : 'kropka-lokalna';
      const tytulKropki = autobus.zrodlo === 'api' ? 'Dane z API GTFS ZTP' : 'Dane z lokalnego rozkładu';

      element.innerHTML = `
        <span class="linia">${autobus.patternText}</span>
        <span class="kierunek">${autobus.direction}${opoznienieHTML}</span>
        <span class="czas">${autobus.mixedTime}</span>
        <span class="${klasaKropki}" data-tooltip="${tytulKropki}"></span>
      `;

      pojemnik.appendChild(element);
    });
  } catch (blad) {
    console.error("Szczegóły błędu w przeglądarce:", blad);
    document.getElementById('odjazdy-lista').innerHTML = `<p style="color:red; text-align:center; font-size: 14px;">Błąd: ${blad.message}</p>`;
  }
}

pobierzOdjazdy();
setInterval(pobierzOdjazdy, 30000);

aktualizujZegar();
setInterval(aktualizujZegar, 1000);
pobierzPogode();
