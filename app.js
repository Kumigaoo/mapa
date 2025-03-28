/**
 * Classe base que representa un punt d'interès genèric
 */
class PuntInteres {
  static totalTasques = 0;
  static IVA_PAISOS = {
    ES: 0.21, // Espanya
    GB: 0.2, // Regne Unit
    FR: 0.2, // França
    IT: 0.22, // Itàlia
    DE: 0.19, // Alemanya
  };

  #id;
  #esManual;

  constructor(
    pais,
    ciutat,
    nom,
    direccio,
    tipus,
    latitud,
    longitud,
    puntuacio
  ) {
    this.pais = pais;
    this.ciutat = ciutat;
    this.nom = nom;
    this.direccio = direccio;
    this.tipus = tipus;
    this.latitud = latitud;
    this.longitud = longitud;
    this.puntuacio = puntuacio;
    this.#id = Date.now();
    this.#esManual = false;
    PuntInteres.totalTasques++;
  }

  get id() {
    return this.#id;
  }

  set id(value) {
    this.#id = value;
  }

  get esManual() {
    return this.#esManual;
  }

  set esManual(value) {
    this.#esManual = value;
  }

  static obtenirTotalElements() {
    return PuntInteres.totalTasques;
  }

  /**
   * Retorna informació bàsica del punt d'interès
   */
  getInfoBasica() {
    return `${this.nom} | ${this.ciutat} | Tipus: ${this.tipus}`;
  }
}

/**
 * Classe que representa una atracció turística
 */
class Atraccio extends PuntInteres {
  constructor(
    pais,
    ciutat,
    nom,
    direccio,
    tipus,
    latitud,
    longitud,
    puntuacio,
    horaris,
    preu,
    moneda
  ) {
    super(pais, ciutat, nom, direccio, tipus, latitud, longitud, puntuacio);
    this.horaris = horaris;
    this.preu = parseFloat(preu) || 0;
    this.moneda = moneda;
  }

  /**
   * Calcula el preu amb IVA segons el país
   */
  get preuIva() {
    if (this.preu === 0) return "Entrada gratuïta";

    const iva = PuntInteres.IVA_PAISOS[this.pais] || 0;
    if (iva === 0) {
      return `${this.preu.toFixed(2)}${this.moneda} (no IVA)`;
    } else {
      const preuAmbIva = this.preu * (1 + iva);
      return `${preuAmbIva.toFixed(2)}${this.moneda} (IVA)`;
    }
  }

  /**
   * Retorna informació completa de l'atracció
   */
  getInfoCompleta() {
    return `${super.getInfoBasica()} | Horaris: ${this.horaris} | ${
      this.preuIva
    }`;
  }
}

/**
 * Classe que representa un museu
 */
class Museu extends PuntInteres {
  constructor(
    pais,
    ciutat,
    nom,
    direccio,
    tipus,
    latitud,
    longitud,
    puntuacio,
    horaris,
    preu,
    moneda,
    descripcio
  ) {
    super(pais, ciutat, nom, direccio, tipus, latitud, longitud, puntuacio);
    this.horaris = horaris;
    this.preu = parseFloat(preu) || 0;
    this.moneda = moneda;
    this.descripcio = descripcio;
  }

  /**
   * Calcula el preu amb IVA segons el país
   */
  get preuIva() {
    if (this.preu === 0) return "Entrada gratuïta";

    const iva = PuntInteres.IVA_PAISOS[this.pais] || 0;
    if (iva === 0) {
      return `${this.preu.toFixed(2)}${this.moneda} (no IVA)`;
    } else {
      const preuAmbIva = this.preu * (1 + iva);
      return `${preuAmbIva.toFixed(2)}${this.moneda} (IVA)`;
    }
  }

  /**
   * Retorna informació completa del museu
   */
  getInfoCompleta() {
    return `${super.getInfoBasica()} | Horaris: ${this.horaris} | ${
      this.preuIva
    }\nDescripció: ${this.descripcio}`;
  }
}

/**
 * Classe que gestiona el mapa i els punts d'interès
 */
class Mapa {
  #map;
  #markers = [];
  #currentPositionMarker = null;

