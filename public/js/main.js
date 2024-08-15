let currentPage = 1;
let isLoading = false;
let userEmail = '';

const reviewsList = document.getElementById('reviewsList');
const loadingSpinner = document.getElementById('loadingSpinner');
const addReviewBtn = document.getElementById('addReviewBtn');
const emailVerificationModal = new bootstrap.Modal(document.getElementById('emailVerificationModal'));
const reviewModal = new bootstrap.Modal(document.getElementById('reviewModal'));

addReviewBtn.addEventListener('click', () => {
    emailVerificationModal.show();
});

document.getElementById('emailVerificationForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const confirmEmail = document.getElementById('confirmEmail').value;

    if (email === confirmEmail) {
        userEmail = email;
        emailVerificationModal.hide();
        reviewModal.show();
    } else {
        showAlert('Emails do not match. Please try again.', 'danger');
    }
});

document.getElementById('reviewForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const rating = document.getElementById('rating').value;
    const review = document.getElementById('review').value;
    const reviewId = document.getElementById('reviewId').value;

    try {
        if (reviewId) {
            await axios.put(`/api/reviews/${reviewId}`, { name, email: userEmail, rating, review });
            showAlert('Review updated successfully!', 'success');
        } else {
            await axios.post('/api/reviews', { name, email: userEmail, rating, review });
            showAlert('Review submitted successfully!', 'success');
        }
        reviewModal.hide();
        resetForm();
        currentPage = 1;
        reviewsList.innerHTML = '';
        await loadReviews();
    } catch (error) {
        console.error('Error submitting review:', error);
        showAlert('An error occurred while submitting your review. Please try again.', 'danger');
    }
});

function resetForm() {
    document.getElementById('reviewForm').reset();
    document.getElementById('reviewId').value = '';
    document.getElementById('reviewModalTitle').textContent = 'Add Review';
    document.querySelectorAll('#ratingStars .fas.fa-star').forEach(star => star.classList.remove('active'));
}

document.getElementById('ratingStars').addEventListener('click', (e) => {
    if (e.target.classList.contains('fa-star')) {
        const rating = e.target.getAttribute('data-rating');
        document.getElementById('rating').value = rating;
        document.querySelectorAll('#ratingStars .fas.fa-star').forEach(star => {
            star.classList.toggle('active', star.getAttribute('data-rating') <= rating);
        });
    }
});

async function loadReviews() {
    if (isLoading) return;
    isLoading = true;
    loadingSpinner.classList.remove('d-none');

    try {
        const response = await axios.get(`/api/reviews?page=${currentPage}`);
        const reviews = response.data;

        reviews.forEach((review, index) => {
            const reviewElement = createReviewElement(review);
            reviewsList.appendChild(reviewElement);
            animateReviewEntry(reviewElement, index);
        });

        currentPage++;
        if (reviews.length === 0) {
            window.removeEventListener('scroll', handleInfiniteScroll);
        }
    } catch (error) {
        console.error('Error loading reviews:', error);
        showAlert('Error loading reviews. Please try again later.', 'danger');
    } finally {
        isLoading = false;
        loadingSpinner.classList.add('d-none');
    }
}

function createReviewElement(review) {
    const reviewElement = document.createElement('div');
    reviewElement.classList.add('review-item');
    reviewElement.innerHTML = `
        <h5 class="mb-1">${review.name}</h5>
        <p class="mb-1">${review.review}</p>
        <small>Rating: ${createStarRating(review.rating)}</small>
        <div class="review-actions mt-2">
            ${review.email === userEmail ? `
                <button class="btn btn-sm btn-outline-primary edit-review" data-id="${review.id}">Edit</button>
                <button class="btn btn-sm btn-outline-danger delete-review" data-id="${review.id}">Delete</button>
            ` : ''}
        </div>
    `;

    const editBtn = reviewElement.querySelector('.edit-review');
    const deleteBtn = reviewElement.querySelector('.delete-review');

    if (editBtn) {
        editBtn.addEventListener('click', () => editReview(review));
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => deleteReview(review.id));
    }

    return reviewElement;
}

function createStarRating(rating) {
    return Array(5).fill().map((_, i) =>
        `<i class="fas fa-star${i < rating ? ' text-warning' : ' text-muted'}"></i>`
    ).join('');
}

function editReview(review) {
    document.getElementById('reviewId').value = review.id;
    document.getElementById('name').value = review.name;
    document.getElementById('rating').value = review.rating;
    document.getElementById('review').value = review.review;
    document.getElementById('reviewModalTitle').textContent = 'Edit Review';

    document.querySelectorAll('#ratingStars .fas.fa-star').forEach(star => {
        star.classList.toggle('active', star.getAttribute('data-rating') <= review.rating);
    });

    reviewModal.show();
}

async function deleteReview(id) {
    if (confirm('Are you sure you want to delete this review?')) {
        try {
            await axios.delete(`/api/reviews/${id}`, { data: { email: userEmail } });
            const reviewElement = document.querySelector(`.review-item [data-id="${id}"]`).closest('.review-item');
            gsap.to(reviewElement, { opacity: 0, y: -20, duration: 0.3, onComplete: () => reviewElement.remove() });
            showAlert('Review deleted successfully!', 'success');
        } catch (error) {
            console.error('Error deleting review:', error);
            showAlert('An error occurred while deleting the review. Please try again.', 'danger');
        }
    }
}

function handleInfiniteScroll() {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        loadReviews();
    }
}

function animateReviewEntry(reviewElement, index) {
    gsap.fromTo(reviewElement,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, delay: index * 0.1 }
    );
}

function showAlert(message, type) {
    const alertElement = document.createElement('div');
    alertElement.classList.add('alert', `alert-${type}`, 'alert-dismissible', 'fade', 'show', 'position-fixed', 'top-0', 'start-50', 'translate-middle-x', 'mt-3');
    alertElement.setAttribute('role', 'alert');
    alertElement.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(alertElement);

    setTimeout(() => {
        alertElement.remove();
    }, 5000);
}

window.addEventListener('scroll', handleInfiniteScroll);
loadReviews();

// Add some animations to the main elements
gsap.from('h1', { opacity: 0, y: -50, duration: 1, delay: 0.5 });
gsap.from('.card', { opacity: 0, y: 50, duration: 1, delay: 0.8 });
gsap.from('#addReviewBtn', { opacity: 0, scale: 0.5, duration: 1, delay: 1.1 });