// Portfolio items dynamic loading for portfolio.html

document.addEventListener('DOMContentLoaded', () => {
    const portfolioGrid = document.querySelector('.portfolio-grid');
    const portfolioItems = [
        {
            title: 'RwandaEats',
            description: 'A modern food ordering app in making,it will allow restaurants to create Pages and  customers to open accounts, so restaurant owners can handle their customers and deliveries.',
            image: 'capture1.png'
        },
        {
            title: 'AfroPay',
            description: 'A Fintech App in making. This App is to allow easy transactions in africa and the diaspora.',
            image: 'capture.png'
        },
        {
            title: 'AfroDates',
            description: 'A modern dating app in making. This app will allow people to connect and find love in africa and the diaspora.',
            image: 'capture2.png'
        }
    ];

    if (portfolioGrid) {
        portfolioItems.forEach(item => {
            const portfolioItem = document.createElement('div');
            portfolioItem.className = 'portfolio-item';
            portfolioItem.innerHTML = `
                <img src="${item.image}" alt="${item.title}">
                <h3>${item.title}</h3>
                <p>${item.description}</p>
            `;
            portfolioGrid.appendChild(portfolioItem);
        });
    }
}); 