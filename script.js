// State Global
let currentUserRole = null; // 'pemohon', 'staf', or null

// PERINGATAN KEAMANAN KRITIS: 
// Kata sandi yang di-*hardcode* di sisi klien (browser) sangat tidak aman.
// Dalam aplikasi nyata, autentikasi harus dilakukan melalui server (misalnya, Firebase Auth atau backend khusus)
// menggunakan hashing (seperti bcrypt) dan komunikasi HTTPS.
const STAFF_PASSWORD = 'SPsulsel01'; // Password Staf yang disembunyikan
let isLoggingOut = false; // FLAG BARU: Untuk mencegah pop-up saat logout

document.addEventListener('DOMContentLoaded', (event) => {
    // Event listener untuk menutup modal peringatan
    document.getElementById('closeModalBtn').addEventListener('click', function() {
        document.getElementById('alertModal').classList.add('hidden');
        
        // Kembalikan fokus ke input password staf setelah alert ditutup (jika form login staf aktif)
        const staffLoginForm = document.getElementById('staffLoginForm');
        if (staffLoginForm && !staffLoginForm.classList.contains('hidden')) {
            document.getElementById('staffPasswordInput').focus();
        }
    });

    // Setup listeners untuk input luas (untuk format angka dan tombol hapus)
    setupInputListeners('luasInputKadastral', 'clearKadastralBtn');
    setupInputListeners('luasInputTematik', 'clearTematikBtn');
    setupInputListeners('luasInputPengembalianBatas', 'clearPengembalianBatasBtn');

    // Setup listeners Enter untuk input Luas
    setupEnterKeyListener('luasInputKadastral');
    setupEnterKeyListener('luasInputTematik');
    setupEnterKeyListener('luasInputPengembalianBatas');
    
    // Pastikan form default Kadastral tampil saat pertama kali dimuat
    toggleForm('kadastral');
});

// --- FUNGSI UTILITY INPUT LUAS & RESET ---

/**
 * Menambahkan event listener keydown untuk tombol Enter agar memicu hitungTarif.
 * @param {string} inputId ID dari elemen input.
 */
function setupEnterKeyListener(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault(); 
                hitungTarif();
            }
        });
    }
}

/**
 * Menampilkan modal peringatan kustom.
 * @param {string} message Pesan yang akan ditampilkan.
 */
function showAlert(message) {
    document.getElementById('alertMessage').textContent = message;
    document.getElementById('alertModal').classList.remove('hidden');
}

/**
 * Menambahkan event listener ke input luas untuk pemformatan angka dan visibilitas tombol clear.
 * @param {string} inputId ID dari elemen input luas.
 * @param {string} clearBtnId ID dari elemen tombol clear.
 */
function setupInputListeners(inputId, clearBtnId) {
    const input = document.getElementById(inputId);
    const clearBtn = document.getElementById(clearBtnId);

    if (input) {
        input.addEventListener('input', function(e) {
            // Hapus semua karakter non-digit
            let value = e.target.value.replace(/\D/g, ''); 
            
            if (value !== '') {
                // Format angka dengan titik sebagai pemisah ribuan
                e.target.value = new Intl.NumberFormat('id-ID').format(value);
            } else {
                e.target.value = '';
            }

            clearBtn.classList.toggle('hidden', e.target.value === '');
            checkAndRecalculate(); // Panggil fungsi hitung ulang saat input berubah
        });
    }
}

/**
 * Membersihkan nilai input dan menyembunyikan tombol clear (x) pada input Luas.
 * Fungsi ini digunakan oleh tombol clear dan reset.
 * @param {string} inputId ID dari elemen input yang akan dibersihkan.
 */
function clearInput(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.value = '';
        // Memicu event input untuk memastikan tombol clear-nya tersembunyi
        input.dispatchEvent(new Event('input')); 
    }
}

/**
 * Membersihkan semua input di semua form dan mereset tampilan hasil.
 */
function clearAllInputs() {
    const luasInputIds = ['luasInputKadastral', 'luasInputTematik', 'luasInputPengembalianBatas'];
    
    // 1. Clear semua input luas
    luasInputIds.forEach(id => clearInput(id));

    // 2. Clear input password staf
    const staffPasswordInput = document.getElementById('staffPasswordInput');
    if (staffPasswordInput) {
        staffPasswordInput.value = '';
        const clearBtn = document.getElementById('clearStaffPasswordBtn');
        if(clearBtn) clearBtn.classList.add('hidden');
    }
    
    // 3. Sembunyikan hasil perhitungan
    document.getElementById('hasilContainer').classList.add('hidden');
}

