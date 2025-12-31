const imageInput = document.getElementById('imageInput');
const topTextInput = document.getElementById('topText');
const bottomTextInput = document.getElementById('bottomText');
const fontSizeSlider = document.getElementById('fontSize');
const fontSizeValue = document.getElementById('fontSizeValue');
const textColorInput = document.getElementById('textColor');
const enableBorderCheckbox = document.getElementById('enableBorder');
const borderColorInput = document.getElementById('borderColor');
const borderColorGroup = document.getElementById('borderColorGroup');
const downloadBtn = document.getElementById('downloadBtn');
const canvas = document.getElementById('memeCanvas');
const ctx = canvas.getContext('2d');
const placeholder = document.getElementById('placeholder');
const templatesGallery = document.getElementById('templatesGallery');

let currentImage = null;
let fontSize = 40;

// List of default template images (100 popular meme templates)
const defaultTemplates = Array.from({ length: 100 }, (_, i) => `images/template${i + 1}.jpg`);

// Function to load an image from URL
function loadImageFromUrl(url) {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Handle CORS if needed
    img.onload = () => {
        currentImage = img;
        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Maintain aspect ratio for display (max width 800px)
        const maxWidth = 800;
        if (canvas.width > maxWidth) {
            const ratio = maxWidth / canvas.width;
            canvas.style.width = maxWidth + 'px';
            canvas.style.height = (canvas.height * ratio) + 'px';
        } else {
            canvas.style.width = canvas.width + 'px';
            canvas.style.height = canvas.height + 'px';
        }
        
        placeholder.classList.add('hidden');
        canvas.style.display = 'block';
        downloadBtn.disabled = false;
        drawMeme();
    };
    img.onerror = () => {
        console.error('Failed to load image:', url);
    };
    img.src = url;
}

// Load default templates
function loadTemplates() {
    templatesGallery.innerHTML = '<p class="loading-text">Loading templates...</p>';
    
    // Try to load each template
    const availableTemplates = [];
    let loadedCount = 0;
    
    defaultTemplates.forEach((templatePath, index) => {
        const img = new Image();
        img.onload = () => {
            availableTemplates.push({
                path: templatePath,
                name: `Template ${index + 1}`
            });
            loadedCount++;
            if (loadedCount === defaultTemplates.length) {
                displayTemplates(availableTemplates);
            }
        };
        img.onerror = () => {
            loadedCount++;
            if (loadedCount === defaultTemplates.length) {
                displayTemplates(availableTemplates);
            }
        };
        img.src = templatePath;
    });
}

// Template management variables
let allTemplates = [];
let filteredTemplates = [];
let currentPage = 1;
let templatesPerPage = 20;
let showAllMode = false;

// Display templates in gallery with pagination
function displayTemplates(templates) {
    allTemplates = templates;
    filteredTemplates = templates;
    
    updateTemplateCount();
    renderTemplates();
}

function updateTemplateCount() {
    const count = filteredTemplates.length;
    document.getElementById('templateCount').textContent = `${count} template${count !== 1 ? 's' : ''}`;
}

function renderTemplates() {
    if (filteredTemplates.length === 0) {
        templatesGallery.innerHTML = '<p class="empty-templates">No templates found. Try a different search term!</p>';
        updatePagination();
        return;
    }
    
    templatesGallery.innerHTML = '';
    
    let templatesToShow;
    if (showAllMode) {
        templatesToShow = filteredTemplates;
    } else {
        const startIndex = (currentPage - 1) * templatesPerPage;
        const endIndex = startIndex + templatesPerPage;
        templatesToShow = filteredTemplates.slice(startIndex, endIndex);
    }
    
    templatesToShow.forEach((template, index) => {
        const templateItem = document.createElement('div');
        templateItem.className = 'template-item';
        templateItem.dataset.path = template.path;
        
        const img = document.createElement('img');
        img.src = template.path;
        img.alt = template.name;
        img.loading = 'lazy';
        
        templateItem.appendChild(img);
        templateItem.addEventListener('click', () => {
            // Remove selected class from all items
            document.querySelectorAll('.template-item').forEach(item => {
                item.classList.remove('selected');
            });
            // Add selected class to clicked item
            templateItem.classList.add('selected');
            // Load the image
            loadImageFromUrl(template.path);
        });
        
        templatesGallery.appendChild(templateItem);
    });
    
    updatePagination();
}

