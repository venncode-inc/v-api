document.addEventListener('DOMContentLoaded', async () => {
    // Enhanced loading screen
    const loadingScreen = document.getElementById("loadingScreen");
    const body = document.body;
    body.classList.add("no-scroll");

    // More dynamic loading dots animation
    const loadingDotsAnimation = setInterval(() => {
        const loadingDots = document.querySelector(".loading-dots");
        if (loadingDots) {
            if (loadingDots.textContent === '...') {
                loadingDots.textContent = '.';
            } else {
                loadingDots.textContent += '.';
            }
        }
    }, 500);
    
    // Side navigation functionality
    const sideNav = document.querySelector('.side-nav');
    const mainWrapper = document.querySelector('.main-wrapper');
    const navCollapseBtn = document.querySelector('.nav-collapse-btn');
    const menuToggle = document.querySelector('.menu-toggle');
    
    navCollapseBtn.addEventListener('click', () => {
        sideNav.classList.toggle('collapsed');
        mainWrapper.classList.toggle('nav-collapsed');
    });
    
    menuToggle.addEventListener('click', () => {
        sideNav.classList.toggle('active');
    });
    
    // Close side nav when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth < 992 && 
            !e.target.closest('.side-nav') && 
            !e.target.closest('.menu-toggle') && 
            sideNav.classList.contains('active')) {
            sideNav.classList.remove('active');
        }
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('.side-nav-link').forEach(link => {
        if (link.getAttribute('href').startsWith('#')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({ 
                        behavior: 'smooth' 
                    });
                    
                    // Update active link
                    document.querySelectorAll('.side-nav-link').forEach(l => {
                        l.classList.remove('active');
                    });
                    this.classList.add('active');
                    
                    // Close side nav on mobile
                    if (window.innerWidth < 992) {
                        sideNav.classList.remove('active');
                    }
                }
            });
        }
    });
    
    // Update active nav link on scroll
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        
        document.querySelectorAll('section[id]').forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                document.querySelectorAll('.side-nav-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });

    // Toast notification system
    const showToast = (message, type = 'info') => {
        const toast = document.getElementById('notificationToast');
        const toastBody = toast.querySelector('.toast-body');
        const toastTitle = toast.querySelector('.toast-title');
        const toastIcon = toast.querySelector('.toast-icon');
        
        toastBody.textContent = message;
        
        // Set toast appearance based on type
        toast.style.borderLeftColor = type === 'success' 
            ? 'var(--success-color)' 
            : type === 'error' 
                ? 'var(--error-color)' 
                : 'var(--primary-color)';
        
        toastIcon.className = `toast-icon fas fa-${
            type === 'success' 
                ? 'check-circle' 
                : type === 'error' 
                    ? 'exclamation-circle' 
                    : 'info-circle'
        } me-2`;
        
        toastIcon.style.color = type === 'success' 
            ? 'var(--success-color)' 
            : type === 'error' 
                ? 'var(--error-color)' 
                : 'var(--primary-color)';
        
        toastTitle.textContent = type.charAt(0).toUpperCase() + type.slice(1);
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    };

    // Check for saved theme preference
     document.body.classList.remove('dark-mode');
     localStorage.setItem('darkMode', 'false');

    // Improved clear search button functionality
    document.getElementById('clearSearch').addEventListener('click', () => {
        const searchInput = document.getElementById('searchInput');
        if (searchInput.value.length > 0) {
            searchInput.value = '';
            searchInput.focus();
            // Trigger input event to update the search results
            searchInput.dispatchEvent(new Event('input'));
            // Add haptic feedback animation
            searchInput.classList.add('shake-animation');
            setTimeout(() => {
                searchInput.classList.remove('shake-animation');
            }, 400);
        }
    });

    // Enhanced copy to clipboard functionality
    const copyToClipboard = (elementId) => {
        const element = document.getElementById(elementId);
        const text = element.textContent;
        
        navigator.clipboard.writeText(text).then(() => {
            const btn = elementId === 'apiEndpoint' ? 
                document.getElementById('copyEndpoint') : 
                document.getElementById('copyResponse');
            
            // Show enhanced success animation
            btn.innerHTML = '<i class="fas fa-check"></i>';
            btn.classList.add('copy-success');
            
            // Show toast
            showToast('Copied to clipboard successfully!', 'success');
            
            setTimeout(() => {
                btn.innerHTML = '<i class="far fa-copy"></i>';
                btn.classList.remove('copy-success');
            }, 1500);
        }).catch(err => {
            showToast('Failed to copy text: ' + err, 'error');
        });
    };
    
    document.getElementById('copyEndpoint').addEventListener('click', () => {
        copyToClipboard('apiEndpoint');
    });
    
    document.getElementById('copyResponse').addEventListener('click', () => {
        copyToClipboard('apiResponseContent');
    });

    try {
        // Fetch settings with improved error handling
        const settingsResponse = await fetch('/src/settings.json');
        
        if (!settingsResponse.ok) {
            throw new Error(`Failed to load settings: ${settingsResponse.status} ${settingsResponse.statusText}`);
        }
        
        const settings = await settingsResponse.json();

        // Enhanced content setter function
        const setContent = (id, property, value, fallback = '') => {
            const element = document.getElementById(id);
            if (element) element[property] = value || fallback;
        };
        
        // Set page content from settings with fallbacks
        const currentYear = new Date().getFullYear();
        setContent('page', 'textContent', settings.name, "Falcon-Api");
        setContent('wm', 'textContent', `© ${currentYear} ${settings.apiSettings?.creator || 'FlowFalcon'}. All rights reserved.`);
        setContent('header', 'textContent', settings.name, "Skyzopedia UI");
        setContent('name', 'textContent', settings.name, "Skyzopedia UI");
        setContent('sideNavName', 'textContent', settings.name || "API");
        setContent('version', 'textContent', settings.version, "v1.0");
        setContent('versionHeader', 'textContent', settings.header?.status, "Active!");
        setContent('description', 'textContent', settings.description, "Simple API's");

        // Set banner image with improved error handling
        const dynamicImage = document.getElementById('dynamicImage');
        if (dynamicImage) {
            if (settings.bannerImage) {
                dynamicImage.src = settings.bannerImage;
            }
            
            // Add loading animation and error handling
            dynamicImage.onerror = () => {
                dynamicImage.src = '/api/src/banner.jpg'; // Fallback image
                showToast('Failed to load banner image, using default', 'error');
            };
            
            dynamicImage.onload = () => {
                dynamicImage.classList.add('fade-in');
            };
        }

        // Set links with enhanced UI
        const apiLinksContainer = document.getElementById('apiLinks');
        if (apiLinksContainer && settings.links?.length) {
            apiLinksContainer.innerHTML = ''; // Clear existing links
            
            settings.links.forEach(({ url, name }, index) => {
                const link = document.createElement('a');
                link.href = url;
                link.textContent = name;
                link.target = '_blank';
                link.className = 'api-link';
                link.style.animationDelay = `${index * 0.1}s`;
                link.setAttribute('aria-label', name);
                
                // Add icon based on URL
                if (url.includes('github')) {
                    link.innerHTML = `<i class="fab fa-github"></i> ${name}`;
                } else if (url.includes('docs') || url.includes('documentation')) {
                    link.innerHTML = `<i class="fas fa-book"></i> ${name}`;
                } else {
                    link.innerHTML = `<i class="fas fa-external-link-alt"></i> ${name}`;
                }
                
                apiLinksContainer.appendChild(link);
            });
        }

        // Create API content with enhanced UI and animations
        const apiContent = document.getElementById('apiContent');
        if (!settings.categories || !settings.categories.length) {
            apiContent.innerHTML = `
                <div class="no-results-message">
                    <i class="fas fa-database"></i>
                    <p>No API categories found</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        <i class="fas fa-sync-alt"></i> Refresh
                    </button>
                </div>
            `;
        } else {
            settings.categories.forEach((category, categoryIndex) => {
                // Sort items alphabetically
                const sortedItems = category.items.sort((a, b) => a.name.localeCompare(b.name));
                
                const categoryElement = document.createElement('div');
                categoryElement.className = 'category-section';
                categoryElement.style.animationDelay = `${categoryIndex * 0.2}s`;
                
                const categoryHeader = document.createElement('h3');
                categoryHeader.className = 'category-header';
                categoryHeader.textContent = category.name;
                
                // Add category icon if available
                if (category.icon) {
                    const icon = document.createElement('i');
                    icon.className = category.icon;
                    icon.style.color = 'var(--primary-color)';
                    categoryHeader.prepend(icon);
                }
                
                categoryElement.appendChild(categoryHeader);
                
                // Add category image if available
                if (category.image) {
                    const categoryImage = document.createElement('img');
                    categoryImage.src = category.image;
                    categoryImage.alt = `${category.name} category`;
                    categoryImage.className = 'category-image';
                    categoryElement.appendChild(categoryImage);
                }
                
                const itemsRow = document.createElement('div');
                itemsRow.className = 'row';
                
                sortedItems.forEach((item, index) => {
                    const itemCol = document.createElement('div');
                    itemCol.className = 'col-md-6 col-lg-4 api-item';
                    itemCol.dataset.name = item.name;
                    itemCol.dataset.desc = item.desc;
                    itemCol.dataset.category = category.name;
                    itemCol.style.animationDelay = `${index * 0.05 + 0.3}s`;
                    
                    const heroSection = document.createElement('div');
                    heroSection.className = 'hero-section';
                    
                    const infoDiv = document.createElement('div');
                    
                    const itemTitle = document.createElement('h5');
                    itemTitle.className = 'mb-0';
                    itemTitle.textContent = item.name;
                    
                    const itemDesc = document.createElement('p');
                    itemDesc.className = 'text-muted mb-0';
                    itemDesc.textContent = item.desc;
                    
                    infoDiv.appendChild(itemTitle);
                    infoDiv.appendChild(itemDesc);
                    
                    const actionsDiv = document.createElement('div');
                    actionsDiv.className = 'api-actions';
                    
                    const getBtn = document.createElement('button');
                    getBtn.className = 'btn get-api-btn';
                    getBtn.innerHTML = '<i class="fas fa-code"></i> GET';
                    getBtn.dataset.apiPath = item.path;
                    getBtn.dataset.apiName = item.name;
                    getBtn.dataset.apiDesc = item.desc;
                    getBtn.setAttribute('aria-label', `Get ${item.name} API`);
                    
                    // Add API status indicator with enhanced styling
                    const statusIndicator = document.createElement('div');
                    statusIndicator.className = 'api-status';
                    
                    // Set status based on item.status (or default to "ready")
                    const status = item.status || "ready";
                    let statusClass, statusIcon, statusTooltip;
                    
                    switch(status) {
                        case "error":
                            statusClass = "status-error";
                            statusIcon = "fa-exclamation-triangle";
                            statusTooltip = "API has errors";
                            break;
                        case "update":
                            statusClass = "status-update";
                            statusIcon = "fa-arrow-up";
                            statusTooltip = "Updates available";
                            break;
                        default: // "ready"
                            statusClass = "status-ready";
                            statusIcon = "fa-circle";
                            statusTooltip = "API is ready";
                    }
                    
                    statusIndicator.classList.add(statusClass);
                    statusIndicator.setAttribute('title', statusTooltip);
                    statusIndicator.setAttribute('data-bs-toggle', 'tooltip');
                    statusIndicator.setAttribute('data-bs-placement', 'left');
                    
                    const icon = document.createElement('i');
                    icon.className = `fas ${statusIcon}`;
                    statusIndicator.appendChild(icon);
                    
                    const statusText = document.createElement('span');
                    statusText.textContent = status;
                    statusIndicator.appendChild(statusText);
                    
                    actionsDiv.appendChild(getBtn);
                    actionsDiv.appendChild(statusIndicator);
                    
                    heroSection.appendChild(infoDiv);
                    heroSection.appendChild(actionsDiv);
                    
                    itemCol.appendChild(heroSection);
                    itemsRow.appendChild(itemCol);
                });
                
                categoryElement.appendChild(itemsRow);
                apiContent.appendChild(categoryElement);
            });
        }

        // Enhanced search functionality with improved UX
        const searchInput = document.getElementById('searchInput');
        const clearSearchBtn = document.getElementById('clearSearch');
        
        searchInput.addEventListener('focus', () => {
            // Add animation to search container on focus
            searchInput.parentElement.classList.add('search-focused');
        });
        
        searchInput.addEventListener('blur', () => {
            searchInput.parentElement.classList.remove('search-focused');
        });
        
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();
            
            // Show/hide clear button based on search input with animation
            if (searchTerm.length > 0) {
                clearSearchBtn.style.opacity = '1';
                clearSearchBtn.style.pointerEvents = 'auto';
            } else {
                clearSearchBtn.style.opacity = '0';
                clearSearchBtn.style.pointerEvents = 'none';
            }
            
            const apiItems = document.querySelectorAll('.api-item');
            const categoryHeaders = document.querySelectorAll('.category-header');
            const categoryImages = document.querySelectorAll('.category-image');
            const categoryCount = {};

            apiItems.forEach(item => {
                const name = item.getAttribute('data-name').toLowerCase();
                const desc = item.getAttribute('data-desc').toLowerCase();
                const category = item.getAttribute('data-category').toLowerCase();
                
                const matchesSearch = name.includes(searchTerm) || 
                                     desc.includes(searchTerm) || 
                                     category.includes(searchTerm);
                
                if (matchesSearch) {
                    item.style.display = '';
                    // Highlight what was found
                    if (searchTerm !== '') {
                        item.classList.add('search-match');
                        setTimeout(() => item.classList.remove('search-match'), 800);
                    }
                    
                    // Count visible items per category
                    if (!categoryCount[category]) {
                        categoryCount[category] = 0;
                    }
                    categoryCount[category]++;
                } else {
                    item.style.display = 'none';
                }
            });

            categoryHeaders.forEach((header, index) => {
                const categorySection = header.closest('.category-section');
                const categoryRow = categorySection.querySelector('.row');
                const categoryName = header.textContent.toLowerCase();
                
                if (categoryCount[categoryName] > 0) {
                    categorySection.style.display = '';
                    if (categoryImages[index]) {
                        categoryImages[index].style.display = '';
                    }
                    
                    // Add counter badge to header for non-empty search
                    if (searchTerm.length > 0) {
                        let countBadge = header.querySelector('.count-badge');
                        if (!countBadge) {
                            countBadge = document.createElement('span');
                            countBadge.className = 'count-badge';
                            countBadge.style.fontSize = '14px';
                            countBadge.style.marginLeft = '10px';
                            countBadge.style.fontWeight = 'normal';
                            countBadge.style.color = 'var(--text-muted)';
                            header.appendChild(countBadge);
                        }
                        countBadge.textContent = `(${categoryCount[categoryName]} results)`;
                    } else {
                        const countBadge = header.querySelector('.count-badge');
                        if (countBadge) {
                            header.removeChild(countBadge);
                        }
                    }
                } else {
                    categorySection.style.display = 'none';
                    if (categoryImages[index]) {
                        categoryImages[index].style.display = 'none';
                    }
                }
            });
            
            // Show enhanced no results message if needed
            const noVisibleSections = Array.from(document.querySelectorAll('.category-section')).every(
                section => section.style.display === 'none'
            );
            
            let noResultsMsg = document.getElementById('noResultsMessage');
            
            if (noVisibleSections && searchTerm.length > 0) {
                if (!noResultsMsg) {
                    noResultsMsg = document.createElement('div');
                    noResultsMsg.id = 'noResultsMessage';
                    noResultsMsg.className = 'no-results-message fade-in';
                    noResultsMsg.innerHTML = `
                        <i class="fas fa-search"></i>
                        <p>No results found for "<span>${searchTerm}</span>"</p>
                        <button id="clearSearchFromMsg" class="btn btn-primary">
                            <i class="fas fa-times"></i> Clear Search
                        </button>
                    `;
                    apiContent.appendChild(noResultsMsg);
                    
                    document.getElementById('clearSearchFromMsg').addEventListener('click', () => {
                        searchInput.value = '';
                        searchInput.dispatchEvent(new Event('input'));
                        searchInput.focus();
                    });
                } else {
                    noResultsMsg.querySelector('span').textContent = searchTerm;
                    noResultsMsg.style.display = 'flex';
                }
            } else if (noResultsMsg) {
                noResultsMsg.style.display = 'none';
            }
        });

        // Enhanced API Button click handler
        document.addEventListener('click', event => {
            const getApiBtn = event.target.closest('.get-api-btn');
            if (!getApiBtn) return;

            // Add click feedback animation
            getApiBtn.classList.add('pulse-animation');
            setTimeout(() => {
                getApiBtn.classList.remove('pulse-animation');
            }, 300);

            const { apiPath, apiName, apiDesc } = getApiBtn.dataset;
            const modal = new bootstrap.Modal(document.getElementById('apiResponseModal'));
            const modalRefs = {
                label: document.getElementById('apiResponseModalLabel'),
                desc: document.getElementById('apiResponseModalDesc'),
                content: document.getElementById('apiResponseContent'),
                container: document.getElementById('responseContainer'),
                endpoint: document.getElementById('apiEndpoint'),
                spinner: document.getElementById('apiResponseLoading'),
                queryInputContainer: document.getElementById('apiQueryInputContainer'),
                submitBtn: document.getElementById('submitQueryBtn')
            };

            // Reset modal with enhanced animations
            modalRefs.label.textContent = apiName;
            modalRefs.desc.textContent = apiDesc;
            modalRefs.content.textContent = '';
            modalRefs.endpoint.textContent = '';
            modalRefs.spinner.classList.add('d-none');
            modalRefs.content.classList.add('d-none');
            modalRefs.container.classList.add('d-none');
            modalRefs.endpoint.classList.add('d-none');

            modalRefs.queryInputContainer.innerHTML = '';
            modalRefs.submitBtn.classList.add('d-none');
            modalRefs.submitBtn.disabled = true;
            modalRefs.submitBtn.classList.remove('btn-active');

            let baseApiUrl = `${window.location.origin}${apiPath}`;
            let params = new URLSearchParams(apiPath.split('?')[1]);
            let hasParams = params.toString().length > 0;

            if (hasParams) {
                // Create enhanced input fields for parameters
                const paramContainer = document.createElement('div');
                paramContainer.className = 'param-container';

                const paramsArray = Array.from(params.keys());
                
                const formTitle = document.createElement('h6');
                formTitle.className = 'param-form-title';
                formTitle.innerHTML = '<i class="fas fa-sliders-h"></i> Parameters';
                paramContainer.appendChild(formTitle);
                
                paramsArray.forEach((param, index) => {
                    const paramGroup = document.createElement('div');
                    paramGroup.className = index < paramsArray.length - 1 ? 'mb-3 param-group' : 'param-group';

                    // Create enhanced label with animated focus effect
                    const labelContainer = document.createElement('div');
                    labelContainer.className = 'param-label-container';
                    
                    const label = document.createElement('label');
                    label.className = 'form-label';
                    label.textContent = param;
                    label.htmlFor = `param-${param}`;
                    
                    // Add required indicator
                    const requiredSpan = document.createElement('span');
                    requiredSpan.className = 'required-indicator';
                    requiredSpan.textContent = '*';
                    label.appendChild(requiredSpan);
                    
                    labelContainer.appendChild(label);
                    
                    // Add enhanced parameter description tooltip
                    const currentItem = settings.categories
                        .flatMap(category => category.items)
                        .find(item => item.path === apiPath);
                    
                    if (currentItem && currentItem.params && currentItem.params[param]) {
                        const tooltipIcon = document.createElement('i');
                        tooltipIcon.className = 'fas fa-info-circle param-info';
                        tooltipIcon.setAttribute('data-bs-toggle', 'tooltip');
                        tooltipIcon.setAttribute('data-bs-placement', 'top');
                        tooltipIcon.title = currentItem.params[param];
                        labelContainer.appendChild(tooltipIcon);
                    }
                    
                    paramGroup.appendChild(labelContainer);
                    
                    // Create input with enhanced styling
                    const inputContainer = document.createElement('div');
                    inputContainer.className = 'input-container';
                    
                    const inputField = document.createElement('input');
                    inputField.type = 'text';
                    inputField.className = 'form-control custom-input';
                    inputField.id = `param-${param}`;
                    inputField.placeholder = `Enter ${param}...`;
                    inputField.dataset.param = param;
                    inputField.required = true;
                    inputField.autocomplete = "off";
                    
                    // Add animation and validation events
                    inputField.addEventListener('focus', () => {
                        inputContainer.classList.add('input-focused');
                    });
                    
                    inputField.addEventListener('blur', () => {
                        inputContainer.classList.remove('input-focused');
                        
                        // Validate on blur
                        if (!inputField.value.trim()) {
                            inputField.classList.add('is-invalid');
                        } else {
                            inputField.classList.remove('is-invalid');
                        }
                    });
                    
                    inputField.addEventListener('input', validateInputs);
                    
                    inputContainer.appendChild(inputField);
                    paramGroup.appendChild(inputContainer);
                    paramContainer.appendChild(paramGroup);
                });
                
                // Check for inner description and add with enhanced styling
                const currentItem = settings.categories
                    .flatMap(category => category.items)
                    .find(item => item.path === apiPath);

                if (currentItem && currentItem.innerDesc) {
                    const innerDescDiv = document.createElement('div');
                    innerDescDiv.className = 'inner-desc';
                    innerDescDiv.innerHTML = `<i class="fas fa-info-circle"></i> ${currentItem.innerDesc.replace(/\n/g, '<br>')}`;
                    paramContainer.appendChild(innerDescDiv);
                }

                modalRefs.queryInputContainer.appendChild(paramContainer);
                modalRefs.submitBtn.classList.remove('d-none');

                // Enhanced submit button handler
                modalRefs.submitBtn.onclick = async () => {
                    const inputs = modalRefs.queryInputContainer.querySelectorAll('input');
                    const newParams = new URLSearchParams();
                    let isValid = true;

                    inputs.forEach(input => {
                        if (!input.value.trim()) {
                            isValid = false;
                            input.classList.add('is-invalid');
                            input.parentElement.classList.add('shake-animation');
                            setTimeout(() => {
                                input.parentElement.classList.remove('shake-animation');
                            }, 500);
                        } else {
                            input.classList.remove('is-invalid');
                            newParams.append(input.dataset.param, input.value.trim());
                        }
                    });

                    if (!isValid) {
                        // Enhanced error message with animation
                        const errorMsg = document.createElement('div');
                        errorMsg.className = 'alert alert-danger mt-3 fade-in';
                        errorMsg.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please fill in all required fields.';
                        
                        // Remove existing error message if any
                        const existingError = modalRefs.queryInputContainer.querySelector('.alert');
                        if (existingError) existingError.remove();
                        
                        modalRefs.queryInputContainer.appendChild(errorMsg);
                        
                        // Shake the submit button for feedback
                        modalRefs.submitBtn.classList.add('shake-animation');
                        setTimeout(() => {
                            modalRefs.submitBtn.classList.remove('shake-animation');
                        }, 500);
                        
                        return;
                    }

                    // Enhanced loading animation
                    modalRefs.submitBtn.disabled = true;
                    modalRefs.submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';


                    const apiUrlWithParams = `${window.location.origin}${apiPath.split('?')[0]}?${newParams.toString()}`;
                    
                    // Improved animated transition
                    modalRefs.queryInputContainer.style.opacity = '0';
                    setTimeout(() => {
                        modalRefs.queryInputContainer.innerHTML = '';
                        modalRefs.queryInputContainer.style.opacity = '1';
                        modalRefs.submitBtn.classList.add('d-none');
                        handleApiRequest(apiUrlWithParams, modalRefs, apiName);
                    }, 300);
                };
                
                // Initialize tooltips
                const tooltips = modalRefs.queryInputContainer.querySelectorAll('[data-bs-toggle="tooltip"]');
                tooltips.forEach(tooltip => {
                    new bootstrap.Tooltip(tooltip);
                });
            } else {
                handleApiRequest(baseApiUrl, modalRefs, apiName);
            }

            modal.show();
        });

        // Enhanced input validation with visual feedback
        function validateInputs() {
            const submitBtn = document.getElementById('submitQueryBtn');
            const inputs = document.querySelectorAll('.param-container input');
            const isValid = Array.from(inputs).every(input => input.value.trim() !== '');
            
            if (isValid) {
                submitBtn.disabled = false;
                submitBtn.classList.add('btn-active');
            } else {
                submitBtn.disabled = true;
                submitBtn.classList.remove('btn-active');
            }
            
            // Remove validation error on input
            this.classList.remove('is-invalid');
            
            // Remove error message when user starts typing
            const errorMsg = document.querySelector('.alert.alert-danger');
            if (errorMsg && this.value.trim() !== '') {
                errorMsg.classList.add('fade-out');
                setTimeout(() => errorMsg.remove(), 300);
            }
        }

        // Enhanced API request handler with improved animations and error handling
        async function handleApiRequest(apiUrl, modalRefs, apiName) {
            modalRefs.spinner.classList.remove('d-none');
            modalRefs.container.classList.add('d-none');
            
            // Display the endpoint with enhanced typing animation
            modalRefs.endpoint.textContent = '';
            modalRefs.endpoint.classList.remove('d-none');
            
            const typingSpeed = 20; // ms per character
            const endpointText = apiUrl;
            let charIndex = 0;
            
            const typeEndpoint = () => {
                if (charIndex < endpointText.length) {
                    modalRefs.endpoint.textContent += endpointText.charAt(charIndex);
                    charIndex++;
                    setTimeout(typeEndpoint, typingSpeed);
                }
            };
            
            typeEndpoint();

            try {
                // Add request timeout for better UX
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
                
                const response = await fetch(apiUrl, { 
                    signal: controller.signal 
                }).catch(error => {
                    if (error.name === 'AbortError') {
                        throw new Error('Request timed out. Please try again.');
                    }
                    throw error;
                });
                
                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} - ${response.statusText || 'Unknown error'}`);
                }

                const contentType = response.headers.get('Content-Type');
                if (contentType && contentType.startsWith('image/')) {
                    // Handle image response with enhanced animation
                    const blob = await response.blob();
                    const imageUrl = URL.createObjectURL(blob);

                    const img = document.createElement('img');
                    img.src = imageUrl;
                    img.alt = apiName;
                    img.className = 'response-image fade-in';
                    img.style.maxWidth = '100%';
                    img.style.height = 'auto';
                    img.style.borderRadius = 'var(--border-radius)';
                    img.style.boxShadow = 'var(--shadow)';
                    img.style.transition = 'var(--transition)';
                    
                    // Add hover effect
                    img.onmouseover = () => {
                        img.style.transform = 'scale(1.02)';
                        img.style.boxShadow = 'var(--hover-shadow)';
                    };
                    
                    img.onmouseout = () => {
                        img.style.transform = 'scale(1)';
                        img.style.boxShadow = 'var(--shadow)';
                    };

                    modalRefs.content.innerHTML = '';
                    modalRefs.content.appendChild(img);
                    
                    // Show download button for images
                    const downloadBtn = document.createElement('button');
                    downloadBtn.className = 'btn btn-primary mt-3';
                    downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download Image';
                    downloadBtn.style.width = '100%';
                    
                    downloadBtn.onclick = () => {
                        const link = document.createElement('a');
                        link.href = imageUrl;
                        link.download = `${apiName.toLowerCase().replace(/\s+/g, '-')}.${blob.type.split('/')[1]}`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        
                        // Show notification
                        showToast('Image download started!', 'success');
                    };
                    
                    modalRefs.content.appendChild(downloadBtn);
                } else {
                    // Handle JSON response with enhanced syntax highlighting and animation
                    const data = await response.json();
                    
                    // Pretty-print JSON with enhanced syntax highlighting
                    const formattedJson = syntaxHighlight(JSON.stringify(data, null, 2));
                    modalRefs.content.innerHTML = formattedJson;
                    
                    // Add code folding for large responses with enhanced UI
                    if (JSON.stringify(data, null, 2).split('\n').length > 15) {
                        addCodeFolding(modalRefs.content);
                    }
                }

                modalRefs.container.classList.remove('d-none');
                modalRefs.content.classList.remove('d-none');
                
                // Animate the response container with enhanced animation
                modalRefs.container.classList.add('slide-in-bottom');
                
                // Show success toast
                showToast(`Successfully retrieved ${apiName}`, 'success');
            } catch (error) {
                // Enhanced error display with more information
                const errorContainer = document.createElement('div');
                errorContainer.className = 'error-container fade-in';
                
                const errorIcon = document.createElement('div');
                errorIcon.className = 'error-icon';
                errorIcon.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
                
                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-message';
                errorMessage.innerHTML = `
                    <h6>Error Occurred</h6>
                    <p>${error.message}</p>
                    <div class="mt-2">
                        <button class="btn btn-sm retry-btn">
                            <i class="fas fa-sync-alt"></i> Retry Request
                        </button>
                    </div>
                `;
                
                errorContainer.appendChild(errorIcon);
                errorContainer.appendChild(errorMessage);
                
                modalRefs.content.innerHTML = '';
                modalRefs.content.appendChild(errorContainer);
                modalRefs.container.classList.remove('d-none');
                modalRefs.content.classList.remove('d-none');
                
                // Add retry functionality
                errorContainer.querySelector('.retry-btn').addEventListener('click', () => {
                    modalRefs.content.classList.add('d-none');
                    modalRefs.container.classList.add('d-none');
                    handleApiRequest(apiUrl, modalRefs, apiName);
                });
                
                // Show error toast
                showToast('Error retrieving data. Check response for details.', 'error');
            } finally {
                modalRefs.spinner.classList.add('d-none');
            }
        }
        
        // Enhanced code folding functionality
        function addCodeFolding(container) {
            const codeLines = container.innerHTML.split('\n');
            let foldableContent = '';
            let inObject = false;
            let objectLevel = 0;
            let foldedLineCount = 0;
            
            for (let i = 0; i < codeLines.length; i++) {
                const line = codeLines[i];
                
                if (line.includes('{') && !line.includes('}')) {
                    if (!inObject) {
                        foldableContent += `<div class="code-fold-trigger" data-folded="false">${line}</div>`;
                        foldableContent += '<div class="code-fold-content">';
                        inObject = true;
                        objectLevel = 1;
                    } else {
                        foldableContent += line + '\n';
                        objectLevel++;
                    }
                } else if (line.includes('}') && !line.includes('{')) {
                    objectLevel--;
                    if (objectLevel === 0 && inObject) {
                        foldableContent += line + '\n';
                        foldableContent += '</div>';
                        inObject = false;
                    } else {
                        foldableContent += line + '\n';
                    }
                } else {
                    if (inObject) {
                        foldableContent += line + '\n';
                        foldedLineCount++;
                    } else {
                        foldableContent += line + '\n';
                    }
                }
            }
            
            container.innerHTML = foldableContent;
            
            // Add enhanced click handlers for fold/unfold
            const foldTriggers = container.querySelectorAll('.code-fold-trigger');
            foldTriggers.forEach(trigger => {
                trigger.addEventListener('click', () => {
                    const isFolded = trigger.getAttribute('data-folded') === 'true';
                    const content = trigger.nextElementSibling;
                    
                    if (isFolded) {
                        // Unfold with animation
                        content.style.maxHeight = '0';
                        content.style.display = 'block';
                        setTimeout(() => {
                            content.style.maxHeight = content.scrollHeight + 'px';
                            trigger.setAttribute('data-folded', 'false');
                            trigger.classList.remove('folded');
                        }, 10);
                        
                        setTimeout(() => {
                            content.style.maxHeight = '';
                        }, 300);
                    } else {
                        // Fold with animation
                        content.style.maxHeight = content.scrollHeight + 'px';
                        setTimeout(() => {
                            content.style.maxHeight = '0';
                        }, 10);
                        
                        setTimeout(() => {
                            content.style.display = 'none';
                            trigger.setAttribute('data-folded', 'true');
                            trigger.classList.add('folded');
                        }, 300);
                    }
                });
                
                // Add enhanced fold icon and count
                if (trigger.nextElementSibling.classList.contains('code-fold-content')) {
                    const lineCount = trigger.nextElementSibling.innerHTML.split('\n').length - 1;
                    const foldIndicator = document.createElement('span');
                    foldIndicator.className = 'fold-indicator';
                    foldIndicator.innerHTML = `<i class="fas fa-chevron-down"></i> ${lineCount} lines`;
                    trigger.appendChild(foldIndicator);
                }
            });
        }
        
        // Enhanced JSON syntax highlighting
        function syntaxHighlight(json) {
            json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
                let cls = 'json-number';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'json-key';
                    } else {
                        cls = 'json-string';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'json-boolean';
                } else if (/null/.test(match)) {
                    cls = 'json-null';
                }
                return '<span class="' + cls + '">' + match + '</span>';
            });
        }
        
        // Initialize all tooltips
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.forEach(function (tooltipTriggerEl) {
            new bootstrap.Tooltip(tooltipTriggerEl);
        });

        // Add bell notification dropdown on click
        const notificationBell = document.querySelector('.notification-bell');
        if (notificationBell) {
            notificationBell.addEventListener('click', () => {
                showToast('🎉 2 new updates available! Click to see more.', 'info');
            });
        }
        
    } catch (error) {
        console.error('Error loading settings:', error);
        
        // Show enhanced error notification
        showToast(`Failed to load settings: ${error.message}`, 'error');
    } finally {
        // Add enhanced animation to loading screen disappearance
        clearInterval(loadingDotsAnimation);
          setTimeout(() => {
            loadingScreen.classList.add('fade-out');

            setTimeout(() => {
          loadingScreen.style.display = "none";
        body.classList.remove("no-scroll");
          }, 500); // waktu animasi fade-out
       }, 9500); // tunggu 9.5 detik dulu sebelum animasi
    }
    // Animate in API items as they come into view
    const observeElements = () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    observer.unobserve(entry.target);
// Pastikan DOM sudah dimuat sepenuhnya sebelum menjalankan skrip
document.addEventListener('DOMContentLoaded', async () => {
    // Selektor Elemen DOM Utama
    const DOM = {
        loadingScreen: document.getElementById("loadingScreen"),
        body: document.body,
        sideNav: document.querySelector('.side-nav'),
        mainWrapper: document.querySelector('.main-wrapper'),
        navCollapseBtn: document.querySelector('.nav-collapse-btn'),
        menuToggle: document.querySelector('.menu-toggle'),
        themeToggle: document.getElementById('themeToggle'),
        searchInput: document.getElementById('searchInput'),
        clearSearchBtn: document.getElementById('clearSearch'),
        apiContent: document.getElementById('apiContent'),
        notificationToast: document.getElementById('notificationToast'), // Toast untuk notifikasi umum
        notificationBell: document.getElementById('notificationBell'), // Tombol lonceng
        notificationBadge: document.getElementById('notificationBadge'), // Badge merah
        modal: {
            instance: null, // Akan diinisialisasi nanti
            element: document.getElementById('apiResponseModal'),
            label: document.getElementById('apiResponseModalLabel'),
            desc: document.getElementById('apiResponseModalDesc'),
            content: document.getElementById('apiResponseContent'),
            container: document.getElementById('responseContainer'),
            endpoint: document.getElementById('apiEndpoint'),
            spinner: document.getElementById('apiResponseLoading'),
            queryInputContainer: document.getElementById('apiQueryInputContainer'),
            submitBtn: document.getElementById('submitQueryBtn'),
            copyEndpointBtn: document.getElementById('copyEndpoint'),
            copyResponseBtn: document.getElementById('copyResponse')
        },
        // Elemen yang diisi dari settings.json
        pageTitle: document.getElementById('page'),
        wm: document.getElementById('wm'),
        appName: document.getElementById('name'),
        sideNavName: document.getElementById('sideNavName'),
        versionBadge: document.getElementById('version'),
        versionHeaderBadge: document.getElementById('versionHeader'),
        appDescription: document.getElementById('description'),
        dynamicImage: document.getElementById('dynamicImage'), // ID untuk gambar banner di hero section
        apiLinksContainer: document.getElementById('apiLinks')
    };

    let settings = {}; // Untuk menyimpan data dari settings.json
    let currentApiData = null; // Untuk menyimpan data API yang sedang ditampilkan di modal
    let allNotifications = []; // Untuk menyimpan semua notifikasi dari JSON

    // --- Fungsi Utilitas ---
    const showToast = (message, type = 'info', title = 'Notifikasi') => {
        if (!DOM.notificationToast) return;
        const toastBody = DOM.notificationToast.querySelector('.toast-body');
        const toastTitleEl = DOM.notificationToast.querySelector('.toast-title');
        const toastIcon = DOM.notificationToast.querySelector('.toast-icon');
        
        toastBody.textContent = message;
        toastTitleEl.textContent = title;
        
        const typeConfig = {
            success: { color: 'var(--success-color)', icon: 'fa-check-circle' },
            error: { color: 'var(--error-color)', icon: 'fa-exclamation-circle' },
            info: { color: 'var(--primary-color)', icon: 'fa-info-circle' },
            notification: { color: 'var(--accent-color)', icon: 'fa-bell' }
        };
        
        const config = typeConfig[type] || typeConfig.info;
        
        DOM.notificationToast.style.borderLeftColor = config.color;
        toastIcon.className = `toast-icon fas ${config.icon} me-2`;
        toastIcon.style.color = config.color;

        let bsToast = bootstrap.Toast.getInstance(DOM.notificationToast);
        if (!bsToast) {
            bsToast = new bootstrap.Toast(DOM.notificationToast);
        }
        bsToast.show();
    };

    const copyToClipboard = async (text, btnElement) => {
        if (!navigator.clipboard) {
            showToast('Browser tidak mendukung penyalinan ke clipboard.', 'error');
            return;
        }
        try {
            await navigator.clipboard.writeText(text);
            const originalIcon = btnElement.innerHTML;
            btnElement.innerHTML = '<i class="fas fa-check"></i>';
            btnElement.classList.add('copy-success');
            showToast('Berhasil disalin ke clipboard!', 'success');
            
            setTimeout(() => {
                btnElement.innerHTML = originalIcon;
                btnElement.classList.remove('copy-success');
            }, 1500);
        } catch (err) {
            showToast('Gagal menyalin teks: ' + err.message, 'error');
        }
    };

    const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    };

    // --- Fungsi Notifikasi ---
    const loadNotifications = async () => {
        try {
            const response = await fetch('/notifications.json'); 
            if (!response.ok) throw new Error(`Gagal memuat notifikasi: ${response.status}`);
            allNotifications = await response.json();
            updateNotificationBadge();
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    };

    const getSessionReadNotificationIds = () => {
        const ids = sessionStorage.getItem('sessionReadNotificationIds');
        return ids ? JSON.parse(ids) : [];
    };

    const addSessionReadNotificationId = (id) => {
        let ids = getSessionReadNotificationIds();
        if (!ids.includes(id)) {
            ids.push(id);
            sessionStorage.setItem('sessionReadNotificationIds', JSON.stringify(ids));
        }
    };
    
    const updateNotificationBadge = () => {
        if (!DOM.notificationBadge || !allNotifications.length) {
             if(DOM.notificationBadge) DOM.notificationBadge.classList.remove('active');
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); 

        const sessionReadIds = getSessionReadNotificationIds();

        const unreadNotifications = allNotifications.filter(notif => {
            const notificationDate = new Date(notif.date);
            notificationDate.setHours(0, 0, 0, 0); 
            return !notif.read && notificationDate <= today && !sessionReadIds.includes(notif.id);
        });

        if (unreadNotifications.length > 0) {
            DOM.notificationBadge.classList.add('active');
            DOM.notificationBell.setAttribute('aria-label', `Notifikasi (${unreadNotifications.length} belum dibaca)`);
        } else {
            DOM.notificationBadge.classList.remove('active');
            DOM.notificationBell.setAttribute('aria-label', 'Tidak ada notifikasi baru');
        }
    };

    const handleNotificationBellClick = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sessionReadIds = getSessionReadNotificationIds();

        const notificationsToShow = allNotifications.filter(notif => {
            const notificationDate = new Date(notif.date);
            notificationDate.setHours(0, 0, 0, 0);
            return !notif.read && notificationDate <= today && !sessionReadIds.includes(notif.id);
        });

        if (notificationsToShow.length > 0) {
            notificationsToShow.forEach(notif => {
                showToast(notif.message, 'notification', `Notifikasi (${new Date(notif.date).toLocaleDateString('id-ID')})`);
                addSessionReadNotificationId(notif.id); 
            });
        } else {
            showToast('Tidak ada notifikasi baru saat ini.', 'info');
        }
        
        updateNotificationBadge(); 
    };

    // --- Inisialisasi dan Event Listener Utama ---
    const init = async () => {
        setupEventListeners();
        initTheme();
        initSideNav();
        initModal();
        await loadNotifications(); 
        
        try {
            const response = await fetch('/src/settings.json');
            if (!response.ok) throw new Error(`Gagal memuat pengaturan: ${response.status}`);
            settings = await response.json();
            populatePageContent();
            renderApiCategories();
            observeApiItems();
        } catch (error) {
            console.error('Error loading settings:', error);
            showToast(`Gagal memuat pengaturan: ${error.message}`, 'error');
            displayErrorState("Tidak dapat memuat konfigurasi API.");
        } finally {
            hideLoadingScreen();
        }
    };

    const setupEventListeners = () => {
        if (DOM.navCollapseBtn) DOM.navCollapseBtn.addEventListener('click', toggleSideNavCollapse);
        if (DOM.menuToggle) DOM.menuToggle.addEventListener('click', toggleSideNavMobile);
        if (DOM.themeToggle) DOM.themeToggle.addEventListener('change', handleThemeToggle);
        if (DOM.searchInput) DOM.searchInput.addEventListener('input', debounce(handleSearch, 300));
        if (DOM.clearSearchBtn) DOM.clearSearchBtn.addEventListener('click', clearSearch);
        
        if (DOM.notificationBell) DOM.notificationBell.addEventListener('click', handleNotificationBellClick);

        if (DOM.apiContent) DOM.apiContent.addEventListener('click', handleApiGetButtonClick);

        if (DOM.modal.copyEndpointBtn) DOM.modal.copyEndpointBtn.addEventListener('click', () => copyToClipboard(DOM.modal.endpoint.textContent, DOM.modal.copyEndpointBtn));
        if (DOM.modal.copyResponseBtn) DOM.modal.copyResponseBtn.addEventListener('click', () => copyToClipboard(DOM.modal.content.textContent, DOM.modal.copyResponseBtn));
        if (DOM.modal.submitBtn) DOM.modal.submitBtn.addEventListener('click', handleSubmitQuery);

        window.addEventListener('scroll', handleScroll);
        document.addEventListener('click', closeSideNavOnClickOutside);
    };

    // --- Manajemen Loading Screen ---
    const hideLoadingScreen = () => {
        if (!DOM.loadingScreen) return;
        const loadingDots = DOM.loadingScreen.querySelector(".loading-dots");
        if (loadingDots && loadingDots.intervalId) clearInterval(loadingDots.intervalId);

        DOM.loadingScreen.classList.add('fade-out');
        setTimeout(() => {
            DOM.loadingScreen.style.display = "none";
            DOM.body.classList.remove("no-scroll");
        }, 500);
    };
    
    const animateLoadingDots = () => {
        const loadingDots = DOM.loadingScreen.querySelector(".loading-dots");
        if (loadingDots) {
            loadingDots.intervalId = setInterval(() => {
                if (loadingDots.textContent.length >= 3) {
                    loadingDots.textContent = '.';
                } else {
                    loadingDots.textContent += '.';
                }
            }, 500);
        }
    };
    animateLoadingDots(); 

    // --- Manajemen Tema ---
    const initTheme = () => {
    // Hapus class dark-mode biar terang terus
    document.body.classList.remove('dark-mode');
    // Simpan preferensi ke localStorage
    localStorage.setItem('darkMode', 'false');
    };

    // Panggil saat halaman dimuat
    initTheme();

    // --- Manajemen Navigasi Samping ---
    const initSideNav = () => {
        if (DOM.sideNav && DOM.navCollapseBtn) {
             const isCollapsed = DOM.sideNav.classList.contains('collapsed');
             DOM.navCollapseBtn.setAttribute('aria-expanded', !isCollapsed);
        }
    };
    
    const toggleSideNavCollapse = () => {
        if (!DOM.sideNav || !DOM.mainWrapper || !DOM.navCollapseBtn) return;
        DOM.sideNav.classList.toggle('collapsed');
        DOM.mainWrapper.classList.toggle('nav-collapsed');
        const isExpanded = !DOM.sideNav.classList.contains('collapsed');
        DOM.navCollapseBtn.setAttribute('aria-expanded', isExpanded);
    };

    const toggleSideNavMobile = () => {
        if (!DOM.sideNav || !DOM.menuToggle) return;
        DOM.sideNav.classList.toggle('active');
        const isActive = DOM.sideNav.classList.contains('active');
        DOM.menuToggle.setAttribute('aria-expanded', isActive);
    };

    const closeSideNavOnClickOutside = (e) => {
        if (!DOM.sideNav || !DOM.menuToggle) return;
        if (window.innerWidth < 992 &&
            !DOM.sideNav.contains(e.target) &&
            !DOM.menuToggle.contains(e.target) &&
            DOM.sideNav.classList.contains('active')) {
            DOM.sideNav.classList.remove('active');
            DOM.menuToggle.setAttribute('aria-expanded', 'false');
        }
    };
    
    const handleScroll = () => {
        const scrollPosition = window.scrollY;
        const headerElement = document.querySelector('.main-header'); 
        const headerHeight = headerElement ? parseInt(getComputedStyle(headerElement).height) : 70; 
        
        document.querySelectorAll('section[id]').forEach(section => {
            const sectionTop = section.offsetTop - headerHeight - 20; 
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            const navLink = document.querySelector(`.side-nav-link[href="#${sectionId}"]`);
            if (navLink) {
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    document.querySelectorAll('.side-nav-link.active').forEach(l => {
                        l.classList.remove('active');
                        l.removeAttribute('aria-current');
                    });
                    navLink.classList.add('active');
                    navLink.setAttribute('aria-current', 'page');
                }
            }
        });
    };

    // --- Inisialisasi Modal ---
    const initModal = () => {
        if (DOM.modal.element) {
            DOM.modal.instance = new bootstrap.Modal(DOM.modal.element);
        }
    };

    // --- Pengisian Konten Halaman ---
    const setPageContent = (element, value, fallback = '') => {
        if (element) element.textContent = value || fallback;
    };
    
    const setPageAttribute = (element, attribute, value, fallback = '') => {
        if (element) element.setAttribute(attribute, value || fallback);
    };

    const populatePageContent = () => {
        if (!settings || Object.keys(settings).length === 0) return;

        const currentYear = new Date().getFullYear();
        const creator = settings.apiSettings?.creator || 'FlowFalcon';

        setPageContent(DOM.pageTitle, settings.name, "Falcon API");
        setPageContent(DOM.wm, `© ${currentYear} ${creator}. Semua hak dilindungi.`);
        setPageContent(DOM.appName, settings.name, "Falcon API");
        setPageContent(DOM.sideNavName, settings.name || "API");
        setPageContent(DOM.versionBadge, settings.version, "v1.0");
        setPageContent(DOM.versionHeaderBadge, settings.header?.status, "Aktif!");
        setPageContent(DOM.appDescription, settings.description, "Dokumentasi API simpel dan mudah digunakan.");

        // Mengatur gambar banner
        if (DOM.dynamicImage) {
            if (settings.bannerImage) {
                DOM.dynamicImage.src = settings.bannerImage;
                DOM.dynamicImage.alt = settings.name ? `${settings.name} Banner` : "API Banner";
                DOM.dynamicImage.style.display = ''; // Pastikan gambar ditampilkan jika ada path
            } else {
                // Jika tidak ada bannerImage di settings, gunakan fallback default dan tampilkan
                DOM.dynamicImage.src = '/src/banner.jpg'; 
                DOM.dynamicImage.alt = "API Banner Default";
                DOM.dynamicImage.style.display = '';
            }
            DOM.dynamicImage.onerror = () => {
                DOM.dynamicImage.src = '/src/banner.jpg'; // Fallback jika error loading
                DOM.dynamicImage.alt = "API Banner Fallback";
                DOM.dynamicImage.style.display = ''; // Pastikan tetap tampil
                showToast('Gagal memuat gambar banner, menggunakan gambar default.', 'warning');
            };
        }
        
        if (DOM.apiLinksContainer) {
            DOM.apiLinksContainer.innerHTML = ''; 
            const defaultLinks = [{ url: "https://github.com/FlowFalcon/Falcon-Api-UI", name: "Lihat di GitHub", icon: "fab fa-github" }];
            const linksToRender = settings.links?.length ? settings.links : defaultLinks;

            linksToRender.forEach(({ url, name, icon }, index) => {
                const link = document.createElement('a');
                link.href = url;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.className = 'api-link btn btn-primary'; 
                link.style.animationDelay = `${index * 0.1}s`;
                link.setAttribute('aria-label', name);
                
                const iconElement = document.createElement('i');
                iconElement.className = icon || 'fas fa-external-link-alt'; 
                iconElement.setAttribute('aria-hidden', 'true');
                
                link.appendChild(iconElement);
                link.appendChild(document.createTextNode(` ${name}`));
                DOM.apiLinksContainer.appendChild(link);
            });
        }
    };

    // --- Render Kategori dan Item API ---
    const renderApiCategories = () => {
        if (!DOM.apiContent || !settings.categories || !settings.categories.length) {
            displayErrorState("Tidak ada kategori API yang ditemukan.");
            return;
        }
        DOM.apiContent.innerHTML = ''; 

        settings.categories.forEach((category, categoryIndex) => {
            const sortedItems = category.items.sort((a, b) => a.name.localeCompare(b.name));
            
            const categorySection = document.createElement('section'); 
            categorySection.id = `category-${category.name.toLowerCase().replace(/\s+/g, '-')}`;
            categorySection.className = 'category-section';
            categorySection.style.animationDelay = `${categoryIndex * 0.15}s`;
            categorySection.setAttribute('aria-labelledby', `category-title-${categoryIndex}`);
            
            const categoryHeader = document.createElement('h3');
            categoryHeader.id = `category-title-${categoryIndex}`;
            categoryHeader.className = 'category-header';
            
            if (category.icon) { 
                const iconEl = document.createElement('i');
                iconEl.className = `${category.icon} me-2`;
                iconEl.setAttribute('aria-hidden', 'true');
                categoryHeader.appendChild(iconEl);
            }
            categoryHeader.appendChild(document.createTextNode(category.name));
            categorySection.appendChild(categoryHeader);
            
            if (category.image) {
                const img = document.createElement('img');
                img.src = category.image;
                img.alt = `${category.name} banner`;
                img.className = 'category-image img-fluid rounded mb-3 shadow-sm'; 
                img.loading = 'lazy'; 
                categorySection.appendChild(img);
            }

            const itemsRow = document.createElement('div');
            itemsRow.className = 'row'; 
            
            sortedItems.forEach((item, itemIndex) => {
                const itemCol = document.createElement('div');
                itemCol.className = 'col-12 col-md-6 col-lg-4 api-item'; 
                itemCol.dataset.name = item.name;
                itemCol.dataset.desc = item.desc;
                itemCol.dataset.category = category.name;
                itemCol.style.animationDelay = `${itemIndex * 0.05 + 0.2}s`;

                const apiCard = document.createElement('article'); 
                apiCard.className = 'api-card h-100'; 
                apiCard.setAttribute('aria-labelledby', `api-title-${categoryIndex}-${itemIndex}`);

                const cardInfo = document.createElement('div');
                cardInfo.className = 'api-card-info';

                const itemTitle = document.createElement('h5');
                itemTitle.id = `api-title-${categoryIndex}-${itemIndex}`;
                itemTitle.className = 'mb-1'; 
                itemTitle.textContent = item.name;
                
                const itemDesc = document.createElement('p');
                itemDesc.className = 'text-muted mb-0';
                itemDesc.textContent = item.desc;
                
                cardInfo.appendChild(itemTitle);
                cardInfo.appendChild(itemDesc);
                
                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'api-actions mt-auto'; 
                
                const getBtn = document.createElement('button');
                getBtn.type = 'button';
                getBtn.className = 'btn get-api-btn btn-sm'; 
                getBtn.innerHTML = '<i class="fas fa-code me-1" aria-hidden="true"></i> GET';
                getBtn.dataset.apiPath = item.path;
                getBtn.dataset.apiName = item.name;
                getBtn.dataset.apiDesc = item.desc;
                if (item.params) getBtn.dataset.apiParams = JSON.stringify(item.params);
                if (item.innerDesc) getBtn.dataset.apiInnerDesc = item.innerDesc;
                getBtn.setAttribute('aria-label', `Dapatkan detail untuk ${item.name}`);
                
                const status = item.status || "ready";
                const statusConfig = {
                    ready: { class: "status-ready", icon: "fa-circle", text: "Ready" },
                    error: { class: "status-error", icon: "fa-exclamation-triangle", text: "Error" },
                    update: { class: "status-update", icon: "fa-arrow-up", text: "Update" }
                };
                const currentStatus = statusConfig[status] || statusConfig.ready;

                if (status === 'error' || status === 'update') {
                    getBtn.disabled = true;
                    apiCard.classList.add('api-card-unavailable');
                    getBtn.title = `API ini sedang dalam status '${status}', sementara tidak dapat digunakan.`;
                }

                const statusIndicator = document.createElement('div');
                statusIndicator.className = `api-status ${currentStatus.class}`;
                statusIndicator.title = `Status: ${currentStatus.text}`;
                statusIndicator.innerHTML = `<i class="fas ${currentStatus.icon} me-1" aria-hidden="true"></i><span>${currentStatus.text}</span>`;
                
                actionsDiv.appendChild(getBtn);
                actionsDiv.appendChild(statusIndicator);
                
                apiCard.appendChild(cardInfo);
                apiCard.appendChild(actionsDiv);
                itemCol.appendChild(apiCard);
                itemsRow.appendChild(itemCol); 
            });
            
            categorySection.appendChild(itemsRow); 
            DOM.apiContent.appendChild(categorySection);
        });
        initializeTooltips(); 
    };

    const displayErrorState = (message) => {
        if (!DOM.apiContent) return;
        DOM.apiContent.innerHTML = `
            <div class="no-results-message text-center p-5">
                <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                <p class="h5">${message}</p>
                <p class="text-muted">Silakan coba muat ulang halaman atau hubungi administrator.</p>
                <button class="btn btn-primary mt-3" onclick="location.reload()">
                    <i class="fas fa-sync-alt me-2"></i> Muat Ulang
                </button>
            </div>
        `;
    };
    
    // --- Fungsi Pencarian ---
    const handleSearch = () => {
        if (!DOM.searchInput || !DOM.apiContent) return;
        const searchTerm = DOM.searchInput.value.toLowerCase().trim();
        DOM.clearSearchBtn.classList.toggle('visible', searchTerm.length > 0);

        const apiItems = DOM.apiContent.querySelectorAll('.api-item');
        let visibleCategories = new Set();

        apiItems.forEach(item => {
            const name = (item.dataset.name || '').toLowerCase();
            const desc = (item.dataset.desc || '').toLowerCase();
            const category = (item.dataset.category || '').toLowerCase();
            const matches = name.includes(searchTerm) || desc.includes(searchTerm) || category.includes(searchTerm);
            
            item.style.display = matches ? '' : 'none';
            if (matches) {
                visibleCategories.add(item.closest('.category-section'));
            }
        });

        DOM.apiContent.querySelectorAll('.category-section').forEach(section => {
            section.style.display = visibleCategories.has(section) ? '' : 'none';
        });

        const noResultsMsg = DOM.apiContent.querySelector('#noResultsMessage') || createNoResultsMessage();
        const allHidden = Array.from(visibleCategories).length === 0 && searchTerm.length > 0;
        
        if (allHidden) {
            noResultsMsg.querySelector('span').textContent = `"${searchTerm}"`;
            noResultsMsg.style.display = 'flex';
        } else {
            noResultsMsg.style.display = 'none';
        }
    };

    const clearSearch = () => {
        if (!DOM.searchInput) return;
        DOM.searchInput.value = '';
        DOM.searchInput.focus();
        handleSearch(); 
        DOM.searchInput.classList.add('shake-animation');
        setTimeout(() => DOM.searchInput.classList.remove('shake-animation'), 400);
    };

    const createNoResultsMessage = () => {
        let noResultsMsg = document.getElementById('noResultsMessage');
        if (!noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.id = 'noResultsMessage';
            noResultsMsg.className = 'no-results-message flex-column align-items-center justify-content-center p-5 text-center';
            noResultsMsg.style.display = 'none'; 
            noResultsMsg.innerHTML = `
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <p class="h5">Tidak ada hasil untuk <span></span></p>
                <button id="clearSearchFromMsg" class="btn btn-primary mt-3">
                    <i class="fas fa-times me-2"></i> Hapus Pencarian
                </button>
            `;
            DOM.apiContent.appendChild(noResultsMsg);
            document.getElementById('clearSearchFromMsg').addEventListener('click', clearSearch);
        }
        return noResultsMsg;
    };

    // --- Penanganan Klik Tombol API ---
    const handleApiGetButtonClick = (event) => {
        const getApiBtn = event.target.closest('.get-api-btn');
        if (!getApiBtn || getApiBtn.disabled) return; 

        getApiBtn.classList.add('pulse-animation');
        setTimeout(() => getApiBtn.classList.remove('pulse-animation'), 300);

        currentApiData = {
            path: getApiBtn.dataset.apiPath,
            name: getApiBtn.dataset.apiName,
            desc: getApiBtn.dataset.apiDesc,
            params: getApiBtn.dataset.apiParams ? JSON.parse(getApiBtn.dataset.apiParams) : null,
            innerDesc: getApiBtn.dataset.apiInnerDesc
        };
        
        setupModalForApi(currentApiData);
        DOM.modal.instance.show();
    };

    const setupModalForApi = (apiData) => {
        DOM.modal.label.textContent = apiData.name;
        DOM.modal.desc.textContent = apiData.desc;
        DOM.modal.content.innerHTML = ''; 
        DOM.modal.endpoint.textContent = `${window.location.origin}${apiData.path.split('?')[0]}`; 
        
        DOM.modal.spinner.classList.add('d-none');
        DOM.modal.content.classList.add('d-none');
        DOM.modal.container.classList.add('d-none');
        DOM.modal.endpoint.classList.remove('d-none'); 

        DOM.modal.queryInputContainer.innerHTML = '';
        DOM.modal.submitBtn.classList.add('d-none');
        DOM.modal.submitBtn.disabled = true;
        DOM.modal.submitBtn.innerHTML = '<span>Kirim</span><i class="fas fa-paper-plane ms-2" aria-hidden="true"></i>';

        const paramsFromPath = new URLSearchParams(apiData.path.split('?')[1]);
        const paramKeys = Array.from(paramsFromPath.keys());

        if (paramKeys.length > 0) {
            const paramContainer = document.createElement('div');
            paramContainer.className = 'param-container';

            const formTitle = document.createElement('h6');
            formTitle.className = 'param-form-title';
            formTitle.innerHTML = '<i class="fas fa-sliders-h me-2" aria-hidden="true"></i> Parameter';
            paramContainer.appendChild(formTitle);

            paramKeys.forEach(paramKey => {
                const paramGroup = document.createElement('div');
                paramGroup.className = 'param-group mb-3';

                const labelContainer = document.createElement('div');
                labelContainer.className = 'param-label-container';
                
                const label = document.createElement('label');
                label.className = 'form-label';
                label.textContent = paramKey;
                label.htmlFor = `param-${paramKey}`;
                
                const requiredSpan = document.createElement('span');
                requiredSpan.className = 'required-indicator ms-1';
                requiredSpan.textContent = '*';
                label.appendChild(requiredSpan);
                labelContainer.appendChild(label);

                if (apiData.params && apiData.params[paramKey]) {
                    const tooltipIcon = document.createElement('i');
                    tooltipIcon.className = 'fas fa-info-circle param-info ms-1';
                    tooltipIcon.setAttribute('data-bs-toggle', 'tooltip');
                    tooltipIcon.setAttribute('data-bs-placement', 'top');
                    tooltipIcon.title = apiData.params[paramKey];
                    labelContainer.appendChild(tooltipIcon);
                }
                paramGroup.appendChild(labelContainer);
                
                const inputContainer = document.createElement('div');
                inputContainer.className = 'input-container';
                const inputField = document.createElement('input');
                inputField.type = 'text';
                inputField.className = 'form-control custom-input';
                inputField.id = `param-${paramKey}`;
                inputField.placeholder = `Masukkan ${paramKey}...`;
                inputField.dataset.param = paramKey;
                inputField.required = true;
                inputField.autocomplete = "off";
                inputField.addEventListener('input', validateModalInputs);
                inputContainer.appendChild(inputField);
                paramGroup.appendChild(inputContainer);
                paramContainer.appendChild(paramGroup);
            });

            if (apiData.innerDesc) {
                const innerDescDiv = document.createElement('div');
                innerDescDiv.className = 'inner-desc mt-3';
                innerDescDiv.innerHTML = `<i class="fas fa-info-circle me-2" aria-hidden="true"></i> ${apiData.innerDesc.replace(/\n/g, '<br>')}`;
                paramContainer.appendChild(innerDescDiv);
            }

            DOM.modal.queryInputContainer.appendChild(paramContainer);
            DOM.modal.submitBtn.classList.remove('d-none');
            initializeTooltips(DOM.modal.queryInputContainer); 
        } else {
            handleApiRequest(`${window.location.origin}${apiData.path}`, apiData.name);
        }
    };
    
    const validateModalInputs = () => {
        const inputs = DOM.modal.queryInputContainer.querySelectorAll('input[required]');
        const allFilled = Array.from(inputs).every(input => input.value.trim() !== '');
        DOM.modal.submitBtn.disabled = !allFilled;
        DOM.modal.submitBtn.classList.toggle('btn-active', allFilled);

        inputs.forEach(input => {
            if (input.value.trim()) input.classList.remove('is-invalid');
        });
        const errorMsg = DOM.modal.queryInputContainer.querySelector('.alert.alert-danger.fade-in');
        if (errorMsg && allFilled) {
             errorMsg.classList.replace('fade-in', 'fade-out');
             setTimeout(() => errorMsg.remove(), 300);
        }
    };

    const handleSubmitQuery = async () => {
        if (!currentApiData) return;

        const inputs = DOM.modal.queryInputContainer.querySelectorAll('input');
        const newParams = new URLSearchParams();
        let isValid = true;

        inputs.forEach(input => {
            if (input.required && !input.value.trim()) {
                isValid = false;
                input.classList.add('is-invalid');
                input.parentElement.classList.add('shake-animation');
                setTimeout(() => input.parentElement.classList.remove('shake-animation'), 500);
            } else {
                input.classList.remove('is-invalid');
                if (input.value.trim()) newParams.append(input.dataset.param, input.value.trim());
            }
        });

        if (!isValid) {
            let errorMsg = DOM.modal.queryInputContainer.querySelector('.alert.alert-danger');
            if (!errorMsg) {
                errorMsg = document.createElement('div');
                errorMsg.className = 'alert alert-danger mt-3';
                errorMsg.setAttribute('role', 'alert');
                DOM.modal.queryInputContainer.appendChild(errorMsg);
            }
            errorMsg.innerHTML = '<i class="fas fa-exclamation-circle me-2"></i> Harap isi semua kolom yang wajib diisi.';
            errorMsg.classList.remove('fade-out');
            errorMsg.classList.add('fade-in');

            DOM.modal.submitBtn.classList.add('shake-animation');
            setTimeout(() => DOM.modal.submitBtn.classList.remove('shake-animation'), 500);
            return;
        }
        
        DOM.modal.submitBtn.disabled = true;
        DOM.modal.submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Memproses...';

        const apiUrlWithParams = `${window.location.origin}${currentApiData.path.split('?')[0]}?${newParams.toString()}`;
        DOM.modal.endpoint.textContent = apiUrlWithParams; 

        if (DOM.modal.queryInputContainer.firstChild) {
            DOM.modal.queryInputContainer.firstChild.classList.add('fade-out');
            setTimeout(() => {
                 if (DOM.modal.queryInputContainer.firstChild) DOM.modal.queryInputContainer.firstChild.style.display = 'none';
            }, 300);
        }
        
        await handleApiRequest(apiUrlWithParams, currentApiData.name);
    };

    const handleApiRequest = async (apiUrl, apiName) => {
        DOM.modal.spinner.classList.remove('d-none');
        DOM.modal.container.classList.add('d-none');
        DOM.modal.content.innerHTML = ''; 

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 20000); 

            const response = await fetch(apiUrl, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) {
                 const errorData = await response.json().catch(() => ({ message: response.statusText }));
                 throw new Error(`HTTP error! Status: ${response.status} - ${errorData.message || response.statusText}`);
            }

            const contentType = response.headers.get('Content-Type');
            if (contentType && contentType.includes('image/')) {
                const blob = await response.blob();
                const imageUrl = URL.createObjectURL(blob);
                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = apiName;
                img.className = 'response-image img-fluid rounded shadow-sm fade-in';
                
                const downloadBtn = document.createElement('a'); 
                downloadBtn.href = imageUrl;
                downloadBtn.download = `${apiName.toLowerCase().replace(/\s+/g, '-')}.${blob.type.split('/')[1] || 'png'}`;
                downloadBtn.className = 'btn btn-primary mt-3 w-100';
                downloadBtn.innerHTML = '<i class="fas fa-download me-2"></i> Unduh Gambar';
                
                DOM.modal.content.appendChild(img);
                DOM.modal.content.appendChild(downloadBtn);

            } else if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                const formattedJson = syntaxHighlightJson(JSON.stringify(data, null, 2));
                DOM.modal.content.innerHTML = formattedJson;
                if (JSON.stringify(data, null, 2).split('\n').length > 20) { 
                    addCodeFolding(DOM.modal.content);
                }
            } else {
                const textData = await response.text();
                DOM.modal.content.textContent = textData || "Respons tidak memiliki konten atau format tidak dikenal.";
            }

            DOM.modal.container.classList.remove('d-none');
            DOM.modal.content.classList.remove('d-none');
            DOM.modal.container.classList.add('slide-in-bottom');
            showToast(`Berhasil mengambil data untuk ${apiName}`, 'success');

        } catch (error) {
            console.error("API Request Error:", error);
            const errorHtml = `
                <div class="error-container text-center p-3">
                    <i class="fas fa-exclamation-triangle fa-2x text-danger mb-2"></i>
                    <h6 class="text-danger">Terjadi Kesalahan</h6>
                    <p class="text-muted small">${error.message || 'Tidak dapat mengambil data dari server.'}</p>
                    ${currentApiData && currentApiData.path.split('?')[1] ? 
                    `<button class="btn btn-sm btn-outline-primary mt-2 retry-query-btn">
                        <i class="fas fa-sync-alt me-1"></i> Coba Lagi
                    </button>` : ''}
                </div>`;
            DOM.modal.content.innerHTML = errorHtml;
            DOM.modal.container.classList.remove('d-none');
            DOM.modal.content.classList.remove('d-none');
            showToast('Gagal mengambil data. Periksa detail di modal.', 'error');

            const retryBtn = DOM.modal.content.querySelector('.retry-query-btn');
            if (retryBtn) {
                retryBtn.onclick = () => {
                    if (DOM.modal.queryInputContainer.firstChild) {
                         DOM.modal.queryInputContainer.firstChild.style.display = '';
                         DOM.modal.queryInputContainer.firstChild.classList.remove('fade-out');
                    }
                    DOM.modal.submitBtn.disabled = false; 
                    DOM.modal.submitBtn.innerHTML = '<span>Kirim</span><i class="fas fa-paper-plane ms-2" aria-hidden="true"></i>';
                    DOM.modal.container.classList.add('d-none'); 
                };
            }

        } finally {
            DOM.modal.spinner.classList.add('d-none');
            if (DOM.modal.submitBtn) { 
                const hasParams = currentApiData && currentApiData.path && currentApiData.path.includes('?');
                const hasError = DOM.modal.content.querySelector('.error-container');
                const hasRetryButton = DOM.modal.content.querySelector('.retry-query-btn');

                if (!hasParams || (hasError && !hasRetryButton)) {
                    DOM.modal.submitBtn.disabled = !hasParams; 
                    DOM.modal.submitBtn.innerHTML = '<span>Kirim</span><i class="fas fa-paper-plane ms-2" aria-hidden="true"></i>';
                }
             }
        }
    };
    
    // --- Fungsi Pembantu untuk Tampilan Kode ---
    const syntaxHighlightJson = (json) => {
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
            let cls = 'json-number';
            if (/^"/.test(match)) {
                cls = /:$/.test(match) ? 'json-key' : 'json-string';
            } else if (/true|false/.test(match)) {
                cls = 'json-boolean';
            } else if (/null/.test(match)) {
                cls = 'json-null';
            }
            return `<span class="${cls}">${match}</span>`;
        });
    };

    const addCodeFolding = (container) => {
        const lines = container.innerHTML.split('\n');
        let currentLevel = 0;
        let foldableHtml = '';
        let inFoldableBlock = false;

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            if (trimmedLine.endsWith('{') || trimmedLine.endsWith('[')) {
                if (currentLevel === 0) { 
                    foldableHtml += `<div class="code-fold-trigger" data-folded="false" role="button" tabindex="0" aria-expanded="true">${line}<span class="fold-indicator ms-2 small text-muted">(<i class="fas fa-chevron-down"></i> Lipat)</span></div><div class="code-fold-content">`;
                    inFoldableBlock = true;
                } else {
                    foldableHtml += line + '\n';
                }
                currentLevel++;
            } else if (trimmedLine.startsWith('}') || trimmedLine.startsWith(']')) {
                currentLevel--;
                foldableHtml += line + '\n';
                if (currentLevel === 0 && inFoldableBlock) {
                    foldableHtml += '</div>';
                    inFoldableBlock = false;
                }
            } else {
                foldableHtml += line + (index === lines.length - 1 ? '' : '\n');
            }
        });
        container.innerHTML = foldableHtml;

        container.querySelectorAll('.code-fold-trigger').forEach(trigger => {
            trigger.addEventListener('click', () => toggleFold(trigger));
            trigger.addEventListener('keydown', (e) => { 
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleFold(trigger);
                }
            });
        });
    };

    const toggleFold = (trigger) => {
        const content = trigger.nextElementSibling;
        const isFolded = trigger.dataset.folded === 'true';
        const indicator = trigger.querySelector('.fold-indicator');

        if (isFolded) { 
            content.style.maxHeight = content.scrollHeight + "px";
            trigger.dataset.folded = "false";
            trigger.setAttribute('aria-expanded', 'true');
            indicator.innerHTML = '(<i class="fas fa-chevron-up"></i> Tutup)';
        } else { 
            content.style.maxHeight = "0px";
            trigger.dataset.folded = "true";
            trigger.setAttribute('aria-expanded', 'false');
            indicator.innerHTML = '(<i class="fas fa-chevron-down"></i> Buka)';
        }
    };
    
    // --- Observasi Item API untuk Animasi ---
    const observeApiItems = () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view', 'slideInUp'); 
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.api-item:not(.in-view)').forEach(item => {
            observer.observe(item);
        });
    };

    // --- Inisialisasi Tooltip ---
    const initializeTooltips = (parentElement = document) => {
        const tooltipTriggerList = [].slice.call(parentElement.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(tooltipTriggerEl => {
            const existingTooltip = bootstrap.Tooltip.getInstance(tooltipTriggerEl);
            if (existingTooltip) {
                existingTooltip.dispose();
            }
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    };

    // Jalankan inisialisasi utama
    init();
});
