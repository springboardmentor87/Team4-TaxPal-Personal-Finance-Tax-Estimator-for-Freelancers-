const overlay = document.querySelector('.overlay');
const closeBtn = document.querySelector('.close-btn');
const cancelBtn = document.querySelector('.cancel');
const form = document.querySelector('form');

function closeModal() {
    overlay.style.display = 'none';
}

closeBtn?.addEventListener('click', closeModal);
cancelBtn?.addEventListener('click', closeModal);

form?.addEventListener('submit', event => {
    event.preventDefault();
    alert('Income saved successfully!');
    closeModal();
});
