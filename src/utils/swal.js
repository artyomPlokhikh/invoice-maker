import Swal from "sweetalert2";

export function confirmSaveDialog() {
    return Swal.fire({
        title: "Chcete změny uložit?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Uložit",
        confirmButtonColor: '#00bd7e', // jade-500
        denyButtonText: `Neukládat`
    });
}

export function confirmDeleteDialog() {
    return Swal.fire({
        title: "Opravdu chcete smazat tuto fakturu?",
        text: "Nebudete ji moci vrátit zpět!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: '#00bd7e', // jade-500
        cancelButtonText: "Zrušit",
        confirmButtonText: "Ano, smazat"
    });
}

export function dataUpdatedDialog() {
    return Swal.fire({
        title: "Údaje byly aktualizovány",
        icon: "success",
        confirmButtonColor: '#00bd7e' // jade-500
    });
}