/**
 * Membersihkan status aplikasi saat ganti user atau logout.
 */
function resetApplicationState() {
    clearAllInputs();
    
    // Set layanan kembali ke default (Kadastral)
    const layananDropdown = document.getElementById('layananDropdown');
    if (layananDropdown) {
        layananDropdown.value = 'kadastral';
    }
    toggleForm('kadastral');
}


// --- FUNGSI LOGIN STAF (CLEAR DAN TOGGLE VISIBILITY) ---

/**
 * Mengatur event listener untuk input password staf (clear dan toggle visibility).
 */
function setupStaffPasswordListeners() {
    const passwordInput = document.getElementById('staffPasswordInput');
    const clearBtn = document.getElementById('clearStaffPasswordBtn');
    const toggleBtn = document.getElementById('toggleStaffVisibilityBtn');
    const toggleIcon = toggleBtn.querySelector('i');
    
    // 1. Tombol Clear (x)
    const handlePasswordInput = function(e) {
        clearBtn.classList.toggle('hidden', e.target.value === '');
    };
    passwordInput.addEventListener('input', handlePasswordInput);

    const handleClearClick = function() {
        passwordInput.value = '';
        clearBtn.classList.add('hidden');
        passwordInput.focus();
    };
    clearBtn.addEventListener('click', handleClearClick);
    
    // 2. Toggle Visibility (Mata)
    const handleToggleClick = function() {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.classList.remove('fa-eye-slash');
            toggleIcon.classList.add('fa-eye');
            toggleBtn.setAttribute('title', 'Sembunyikan Kata Sandi');
        } else {
            passwordInput.type = 'password';
            toggleIcon.classList.remove('fa-eye');
            toggleIcon.classList.add('fa-eye-slash');
            toggleBtn.setAttribute('title', 'Tampilkan Kata Sandi');
        }
        passwordInput.focus();
    };
    toggleBtn.addEventListener('click', handleToggleClick);
    
    // Simpan referensi fungsi agar bisa dihapus saat logout
    passwordInput.dataset.handleInput = handlePasswordInput;
    clearBtn.dataset.handleClick = handleClearClick;
    toggleBtn.dataset.handleClick = handleToggleClick;

    // Pastikan status awal tombol clear, type, dan ikon benar saat form dibuka
    clearBtn.classList.toggle('hidden', passwordInput.value === '');
    passwordInput.type = 'password';
    toggleIcon.classList.remove('fa-eye');
    toggleIcon.classList.add('fa-eye-slash');
}

/**
 * Menghapus event listener untuk input password staf saat form disembunyikan/logout.
 */
function removeStaffPasswordListeners() {
    const passwordInput = document.getElementById('staffPasswordInput');
    const clearBtn = document.getElementById('clearStaffPasswordBtn');
    const toggleBtn = document.getElementById('toggleStaffVisibilityBtn');

    if (passwordInput && passwordInput.dataset.handleInput) {
        passwordInput.removeEventListener('input', passwordInput.dataset.handleInput);
        clearBtn.removeEventListener('click', clearBtn.dataset.handleClick);
        toggleBtn.removeEventListener('click', toggleBtn.dataset.handleClick);
        
        passwordInput.dataset.handleInput = null;
        clearBtn.dataset.handleClick = null;
        toggleBtn.dataset.handleClick = null;
    }
}

// --- FUNGSI LOGIN & LOGOUT ---

/**
 * Menampilkan form login staf.
 */
function showStaffLogin() {
    document.getElementById('roleSelection').classList.add('hidden');
    document.getElementById('staffLoginForm').classList.remove('hidden');
    const passwordInput = document.getElementById('staffPasswordInput');
    
    setupStaffPasswordListeners(); 
    passwordInput.focus();
    
    // Tambahkan event listener Enter untuk Login Staf
    passwordInput.onkeydown = function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); 
            loginUser('staf');
        }
    };
}

/**
 * Menyembunyikan form login staf dan meresetnya.
 */
function hideStaffLogin() {
    document.getElementById('roleSelection').classList.remove('hidden');
    document.getElementById('staffLoginForm').classList.add('hidden');
    removeStaffPasswordListeners();
}

