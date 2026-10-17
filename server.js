const express = require('express');
const GtfsRealtimeBindings = require('gtfs-realtime-bindings');
const cors = require('cors');
const AdmZip = require('adm-zip');

const app = express();
app.use(cors());
app.use(express.static(__dirname));

const KODY_PRZYSTANKU = ['2048877', '2048878', '2048879'];

let słownikLinii = {};   
let słownikKursow = {};  
let słownikGodzinRozkladowych = {};

const tylkoCyfry = (id) => id ? id.replace(/[^0-9]/g, '') : '';
const oczysc = (id) => id ? id.replace(/^[A-Za-z0-9]+_/, '').trim() : '';

function wyznaczCzasRozkladowy(sekundy, wzgledemEpoch) {
    const d = new Date(wzgledemEpoch * 1000);
    const lokalnaPolnoc = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 1000;
    let epoch = lokalnaPolnoc + sekundy;
    while (epoch - wzgledemEpoch > 43200) epoch -= 86400;
    while (wzgledemEpoch - epoch > 43200) epoch += 86400;
    return epoch;
}

function parseCsvLine(text) {
    let result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
        let c = text[i];
        if (c === '"') inQuotes = !inQuotes;
        else if (c === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
        else current += c;
    }
    result.push(current.trim());
    return result;
}

