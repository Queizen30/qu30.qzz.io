// Search functionality for articles
class ArticleSearch {
    constructor(articlesBasePath) {
        this.articlesBasePath = articlesBasePath;
        this.articles = [];
    }

    // Define the list of articles to search through
    async loadArticles() {
        // Get the current directory to determine which articles to load
        const currentPath = window.location.pathname;
        let articleFiles = [];

        if (currentPath.includes('/what-is/')) {
            // If we're in the what-is directory, search in what-is articles
            articleFiles = [
                '/articles/what-is/cloudflare.html'
            ];
        } else {
            // If we're in the main articles directory, search all articles
            articleFiles = [
                '/articles/free-domain.html',
                '/articles/free-subdomains.html',
                '/articles/screen_time_bypasses.html',
                '/articles/what-is/cloudflare.html'
            ];
        }

        // Fetch and parse each article
        for (const file of articleFiles) {
            try {
                const response = await fetch(file);
                if (response.ok) {
                    const html = await response.text();
                    const article = this.parseArticle(html, file);
                    if (article) {
                        this.articles.push(article);
                    }
                }
            } catch (error) {
                console.error(`Error loading article ${file}:`, error);
            }
        }

        return this.articles;
    }

    // Parse HTML and extract metadata
    parseArticle(html, url) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Extract title
        const titleElement = doc.querySelector('title');
        const title = titleElement ? titleElement.textContent : '';

        // Extract description from meta tag
        const descriptionElement = doc.querySelector('meta[name="description"]');
        const description = descriptionElement ? descriptionElement.getAttribute('content') : '';

        // Extract all headings for searchable content
        const headings = [];
        const h1Elements = doc.querySelectorAll('h1');
        const h2Elements = doc.querySelectorAll('h2');
        const h3Elements = doc.querySelectorAll('h3');
        const h4Elements = doc.querySelectorAll('h4');
        const h5Elements = doc.querySelectorAll('h5');
        const h6Elements = doc.querySelectorAll('h6');

        h1Elements.forEach(h => headings.push(h.textContent.trim()));
        h2Elements.forEach(h => headings.push(h.textContent.trim()));
        h3Elements.forEach(h => headings.push(h.textContent.trim()));
        h4Elements.forEach(h => headings.push(h.textContent.trim()));
        h5Elements.forEach(h => headings.push(h.textContent.trim()));
        h6Elements.forEach(h => headings.push(h.textContent.trim()));

        return {
            url: url,
            title: title,
            description: description,
            headings: headings,
            searchText: (title + ' ' + description + ' ' + headings.join(' ')).toLowerCase()
        };
    }

    // Search articles based on query
    search(query) {
        if (!query || query.trim() === '') {
            return this.articles;
        }

        const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
        
        return this.articles.filter(article => {
            return searchTerms.every(term => article.searchText.includes(term));
        });
    }

    // Display search results
    displayResults(results, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        if (results.length === 0) {
            container.innerHTML = '<p>No articles found.</p>';
            return;
        }

        results.forEach(article => {
            const resultDiv = document.createElement('a');
            resultDiv.href = article.url;
            resultDiv.style.textDecoration = 'none';
            
            const articleBox = document.createElement('div');
            articleBox.className = 'sel-a';
            
            const titleElement = document.createElement('h2');
            // Extract just the article title from the full title (before the pipe)
            const displayTitle = article.title.split('|')[0].trim();
            titleElement.textContent = displayTitle;
            titleElement.style.fontSize = '150%';
            titleElement.style.margin = '10px 0';
            
            const descElement = document.createElement('p');
            descElement.textContent = article.description || 'No description available';
            descElement.style.margin = '5px 0';
            
            articleBox.appendChild(titleElement);
            articleBox.appendChild(descElement);
            resultDiv.appendChild(articleBox);
            container.appendChild(resultDiv);
        });
    }
}

// Initialize search when page loads
let searchInstance;

document.addEventListener('DOMContentLoaded', async function() {
    const searchInput = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('searchResults');
    
    if (!searchInput || !resultsContainer) return;

    // Create search instance
    searchInstance = new ArticleSearch();
    
    // Load articles
    await searchInstance.loadArticles();
    
    // Display all articles initially
    searchInstance.displayResults(searchInstance.articles, 'searchResults');
    
    // Add search input listener
    searchInput.addEventListener('input', function() {
        const query = this.value;
        const results = searchInstance.search(query);
        searchInstance.displayResults(results, 'searchResults');
    });
});
