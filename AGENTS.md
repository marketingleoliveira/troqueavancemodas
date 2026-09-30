# Architecture Rules

- Treat `withdrawn` as a terminal return-request status; it remains visible in history but customer chat and further workflow actions are disabled, because it represents abandonment after seven days without response.
- Keep password recovery on public routes and preserve the originating customer/admin login context, so expired links can safely restart the correct flow.