/**
 * Menangani proses login user (Pemohon atau Staf).
 * @param {string} role Peran pengguna ('pemohon' atau 'staf').
 */
function loginUser(role) {
    const loginContainer = document.getElementById('loginContainer');
    const appContainer = document.getElementById('appContainer');
    const userRoleDisplay = document.getElementById('userRoleDisplay');
    
    if (role === 'pemohon') {
        currentUserRole = 'pemohon';
        resetApplicationState(); // CLEAR INPUTS SAAT GANTI HAK AKSES
        
        appContainer.classList.remove('hidden');
        loginContainer.classList.add('hidden');
        userRoleDisplay.textContent = 'Pemohon';
    
    } else if (role === 'staf') {
        const password = document.getElementById('staffPasswordInput').value;
        
        if (password === STAFF_PASSWORD) {
            currentUserRole = 'staf';
            resetApplicationState(); // CLEAR INPUTS SAAT GANTI HAK AKSES
            
            appContainer.classList.remove('hidden');
            loginContainer.classList.add('hidden');
            userRoleDisplay.textContent = 'Staf';
            hideStaffLogin();
        } else {
            showAlert('Kata sandi Staf tidak valid.');
        }
    }
}

/**
 * Menangani proses logout user.
 */
function logoutUser() {
    // 1. SET FLAG: Ini memastikan hitungTarif tidak memunculkan pop-up
    isLoggingOut = true; 
    
    // 2. Clear semua input dan reset state aplikasi
    currentUserRole = null;
    resetApplicationState(); 
    
    // 3. Pindahkan ke halaman login
    document.getElementById('loginContainer').classList.remove('hidden');
    document.getElementById('appContainer').classList.add('hidden');
    document.getElementById('userRoleDisplay').textContent = 'Silakan masuk';
    hideStaffLogin(); 

    // 4. RESET FLAG: Setelah proses logout selesai
    isLoggingOut = false;
}

// --- FUNGSI UI & LOGIKA PERHITUNGAN ---

/**
 * Menampilkan atau menyembunyikan form berdasarkan jenis layanan yang dipilih.
 * @param {string} layanan Jenis layanan yang dipilih.
 */
function toggleForm(layanan) {
    const forms = {
        kadastral: document.getElementById('formKadastral'),
        tematik: document.getElementById('formTematik'),
        pengembalian_batas: document.getElementById('formPengembalianBatas')
    };
    const hasilContainer = document.getElementById('hasilContainer');

    for (const key in forms) {
        // Hapus input dari form yang sedang disembunyikan/sebelum berganti
        if (!forms[key].classList.contains('hidden')) {
            if (key === 'kadastral') clearInput('luasInputKadastral');
            else if (key === 'tematik') clearInput('luasInputTematik');
            else if (key === 'pengembalian_batas') clearInput('luasInputPengembalianBatas');
        }

        // Tampilkan form yang benar
        if (key === layanan) {
            forms[key].classList.remove('hidden');
        } else {
            forms[key].classList.add('hidden');
        }
    }
    // Sembunyikan hasil perhitungan saat ganti layanan
    hasilContainer.classList.add('hidden');
}

/**
 * Mengontrol visibilitas detail komponen biaya.
 */
function toggleDetail() {
    // Hanya izinkan toggle jika user adalah Staf
    if (currentUserRole === 'staf') {
        const detailBiaya = document.getElementById('detailBiaya');
        const chevronIcon = document.getElementById('chevronIcon');
        
        detailBiaya.classList.toggle('hidden');
        chevronIcon.classList.toggle('rotate-180');
    }
}

/**
 * Memeriksa apakah hasil sedang ditampilkan, jika ya, hitung ulang.
 */
function checkAndRecalculate() {
    const hasilContainer = document.getElementById('hasilContainer');
    if (!hasilContainer.classList.contains('hidden')) {
        hitungTarif();
    }
}

/**
 * Memanggil fungsi hitungan yang relevan berdasarkan jenis layanan yang dipilih.
 */
function hitungTarif() {
    // PERBAIKAN: Cek flag isLoggingOut
    if (!currentUserRole && !isLoggingOut) {
        showAlert('Anda harus masuk terlebih dahulu.');
        return;
    } else if (!currentUserRole && isLoggingOut) {
        // Abaikan hitung tarif jika sedang logout
        return; 
    }

    const layanan = document.getElementById('layananDropdown').value;
    if (layanan === 'kadastral') {
        hitungKadastral();
    } else if (layanan === 'tematik') {
        hitungTematik();
    } else if (layanan === 'pengembalian_batas') {
        hitungPengembalianBatas();
    }
}

