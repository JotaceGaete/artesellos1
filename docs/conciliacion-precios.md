# Conciliación products vs stock_timbres (solo lectura, 2026-11-25)

Estado: informe. No se ha cambiado ningún precio ni stock.

## Naturaleza de las tablas
- `stock_timbres` (61 filas) es un inventario por lotes: un mismo modelo aparece varias veces, a veces con precios distintos (3 modelos tienen más de un precio).
- `products` (22 filas) tiene una fila por modelo publicado.
- Los nombres no coinciden: `Shiny S-722`, `Shiny 722`, `Traxx-9011` y `Traxx  9011`. La comparación se hizo por marca + número de modelo.

## Resultados (por modelo normalizado)
| Concepto | Resultado |
|---|---|
| Modelos en stock_timbres | 36 |
| Modelos en products | 22 |
| Coinciden | 15 |
| Solo en stock_timbres | 21 |
| Solo en products | 7 |
| Precio products igual a stock (3 de 15) | Shiny 722, 829, 833 |
| Precio products distinto (12 de 15) | ver detalle |
| Stock total distinto (14 de 15) | ver detalle |
| `regular_price` distinto de `price` en products | 6 |

## Detalle de los 15 coincidentes (precio products / precio stock / stock products / stock stock)
- Automatik 913: 22.000 / 18.000 / 0 / 6
- Automatik 940: 23.000 / 21.000 / 10 / 7
- Automatik 953: 19.500 / 24.000 / 10 / 3
- Shiny 842: 18.000 / 16.000 / 2 / 4
- Shiny 829 (Fechador): 29.000 / 29.000 / 0 / 4
- Shiny 832: 19.000 / 18.000 / 10 / 1
- Shiny 833: 26.000 / 26.000 / 10 / 1
- Shiny 837 (Fechador): 29.000 / 24.000 / 0 / 3
- Shiny E-915 (Fechador): 45.000 / 40.000 / 0 / 2
- Shiny S-722: 16.000 / 16.000 / 9 / 8
- Shiny S-723: 18.000 / 17.000 / 0 / 3
- Traxx 9130: 19.000 / 18.000 / 0 / 4
- Traxx-9011: 17.000 / 18.000 / 0 / 4
- Trodat 4912: 19.000 / 18.000 / 10 / 8
- Trodat 4915: 25.000 / 20.000 / 1 / 1

## Solo en products (sin lotes en stock_timbres)
Automatik 945, Shiny 532, Shiny Printer S-841, Traxx 9045, Traxx 916, Trodat 9511, Trodat Printy 3911.

## Recomendación antes de cambiar la fuente oficial
1. Confirmar con el dueño, modelo por modelo, cuál es el precio vigente. Hay 12 diferencias.
2. Confirmar si el stock de products es manual o refleja stock_timbres; hoy no coincide en 14 de 15.
3. Decidir qué hacer con los 21 modelos que solo existen en inventario (no publicados) y con los 7 publicados sin lotes.
4. Solo después, un cambio explícito de precios, con respaldo previo.
