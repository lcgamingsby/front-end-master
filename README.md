# Update (as of 6-3-2026)

## Issues
- [x] Jawaban yang disimpan dapat double karena masalah jaringan (sudah dibatasi dengan useRef)
- [x] BAD_REQUEST saat menjawab karena token autentikasi kadaluarsa (student - sudah memanggil `getRefreshToken()` saat request API gagal)
- [x] Mahasiswa mendapatkan NETWORK_ERROR karena masalah jaringan (out of application scope)

## To-do (frontend)
- [ ] Dashboard mahasiswa diberikan update live biar mahasiswa tidak perlu refresh untuk masuk ujian
- [ ] Berikan error untuk mahasiswa ketika ada kendala saat mengerjakan ujian
- [ ] Membuat dokumentasi detail (seperti video) untuk pendaftaran
- [ ] Revisi halaman pendaftaran (apa jadi?)
