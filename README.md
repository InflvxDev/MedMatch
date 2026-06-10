# MedMatch

**Comparador de precios de productos médicos.** MedMatch lee un archivo Excel con varios
portafolios de proveedores y te permite buscar un producto para comparar, lado a lado, los
precios equivalentes entre todos los portafolios — resaltando automáticamente el mejor precio
para apoyar la toma de decisiones de compra.

Todo el procesamiento ocurre **en el navegador** (sitio estático): el Excel nunca se sube a un
servidor. Los datos cargados se persisten localmente con IndexedDB para no tener que resubirlos.

---

## Características

- **Carga de Excel** con arrastrar y soltar (`.xlsx`), validando la hoja `Todos los registros`.
- **Detección dinámica de portafolios** a partir de las cabeceras (`P{n}_PROVEEDOR_...`).
- **Buscador con autocompletado** que agrupa las descripciones por proveedor.
- **Comparación all-vs-all**: por cada portafolio se muestran sus productos distintos asociados
  a la fila buscada (deduplicados por marca + descripción).
- **Resalte del mejor precio** global entre todos los portafolios.
- **Persistencia local** del libro cargado (IndexedDB) — sobrevive recargas.
- **Limpiar la búsqueda limpia la comparación** automáticamente.

---

## Stack

- [Astro](https://astro.build) (sitio estático + islas)
- [React 19](https://react.dev) para la interfaz interactiva
- [Tailwind CSS v4](https://tailwindcss.com) (configuración por CSS con `@theme`)
- [ExcelJS](https://github.com/exceljs/exceljs) para leer el `.xlsx` (carga diferida)
- [idb](https://github.com/jakearchibald/idb) como envoltorio de IndexedDB
- Tipografía: familia **IBM Plex** (Sans / Serif / Mono)

---

## Estructura esperada del Excel

El libro debe contener una hoja llamada **`Todos los registros`**. Las columnas siguen el patrón
`P{n}_{PROVEEDOR}_{CAMPO}`:

| Parte         | Significado          | Ejemplo                           |
| :------------ | :------------------- | :-------------------------------- |
| `P{n}`        | Número de portafolio | `P1`, `P2`, …                     |
| `{PROVEEDOR}` | Nombre del proveedor | `GENEFIX`, `LH`                   |
| `{CAMPO}`     | Dato de la columna   | `Descripcion`, `MARCA`, `PRECIO…` |

Por cada portafolio MedMatch detecta automáticamente la columna con **`Descripcion`** (requerida),
la de **`MARCA`** (opcional) y **todas** las que contienen **`PRECIO`** (una o varias).

Ejemplo de cabeceras para dos portafolios:

```
P1_GENEFIX_MARCA   P1_GENEFIX_Descripcion   P1_GENEFIX_PRECIO_BASE_GENEFIX   P1_GENEFIX_PRECIO_FACTURA_NC_25
P2_LH_MARCA        P2_LH_Descripcion        P2_LH_PRECIO_LISTA_2026
```

> El Excel es **all-vs-all**: cada fila correlaciona productos equivalentes entre portafolios.
> Si un producto de `P2` se repite en varias filas (porque hay varios productos de `P1`
> asociados), la tarjeta de `P2` se muestra una sola vez y las de `P1` se muestran todas.

---

## Puesta en marcha

Requiere **Node.js >= 22.12** y [pnpm](https://pnpm.io).

```sh
pnpm install
pnpm dev
```

Abre `http://localhost:4321`, sube tu Excel y empieza a comparar.

---

## Comandos

Todos se ejecutan desde la raíz del proyecto:

| Comando          | Acción                                         |
| :--------------- | :--------------------------------------------- |
| `pnpm install`   | Instala las dependencias                       |
| `pnpm dev`       | Servidor de desarrollo en `localhost:4321`     |
| `pnpm build`     | Compila el sitio de producción en `./dist/`    |
| `pnpm preview`   | Previsualiza la compilación antes de desplegar |
| `pnpm astro ...` | Ejecuta comandos de la CLI de Astro            |

---

## Estructura del proyecto

```text
src/
  components/
    App.tsx                # Orquesta el estado (carga -> busqueda -> comparacion)
    ExcelUploader.tsx      # Zona de carga del archivo
    SearchAutocomplete.tsx # Buscador con sugerencias agrupadas por proveedor
    ComparisonResults.tsx  # Columnas comparativas por portafolio
    ProductCard.tsx        # Tarjeta de producto con sus precios
  lib/
    excel.ts               # Parseo del Excel y deteccion de portafolios
    compare.ts             # Sugerencias y logica de comparacion
    storage.ts             # Persistencia en IndexedDB
    labels.ts              # Etiquetas legibles de columnas/proveedores
    format.ts              # Formato de moneda (COP) y parseo numerico
    types.ts               # Tipos del dominio
  layouts/Layout.astro     # Shell, fondo y atmosfera
  pages/index.astro        # Punto de entrada (monta la isla React)
  styles/global.css        # Tema Tailwind (@theme), fuentes y animaciones
```

---

## Privacidad

MedMatch funciona 100 % en el cliente. El archivo Excel se procesa en tu navegador y solo se
guarda localmente (IndexedDB); no se envía a ningún servidor.

---

## Licencia

Distribuido bajo la licencia [MIT](LICENSE).
