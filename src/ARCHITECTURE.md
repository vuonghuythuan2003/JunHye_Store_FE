# Frontend structure (for BE integration)

## Folder tree

- `src/core`: config chung và HTTP client
- `src/api`: định nghĩa API call theo endpoint
- `src/services`: business service dùng cho UI
- `src/modules`: chia theo domain/module (home, auth, order...)
- `src/shared`: component và util dùng lại
- `src/layouts`: layout khung trang

## Flow đề xuất

`module page` -> `service` -> `api` -> `httpClient` -> Backend