function updatePagination() {
    const totalPages = Math.ceil(filteredTemplates.length / templatesPerPage);
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    if (showAllMode || filteredTemplates.length <= templatesPerPage) {
        pageInfo.textContent = `Showing ${filteredTemplates.length} template${filteredTemplates.length !== 1 ? 's' : ''}`;
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    } else {
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        prevBtn.style.display = 'block';
        nextBtn.style.display = 'block';
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;
    }
}

// Search functionality
const templateSearch = document.getElementById('templateSearch');
templateSearch.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredTemplates = allTemplates;
    } else {
        filteredTemplates = allTemplates.filter((template, index) => {
            return template.name.toLowerCase().includes(searchTerm) ||
                   `template ${index + 1}`.includes(searchTerm);
        });
    }
    
    currentPage = 1;
    showAllMode = false;
    document.getElementById('showAllBtn').classList.remove('active');
    document.getElementById('showMoreBtn').classList.add('active');
    renderTemplates();
});

// Pagination controls
document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderTemplates();
        templatesGallery.scrollTop = 0;
    }
});

document.getElementById('nextPage').addEventListener('click', () => {
    const totalPages = Math.ceil(filteredTemplates.length / templatesPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderTemplates();
        templatesGallery.scrollTop = 0;
    }
});

// View options
document.getElementById('showAllBtn').addEventListener('click', () => {
    showAllMode = true;
    document.getElementById('showAllBtn').classList.add('active');
    document.getElementById('showMoreBtn').classList.remove('active');
    renderTemplates();
});

document.getElementById('showMoreBtn').addEventListener('click', () => {
    showAllMode = false;
    document.getElementById('showAllBtn').classList.remove('active');
    document.getElementById('showMoreBtn').classList.add('active');
    currentPage = 1;
    renderTemplates();
});

// Load templates on page load
loadTemplates();

// Drag and drop functionality
const dropZone = document.getElementById('dropZone');

// Make drop zone clickable
dropZone.addEventListener('click', () => {
    imageInput.click();
});

// Drag and drop event handlers
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
        handleFileUpload(files[0]);
    } else {
        alert('Please drop an image file!');
    }
});

// Function to handle file upload
function handleFileUpload(file) {
    // Clear template selection
    document.querySelectorAll('.template-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            currentImage = img;
            // Set canvas size to match image
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Maintain aspect ratio for display (max width 800px)
            const maxWidth = 800;
            if (canvas.width > maxWidth) {
                const ratio = maxWidth / canvas.width;
                canvas.style.width = maxWidth + 'px';
                canvas.style.height = (canvas.height * ratio) + 'px';
            } else {
                canvas.style.width = canvas.width + 'px';
                canvas.style.height = canvas.height + 'px';
            }
            
            placeholder.classList.add('hidden');
            canvas.style.display = 'block';
            downloadBtn.disabled = false;
            drawMeme();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// Load image when user selects one
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleFileUpload(file);
    }
});

// Update font size display
fontSizeSlider.addEventListener('input', (e) => {
    fontSize = parseInt(e.target.value);
    fontSizeValue.textContent = fontSize;
    if (currentImage) {
        drawMeme();
    }
});

// Redraw meme when text changes
topTextInput.addEventListener('input', () => {
    if (currentImage) {
        drawMeme();
    }
});

bottomTextInput.addEventListener('input', () => {
    if (currentImage) {
        drawMeme();
    }
});

