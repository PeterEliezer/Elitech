// Contact Form handling for contact.html

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            fetch('send-mail.php', {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                if (data.success) {
                    contactForm.reset();
                }
            })
            .catch(() => alert('Failed to send message. Please try again later.'));
        });
    }
}); 