# Design — Mise en Place

Registro: **product** (app UI). Lenguaje visual de la familia **Evolving Studio** con acento propio de cocina.

## Paleta (objeto `G` en index.html, ~línea 72)
Se conservan los nombres de clave históricos; `blue` = acento oliva (no azul).

| Rol | Token | Valor |
|---|---|---|
| Fondo (hueso cálido) | `bg` | `#F3F1EC` |
| Superficie sutil | `surf` | `#ECE8DF` |
| Card / near-white | `card` / `w` | `#FCFBF8` |
| Línea | `brd` | `#E3DED2` |
| **Acento (oliva)** | `blue` | `#4F6146` |
| Acento hover | `blueHov` | `#3E4E37` |
| Tint acento | `blueTint` | `#ECEFE6` |
| Tinta | `text` | `#17150F` |
| Body | `textMid` | `#3A3730` |
| Muted | `textMut` | `#8C8678` |
| Destructivo (brick) | `red` | `#B0473B` |
| Éxito | `green` | `#54694A` |
| Ochre | `gold` | `#A9762C` |

Categorías/colecciones usan una paleta terrosa cálida (`COLL_COLORS`, `catColors`): oliva, terracota, ochre, ciruela, arcilla, salvia, taupe. Nada de azules/morados brillantes.

## Tipografía
- Display: **Space Grotesk** (`FH`). Headings, `letter-spacing:-.02em`.
- Body: **Inter** (`FB`).
- **Labels / eyebrows / meta: IBM Plex Mono** (`FM`), MAYÚSCULAS, `letter-spacing` ~1–2.5, `font-weight:500`. Es la firma editorial.

## Iconos
Set line propio en `ICON_PATHS` + componente `<Icon name size stroke style/>` (~línea 130). viewBox 24, `currentColor`, trazo 1.5–1.6, caps redondos. **No usar emojis pictográficos en UI.** Glifos tipográficos limpios permitidos: ✓ ✕ ✦ ★ → ← ↗ ↻ · ⋯ ○. Los emojis en el TEXTO exportado de la lista de compras (🛒) son contenido, se quedan.

## Principios
- Editorial y con aire: hueso cálido + tinta cálida + mucho espacio.
- Labels mono en mayúsculas como firma; jerarquía por escala/peso, no por decoración.
- Acento oliva usado con moderación (acciones primarias, activos, eyebrows).
- Sin cards anidadas, sin sombras+borde duplicados, radios de card 8–14px.
- "Look nothing like the rest" (pilar Evolving): art direction propia, no plantilla SaaS.
