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
    
    if (navCollapseBtn) {
        navCollapseBtn.addEventListener('click', () => {
            sideNav.classList.toggle('collapsed');
            mainWrapper.classList.toggle('nav-collapsed');
        });
    }
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sideNav.classList.toggle('active');
        });
    }
    
    // Close side nav when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth < 992 && 
            !e.target.closest('.side-nav') && 
            !e.target.closest('.menu-toggle') && 
            sideNav && sideNav.classList.contains('active')) {
            sideNav.classList.remove('active');
        }
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('.side-nav-link').forEach(link => {
        if (link.getAttribute('href') && link.getAttribute('href').startsWith('#')) {
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
                    if (window.innerWidth < 992 && sideNav) {
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
        if (!toast) return;
        
        const toastBody = toast.querySelector('.toast-body');
        const toastTitle = toast.querySelector('.toast-title');
        const toastIcon = toast.querySelector('.toast-icon');
        
        if (toastBody) toastBody.textContent = message;
        
        // Set toast appearance based on type
        if (toast) {
            toast.style.borderLeftColor = type === 'success' 
                ? 'var(--success-color)' 
                : type === 'error' 
                    ? 'var(--error-color)' 
                    : 'var(--primary-color)';
        }
        
        if (toastIcon) {
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
        }
        
        if (toastTitle) {
            toastTitle.textContent = type.charAt(0).toUpperCase() + type.slice(1);
        }
        
        if (typeof bootstrap !== 'undefined') {
            const bsToast = new bootstrap.Toast(toast);
            bsToast.show();
        }
    };

    // Check for saved theme preference
    document.body.classList.remove('dark-mode');
    localStorage.setItem('darkMode', 'false');

    // Improved clear search button functionality
    const clearSearchBtn = document.getElementById('clearSearch');
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            const searchInput = document.getElementById('searchInput');
            if (searchInput && searchInput.value.length > 0) {
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
    }

    // Enhanced copy to clipboard functionality
    const copyToClipboard = (elementId) => {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const text = element.textContent;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                const btn = elementId === 'apiEndpoint' ? 
                    document.getElementById('copyEndpoint') : 
                    document.getElementById('copyResponse');
                
                if (btn) {
                    // Show enhanced success animation
                    btn.innerHTML = '<i class="fas fa-check"></i>';
                    btn.classList.add('copy-success');
                    
                    // Show toast
                    showToast('Copied to clipboard successfully!', 'success');
                    
                    setTimeout(() => {
                        btn.innerHTML = '<i class="far fa-copy"></i>';
                        btn.classList.remove('copy-success');
                    }, 1500);
                }
            }).catch(err => {
                showToast('Failed to copy text: ' + err, 'error');
            });
        }
    };
    
    const copyEndpointBtn = document.getElementById('copyEndpoint');
    const copyResponseBtn = document.getElementById('copyResponse');
    
    if (copyEndpointBtn) {
        copyEndpointBtn.addEventListener('click', () => {
            copyToClipboard('apiEndpoint');
        });
    }
    
    if (copyResponseBtn) {
        copyResponseBtn.addEventListener('click', () => {
            copyToClipboard('apiResponseContent');
        });
    }

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
        if (dynamicImage && settings.bannerImage) {
            dynamicImage.src = settings.bannerImage;
            
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
        if (!apiContent) {
            console.error('API Content container not found');
            return;
        }

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
                const sortedItems = category.items ? category.items.sort((a, b) => a.name.localeCompare(b.name)) : [];
                
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
                    itemCol.dataset.name = item.name || '';
                    itemCol.dataset.desc = item.desc || '';
                    itemCol.dataset.category = category.name || '';
                    itemCol.style.animationDelay = `${index * 0.05 + 0.3}s`;
                    
                    const heroSection = document.createElement('div');
                    heroSection.className = 'hero-section';
                    
                    const infoDiv = document.createElement('div');
                    
                    const itemTitle = document.createElement('h5');
                    itemTitle.className = 'mb-0';
                    itemTitle.textContent = item.name || '';
                    
                    const itemDesc = document.createElement('p');
                    itemDesc.className = 'text-muted mb-0';
                    itemDesc.textContent = item.desc || '';
                    
                    infoDiv.appendChild(itemTitle);
                    infoDiv.appendChild(itemDesc);
                    
                    const actionsDiv = document.createElement('div');
                    actionsDiv.className = 'api-actions';
                    
                    const getBtn = document.createElement('button');
                    getBtn.className = 'btn get-api-btn';
                    getBtn.innerHTML = '<i class="fas fa-code"></i> GET';
                    getBtn.dataset.apiPath = item.path || '';
                    getBtn.dataset.apiName = item.name || '';
                    getBtn.dataset.apiDesc = item.desc || '';
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

        // FIXED: Enhanced search functionality with improved UX and error handling
        const searchInput = document.getElementById('searchInput');
        const clearSearchBtn = document.getElementById('clearSearch');
        
        if (searchInput) {
            searchInput.addEventListener('focus', () => {
                // Add animation to search container on focus
                const parent = searchInput.parentElement;
                if (parent) parent.classList.add('search-focused');
            });
            
            searchInput.addEventListener('blur', () => {
                const parent = searchInput.parentElement;
                if (parent) parent.classList.remove('search-focused');
            });
            
            searchInput.addEventListener('input', () => {
                const searchTerm = searchInput.value.toLowerCase();
                
                // Show/hide clear button based on search input with animation
                if (clearSearchBtn) {
                    if (searchTerm.length > 0) {
                        clearSearchBtn.style.opacity = '1';
                        clearSearchBtn.style.pointerEvents = 'auto';
                    } else {
                        clearSearchBtn.style.opacity = '0';
                        clearSearchBtn.style.pointerEvents = 'none';
                    }
                }
                
                const apiItems = document.querySelectorAll('.api-item');
                const categoryHeaders = document.querySelectorAll('.category-header');
                const categoryImages = document.querySelectorAll('.category-image');
                const categoryCount = {};

                apiItems.forEach(item => {
                    const name = (item.getAttribute('data-name') || '').toLowerCase();
                    const desc = (item.getAttribute('data-desc') || '').toLowerCase();
                    const category = (item.getAttribute('data-category') || '').toLowerCase();
                    
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
                    if (!categorySection) return;
                    
                    const categoryName = (header.textContent || '').toLowerCase();
                    
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
                        
                        const clearFromMsgBtn = document.getElementById('clearSearchFromMsg');
                        if (clearFromMsgBtn) {
                            clearFromMsgBtn.addEventListener('click', () => {
                                searchInput.value = '';
                                searchInput.dispatchEvent(new Event('input'));
                                searchInput.focus();
                            });
                        }
                    } else {
                        const searchSpan = noResultsMsg.querySelector('span');
                        if (searchSpan) searchSpan.textContent = searchTerm;
                        noResultsMsg.style.display = 'flex';
                    }
                } else if (noResultsMsg) {
                    noResultsMsg.style.display = 'none';
                }
            });
        }

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
            
            // Check if bootstrap is available
            if (typeof bootstrap === 'undefined') {
                console.error('Bootstrap is not loaded');
                return;
            }
            
            const modalElement = document.getElementById('apiResponseModal');
            if (!modalElement) {
                console.error('API Response Modal not found');
                return;
            }
            
            const modal = new bootstrap.Modal(modalElement);
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
            if (modalRefs.label) modalRefs.label.textContent = apiName || '';
            if (modalRefs.desc) modalRefs.desc.textContent = apiDesc || '';
            if (modalRefs.content) {
                modalRefs.content.textContent = '';
                modalRefs.content.classList.add('d-none');
            }
            if (modalRefs.endpoint) {
                modalRefs.endpoint.textContent = '';
                modalRefs.endpoint.classList.add('d-none');
            }
            if (modalRefs.spinner) modalRefs.spinner.classList.add('d-none');
            if (modalRefs.container) modalRefs.container.classList.add('d-none');

            if (modalRefs.queryInputContainer) modalRefs.queryInputContainer.innerHTML = '';
            if (modalRefs.submitBtn) {
                modalRefs.submitBtn.classList.add('d-none');
                modalRefs.submitBtn.disabled = true;
                modalRefs.submitBtn.classList.remove('btn-active');
            }

            let baseApiUrl = `${window.location.origin}${apiPath || ''}`;
            let params = new URLSearchParams((apiPath || '').split('?')[1]);
            let hasParams = params.toString().length > 0;

            if (hasParams && modalRefs.queryInputContainer) {
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
                    label.className = 'form-label param-label';
                    label.textContent = param;
                    label.setAttribute('for', `param_${param}`);
                    
                    const requiredIndicator = document.createElement('span');
                    requiredIndicator.className = 'required-indicator';
                    requiredIndicator.textContent = ' *';
                    requiredIndicator.style.color = 'var(--error-color)';
                    label.appendChild(requiredIndicator);
                    
                    labelContainer.appendChild(label);
                    
                    const inputContainer = document.createElement('div');
                    inputContainer.className = 'input-container';
                    
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.className = 'form-control param-input';
                    input.id = `param_${param}`;
                    input.name = param;
                    input.placeholder = `Enter ${param}...`;
                    input.value = params.get(param) || '';
                    input.setAttribute('data-param', param);
                    
                    // Add real-time validation
                    input.addEventListener('input', () => {
                        const value = input.value.trim();
                        if (value) {
                            input.classList.remove('is-invalid');
                            input.classList.add('is-valid');
                        } else {
                            input.classList.remove('is-valid');
                            input.classList.add('is-invalid');
                        }
                        
                        // Check if all required fields are filled
                        const allInputs = paramContainer.querySelectorAll('.param-input');
                        const allFilled = Array.from(allInputs).every(inp => inp.value.trim() !== '');
                        
                        if (modalRefs.submitBtn) {
                            modalRefs.submitBtn.disabled = !allFilled;
                            if (allFilled) {
                                modalRefs.submitBtn.classList.add('btn-active');
                            } else {
                                modalRefs.submitBtn.classList.remove('btn-active');
                            }
                        }
                    });
                    
                    // Add enhanced focus effects
                    input.addEventListener('focus', () => {
                        inputContainer.classList.add('input-focused');
                        labelContainer.classList.add('label-focused');
                    });
                    
                    input.addEventListener('blur', () => {
                        inputContainer.classList.remove('input-focused');
                        labelContainer.classList.remove('label-focused');
                    });
                    
                    const inputIcon = document.createElement('i');
                    inputIcon.className = 'fas fa-edit input-icon';
                    
                    inputContainer.appendChild(input);
                    inputContainer.appendChild(inputIcon);
                    
                    paramGroup.appendChild(labelContainer);
                    paramGroup.appendChild(inputContainer);
                    
                    paramContainer.appendChild(paramGroup);
                });
                
                modalRefs.queryInputContainer.appendChild(paramContainer);
                
                if (modalRefs.submitBtn) {
                    modalRefs.submitBtn.classList.remove('d-none');
                    modalRefs.submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Execute API';
                    
                    // Remove existing event listeners
                    const newSubmitBtn = modalRefs.submitBtn.cloneNode(true);
                    modalRefs.submitBtn.parentNode.replaceChild(newSubmitBtn, modalRefs.submitBtn);
                    modalRefs.submitBtn = newSubmitBtn;
                    
                    modalRefs.submitBtn.addEventListener('click', async () => {
                        const inputs = paramContainer.querySelectorAll('.param-input');
                        const newParams = new URLSearchParams();
                        
                        let allValid = true;
                        inputs.forEach(input => {
                            const value = input.value.trim();
                            if (!value) {
                                input.classList.add('is-invalid');
                                allValid = false;
                            } else {
                                input.classList.remove('is-invalid');
                                newParams.set(input.getAttribute('data-param'), value);
                            }
                        });
                        
                        if (!allValid) {
                            showToast('Please fill in all required parameters', 'error');
                            return;
                        }
                        
                        const finalUrl = `${baseApiUrl.split('?')[0]}?${newParams.toString()}`;
                        
                        // Show loading state
                        if (modalRefs.spinner) modalRefs.spinner.classList.remove('d-none');
                        if (modalRefs.container) modalRefs.container.classList.add('d-none');
                        modalRefs.submitBtn.disabled = true;
                        modalRefs.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Executing...';
                        
                        try {
                            const response = await fetch(finalUrl);
                            const data = await response.text();
                            
                            if (modalRefs.endpoint) {
                                modalRefs.endpoint.textContent = finalUrl;
                                modalRefs.endpoint.classList.remove('d-none');
                            }
                            if (modalRefs.content) {
                                modalRefs.content.textContent = data;
                                modalRefs.content.classList.remove('d-none');
                            }
                            if (modalRefs.container) modalRefs.container.classList.remove('d-none');
                            
                            showToast('API executed successfully!', 'success');
                        } catch (error) {
                            if (modalRefs.content) {
                                modalRefs.content.textContent = `Error: ${error.message}`;
                                modalRefs.content.classList.remove('d-none');
                            }
                            if (modalRefs.container) modalRefs.container.classList.remove('d-none');
                            showToast('Failed to execute API', 'error');
                        } finally {
                            if (modalRefs.spinner) modalRefs.spinner.classList.add('d-none');
                            modalRefs.submitBtn.disabled = false;
                            modalRefs.submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Execute API';
                        }
                    });
                }
            } else {
                // Direct API call without parameters
                if (modalRefs.spinner) modalRefs.spinner.classList.remove('d-none');
                
                fetch(baseApiUrl)
                    .then(response => response.text())
                    .then(data => {
                        if (modalRefs.endpoint) {
                            modalRefs.endpoint.textContent = baseApiUrl;
                            modalRefs.endpoint.classList.remove('d-none');
                        }
                        if (modalRefs.content) {
                            modalRefs.content.textContent = data;
                            modalRefs.content.classList.remove('d-none');
                        }
                        if (modalRefs.container) modalRefs.container.classList.remove('d-none');
                        showToast('API executed successfully!', 'success');
                    })
                    .catch(error => {
                        if (modalRefs.content) {
                            modalRefs.content.textContent = `Error: ${error.message}`;
                            modalRefs.content.classList.remove('d-none');
                        }
                        if (modalRefs.container) modalRefs.container.classList.remove('d-none');
                        showToast('Failed to execute API', 'error');
                    })
                    .finally(() => {
                        if (modalRefs.spinner) modalRefs.spinner.classList.add('d-none');
                    });
            }
            
            modal.show();
        });

        // Hide loading screen with enhanced animation
        setTimeout(() => {
            clearInterval(loadingDotsAnimation);
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    body.classList.remove("no-scroll");
                }, 500);
            }
        }, 2000);

    } catch (error) {
        console.error('Error loading settings:', error);
        showToast('Failed to load application settings', 'error');
        
        // Hide loading screen even on error
        setTimeout(() => {
            clearInterval(loadingDotsAnimation);
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
                body.classList.remove("no-scroll");
            }
        }, 1000);
    }
});

