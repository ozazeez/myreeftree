
// Visual feedback for selected components
document.querySelectorAll('.component-checkbox').forEach(checkbox => {
    // Initialize from server-side checked state
    if (checkbox.checked) {
        checkbox.parentElement.querySelector('.badge').textContent = 'Selected';
        checkbox.parentElement.querySelector('.badge').classList.add('bg-reef-teal', 'text-white');
    }

    // Handle user interactions
    checkbox.addEventListener('change', function () {
        const badge = this.parentElement.querySelector('.badge');
        if (this.checked) {
            badge.textContent = 'Selected';
            badge.classList.add('bg-reef-teal', 'text-white');
            badge.classList.remove('badge-outline');
        } else {
            badge.textContent = 'Select';
            badge.classList.remove('bg-reef-teal', 'text-white');
            badge.classList.add('badge-outline');
        }
    });
});

tailwind.config = {
    theme: {
        extend: {
            colors: {
                reef: {
                    dark: '#0A2463',
                    teal: '#2CCED2',
                    coral: '#FF6B6B',
                    light: '#F5F0E6',
                    sea: '#88C9BF'
                }
            }
        }
    }
}