// Update text color
textColorInput.addEventListener('input', () => {
    if (currentImage) {
        drawMeme();
    }
});

// Toggle border
enableBorderCheckbox.addEventListener('change', () => {
    if (enableBorderCheckbox.checked) {
        borderColorGroup.classList.remove('disabled');
    } else {
        borderColorGroup.classList.add('disabled');
    }
    if (currentImage) {
        drawMeme();
    }
});

// Update border color
borderColorInput.addEventListener('input', () => {
    if (currentImage) {
        drawMeme();
    }
});

// Draw meme function
function drawMeme() {
    if (!currentImage) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw image
    ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
    
    // Set text properties
    ctx.font = `bold ${fontSize}px Impact, Arial Black, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    const topText = topTextInput.value.trim();
    const bottomText = bottomTextInput.value.trim();
    
    // Draw top text
    if (topText) {
        drawTextWithBorder(topText, canvas.width / 2, 20);
    }
    
    // Draw bottom text
    if (bottomText) {
        const textMetrics = ctx.measureText(bottomText);
        const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
        drawTextWithBorder(bottomText, canvas.width / 2, canvas.height - textHeight - 20);
    }
}

// Draw text with customizable color and border
function drawTextWithBorder(text, x, y) {
    const textColor = textColorInput.value;
    const borderEnabled = enableBorderCheckbox.checked;
    const borderColor = borderColorInput.value;
    
    // Draw border (stroke) if enabled
    if (borderEnabled) {
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = Math.max(3, fontSize / 10);
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        ctx.strokeText(text, x, y);
    }
    
    // Draw text fill
    ctx.fillStyle = textColor;
    ctx.fillText(text, x, y);
}

// Download meme
downloadBtn.addEventListener('click', () => {
    if (!currentImage) return;
    
    // Create a temporary canvas with original dimensions for download
    const downloadCanvas = document.createElement('canvas');
    const downloadCtx = downloadCanvas.getContext('2d');
    
    downloadCanvas.width = currentImage.width;
    downloadCanvas.height = currentImage.height;
    
    // Draw image at original size
    downloadCtx.drawImage(currentImage, 0, 0, downloadCanvas.width, downloadCanvas.height);
    
    // Calculate font size relative to original image size
    const scaleFactor = downloadCanvas.width / canvas.width;
    const downloadFontSize = fontSize * scaleFactor;
    
    // Set text properties
    downloadCtx.font = `bold ${downloadFontSize}px Impact, Arial Black, sans-serif`;
    downloadCtx.textAlign = 'center';
    downloadCtx.textBaseline = 'top';
    
    const topText = topTextInput.value.trim();
    const bottomText = bottomTextInput.value.trim();
    
    // Draw top text
    if (topText) {
        drawTextWithBorderOnCanvas(downloadCtx, topText, downloadCanvas.width / 2, 20 * scaleFactor, downloadFontSize);
    }
    
    // Draw bottom text
    if (bottomText) {
        const textMetrics = downloadCtx.measureText(bottomText);
        const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
        drawTextWithBorderOnCanvas(downloadCtx, bottomText, downloadCanvas.width / 2, downloadCanvas.height - textHeight - (20 * scaleFactor), downloadFontSize);
    }
    
    // Convert to blob and download
    downloadCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'meme.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
});

// Helper function for drawing text with border on download canvas
function drawTextWithBorderOnCanvas(ctx, text, x, y, fontSize) {
    const textColor = textColorInput.value;
    const borderEnabled = enableBorderCheckbox.checked;
    const borderColor = borderColorInput.value;
    
    // Draw border (stroke) if enabled
    if (borderEnabled) {
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = Math.max(3, fontSize / 10);
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        ctx.strokeText(text, x, y);
    }
    
    // Draw text fill
    ctx.fillStyle = textColor;
    ctx.fillText(text, x, y);
}