/**
 * Menghitung tarif layanan Pengukuran dan Pemetaan Kadastral.
 */
function hitungKadastral() {
    // Pastikan untuk menghapus titik pemisah ribuan sebelum parsing
    const luasRaw = document.getElementById('luasInputKadastral').value.replace(/\./g, '');
    const luas = parseFloat(luasRaw);
    const hasilContainer = document.getElementById('hasilContainer');
    const jenisLayanan = document.getElementById('jenisKadastralDropdown').value;

    if (isNaN(luas) || luas <= 0) {
        hasilContainer.classList.add('hidden');
        // Hanya tampilkan peringatan jika tidak dalam proses logout
        if (!isLoggingOut) showAlert("Mohon masukkan luas yang valid untuk layanan Kadastral.");
        return;
    }
    
    // Konstanta berdasarkan PP 128 Tahun 2015
    const tarifDasarPertanian = 40000;
    const tarifDasarNonPertanian = 80000;
    const luas10Ha = 100000;
    const luas1000Ha = 10000000;
    let tarif = 0;
    const tarifDasar = jenisLayanan === 'pertanian' ? tarifDasarPertanian : tarifDasarNonPertanian;

    if (luas <= luas10Ha) {
        tarif = (luas * tarifDasar / 500) + 100000;
    } else if (luas <= luas1000Ha) {
        tarif = (luas * tarifDasar / 4000) + 14000000;
    } else {
        tarif = (luas * tarifDasar / 10000) + 134000000;
    }
    
    // Perhitungan Komponen Biaya untuk Staf
    const biayaIzinPenggunaan = tarif * 0.8554;
    const biayaPengukuranBidangTanah = biayaIzinPenggunaan * 0.80;

    // Tampilkan Hasil
    document.getElementById('hasilText').textContent = `Tarif layanan Pengukuran dan Pemetaan Kadastral: Rp ${Math.ceil(tarif).toLocaleString('id-ID')}`;
    document.getElementById('catatanPasal').textContent = "Tarif tersebut tidak termasuk biaya transportasi, akomodasi dan konsumsi (Pasal 21 PP 128 Tahun 2015)";
    
    // Tampilkan Rincian (Staf Only)
    document.getElementById('biayaIzinPenggunaanLabel').textContent = `Ijin Penggunaan (85,54%)`;
    document.getElementById('biayaIzinPenggunaanValue').textContent = `Rp ${Math.ceil(biayaIzinPenggunaan).toLocaleString('id-ID')}`;
    document.getElementById('biayaPengukuranBidangTanahLabel').textContent = `Penggunaan Biaya Pengukuran & PBT (80%)`;
    document.getElementById('biayaPengukuranBidangTanahValue').textContent = `Rp ${Math.ceil(biayaPengukuranBidangTanah).toLocaleString('id-ID')}`;
    
    hasilContainer.classList.remove('hidden');
    
    document.getElementById('toggleDetailHeader').classList.toggle('hidden', currentUserRole === 'pemohon');
    document.getElementById('detailBiaya').classList.add('hidden'); 
    document.getElementById('chevronIcon').classList.remove('rotate-180');
}

/**
 * Menghitung tarif layanan Pemetaan Tematik Kawasan (dalam Ha).
 */