async function pobierzBazeLinii() {
    try {
        console.log("-> Trwa budowa słownika (feed zbiorczy)...");
        
        const response = await fetch('https://gtfs.ztp.krakow.pl/GTFS_KRK.zip');
        if (!response.ok) throw new Error(`Błąd pobierania bazy (HTTP: ${response.status})`);
        
        const buffer = await response.arrayBuffer();
        const zip = new AdmZip(Buffer.from(buffer));

        const plikRoutes = zip.getEntries().find(e => e.entryName.endsWith('routes.txt'));
        if (plikRoutes) {
            const wiersze = plikRoutes.getData().toString('utf8').replace(/^\uFEFF/, '').replace(/\r/g, '').split('\n');
            const naglowki = parseCsvLine(wiersze[0]);
            const idIdx = naglowki.indexOf('route_id');
            const nameIdx = naglowki.indexOf('route_short_name');

            for (let i = 1; i < wiersze.length; i++) {
                const kol = parseCsvLine(wiersze[i]);
                if (kol[idIdx] && kol[nameIdx]) {
                    const rId = kol[idIdx];
                    const rName = kol[nameIdx];
                    słownikLinii[rId] = rName;
                    słownikLinii[oczysc(rId)] = rName;
                }
            }
        }

        const plikTrips = zip.getEntries().find(e => e.entryName.endsWith('trips.txt'));
        if (plikTrips) {
            const wiersze = plikTrips.getData().toString('utf8').replace(/^\uFEFF/, '').replace(/\r/g, '').split('\n');
            const naglowki = parseCsvLine(wiersze[0]);
            const tripIdx = naglowki.indexOf('trip_id');
            const routeIdx = naglowki.indexOf('route_id');
            const headsignIdx = naglowki.indexOf('trip_headsign');

            for (let i = 1; i < wiersze.length; i++) {
                const kol = parseCsvLine(wiersze[i]);
                if (kol[tripIdx] && kol[routeIdx]) {
                    const tId = kol[tripIdx];
                    const rId = kol[routeIdx];
                    
                    const linia = słownikLinii[rId] || słownikLinii[oczysc(rId)] || rId;
                    let kierunek = kol[headsignIdx] ? kol[headsignIdx].replace(/"/g, '').trim() : '';
                    
                    // Jeśli w bazie brak kierunku, nadajemy inteligentny domyślny na podstawie linii
                    if (!kierunek) {
                        kierunek = `Linia ${linia}`;
                    }

                    const dane = { linia: linia, kierunek: kierunek };

                    słownikKursow[tId] = dane;
                    słownikKursow[oczysc(tId)] = dane;
                    if (tylkoCyfry(tId)) słownikKursow[tylkoCyfry(tId)] = dane;
                }
            }
        }

        const plikStopTimes = zip.getEntries().find(e => e.entryName.endsWith('stop_times.txt'));
        if (plikStopTimes) {
            const wiersze = plikStopTimes.getData().toString('utf8').replace(/^\uFEFF/, '').replace(/\r/g, '').split('\n');
            const naglowki = parseCsvLine(wiersze[0]);
            const tripIdx = naglowki.indexOf('trip_id');
            const stopIdx = naglowki.indexOf('stop_id');
            const depIdx = naglowki.indexOf('departure_time');
            const arrIdx = naglowki.indexOf('arrival_time');

            for (let i = 1; i < wiersze.length; i++) {
                const kol = parseCsvLine(wiersze[i]);
                const sId = kol[stopIdx];
                if (!sId || !KODY_PRZYSTANKU.includes(sId)) continue;

                const tId = kol[tripIdx];
                const godzina = kol[depIdx] || kol[arrIdx];
                if (!tId || !godzina) continue;

                const czesci = godzina.split(':');
                if (czesci.length !== 3) continue;

                const sekundy = Number(czesci[0]) * 3600 + Number(czesci[1]) * 60 + Number(czesci[2]);
                słownikGodzinRozkladowych[tId + '|' + sId] = sekundy;
            }
        }

        console.log(`-> SŁOWNIK ZBUDOWANY! Przetłumaczono ${Object.keys(słownikKursow).length} kursów, ${Object.keys(słownikGodzinRozkladowych).length} godzin rozkładowych.`);
    } catch (e) {
        console.error("-> Błąd słownika:", e.message);
    }
}

pobierzBazeLinii();
setInterval(pobierzBazeLinii, 24 * 60 * 60 * 1000);

async function getDepartures() {
    try {
        let response = await fetch('https://gtfs.ztp.krakow.pl/TripUpdates.pb', { headers: { 'Cache-Control': 'no-cache' } });
        if (!response.ok) {
            response = await fetch('https://gtfs.ztp.krakow.pl/TripUpdates_A.pb', { headers: { 'Cache-Control': 'no-cache' } });
        }

        if (!response.ok) throw new Error(`Błąd HTTP: ${response.status}`);
        
        const buffer = await response.arrayBuffer();
        const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer));
        
        let departures = [];
        const now = Math.floor(Date.now() / 1000);

        feed.entity.forEach(entity => {
            if (entity.tripUpdate && entity.tripUpdate.stopTimeUpdate) {
                entity.tripUpdate.stopTimeUpdate.forEach(stopTime => {
                    const stopId = String(stopTime.stopId || '');
                    
                    const czyToTen = KODY_PRZYSTANKU.includes(stopId);

                    if (czyToTen) {
                        const timing = stopTime.departure || stopTime.arrival;
                        if (!timing) return;

                        const rawTrip = entity.tripUpdate.trip.tripId || '';
                        const rawRoute = entity.tripUpdate.trip.routeId || '';
                        const rozkladoweSekundy = słownikGodzinRozkladowych[rawTrip + '|' + stopId];
                        const delayZWFeedu = timing.delay ? Number(timing.delay.low || timing.delay) : null;

                        let departureTime = null;
                        if (timing.time) {
                            departureTime = Number(timing.time.low || timing.time);
                        } else if (rozkladoweSekundy != null && delayZWFeedu != null) {
                            departureTime = wyznaczCzasRozkladowy(rozkladoweSekundy, now) + delayZWFeedu;
                        }

                        if (departureTime != null) {
                            let finalnaLinia = null;
                            let finalnyKierunek = 'Kierunek wg rozkładu';

                            const kurs = słownikKursow[rawTrip] || słownikKursow[oczysc(rawTrip)] || słownikKursow[tylkoCyfry(rawTrip)];
                            
                            if (kurs) {
                                finalnaLinia = kurs.linia;
                                finalnyKierunek = kurs.kierunek;
                            } else if (rawRoute) {
                                finalnaLinia = słownikLinii[rawRoute] || słownikLinii[oczysc(rawRoute)] || rawRoute;
                            }
                            
                            if (!finalnaLinia) {
                                finalnaLinia = oczysc(rawRoute) || oczysc(rawTrip);
                            }

                            // Jeśli strumień na żywo podaje własny kierunek i różni się od pustego, możemy go uwzględnić
                            if (entity.tripUpdate.trip.tripHeadsign) {
                                finalnyKierunek = entity.tripUpdate.trip.tripHeadsign;
                            }

                            const dozwoloneLinie = ['107', '133', '169'];

                            if (dozwoloneLinie.includes(finalnaLinia) && departureTime > now - 120) {
                                // Opóźnienie liczymy porównując czas na żywo z rozkładem (feed często nie podaje pola delay)
                                let delay = delayZWFeedu;
                                if (rozkladoweSekundy != null) {
                                    delay = departureTime - wyznaczCzasRozkladowy(rozkladoweSekundy, departureTime);
                                }
                                if (delay == null) delay = 0;

                                departures.push({
                                    patternText: finalnaLinia,
                                    direction: finalnyKierunek,
                                    departureTime: departureTime,
                                    delay: Math.round(delay / 60)
                                });
                            }
                        }
                    }
                });
            }
        });

        departures.sort((a, b) => a.departureTime - b.departureTime);

        let unikalneOdjazdy = [];
        for (let odjazd of departures) {
            let ostatni = unikalneOdjazdy[unikalneOdjazdy.length - 1];
            if (!ostatni || ostatni.patternText !== odjazd.patternText || ostatni.direction !== odjazd.direction || Math.abs(ostatni.departureTime - odjazd.departureTime) > 90) {
                unikalneOdjazdy.push(odjazd);
            }
        }

        return unikalneOdjazdy.slice(0, 10);
    } catch (error) {
        console.error("-> Błąd parsowania na żywo:", error.message);
        return [];
    }
}

app.get('/api/odjazdy', async (req, res) => {
    if (Object.keys(słownikKursow).length === 0) {
        await pobierzBazeLinii();
    }
    const departures = await getDepartures();
    res.json({ actual: departures });
});

app.listen(3000, () => {
    console.log('-> Serwer gotowy na http://localhost:3000');
});