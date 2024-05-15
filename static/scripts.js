function showTab(tabId) {
    // Get all tab content elements and hide them
    var tabContents = document.getElementsByClassName('tab-content');
    for (var i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active');
    }

    // Get all pill buttons and remove the 'active' class
    var pillButtons = document.getElementsByClassName('pill-button-unique');
    for (var i = 0; i < pillButtons.length; i++) {
        pillButtons[i].classList.remove('active');
    }

    // Show the selected tab content and mark the button as active
    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');
}

function openGallery(filePath) {
    let overlay = document.getElementById('galleryOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'galleryOverlay';
        overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.8); z-index: 1000; display: flex; flex-direction: column; justify-content: center; align-items: center;';
        document.body.appendChild(overlay);
    } else {
        overlay.innerHTML = '';
    }

    const fileName = filePath.split('/').pop();
    const title = document.createElement('div');
    title.innerText = fileName;
    title.style.cssText = 'color: white; font-size: 24px; margin-bottom: 20px;';

    const fileType = filePath.split('.').pop();
    const files = document.querySelectorAll(fileType === 'html' ? '.html-files a' : '.images a');
    let currentIndex = Array.from(files).findIndex(file => file.onclick.toString().includes(filePath));

    const content = document.createElement(fileType === 'html' ? 'iframe' : 'img');
    content.src = filePath;

    if (fileType === 'html') {
        content.classList.add('overlay-iframe');
        console.log('Added overlay-iframe class to the iframe');
    } else {
        content.style.cssText = 'max-width: 90%; max-height: 90%; width: auto; height: auto;';
    }

    console.log('Content styles:', content.style.cssText);

    const createArrow = (direction) => {
        const arrow = document.createElement('a');
        arrow.innerText = direction === -1 ? '❮' : '❯';
        arrow.style.cssText = `cursor: pointer; position: absolute; top: 50%; ${direction === -1 ? 'left: 20px;' : 'right: 20px;'} font-size: 24px; color: white; transform: translateY(-50%);`;
        arrow.onclick = () => {
            currentIndex = (currentIndex + direction + files.length) % files.length;
            const nextFile = files[currentIndex].onclick.toString().match(/openGallery\('([^']+)'\)/)[1];
            openGallery(nextFile);
        };
        return arrow;
    };

    const leftArrow = createArrow(-1);
    const rightArrow = createArrow(1);

    const closeButton = document.createElement('button');
    closeButton.innerText = 'X';
    closeButton.style.cssText = 'position: absolute; top: 20px; right: 20px; font-size: 24px; color: white; cursor: pointer;';
    closeButton.onclick = () => document.body.removeChild(overlay);

    const commentBox = document.createElement('textarea');
    commentBox.placeholder = 'Add a comment...';
    commentBox.style.cssText = 'width: 90%; height: 50px; margin-top: 20px;';

    const submitButton = document.createElement('button');
    submitButton.innerText = 'Submit';
    submitButton.style.cssText = 'margin-top: 10px;';
    submitButton.onclick = () => submitComment(fileName, commentBox.value);

    overlay.appendChild(title);
    overlay.appendChild(leftArrow);
    overlay.appendChild(content);
    overlay.appendChild(rightArrow);
    overlay.appendChild(closeButton);
    overlay.appendChild(commentBox);
    overlay.appendChild(submitButton);
}

function submitComment(fileName, comment) {
    fetch('/submit_comment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName, comment }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Comment submitted successfully!');
        } else {
            alert('Failed to submit comment.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error submitting comment.');
    });
}