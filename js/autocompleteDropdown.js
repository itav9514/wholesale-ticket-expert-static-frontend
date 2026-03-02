// Use the correct URL prefix (adjust port/domain as needed)
const apiUrl = 'http://127.0.0.1:8000/api_airport_dropdown/airports/';  
// If testing locally without FORCE_SCRIPT_NAME: 'http://127.0.0.1:8000/cms/api_airport_dropdown/airports/'
// In production: '/api_airport_dropdown/airports/' (relative path is best)

function setupAutocomplete(inputId, dropdownId) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);

    if (!input || !dropdown) {
        console.error(`Element not found: ${inputId} or ${dropdownId}`);
        return;
    }

    let debounceTimer;

    input.addEventListener('input', () => {
        clearTimeout(debounceTimer);

        debounceTimer = setTimeout(async () => {
            const query = input.value.trim();

            if (query.length < 2) {
                dropdown.innerHTML = '';
                dropdown.classList.remove('show');
                return;
            }

            try {
                const response = await fetch(`${apiUrl}?query=${encodeURIComponent(query)}`);
                
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }

                const suggestions = await response.json();

                dropdown.innerHTML = '';

                if (suggestions.length === 0) {
                    const li = document.createElement('li');
                    li.textContent = 'No airports found';
                    li.style.color = '#999';
                    dropdown.appendChild(li);
                } else {
                    suggestions.forEach(sugg => {
                        const li = document.createElement('li');
                        li.textContent = sugg.label;
                        
                        li.addEventListener('click', () => {
                            input.value = sugg.label;
                            // Optional: store airport code in hidden input or data attribute
                            // input.dataset.airportCode = sugg.airport_code;
                            
                            dropdown.innerHTML = '';
                            dropdown.classList.remove('show');
                        });
                        
                        dropdown.appendChild(li);
                    });
                }

                dropdown.classList.add('show');
            } catch (error) {
                console.error('Autocomplete fetch error:', error);
                dropdown.innerHTML = '<li style="color:red">Error loading suggestions</li>';
                dropdown.classList.add('show');
            }
        }, 300); // 300ms debounce
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('show');
            dropdown.innerHTML = '';
        }
    });

    // Optional: show dropdown again if user focuses input and value exists
    input.addEventListener('focus', () => {
        if (input.value.trim().length >= 2) {
            // You could re-trigger search here if needed
            dropdown.classList.add('show');
        }
    });
}

// Initialize both fields
setupAutocomplete('from-input', 'from-dropdown');
setupAutocomplete('to-input', 'to-dropdown');