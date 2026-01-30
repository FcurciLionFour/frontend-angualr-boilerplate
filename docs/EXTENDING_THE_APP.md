# Extender la aplicación

## Agregar un nuevo feature

Ejemplo: Products

Estructura recomendada:
features/products/
- products.routes.ts
- products.api.ts
- products-list/
- product-detail/
- product-create/
- product-edit/

## Pasos
1. Crear carpeta en features
2. Definir routes lazy
3. Crear API service
4. Aplicar guards por permisos
5. Manejar estado local con signals

## Reglas
- No modificar core salvo necesidad transversal
- No mezclar lógica de negocio en layouts
- No duplicar permisos
- Mantener contratos con backend

## Permisos
Usar siempre:
permissionGuard(['resource.action'])

## UI
- Reutilizar layouts
- Mantener diseño minimalista
- Usar toast para feedback
- Usar loaders por acción

Siguiendo estas reglas, la app escala sin romperse.
