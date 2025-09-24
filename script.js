// Event listener untuk menutup modal peringatan
document.getElementById('closeModalBtn').addEventListener('click', function() {
    document.getElementById('alertModal').classList.add('hidden');
});

// Fungsi untuk menampilkan modal peringatan dengan pesan khusus
function showAlert(message) {
    document.getElementById('alertMessage').textContent = message;
    document.getElementById('alertModal').classList.remove('hidden');
}

// Fungsi untuk menampilkan atau menyembunyikan form berdasarkan jenis layanan
function toggleForm(layanan) {
    const formKadastral = document.getElementById('formKadastral');
    const formTematik = document.getElementById('formTematik');
    const formPengembalianBatas = document.getElementById('formPengembalianBatas');
    const hasilContainer = document.getElementById('hasilContainer');

    if (layanan === 'kadastral') {
        formKadastral.classList.remove('hidden');
        formTematik.classList.add('hidden');
        formPengembalianBatas.classList.add('hidden');
    } else if (layanan === 'tematik') {
        formKadastral.classList.add('hidden');
        formTematik.classList.remove('hidden');
        formPengembalianBatas.classList.add('hidden');
    } else if (layanan === 'pengembalian_batas') {
        formKadastral.classList.add('hidden');
        formTematik.classList.add('hidden');
        formPengembalianBatas.classList.remove('hidden');
    }
    hasilContainer.classList.add('hidden');
}

// Event listener untuk input luas kadastral
const luasInputKadastral = document.getElementById('luasInputKadastral');
const clearKadastralBtn = document.getElementById('clearKadastralBtn');
luasInputKadastral.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\./g, '');
    if (!isNaN(value) && value !== '') {
        e.target.value = new Intl.NumberFormat('id-ID').format(value);
    }
    clearKadastralBtn.classList.toggle('hidden', e.target.value === '');
});

// Event listener untuk input luas tematik
const luasInputTematik = document.getElementById('luasInputTematik');
const clearTematikBtn = document.getElementById('clearTematikBtn');
luasInputTematik.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\./g, '');
    if (!isNaN(value) && value !== '') {
        e.target.value = new Intl.NumberFormat('id-ID').format(value);
    }
    clearTematikBtn.classList.toggle('hidden', e.target.value === '');
});

// Event listener untuk input luas pengembalian batas
const luasInputPengembalianBatas = document.getElementById('luasInputPengembalianBatas');
const clearPengembalianBatasBtn = document.getElementById('clearPengembalianBatasBtn');
luasInputPengembalianBatas.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\./g, '');
    if (!isNaN(value) && value !== '') {
        e.target.value = new Intl.NumberFormat('id-ID').format(value);
    }
    clearPengembalianBatasBtn.classList.toggle('hidden', e.target.value === '');
});
        
// Fungsi untuk membersihkan input dan menyembunyikan hasil
function clearInput(inputId) {
    const input = document.getElementById(inputId);
    input.value = '';
    let clearBtn;
    if (inputId === 'luasInputKadastral') {
        clearBtn = clearKadastralBtn;
    } else if (inputId === 'luasInputTematik') {
        clearBtn = clearTematikBtn;
    } else {
        clearBtn = clearPengembalianBatasBtn;
    }
    clearBtn.classList.add('hidden');
    document.getElementById('hasilContainer').classList.add('hidden');
}

// Fungsi untuk memeriksa apakah hasil sudah ada, lalu menghitung ulang
function checkAndRecalculate() {
    const hasilContainer = document.getElementById('hasilContainer');
    if (!hasilContainer.classList.contains('hidden')) {
        hitungTarif();
    }
}

// Fungsi utama untuk memilih jenis perhitungan tarif
function hitungTarif() {
    const layanan = document.getElementById('layananDropdown').value;
    if (layanan === 'kadastral') {
        hitungKadastral();
    } else if (layanan === 'tematik') {
        hitungTematik();
    } else if (layanan === 'pengembalian_batas') {
        hitungPengembalianBatas();
    }
}

