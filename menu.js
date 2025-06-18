document.querySelectorAll('.menu-item').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    const id = item.getAttribute('data-id');
    const content = document.getElementById(id);
    content.style.display = content.style.display === 'block' ? 'none' : 'block';
  });
});