function hitungTematik() {
    // Pastikan untuk menghapus titik pemisah ribuan sebelum parsing
    const luasRaw = document.getElementById('luasInputTematik').value.replace(/\./g, '');
    const luas = parseFloat(luasRaw);
    const skala = document.getElementById('skalaDropdown').value;
    const hasilContainer = document.getElementById('hasilContainer');
    
    if (isNaN(luas) || luas <= 0) {
        hasilContainer.classList.add('hidden');
        if (!isLoggingOut) showAlert("Mohon masukkan luas yang valid untuk layanan Pemetaan Tematik Kawasan (Ha).");
        return;
    }

    let tarif = 0;
    // Asumsi tarif berdasarkan PP 128/2015 Pasal 15 ayat (1) huruf a dan b.
    if (skala === '1:10000') {
        tarif = luas * 40000;
    } else if (skala === '1:25000') {
        tarif = luas * 20000;
    }
    
    // Kosongkan rincian karena layanan tematik tidak memiliki rincian komponen biaya yang sama.
    document.getElementById('biayaIzinPenggunaanLabel').textContent = '';
    document.getElementById('biayaPengukuranBidangTanahLabel').textContent = '';
    document.getElementById('biayaIzinPenggunaanValue').textContent = '';
    document.getElementById('biayaPengukuranBidangTanahValue').textContent = '';

    // Tampilkan Hasil
    document.getElementById('hasilText').textContent = `Tarif layanan Pemetaan Tematik Kawasan: Rp ${Math.ceil(tarif).toLocaleString('id-ID')}`;
    document.getElementById('catatanPasal').textContent = "Tarif tersebut tidak termasuk biaya transportasi, akomodasi dan konsumsi (Pasal 21 PP 128 Tahun 2015)";
    hasilContainer.classList.remove('hidden');

    // Sembunyikan rincian komponen biaya untuk layanan ini
    document.getElementById('detailBiaya').classList.add('hidden');
    document.getElementById('toggleDetailHeader').classList.add('hidden');
}

/**
 * Menghitung tarif layanan Pengembalian Batas (1.5x tarif kadastral).
 */
function hitungPengembalianBatas() {
    // Pastikan untuk menghapus titik pemisah ribuan sebelum parsing
    const luasRaw = document.getElementById('luasInputPengembalianBatas').value.replace(/\./g, '');
    const luas = parseFloat(luasRaw);
    const hasilContainer = document.getElementById('hasilContainer');
    const jenisLayanan = document.getElementById('jenisPengembalianBatasDropdown').value;

    if (isNaN(luas) || luas <= 0) {
        hasilContainer.classList.add('hidden');
        if (!isLoggingOut) showAlert("Mohon masukkan luas yang valid untuk layanan Pengembalian Batas.");
        return;
    }
    
    // Konstanta berdasarkan PP 128 Tahun 2015
    const tarifDasarPertanian = 40000;
    const tarifDasarNonPertanian = 80000;
    const luas10Ha = 100000;
    const luas1000Ha = 10000000;
    let tarifDasar = 0;
    const tarifDasarPerM2 = jenisLayanan === 'pertanian' ? tarifDasarPertanian : tarifDasarNonPertanian;

    // Hitungan Tarif Dasar Kadastral
    if (luas <= luas10Ha) {
        tarifDasar = (luas * tarifDasarPerM2 / 500) + 100000;
    } else if (luas <= luas1000Ha) {
        tarifDasar = (luas * tarifDasarPerM2 / 4000) + 14000000;
    } else {
        tarifDasar = (luas * tarifDasarPerM2 / 10000) + 134000000;
    }
    
    // Tarif Pengembalian Batas = Tarif Dasar Kadastral * 1.5
    const tarifFinal = tarifDasar * 1.5;

    // Perhitungan Komponen Biaya untuk Staf
    const biayaIzinPenggunaan = tarifFinal * 0.8554;
    const biayaPengukuranBidangTanah = biayaIzinPenggunaan * 0.80;

    // Tampilkan Hasil
    document.getElementById('hasilText').textContent = `Tarif layanan Pengembalian Batas: Rp ${Math.ceil(tarifFinal).toLocaleString('id-ID')}`;
    document.getElementById('catatanPasal').textContent = "Tarif tersebut tidak termasuk biaya transportasi, akomodasi dan konsumsi (Pasal 21 PP 128 Tahun 2015)";

    // Tampilkan Rincian (Staf Only)
    document.getElementById('biayaIzinPenggunaanLabel').textContent = `Ijin Penggunaan (85,54%)`;
    document.getElementById('biayaIzinPenggunaanValue').textContent = `Rp ${Math.ceil(biayaIzinPenggunaan).toLocaleString('id-ID')}`;
    document.getElementById('biayaPengukuranBidangTanahLabel').textContent = `Penggunaan Biaya Pengukuran & PBT (80%)`;
    document.getElementById('biayaPengukuranBidangTanahValue').textContent = `Rp ${Math.ceil(biayaPengukuranBidangTanah).toLocaleString('id-ID')}`;

    hasilContainer.classList.remove('hidden');

    document.getElementById('toggleDetailHeader').classList.toggle('hidden', currentUserRole === 'pemohon');
    document.getElementById('detailBiaya').classList.add('hidden'); 
    document.getElementById('chevronIcon').classList.remove('rotate-180');
}

