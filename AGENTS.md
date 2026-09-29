# Architecture Rules

- Treat `withdrawn` as a terminal return-request status; it remains visible in history but customer chat and further workflow actions are disabled, because it represents abandonment after seven days without response.