// Fungsi untuk menghitung tarif layanan kadastral
function hitungKadastral() {
    const luasRaw = document.getElementById('luasInputKadastral').value.replace(/\./g, '');
    const luas = parseFloat(luasRaw);
    const hasilContainer = document.getElementById('hasilContainer');
    const catatanPasal = document.getElementById('catatanPasal');
    const hasilText = document.getElementById('hasilText');

    if (isNaN(luas) || luas <= 0) {
        showAlert("Mohon masukkan luas yang valid untuk layanan Pengukuran dan Pemetaan Kadastral.");
        hasilContainer.classList.add('hidden');
        return;
    }
    
    const jenisLayanan = document.getElementById('jenisKadastralDropdown').value;
    let tarif = 0;

    const tarifDasarPertanian = 40000;
    const tarifDasarNonPertanian = 80000;
    const luas10Ha = 100000;
    const luas1000Ha = 10000000;

    if (luas <= luas10Ha) {
        if (jenisLayanan === 'pertanian') {
            tarif = (luas * tarifDasarPertanian / 500) + 100000;
        } else {
            tarif = (luas * tarifDasarNonPertanian / 500) + 100000;
        }
    } else if (luas <= luas1000Ha) {
        if (jenisLayanan === 'pertanian') {
            tarif = (luas * tarifDasarPertanian / 4000) + 14000000;
        } else {
            tarif = (luas * tarifDasarNonPertanian / 4000) + 14000000;
        }
    } else {
        if (jenisLayanan === 'pertanian') {
            tarif = (luas * tarifDasarPertanian / 10000) + 134000000;
        } else {
            tarif = (luas * tarifDasarNonPertanian / 10000) + 134000000;
        }
    }
    
    hasilText.textContent = `Tarif layanan Pengukuran dan Pemetaan Kadastral: Rp ${tarif.toLocaleString('id-ID')}`;
    catatanPasal.textContent = "Tarif tersebut tidak termasuk biaya transportasi, akomodasi dan konsumsi (Pasal 21 PP 128 Tahun 2015)";
    hasilContainer.classList.remove('hidden');
}

// Fungsi untuk menghitung tarif layanan tematik
function hitungTematik() {
    const luasRaw = document.getElementById('luasInputTematik').value.replace(/\./g, '');
    const luas = parseFloat(luasRaw);
    const skala = document.getElementById('skalaDropdown').value;
    const hasilContainer = document.getElementById('hasilContainer');
    const catatanPasal = document.getElementById('catatanPasal');
    const hasilText = document.getElementById('hasilText');

    if (isNaN(luas) || luas <= 0) {
        showAlert("Mohon masukkan luas yang valid untuk layanan Pemetaan Tematik Kawasan.");
        hasilContainer.classList.add('hidden');
        return;
    }

    let tarif = 0;
    if (skala === '1:10000') {
        tarif = luas * 40000;
    } else if (skala === '1:25000') {
        tarif = luas * 20000;
    }

    hasilText.textContent = `Tarif layanan Pemetaan Tematik Kawasan: Rp ${tarif.toLocaleString('id-ID')}`;
    catatanPasal.textContent = "Tarif tersebut tidak termasuk biaya transportasi, akomodasi dan konsumsi (Pasal 21 PP 128 Tahun 2015)";
    hasilContainer.classList.remove('hidden');
}

// Fungsi untuk menghitung tarif layanan pengembalian batas
function hitungPengembalianBatas() {
    const luasRaw = document.getElementById('luasInputPengembalianBatas').value.replace(/\./g, '');
    const luas = parseFloat(luasRaw);
    const hasilContainer = document.getElementById('hasilContainer');
    const catatanPasal = document.getElementById('catatanPasal');
    const hasilText = document.getElementById('hasilText');

    if (isNaN(luas) || luas <= 0) {
        showAlert("Mohon masukkan luas yang valid untuk layanan Pengembalian Batas.");
        hasilContainer.classList.add('hidden');
        return;
    }
    
    const jenisLayanan = document.getElementById('jenisPengembalianBatasDropdown').value;
    let tarifDasar = 0;

    const tarifDasarPertanian = 40000;
    const tarifDasarNonPertanian = 80000;
    const luas10Ha = 100000;
    const luas1000Ha = 10000000;

    if (luas <= luas10Ha) {
        if (jenisLayanan === 'pertanian') {
            tarifDasar = (luas * tarifDasarPertanian / 500) + 100000;
        } else {
            tarifDasar = (luas * tarifDasarNonPertanian / 500) + 100000;
        }
    } else if (luas <= luas1000Ha) {
        if (jenisLayanan === 'pertanian') {
            tarifDasar = (luas * tarifDasarPertanian / 4000) + 14000000;
        } else {
            tarifDasar = (luas * tarifDasarNonPertanian / 4000) + 14000000;
        }
    } else {
        if (jenisLayanan === 'pertanian') {
            tarifDasar = (luas * tarifDasarPertanian / 10000) + 134000000;
        } else {
            tarifDasar = (luas * tarifDasarNonPertanian / 10000) + 134000000;
        }
    }
    
    const tarifFinal = tarifDasar * 1.5;

    hasilText.textContent = `Tarif layanan Pengembalian Batas: Rp ${tarifFinal.toLocaleString('id-ID')}`;
    catatanPasal.textContent = "Tarif tersebut tidak termasuk biaya transportasi, akomodasi dan konsumsi (Pasal 21 PP 128 Tahun 2015)";
    hasilContainer.classList.remove('hidden');
}
