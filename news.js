// News items dynamic loading for news.html

document.addEventListener('DOMContentLoaded', () => {
    const newsGrid = document.querySelector('.news-grid');
    const newsItems = [
        {
            title: 'New Web Development Trends',
            date: 'March 15, 2024',
            excerpt: 'Exploring the latest trends in web development...'
        },
        {
            title: 'The Future of JavaScript',
            date: 'March 10, 2024',
            excerpt: 'What\'s coming next in the JavaScript ecosystem...'
        },
        {
            title: 'Building Responsive Websites',
            date: 'March 5, 2024',
            excerpt: 'Best practices for creating responsive web designs...'
        }
    ];

    if (newsGrid) {
        newsItems.forEach(item => {
            const newsItem = document.createElement('div');
            newsItem.className = 'news-item';
            newsItem.innerHTML = `
                <h3>${item.title}</h3>
                <p class="date">${item.date}</p>
                <p>${item.excerpt}</p>
                <a href="#" class="read-more">Read More</a>
            `;
            newsGrid.appendChild(newsItem);
        });
    }
}); 