  constructor() {
    // Inicialitza el mapa
    this.#map = L.map("map").setView([0, 0], 2);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Mostra la posició actual
    this.#getPosicioActual().then((pos) => {
      this.mostrarPuntInicial(pos.lat, pos.lon);
    });
  }

  /**
   * Obté la posició actual mitjançant geolocalització
   */
  async #getPosicioActual() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        console.warn("Geolocalització no suportada pel navegador");
        reject(new Error("Geolocalització no suportada"));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      };

      navigator.geolocation.getCurrentPosition(
        (position) =>
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          }),
        (error) => {
          console.warn("Error obtenint la ubicació:", error.message);
          // Coordenades per defecte (Barcelona)
          resolve({
            lat: 41.3874,
            lon: 2.1686,
          });
        },
        options
      );
    });
  }

  /**
   * Mostra el punt inicial (posició actual)
   */
  mostrarPuntInicial(lat, lon) {
    if (this.#currentPositionMarker) {
      this.#map.removeLayer(this.#currentPositionMarker);
    }

    this.#currentPositionMarker = L.marker([lat, lon])
      .addTo(this.#map)
      .bindPopup("Estàs aquí")
      .openPopup();

    this.#map.setView([lat, lon], 13);
  }

  /**
   * Actualitza la posició inicial del mapa
   */
  actualitzarPosInitMapa(lat, lon) {
    this.#map.setView([lat, lon], 13);
  }

  /**
   * Mostra un punt al mapa
   */
  mostrarPunt(lat, lon, desc = "") {
    const marker = L.marker([lat, lon]).addTo(this.#map).bindPopup(desc);

    this.#markers.push(marker);
    return marker;
  }

  /**
   * Elimina tots els punts del mapa
   */
  borrarPunt() {
    this.#markers.forEach((marker) => this.#map.removeLayer(marker));
    this.#markers = [];
  }

  /**
   * Elimina un punt específic del mapa
   */
  borrarPuntEspecific(id) {
    const index = this.#markers.findIndex((m) => m._leaflet_id === id);
    if (index !== -1) {
      this.#map.removeLayer(this.#markers[index]);
      this.#markers.splice(index, 1);
    }
  }
}
/**
 * Classe per llegir fitxers CSV i obtenir informació del país
 */
class Excel {
  /**
   * Llegeix un fitxer CSV i retorna les seves dades
   */
  static async readCSV(file) {
    return new Promise((resolve, reject) => {
      if (!file.name.endsWith(".csv")) {
        reject(new Error("El fitxer no és CSV"));
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target.result;
          console.log("Contingut del CSV:", content);

          // Canvia split('\n') per split(/\r?\n/) per gestionar diferents salts de línia
          const lines = content
            .split(/\r?\n/)
            .filter((line) => line.trim() !== "");

          if (lines.length === 0) {
            reject(new Error("El fitxer CSV està buit"));
            return;
          }

          // Utilitza punt i coma com a delimitador
          const headers = lines[0].split(";").map((h) => h.trim());
          console.log("Capçaleres del CSV:", headers);

          const result = [];
          for (let i = 1; i < lines.length; i++) {
            if (!lines[i]) continue;

            const obj = {};
            // Utilitza punt i coma com a delimitador
            const currentline = lines[i].split(";");

            for (let j = 0; j < headers.length; j++) {
              obj[headers[j]] = currentline[j] ? currentline[j].trim() : "";
            }

            result.push(obj);
          }

          console.log("Dades processades:", result);
          resolve(result);
        } catch (error) {
          console.error("Error processant CSV:", error);
          reject(new Error("Error processant el fitxer CSV"));
        }
      };
      reader.onerror = (error) => {
        console.error("Error llegint fitxer:", error);
        reject(error);
      };
      reader.readAsText(file);
    });
  }

  /**
   * Obté informació del país mitjançant l'API REST Countries
   */
  // Afegir verificació de connexió abans de fer la petició
  static async getInfoCountry(code) {
    // Neteja i normalització del codi
    code = String(code).trim().toUpperCase();

    // Mapeig de codis alpha-3 a alpha-2
    const alpha3ToAlpha2 = {
      ESP: "ES", // Espanya
      GBR: "GB", // Regne Unit
      FRA: "FR", // França
      ITA: "IT", // Itàlia
      DEU: "DE", // Alemanya
    };

    // Convertir si és un codi alpha-3 conegut
    if (code.length === 3 && alpha3ToAlpha2[code]) {
      code = alpha3ToAlpha2[code];
    }

    // Validació final del codi
    if (!/^[A-Z]{2,3}$/.test(code)) {
      console.error(`Codi de país "${code}" no vàlid`);
      return this.getDefaultCountryInfo();
    }

    try {
      const response = await fetch(
        `https://restcountries.com/v3.1/alpha/${code}`
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      const country = data[0];

      return {
        city: country.capital?.[0] || "Desconegut",
        flag: country.flags?.png || "",
        lat: country.capitalInfo?.latlng?.[0] || 0,
        lon: country.capitalInfo?.latlng?.[1] || 0,
      };
    } catch (error) {
      console.error("Error obtenint informació del país:", error);
      return this.getDefaultCountryInfo();
    }
  }
}
/**
 * Classe principal de l'aplicació
 */
class App {
  constructor() {
    this.puntsInteres = [];
    this.tipusDisponibles = new Set();
    this.mapa = new Mapa();
    this.initUI();
  }

  /**
   * Inicialitza la interfície d'usuari
   */
  initUI() {
    // Configuració del drop zone per arrossegar fitxers
    const dropZone = document.getElementById("drop-zone");
    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.classList.add("dragover");
    });

    dropZone.addEventListener("dragleave", () => {
      dropZone.classList.remove("dragover");
    });

    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.classList.remove("dragover");
      this.handleFiles(e.dataTransfer.files);
    });

    // Configuració dels filtres
    document
      .getElementById("filter-type")
      .addEventListener("change", () => this.filtrarLlista());
    document
      .getElementById("filter-order")
      .addEventListener("change", () => this.filtrarLlista());
    document
      .getElementById("filter-name")
      .addEventListener("input", () => this.filtrarLlista());

    // Botó per netejar
    document
      .getElementById("clear-btn")
      .addEventListener("click", () => this.netejarLlista());
  }

  /**
   * Gestiona els fitxers arrossegats
   */
  async handleFiles(files) {
    if (files.length === 0) return;

    const file = files[0];
    if (!file.name.endsWith(".csv")) {
      alert("El fitxer no és csv");
      return;
    }

    try {
      // Llegir CSV
      const data = await Excel.readCSV(file);

      // Processar dades
      this.processarDadesCSV(data);

      // Obtenir informació del país (agafem el primer element com a referència)
      if (data.length > 0) {
        const countryInfo = await Excel.getInfoCountry(data[0].codi);
        this.mostrarInfoPais(countryInfo);
      }

      // Actualitzar UI
      this.actualitzarLlista();
      this.mostrarPuntsMapa();
    } catch (error) {
      console.error("Error processant fitxer:", error);
      alert("Error processant el fitxer");
    }
  }

  /**
   * Processa les dades del CSV i crea els objectes corresponents
   */
  processarDadesCSV(data) {
    if (!data || data.length === 0) {
      console.error("No hi ha dades per processar");
      return;
    }

    // Obtenir el codi de país (ara sabem que el camp es diu 'codi')
    const countryCode = data[0].codi || "ESP"; // 'ESP' com a valor per defecte

    // Obtenir informació del país
    Excel.getInfoCountry(countryCode)
      .then((info) => {
        this.mostrarInfoPais(info);
        if (info.lat && info.lon) {
          this.mapa.actualitzarPosInitMapa(info.lat, info.lon);
        }
      })
      .catch((error) => {
        console.error("Error obtenint info país:", error);
      });

    // Processar cada punt d'interès
    data.forEach((item) => {
      let puntInteres;

      // Assegura't que els noms dels camps coincideixen amb el CSV
      const commonProps = {
        pais: item.pais,
        ciutat: item.ciutat,
        nom: item.nom,
        direccio: item.direcció, // Atenció a l'accent
        tipus: item.tipus,
        latitud: item.latitud,
        longitud: item.longitud,
        puntuacio: item.puntuacio,
      };

      switch (item.tipus.toLowerCase()) {
        case "atraccio":
          puntInteres = new Atraccio(
            ...Object.values(commonProps),
            item.horaris,
            item.preu,
            item.moneda
          );
          break;
        case "museu":
          puntInteres = new Museu(
            ...Object.values(commonProps),
            item.horaris,
            item.preu,
            item.moneda,
            item.descripcio
          );
          break;
        default:
          puntInteres = new PuntInteres(...Object.values(commonProps));
      }

      this.puntsInteres.push(puntInteres);
      this.tipusDisponibles.add(item.tipus);
    });

    this.actualitzarFiltreTipus();
  }

  /**
   * Actualitza el filtre de tipus amb les opcions disponibles
   */
  actualitzarFiltreTipus() {
    const filterType = document.getElementById("filter-type");
    const currentValue = filterType.value; // Guardar la selecció actual

    // Crear un array amb els tipus actuals al dropdown
    const existingTypes = Array.from(filterType.options)
      .map((option) => option.value.toLowerCase())
      .filter((value) => value !== "Tots");

    console.log(
      Array.from(filterType.options)
        .map((option) => option.value)
        .filter((value) => value !== "Tots")
    );

    // Afegir només els nous tipus que no existeixin
    this.tipusDisponibles.forEach((tipus) => {
      if (!existingTypes.includes(tipus.toLowerCase())) {
        const option = document.createElement("option");
        option.value = tipus;
        option.textContent = tipus.toLowerCase();
        filterType.appendChild(option);
      }
    });

    // Restaurar la selecció anterior si encara existeix
    if (
      currentValue &&
      Array.from(filterType.options).some((opt) => opt.value === currentValue)
    ) {
      filterType.value = currentValue;
    }
  }

  /**
   * Mostra la informació del país (bandera i posició)
   */
  mostrarInfoPais(countryInfo) {
    const countryInfoDiv = document.getElementById("country-info");

    if (countryInfo.flag) {
      countryInfoDiv.innerHTML = `
                <img src="${countryInfo.flag}" alt="Bandera" style="height: 30px;">
                <p>Ciutat: ${countryInfo.city}</p>
            `;
    } else {
      countryInfoDiv.innerHTML = `<p>No s'ha pogut obtenir informació del país</p>`;
    }
  }

  /**
   * Actualitza la llista de punts d'interès
   */
  actualitzarLlista() {
    const llistaContainer = document.getElementById("llista-punts");

    if (this.puntsInteres.length === 0) {
      llistaContainer.innerHTML = "<p>No hi ha informació a mostrar</p>";
      return;
    }

    let html = "";
    this.puntsInteres.forEach((punt) => {
      let itemClass = "";
      let infoExtra = "";

      if (punt instanceof Atraccio) {
        itemClass = "atraccio";
        infoExtra = ` | ${punt.horaris} | ${punt.preuIva}`;
      } else if (punt instanceof Museu) {
        itemClass = "museu";
        infoExtra = ` | ${punt.horaris} | ${punt.preuIva}<br>${punt.descripcio}`;
      } else {
        itemClass = "espai";
      }

      html += `
                <div class="punt-interes ${itemClass}">
                    <div class="punt-info">
                        <h3>${punt.nom}</h3>
                        <p>${punt.ciutat} | Tipus: ${punt.tipus}${infoExtra}</p>
                    </div>
                    <button class="delete-btn" data-id="${punt.id}">Eliminar</button>
                </div>
            `;
    });

    llistaContainer.innerHTML = html;

    // Afegir event listeners als botons d'eliminar
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => this.eliminarPunt(btn.dataset.id));
    });

    // Actualitzar comptador
    document.getElementById("total-elements").textContent =
      PuntInteres.obtenirTotalElements();
  }

  /**
   * Mostra tots els punts d'interès al mapa
   */
  mostrarPuntsMapa() {
    this.mapa.borrarPunt();

    this.puntsInteres.forEach((punt) => {
      let descripcio = `<b>${punt.nom}</b><br>${punt.ciutat}, ${punt.pais}, ${punt.direccio} <br><p>Puntuació:  ${punt.puntuacio} </p>`;

      if (punt instanceof Atraccio || punt instanceof Museu) {
        descripcio += `<br>${punt.preuIva}`;
      }

      if (punt instanceof Museu) {
        descripcio += `<br><br>${punt.descripcio}`;
      }

      this.mapa.mostrarPunt(punt.latitud, punt.longitud, descripcio);
    });
  }

  /**
   * Filtra la llista segons els criteris seleccionats
   */
  filtrarLlista() {
    const tipusSeleccionat = document.getElementById("filter-type").value;
    const ordre = document.getElementById("filter-order").value;
    const textFiltre = document
      .getElementById("filter-name")
      .value.toLowerCase()
      .trim();

    // Fer una còpia dels punts originals
    let puntsFiltrats = [...this.puntsInteres];

    // Filtrar per tipus
    if (tipusSeleccionat !== "Tots") {
      puntsFiltrats = puntsFiltrats.filter(
        (punt) => punt.tipus === tipusSeleccionat
      );
    }

    // Filtrar per text (només si s'ha escrit alguna cosa)
    if (textFiltre) {
      puntsFiltrats = puntsFiltrats.filter(
        (punt) =>
          punt.nom.toLowerCase().includes(textFiltre) ||
          punt.ciutat.toLowerCase().includes(textFiltre) ||
          punt.direccio.toLowerCase().includes(textFiltre)
      );
    }

    // Ordenar
    if (ordre === "Ascendent") {
      puntsFiltrats.sort((a, b) => a.nom.localeCompare(b.nom));
    } else if (ordre === "Descendent") {
      puntsFiltrats.sort((a, b) => b.nom.localeCompare(a.nom));
    }

    // Actualitzar la llista
    this.mostrarLlistaFiltrada(puntsFiltrats);

    // Actualitzar punts al mapa
    this.mostrarPuntsMapaFiltrats(puntsFiltrats);
  }
  mostrarLlistaFiltrada(puntsFiltrats) {
    const llistaContainer = document.getElementById("llista-punts");

    if (puntsFiltrats.length === 0) {
      llistaContainer.innerHTML = `
            <div class="no-results">
                <p>No s'han trobat resultats que coincideixin amb els filtres</p>
                <button id="reset-filters">Netejar Filtres</button>
            </div>
        `;

      document.getElementById("reset-filters").addEventListener("click", () => {
        document.getElementById("filter-name").value = "";
        document.getElementById("filter-type").value = "Tots";
        this.filtrarLlista();
      });
      return;
    }

    let html = "";
    puntsFiltrats.forEach((punt) => {
      let itemClass = "";
      let infoExtra = "";

      if (punt instanceof Atraccio) {
        itemClass = "atraccio";
        infoExtra = ` | ${punt.horaris} | ${punt.preuIva}`;
      } else if (punt instanceof Museu) {
        itemClass = "museu";
        infoExtra = ` | ${punt.horaris} | ${punt.preuIva}<br>${punt.descripcio}`;
      } else {
        itemClass = "espai";
      }

      html += `
            <div class="punt-interes ${itemClass}">
                <div class="punt-info">
                    <h3>${punt.nom}</h3>
                    <p>${punt.ciutat} | Tipus: ${punt.tipus}${infoExtra}</p>
                </div>
                <button class="delete-btn" data-id="${punt.id}">Eliminar</button>
            </div>
        `;
    });

    llistaContainer.innerHTML = html;

    // Afegir event listeners als botons d'eliminar
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => this.eliminarPunt(btn.dataset.id));
    });
  }
  mostrarPuntsMapaFiltrats(puntsFiltrats) {
    // Netejar tots els marcadors existents
    this.mapa.borrarPunt();

    // Afegir els nous marcadors
    puntsFiltrats.forEach((punt) => {
      let descripcio = `<b>${punt.nom}</b><br>${punt.ciutat}, ${punt.pais}`;

      if (punt instanceof Atraccio || punt instanceof Museu) {
        descripcio += `<br>${punt.preuIva}`;
      }

      if (punt instanceof Museu) {
        descripcio += `<br><br>${punt.descripcio}`;
      }

      this.mapa.mostrarPunt(punt.latitud, punt.longitud, descripcio);
    });
  }
  /**
   * Elimina un punt d'interès
   */
  eliminarPunt(id) {
    if (!confirm("Estàs segur que vols eliminar el punt d'interès?")) return;

    // Eliminar de la llista
    const index = this.puntsInteres.findIndex((punt) => punt.id == id);
    if (index !== -1) {
      this.puntsInteres.splice(index, 1);
      PuntInteres.totalTasques--;
    }

    // Actualitzar UI
    this.actualitzarLlista();
    this.mostrarPuntsMapa();
  }

  /**
   * Neteja tota la llista de punts d'interès
   */
  netejarLlista() {
    if (this.puntsInteres.length === 0) return;
    if (!confirm("Estàs segur que vols netejar tota la llista?")) return;

    this.puntsInteres = [];
    PuntInteres.totalTasques = 0;
    this.tipusDisponibles = new Set();

    // Actualitzar UI
    document.getElementById("llista-punts").innerHTML =
      "<p>No hi ha informació a mostrar</p>";
    document.getElementById("total-elements").textContent = "0";
    document.getElementById("filter-type").innerHTML =
      '<option value="Tots">Tots</option>';
    document.getElementById("country-info").innerHTML = "";
    this.mapa.borrarPunt();
  }
}

// Inicialitzar l'aplicació quan el DOM estigui carregat
document.addEventListener("DOMContentLoaded", () => {
  const app = new App();
});
