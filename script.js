document.getElementById('closeModalBtn').addEventListener('click', function() {
    document.getElementById('alertModal').classList.add('hidden');
});

function showAlert(message) {
    document.getElementById('alertMessage').textContent = message;
    document.getElementById('alertModal').classList.remove('hidden');
}

function toggleForm(layanan) {
    const formKadastral = document.getElementById('formKadastral');
    const formTematik = document.getElementById('formTematik');
    const hasilContainer = document.getElementById('hasilContainer');

    if (layanan === 'kadastral') {
        formKadastral.classList.remove('hidden');
        formTematik.classList.add('hidden');
    } else {
        formKadastral.classList.add('hidden');
        formTematik.classList.remove('hidden');
    }
    hasilContainer.classList.add('hidden');
}

const luasInputKadastral = document.getElementById('luasInputKadastral');
const clearKadastralBtn = document.getElementById('clearKadastralBtn');
luasInputKadastral.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\./g, '');
    if (!isNaN(value) && value !== '') {
        e.target.value = new Intl.NumberFormat('id-ID').format(value);
    }
    clearKadastralBtn.classList.toggle('hidden', e.target.value === '');
});

const luasInputTematik = document.getElementById('luasInputTematik');
const clearTematikBtn = document.getElementById('clearTematikBtn');
luasInputTematik.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\./g, '');
    if (!isNaN(value) && value !== '') {
        e.target.value = new Intl.NumberFormat('id-ID').format(value);
    }
    clearTematikBtn.classList.toggle('hidden', e.target.value === '');
});

function clearInput(inputId) {
    const input = document.getElementById(inputId);
    input.value = '';
    const clearBtn = inputId === 'luasInputKadastral' ? clearKadastralBtn : clearTematikBtn;
    clearBtn.classList.add('hidden');
}

function hitungKadastral() {
    const luasRaw = document.getElementById('luasInputKadastral').value.replace(/\./g, '');
    const luas = parseFloat(luasRaw);
    const hasilContainer = document.getElementById('hasilContainer');
    const catatanPasal = document.getElementById('catatanPasal');
    const hasilText = document.getElementById('hasilText');

    if (isNaN(luas) || luas <= 0) {
        showAlert("Mohon masukkan luas yang valid untuk layanan Kadastral.");
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
    
    hasilText.textContent = `Tarif layanan Kadastral: Rp ${tarif.toLocaleString('id-ID')}`;
    catatanPasal.textContent = "Tarif tersebut tidak termasuk biaya transportasi, akomodasi dan konsumsi (Pasal 21 PP 128 Tahun 2015)";
    hasilContainer.classList.remove('hidden');
}

function hitungTematik() {
    const luasRaw = document.getElementById('luasInputTematik').value.replace(/\./g, '');
    const luas = parseFloat(luasRaw);
    const skala = document.getElementById('skalaDropdown').value;
    const hasilContainer = document.getElementById('hasilContainer');
    const catatanPasal = document.getElementById('catatanPasal');
    const hasilText = document.getElementById('hasilText');

    if (isNaN(luas) || luas <= 0) {
        showAlert("Mohon masukkan luas yang valid untuk layanan Tematik.");
        hasilContainer.classList.add('hidden');
        return;
    }

    let tarif = 0;
    if (skala === '1:10000') {
        tarif = luas * 40000;
    } else if (skala === '1:25000') {
        tarif = luas * 20000;
    }

    hasilText.textContent = `Tarif layanan Tematik: Rp ${tarif.toLocaleString('id-ID')}`;
    catatanPasal.textContent = "Tarif tersebut tidak termasuk biaya transportasi, akomodasi dan konsumsi (Pasal 21 PP 128 Tahun 2015)";
    hasilContainer.classList.remove('hidden');
}
