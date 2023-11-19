// UI management functions
function showMessage(text, duration = 2000) {
    // TODO: Implement message display
}

function updatePowerBar(percentage) {
    const powerFill = document.getElementById('power-fill');
    if (powerFill) {
        powerFill.style.width = `${percentage}%`;
    }
}