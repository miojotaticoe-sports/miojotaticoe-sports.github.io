const track = document.querySelector('.carousel-track');
const items = document.querySelectorAll('.carousel-item');
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');
let currentIndex = 0;

// Atualiza a posição do carrossel
function updateCarousel() {
  const width = items[0].clientWidth;
  track.style.transform = `translateX(-${currentIndex * width}px)`;
}

// Evento para o botão "Anterior"
prevButton.addEventListener('click', () => {
  currentIndex = (currentIndex === 0) ? items.length - 1 : currentIndex - 1;
  updateCarousel();
});

// Evento para o botão "Próximo"
nextButton.addEventListener('click', () => {
  currentIndex = (currentIndex === items.length - 1) ? 0 : currentIndex + 1;
  updateCarousel();
});

// Atualiza o carrossel ao redimensionar a janela
window.addEventListener('resize', updateCarousel);